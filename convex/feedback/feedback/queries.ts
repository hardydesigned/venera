import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

export const listMine = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);

    return ctx.db
      .query("userFeedback")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
