import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export const feedbackTypeEnum = z.enum(["feature", "bug", "other"]);
export type FeedbackType = z.infer<typeof feedbackTypeEnum>;

export const feedbackStatusEnum = z.enum(["new", "in_review", "done"]);
export type FeedbackStatus = z.infer<typeof feedbackStatusEnum>;

export type UserFeedback = Doc<"userFeedback">;

export const createFeedbackSchema = z.object({
  type: feedbackTypeEnum,
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
});

export type CreateFeedback = z.infer<typeof createFeedbackSchema>;

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  feature: "Feature-Wunsch",
  bug: "Fehler melden",
  other: "Sonstiges",
};

export const defaultFeedback: Partial<CreateFeedback> = {
  type: "feature",
  title: "",
  description: "",
};
