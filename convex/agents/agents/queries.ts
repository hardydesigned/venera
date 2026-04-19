import { query, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";

export const list = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);

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
    const { userId } = await requireAuth(ctx);

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

/** Interne Abfrage: Agenten, deren nextRunAt <= now und isActive = true */
export const listDueForRun = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    // Alle Agenten mit nextRunAt laden (Index-Scan bis now)
    const agents = await ctx.db
      .query("aiAgents")
      .withIndex("by_next_run", (q) => q.lte("nextRunAt", now))
      .collect();

    return agents.filter((a) => a.isActive && a.nextRunAt !== undefined);
  },
});

/** Interne Abfrage: einzelnen Agenten ohne Auth-Check laden */
export const getInternal = internalQuery({
  args: { id: v.id("aiAgents") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});
