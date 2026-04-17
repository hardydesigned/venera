import { mutation } from "../../_generated/server";
import { zCustomMutation, zid } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";

const zMutation = zCustomMutation(mutation, NoOp);

export const createLog = zMutation({
  args: z.object({
    agentId: zid("aiAgents"),
    status: z.enum(["running", "success", "error"]),
    summary: z.string().optional(),
    errorMessage: z.string().optional(),
    startedAt: z.number(),
    finishedAt: z.number().optional(),
  }),
  handler: async (ctx, args) => {
    return ctx.db.insert("agentLogs", args);
  },
});

export const finishLog = zMutation({
  args: z.object({
    logId: zid("agentLogs"),
    status: z.enum(["success", "error"]),
    summary: z.string().optional(),
    errorMessage: z.string().optional(),
  }),
  handler: async (ctx, { logId, ...updates }) => {
    await ctx.db.patch(logId, {
      ...updates,
      finishedAt: Date.now(),
    });
  },
});
