import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { createFeedbackSchema } from "../_model/feedback";
import { zCustomMutation } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";

const zMutation = zCustomMutation(mutation, NoOp);

export const submit = zMutation({
  args: createFeedbackSchema,
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(await ctx.auth.getUserIdentity());

    return ctx.db.insert("userFeedback", {
      ...args,
      userId,
      status: "new",
    });
  },
});
