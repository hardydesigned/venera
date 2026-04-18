"use node";

import { action } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { api } from "../../_generated/api";

export const registerWebhook = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; error?: string }> => {
    await requireAuth(ctx);

    const settings = await ctx.runQuery(api.telegram.bot.queries.getMine);
    if (!settings) {
      return { success: false, error: "Keine Bot-Einstellungen gefunden" };
    }

    const siteUrl = process.env.CONVEX_SITE_URL;
    if (!siteUrl) {
      return { success: false, error: "CONVEX_SITE_URL nicht konfiguriert" };
    }

    const webhookUrl = `${siteUrl}/telegram/webhook`;
    const response = await fetch(
      `https://api.telegram.org/bot${settings.botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      },
    );

    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
    };

    if (data.ok) {
      await ctx.runMutation(api.telegram.bot.mutations.setWebhookRegistered, {
        registered: true,
      });
      return { success: true };
    }

    return { success: false, error: data.description ?? "Unbekannter Fehler" };
  },
});

export const removeWebhook = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; error?: string }> => {
    await requireAuth(ctx);

    const settings = await ctx.runQuery(api.telegram.bot.queries.getMine);
    if (!settings) {
      return { success: false, error: "Keine Bot-Einstellungen gefunden" };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${settings.botToken}/deleteWebhook`,
      { method: "POST" },
    );

    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
    };

    if (data.ok) {
      await ctx.runMutation(api.telegram.bot.mutations.setWebhookRegistered, {
        registered: false,
      });
      return { success: true };
    }

    return { success: false, error: data.description ?? "Unbekannter Fehler" };
  },
});
