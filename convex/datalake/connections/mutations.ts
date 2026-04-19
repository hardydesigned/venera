import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    provider: v.union(v.literal("nextcloud"), v.literal("onedrive"), v.literal("googledrive")),
    webdavUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db.insert("dataLakeConnections", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("dataLakeConnections"),
    name: v.optional(v.string()),
    provider: v.optional(v.union(v.literal("nextcloud"), v.literal("onedrive"), v.literal("googledrive"))),
    webdavUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(id);
    if (!connection || connection.userId !== userId) {
      throw new Error("Verbindung nicht gefunden");
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("dataLakeConnections") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(id);
    if (!connection || connection.userId !== userId) {
      throw new Error("Verbindung nicht gefunden");
    }
    const items = await ctx.db
      .query("dataLakeItems")
      .withIndex("by_connection", (q) => q.eq("connectionId", id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(id);
  },
});

export const setLastSync = mutation({
  args: { id: v.id("dataLakeConnections") },
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(id);
    if (!connection || connection.userId !== userId) {
      throw new Error("Verbindung nicht gefunden");
    }
    await ctx.db.patch(id, { lastSyncAt: Date.now() });
  },
});
