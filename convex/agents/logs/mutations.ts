import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createLog = mutation({
  args: {
    agentId: v.id("aiAgents"),
    status: v.union(v.literal("running"), v.literal("success"), v.literal("error")),
    summary: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("agentLogs", args);
  },
});

export const finishLog = mutation({
  args: {
    logId: v.id("agentLogs"),
    status: v.union(v.literal("success"), v.literal("error")),
    summary: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { logId, ...updates }) => {
    await ctx.db.patch(logId, {
      ...updates,
      finishedAt: Date.now(),
    });
  },
});
