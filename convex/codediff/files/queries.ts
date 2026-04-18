import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

/** Alle Dateien eines Repositories (mit Zugriffsprüfung) */
export const listByRepo = query({
  args: { repoId: v.id("codeDiffRepos") },
  handler: async (ctx, { repoId }) => {
    const { userId } = await requireAuth(ctx);
    const repo = await ctx.db.get(repoId);
    if (!repo || repo.userId !== userId) return [];
    return ctx.db
      .query("codeDiffFiles")
      .withIndex("by_repo", (q) => q.eq("repoId", repoId))
      .collect();
  },
});
