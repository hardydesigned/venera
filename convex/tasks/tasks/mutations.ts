import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

const taskStatusValues = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("done"),
  v.literal("cancelled"),
);

const taskPriorityValues = v.union(
  v.literal("A"),
  v.literal("B"),
  v.literal("C"),
);

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: taskStatusValues,
    priority: taskPriorityValues,
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.id("users")),
    orgId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);

    // Bei Org-Aufgabe: Mitgliedschaft prüfen
    if (args.orgId) {
      const membership = await ctx.db
        .query("orgMemberships")
        .withIndex("by_org_user", (q) =>
          q.eq("orgId", args.orgId!).eq("userId", userId),
        )
        .first();
      if (!membership) throw new Error("Nicht Mitglied dieser Organisation.");
    }

    return ctx.db.insert("tasks", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(taskStatusValues),
    priority: v.optional(taskPriorityValues),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(ctx);
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Aufgabe nicht gefunden.");

    if (!task.orgId) {
      // Persönliche Aufgabe: nur Owner
      if (task.userId !== userId) throw new Error("Keine Berechtigung.");
    } else {
      // Org-Aufgabe: Mitglied darf bearbeiten
      const membership = await ctx.db
        .query("orgMemberships")
        .withIndex("by_org_user", (q) =>
          q.eq("orgId", task.orgId!).eq("userId", userId),
        )
        .first();
      if (!membership) throw new Error("Keine Berechtigung.");
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
    if (!task) throw new Error("Aufgabe nicht gefunden.");

    if (!task.orgId) {
      if (task.userId !== userId) throw new Error("Keine Berechtigung.");
    } else {
      const membership = await ctx.db
        .query("orgMemberships")
        .withIndex("by_org_user", (q) =>
          q.eq("orgId", task.orgId!).eq("userId", userId),
        )
        .first();
      if (!membership) throw new Error("Keine Berechtigung.");
    }

    await ctx.db.delete(id);
  },
});
