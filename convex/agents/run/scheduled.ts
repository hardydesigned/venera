"use node";

import { internalAction } from "../../_generated/server";
import { internal, api } from "../../_generated/api";
import { v } from "convex/values";

/**
 * Interne Action für zeitgesteuerte Agenten-Läufe.
 * Wird vom Cron-Job aufgerufen — kein User-Auth-Check erforderlich.
 */
export const runScheduledAgents = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const now = Date.now();

    const dueAgents = await ctx.runQuery(
      internal.agents.agents.queries.listDueForRun,
      { now },
    );

    if (dueAgents.length === 0) return;

    for (const agent of dueAgents) {
      try {
        await ctx.runAction(internal.agents.run.scheduled.runAgentById, {
          agentId: agent._id,
        });
      } catch (e) {
        console.error(`Scheduled run für Agent ${agent.name} fehlgeschlagen:`, e);
      }
    }
  },
});

/**
 * Führt einen einzelnen Agenten aus (intern, ohne User-Auth).
 * Aktualisiert nextRunAt nach dem Lauf.
 */
export const runAgentById = internalAction({
  args: { agentId: v.id("aiAgents") },
  handler: async (ctx, { agentId }): Promise<void> => {
    const agent = await ctx.runQuery(
      internal.agents.agents.queries.getInternal,
      { id: agentId },
    );
    if (!agent || !agent.isActive) return;

    const startedAt = Date.now();
    const logId = await ctx.runMutation(api.agents.logs.mutations.createLog, {
      agentId,
      status: "running",
      startedAt,
    });

    try {
      const contextFiles: string[] = [];
      for (const ref of agent.connections) {
        if (ref.startsWith("datalake:")) {
          const connectionId = ref.replace("datalake:", "");
          const items = await ctx.runQuery(
            internal.datalake.items.queries.listByConnectionInternal,
            { connectionId: connectionId as any },
          );
          const names = items
            .filter((i: { type: string; path: string; name: string }) => i.type === "file")
            .map((i: { path: string; name: string }) => `- ${i.path} (${i.name})`)
            .join("\n");
          if (names) {
            contextFiles.push(`Dateien in ${connectionId}:\n${names}`);
          }
        }
      }

      const contextBlock = contextFiles.length > 0
        ? `\n\nVerfügbare Dateien im Data Lake:\n${contextFiles.join("\n\n")}`
        : "";

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          system: agent.prompt + contextBlock,
          messages: [{
            role: "user",
            content: "Führe deine Aufgabe jetzt aus und gib eine strukturierte Zusammenfassung zurück.",
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as {
        content: Array<{ type: string; text?: string }>;
      };
      const summary = data.content
        .filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n");

      await ctx.runMutation(api.agents.logs.mutations.finishLog, {
        logId, status: "success", summary,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(api.agents.logs.mutations.finishLog, {
        logId, status: "error", errorMessage,
      });
    }

    // nextRunAt für den nächsten Lauf berechnen und speichern
    await ctx.runMutation(
      internal.agents.agents.mutations.updateNextRun,
      { id: agentId, now: Date.now() },
    );
  },
});
