import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

/** Alle persönlichen Projekte des eingeloggten Nutzers */
export const listPersonal = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("orgId"), undefined))
      .order("desc")
      .collect();
  },
});

/** Einzelnes Projekt laden */
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});
