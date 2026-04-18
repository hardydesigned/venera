import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../lib/auth";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.union(v.string(), v.null())),
    dueDate: v.optional(v.union(v.string(), v.null())),
    category: v.optional(
      v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    ),
    status: v.optional(
      v.union(
        v.literal("OPEN"),
        v.literal("IN_PROGRESS"),
        v.literal("DONE"),
        v.literal("CANCELLED"),
      ),
    ),
    estimatedDurationMinutes: v.optional(v.union(v.number(), v.null())),
    actualDurationMinutes: v.optional(v.union(v.number(), v.null())),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

    return ctx.db.insert("tasks", {
      userId,
      orgId: args.orgId,
      title: args.title,
      description: args.description ?? "",
      startDate: args.startDate ?? null,
      dueDate: args.dueDate ?? null,
      category: args.category ?? "B",
      status: args.status ?? "OPEN",
      estimatedDurationMinutes: args.estimatedDurationMinutes ?? null,
      actualDurationMinutes: args.actualDurationMinutes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.union(v.string(), v.null())),
    dueDate: v.optional(v.union(v.string(), v.null())),
    category: v.optional(
      v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    ),
    status: v.optional(
      v.union(
        v.literal("OPEN"),
        v.literal("IN_PROGRESS"),
        v.literal("DONE"),
        v.literal("CANCELLED"),
      ),
    ),
    estimatedDurationMinutes: v.optional(v.union(v.number(), v.null())),
    actualDurationMinutes: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

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
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) {
      throw new Error("Aufgabe nicht gefunden");
    }

    await ctx.db.delete(id);
  },
});
