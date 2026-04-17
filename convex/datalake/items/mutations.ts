import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAuth } from "../../lib/auth";

export const bulkSync = mutation({
  args: {
    connectionId: v.id("dataLakeConnections"),
    items: v.array(
      v.object({
        path: v.string(),
        name: v.string(),
        type: v.union(v.literal("file"), v.literal("folder")),
        size: v.optional(v.number()),
        lastModified: v.optional(v.number()),
        contentType: v.optional(v.string()),
        etag: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { connectionId, items }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(connectionId);
    if (!connection || connection.userId !== userId) {
      throw new Error("Verbindung nicht gefunden");
    }

    // Bestehende Items löschen
    const existing = await ctx.db
      .query("dataLakeItems")
      .withIndex("by_connection", (q) => q.eq("connectionId", connectionId))
      .collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    // Neue Items einfügen
    for (const item of items) {
      await ctx.db.insert("dataLakeItems", { connectionId, ...item });
    }

    return items.length;
  },
});
