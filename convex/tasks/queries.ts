import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../lib/auth";

export const list = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);

    return ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const listInbox = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return tasks.filter(
      (t) =>
        t.startDate === undefined &&
        t.dueDate === undefined &&
        t.status !== "done" &&
        t.status !== "cancelled",
    );
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);

    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) {
      return null;
    }
    return task;
  },
});
