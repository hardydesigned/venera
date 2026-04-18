import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";

export const list = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db
      .query("dataLakeConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("dataLakeConnections") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(id);
    if (!connection || connection.userId !== userId) return null;
    return connection;
  },
});
