import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { telegramSettingsSchema } from "../_model/telegram";
import { zCustomMutation } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";

const zMutation = zCustomMutation(mutation, NoOp);

export const upsertSettings = zMutation({
  args: telegramSettingsSchema,
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
