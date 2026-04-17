"use node";

import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { v } from "convex/values";

/**
 * Führt einen KI-Agenten aus:
 * 1. Log-Eintrag erstellen (status: running)
 * 2. Data Lake Dateien lesen (nur Lesezugriff)
 * 3. Anthropic API aufrufen mit System-Prompt + Dateien
 * 4. Ergebnis in Log speichern (status: success/error)
 * 5. Optional: Ergebnis als neue Datei in Nextcloud speichern
 */
export const runAgent = action({
  args: {
    agentId: v.id("aiAgents"),
  },
  handler: async (ctx, { agentId }): Promise<{ success: boolean; summary?: string; error?: string }> => {
    const agent = await ctx.runQuery(api.agents.agents.queries.get, { id: agentId });
    if (!agent) {
      return { success: false, error: "Agent nicht gefunden" };
    }

    const startedAt = Date.now();
    const logId = await ctx.runMutation(api.agents.logs.mutations.createLog, {
      agentId,
      status: "running",
      startedAt,
    });

    await ctx.runMutation(api.agents.agents.mutations.setLastRun, { id: agentId });

    try {
      // Kontext aus Data Lake Verbindungen sammeln (nur Lesen)
      const contextFiles: string[] = [];
      for (const connectionRef of agent.connections) {
        if (connectionRef.startsWith("datalake:")) {
          const connectionId = connectionRef.replace("datalake:", "");
          const items = await ctx.runQuery(
            api.datalake.items.queries.listByConnection,
            { connectionId: connectionId as any },
          );
          const fileNames = items
            .filter((i) => i.type === "file")
            .map((i) => `- ${i.path} (${i.name})`)
            .join("\n");
          if (fileNames) {
            contextFiles.push(`Verfügbare Dateien in ${connectionId}:\n${fileNames}`);
          }
        }
      }

      const contextBlock = contextFiles.length > 0
        ? `\n\nVerfügbare Dateien im Data Lake:\n${contextFiles.join("\n\n")}`
        : "";

      // Anthropic API aufrufen
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");
      }

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
          messages: [
            {
              role: "user",
              content: "Führe deine Aufgabe jetzt aus und gib eine strukturierte Zusammenfassung zurück.",
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API Fehler: ${response.status} ${errText}`);
      }

      const data = await response.json() as {
        content: Array<{ type: string; text?: string }>;
      };
      const summary = data.content
        .filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n");

      await ctx.runMutation(api.agents.logs.mutations.finishLog, {
        logId,
        status: "success",
        summary,
      });

      return { success: true, summary };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(api.agents.logs.mutations.finishLog, {
        logId,
        status: "error",
        errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  },
});
