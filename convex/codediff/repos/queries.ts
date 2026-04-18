import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

/** Alle Repositories des eingeloggten Nutzers */
export const list = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db
      .query("codeDiffRepos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/** Einzelnes Repository laden */
export const get = query({
  args: { id: v.id("codeDiffRepos") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const repo = await ctx.db.get(id);
    if (!repo || repo.userId !== userId) return null;
    return repo;
  },
});
