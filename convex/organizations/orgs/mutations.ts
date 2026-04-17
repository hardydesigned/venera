import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

/** Organisation erstellen */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);

    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      throw new Error("Dieses Kürzel ist bereits vergeben.");
    }

    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      ownerId: userId,
    });

    await ctx.db.insert("orgMemberships", {
      orgId,
      userId,
      role: "owner",
    });

    return orgId;
  },
});

/** Mitglied per E-Mail einladen/hinzufügen */
export const addMemberByEmail = mutation({
  args: {
    orgId: v.id("organizations"),
    email: v.string(),
  },
  handler: async (ctx, { orgId, email }) => {
    const { userId } = await requireAuth(ctx);

    const org = await ctx.db.get(orgId);
    if (!org || org.ownerId !== userId) {
      throw new Error("Organisation nicht gefunden oder keine Berechtigung.");
    }

    const targetUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    if (!targetUser) {
      throw new Error("Nutzer mit dieser E-Mail nicht gefunden.");
    }

    const existing = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", targetUser._id),
      )
      .first();
    if (existing) {
      throw new Error("Nutzer ist bereits Mitglied.");
    }

    return ctx.db.insert("orgMemberships", {
      orgId,
      userId: targetUser._id,
      role: "member",
      invitedBy: userId,
    });
  },
});

/** Mitglied entfernen */
export const removeMember = mutation({
  args: {
    orgId: v.id("organizations"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, { orgId, targetUserId }) => {
    const { userId } = await requireAuth(ctx);

    const org = await ctx.db.get(orgId);
    if (!org || org.ownerId !== userId) {
      throw new Error("Organisation nicht gefunden oder keine Berechtigung.");
    }
    if (targetUserId === userId) {
      throw new Error("Owner kann sich nicht selbst entfernen.");
    }

    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", targetUserId),
      )
      .first();
    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});

/** Organisation verlassen (als Mitglied) */
export const leave = mutation({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const { userId } = await requireAuth(ctx);

    const org = await ctx.db.get(orgId);
    if (!org) throw new Error("Organisation nicht gefunden.");
    if (org.ownerId === userId) {
      throw new Error("Owner kann die Organisation nicht verlassen. Bitte zuerst löschen.");
    }

    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org_user", (q) =>
        q.eq("orgId", orgId).eq("userId", userId),
      )
      .first();
    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});

/** Organisation löschen (nur Owner) */
export const remove = mutation({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    const { userId } = await requireAuth(ctx);

    const org = await ctx.db.get(orgId);
    if (!org || org.ownerId !== userId) {
      throw new Error("Organisation nicht gefunden oder keine Berechtigung.");
    }

    const memberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();
    for (const m of memberships) {
      await ctx.db.delete(m._id);
    }

    await ctx.db.delete(orgId);
  },
});
