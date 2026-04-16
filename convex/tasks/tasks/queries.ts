import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";

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
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);
    // orgId kommt aus dem Nutzer-Profil
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile?.personalOrgId) return [];

    return ctx.db
      .query("tasks")
      .withIndex("by_org", (q) => q.eq("orgId", profile.personalOrgId))
      .order("desc")
      .collect();
  },
});
