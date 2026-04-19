import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";

export const listByAgent = query({
  args: { agentId: v.id("aiAgents") },
  handler: async (ctx, { agentId }) => {
    const { userId } = await requireAuth(ctx);

    // Sicherstellen dass der Agent dem Nutzer gehört
    const agent = await ctx.db.get(agentId);
    if (!agent || agent.userId !== userId) return [];

    return ctx.db
      .query("agentLogs")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId))
      .order("desc")
      .take(20);
  },
});
