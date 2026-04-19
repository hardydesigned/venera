import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../lib/auth";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("done"), v.literal("cancelled"))),
    priority: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("C"))),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    orgId: v.optional(v.id("organizations")),
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);

    return ctx.db.insert("tasks", {
      userId,
      title: args.title,
      description: args.description,
      status: args.status ?? "open",
      priority: args.priority ?? "C",
      dueDate: args.dueDate,
      startDate: args.startDate,
      orgId: args.orgId,
      projectId: args.projectId,
      assigneeId: args.assigneeId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("done"), v.literal("cancelled"))),
    priority: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("C"))),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(ctx);

    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) {
      throw new Error("Aufgabe nicht gefunden");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);

    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) {
      throw new Error("Aufgabe nicht gefunden");
    }

    await ctx.db.delete(id);
  },
});
