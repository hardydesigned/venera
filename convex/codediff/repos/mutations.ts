import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

export const create = mutation({
  args: {
    owner: v.string(),
    name: v.string(),
    token: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultBranch: v.string(),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db.insert("codeDiffRepos", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("codeDiffRepos"),
    owner: v.optional(v.string()),
    name: v.optional(v.string()),
    token: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultBranch: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(ctx);
    const repo = await ctx.db.get(id);
    if (!repo || repo.userId !== userId) {
      throw new Error("Repository nicht gefunden.");
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("codeDiffRepos") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const repo = await ctx.db.get(id);
    if (!repo || repo.userId !== userId) {
      throw new Error("Repository nicht gefunden.");
    }
    // Cascade: alle Dateien löschen
    const files = await ctx.db
      .query("codeDiffFiles")
      .withIndex("by_repo", (q) => q.eq("repoId", id))
      .collect();
    for (const file of files) {
      await ctx.db.delete(file._id);
    }
    await ctx.db.delete(id);
  },
});
