import { query, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";

export const list = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

    return ctx.db
      .query("aiAgents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("aiAgents") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

    const agent = await ctx.db.get(id);
    if (!agent || agent.userId !== userId) return null;

    return agent;
  },
});

// Interne Abfrage für Webhook-Handler (kein Auth-Check, direkt nach userId)
export const listByUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("aiAgents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
