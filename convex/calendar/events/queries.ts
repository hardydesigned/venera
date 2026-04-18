import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

/** Ereignisse in einem Zeitraum */
export const listByRange = query({
  args: {
    startAt: v.number(),
    endAt: v.number(),
  },
  handler: async (ctx, { startAt, endAt }) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db
      .query("calendarEvents")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", userId).gte("startAt", startAt),
      )
      .filter((q) => q.lte(q.field("startAt"), endAt))
      .order("asc")
      .collect();
  },
});

/** Einzelnes Ereignis laden */
export const get = query({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const event = await ctx.db.get(id);
    if (!event || event.userId !== userId) return null;
    return event;
  },
});
