import { mutation, internalMutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { createAgentSchema } from "../_model/agent";
import { zCustomMutation, zid } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { v } from "convex/values";
import { computeNextRunAt } from "../lib/schedule";

const zMutation = zCustomMutation(mutation, NoOp);

export const create = zMutation({
  args: createAgentSchema,
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());
    const nextRunAt = computeNextRunAt(args.schedule) ?? undefined;

    return ctx.db.insert("aiAgents", {
      ...args,
      userId,
      nextRunAt,
    });
  },
});

export const update = zMutation({
  args: createAgentSchema.partial().extend({
    id: zid("aiAgents"),
  }),
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

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

export const remove = zMutation({
  args: z.object({ id: zid("aiAgents") }),
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

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

export const setLastRun = zMutation({
  args: z.object({ id: zid("aiAgents") }),
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { lastRunAt: Date.now() });
  },
});

/** Intern: nextRunAt nach einem Scheduled-Run aktualisieren */
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
