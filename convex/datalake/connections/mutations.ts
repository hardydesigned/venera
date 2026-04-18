import { mutation } from "../../_generated/server";
import { zCustomMutation, zid } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";
import { requireAuth } from "../../lib/auth";
import { createConnectionSchema } from "../_model/connection";

const zMutation = zCustomMutation(mutation, NoOp);

export const create = zMutation({
  args: createConnectionSchema,
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    return ctx.db.insert("dataLakeConnections", { ...args, userId });
  },
});

export const update = zMutation({
  args: createConnectionSchema.partial().extend({
    id: zid("dataLakeConnections"),
  }),
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

export const remove = zMutation({
  args: z.object({ id: zid("dataLakeConnections") }),
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(id);
    if (!connection || connection.userId !== userId) {
      throw new Error("Verbindung nicht gefunden");
    }
    // Cascade: Alle gecachten Items löschen
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

export const setLastSync = zMutation({
  args: z.object({ id: zid("dataLakeConnections") }),
  handler: async (ctx, { id }) => {
    const { userId } = await requireAuth(ctx);
    const connection = await ctx.db.get(id);
    if (!connection || connection.userId !== userId) {
      throw new Error("Verbindung nicht gefunden");
    }
    await ctx.db.patch(id, { lastSyncAt: Date.now() });
  },
});
