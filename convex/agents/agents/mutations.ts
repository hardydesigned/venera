import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { createAgentSchema } from "../_model/agent";
import { zCustomMutation, zid } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";

const zMutation = zCustomMutation(mutation, NoOp);

export const create = zMutation({
  args: createAgentSchema,
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

    return ctx.db.insert("aiAgents", {
      ...args,
      userId,
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

    await ctx.db.patch(id, updates);
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

    // Logs löschen (Cascade)
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
