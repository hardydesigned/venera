import { httpAction } from "../../_generated/server";
import { internal, api } from "../../_generated/api";
import type { Doc } from "../../_generated/dataModel";

type AiAgentDoc = Doc<"aiAgents">;

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name?: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendMessage(
  botToken: string,
  chatId: string,
  text: string,
): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export const handleWebhook = httpAction(async (ctx, request) => {
  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;

    if (!message?.text) {
      return new Response("OK", { status: 200 });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // Nutzer anhand der autorisierten Chat-ID finden
    const settings = await ctx.runQuery(
      internal.telegram.bot.queries.getByChatId,
      { chatId },
    );

    if (!settings) {
      return new Response("OK", { status: 200 });
    }

    const { botToken, userId } = settings;

    // Agenten des Nutzers laden (intern, ohne Auth)
    const agents = (await ctx.runQuery(
      internal.agents.agents.queries.listByUser,
      { userId },
    )) as AiAgentDoc[];

    let responseText = "";

    if (text === "/start" || text === "/help") {
      responseText =
        "🤖 Venera KI-Agent Bot\n\n" +
        "Verfügbare Befehle:\n" +
        "/list — Agenten anzeigen\n" +
        "/run <Name> — Agent ausführen\n" +
        "/status — Status anzeigen\n" +
        "/help — Diese Hilfe";
    } else if (text === "/list") {
      if (agents.length === 0) {
        responseText = "Keine Agenten vorhanden.";
      } else {
        responseText =
          "📋 Deine Agenten:\n\n" +
          agents
            .map((a, i) => `${i + 1}. ${a.name} ${a.isActive ? "✅" : "⏸️"}`)
            .join("\n");
      }
    } else if (text.startsWith("/run ")) {
      const agentName = text.slice(5).trim();
      const agent = agents.find(
        (a) => a.name.toLowerCase() === agentName.toLowerCase(),
      );

      if (!agent) {
        responseText = `❌ Agent "${agentName}" nicht gefunden.\n/list zeigt alle Agenten.`;
      } else if (!agent.isActive) {
        responseText = `⏸️ Agent "${agent.name}" ist inaktiv.`;
      } else {
        await sendMessage(
          botToken,
          chatId,
          `▶️ Agent "${agent.name}" wird ausgeführt...`,
        );
        const result = await ctx.runAction(api.agents.run.actions.runAgent, {
          agentId: agent._id,
        });
        if (result.success) {
          const snippet = result.summary
            ? `\n\n${result.summary.slice(0, 400)}`
            : "";
          responseText = `✅ "${agent.name}" abgeschlossen.${snippet}`;
        } else {
          responseText = `❌ Fehler: ${result.error ?? "Unbekannt"}`;
        }
      }
    } else if (text === "/status") {
      if (agents.length === 0) {
        responseText = "Keine Agenten vorhanden.";
      } else {
        responseText =
          "📊 Agent-Status:\n\n" +
          agents
            .map((a) => {
              const lastRun = a.lastRunAt
                ? new Date(a.lastRunAt).toLocaleString("de-DE")
                : "Noch nie";
              return `${a.name}: ${lastRun}`;
            })
            .join("\n");
      }
    } else {
      responseText = "Unbekannter Befehl. /help zeigt alle Befehle.";
    }

    await sendMessage(botToken, chatId, responseText);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Telegram webhook Fehler:", error);
    return new Response("OK", { status: 200 });
  }
});
