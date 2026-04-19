import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    type: v.union(v.literal("feature"), v.literal("bug"), v.literal("other")),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);

    return ctx.db.insert("userFeedback", {
      ...args,
      userId,
      status: "new",
    });
  },
});
