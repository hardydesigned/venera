import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

/** Alle persönlichen Aufgaben des eingeloggten Nutzers */
export const listPersonal = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("orgId"), undefined))
      .order("desc")
      .collect();
  },
});

/** Alle Aufgaben einer Organisation */
export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const { userId } = await requireAuth(ctx);

    // Zugriff nur für Org-Mitglieder
    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
      )
      .first();
    if (!membership) return [];

    return ctx.db
      .query("tasks")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

/** Einzelne Aufgabe laden */
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const task = await ctx.db.get(id);
    if (!task) return null;

    // Persönliche Aufgabe: nur Owner
    if (!task.orgId) {
      if (task.userId !== userId) return null;
      return task;
    }

    // Org-Aufgabe: Mitgliedschaft prüfen
    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", task.orgId!).eq("userId", userId),
      )
      .first();
    if (!membership) return null;
    return task;
  },
});
