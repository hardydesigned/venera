import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

export const upsertSettings = mutation({
  args: {
    botToken: v.string(),
    authorizedChatId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);

    const existing = await ctx.db
      .query("telegramSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        webhookRegistered: false,
      });
      return existing._id;
    }

    return ctx.db.insert("telegramSettings", {
      ...args,
      userId,
      webhookRegistered: false,
    });
  },
});

export const setWebhookRegistered = mutation({
  args: { registered: v.boolean() },
  handler: async (ctx, { registered }) => {
    const { userId } = await requireAuth(ctx);
    const settings = await ctx.db
      .query("telegramSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (settings) {
      await ctx.db.patch(settings._id, { webhookRegistered: registered });
    }
  },
});

export const removeSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    const settings = await ctx.db
      .query("telegramSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (settings) {
      await ctx.db.delete(settings._id);
    }
  },
});
