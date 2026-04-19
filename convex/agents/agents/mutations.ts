import { mutation, internalMutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";
import { computeNextRunAt } from "../lib/schedule";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    prompt: v.string(),
    schedule: v.optional(v.string()),
    connections: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    const nextRunAt = computeNextRunAt(args.schedule) ?? undefined;

    return ctx.db.insert("aiAgents", {
      ...args,
      userId,
      ...(nextRunAt !== undefined ? { nextRunAt } : {}),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("aiAgents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    prompt: v.optional(v.string()),
    schedule: v.optional(v.string()),
    connections: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(ctx);

    const agent = await ctx.db.get(id);
    if (!agent || agent.userId !== userId) {
      throw new Error("Agent nicht gefunden");
    }

    const nextRunAt = updates.schedule !== undefined
      ? (computeNextRunAt(updates.schedule) ?? undefined)
      : undefined;

    await ctx.db.patch(id, {
      ...updates,
      ...(nextRunAt !== undefined ? { nextRunAt } : {}),
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("aiAgents") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);

    const agent = await ctx.db.get(id);
    if (!agent || agent.userId !== userId) {
      throw new Error("Agent nicht gefunden");
    }

    const logs = await ctx.db
      .query("agentLogs")
      .withIndex("by_agent", (q) => q.eq("agentId", id))
      .collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(id);
  },
});

export const setLastRun = mutation({
  args: { id: v.id("aiAgents") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { lastRunAt: Date.now() });
  },
});

export const updateNextRun = internalMutation({
  args: { id: v.id("aiAgents"), now: v.number() },
  handler: async (ctx, { id, now }) => {
    const agent = await ctx.db.get(id);
    if (!agent) return;

    const nextRunAt = computeNextRunAt(agent.schedule, now) ?? undefined;
    await ctx.db.patch(id, {
      lastRunAt: now,
      nextRunAt,
    });
  },
});
