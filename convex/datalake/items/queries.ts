import { query, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";

export const listByConnection = query({
  args: { connectionId: v.id("dataLakeConnections") },
  handler: async (ctx, { connectionId }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(connectionId);
    if (!connection || connection.userId !== userId) return [];
    return ctx.db
      .query("dataLakeItems")
      .withIndex("by_connection", (q) => q.eq("connectionId", connectionId))
      .collect();
  },
});

/** Intern: Data Lake Items für Agenten-Runs laden (ohne User-Auth-Check) */
export const listByConnectionInternal = internalQuery({
  args: { connectionId: v.id("dataLakeConnections") },
  handler: async (ctx, { connectionId }) => {
    return ctx.db
      .query("dataLakeItems")
      .withIndex("by_connection", (q) => q.eq("connectionId", connectionId))
      .collect();
  },
});
