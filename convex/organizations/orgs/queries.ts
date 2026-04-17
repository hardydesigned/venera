import { query } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

/** Alle Organisationen, in denen der Nutzer Mitglied ist */
export const listMine = query({
  handler: async (ctx) => {
    const { userId } = await requireAuth(ctx);

    const memberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const orgs = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.orgId);
        return org ? { ...org, role: m.role } : null;
      }),
    );

    return orgs.filter(Boolean);
  },
});

/** Einzelne Organisation laden */
export const get = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const { userId } = await requireAuth(ctx);

    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
      )
      .first();
    if (!membership) return null;

    return ctx.db.get(orgId);
  },
});

/** Mitglieder einer Organisation laden */
export const getMembers = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const { userId } = await requireAuth(ctx);

    const myMembership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
      )
      .first();
    if (!myMembership) return [];

    const memberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    return Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          userId: m.userId,
          role: m.role,
          email: user?.email ?? null,
          name: user?.name ?? null,
        };
      }),
    );
  },
});
