import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export const taskStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
]);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

export const taskCategoryEnum = z.enum(["A", "B", "C"]);
export type TaskCategory = z.infer<typeof taskCategoryEnum>;

export type Task = Doc<"tasks">;

export const createTaskSchema = z.object({
  userId: z.string().optional(),
  orgId: z.string().optional(),
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().default(""),
  startDate: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  category: taskCategoryEnum.default("B"),
  status: taskStatusEnum.default("OPEN"),
  estimatedDurationMinutes: z.number().nullable().default(null),
  actualDurationMinutes: z.number().nullable().default(null),
});

export type CreateTask = z.infer<typeof createTaskSchema>;

export const taskFormSchema = createTaskSchema.partial().extend({
  title: z.string().min(1, "Titel ist erforderlich"),
  category: taskCategoryEnum,
  status: taskStatusEnum,
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export const defaultTask: Partial<CreateTask> = {
  title: "",
  description: "",
  startDate: null,
  dueDate: null,
  category: "B",
  status: "OPEN",
  estimatedDurationMinutes: null,
  actualDurationMinutes: null,
};
