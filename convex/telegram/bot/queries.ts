import { query, internalQuery } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

export const getMine = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db
      .query("telegramSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Interne Abfrage für den Webhook-Handler (keine Auth nötig)
export const getByChatId = internalQuery({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    return ctx.db
      .query("telegramSettings")
      .withIndex("by_chat", (q) => q.eq("authorizedChatId", chatId))
      .first();
  },
});
