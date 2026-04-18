import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    startAt: v.number(),
    endAt: v.number(),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db.insert("calendarEvents", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("calendarEvents"),
    title: v.optional(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(ctx);
    const event = await ctx.db.get(id);
    if (!event || event.userId !== userId) {
      throw new Error("Ereignis nicht gefunden.");
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const event = await ctx.db.get(id);
    if (!event || event.userId !== userId) {
      throw new Error("Ereignis nicht gefunden.");
    }
    await ctx.db.delete(id);
  },
});
