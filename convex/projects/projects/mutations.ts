import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    goal: v.optional(v.string()),
    color: v.optional(v.string()),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db.insert("projects", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    goal: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) {
      throw new Error("Projekt nicht gefunden.");
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) {
      throw new Error("Projekt nicht gefunden.");
    }
    // Tasks vom Projekt entkoppeln (nicht löschen)
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();
    for (const task of tasks) {
      await ctx.db.patch(task._id, { projectId: undefined });
    }
    await ctx.db.delete(id);
  },
});
