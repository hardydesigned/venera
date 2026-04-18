import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export const taskStatusEnum = z.enum([
  "open",
  "in_progress",
  "done",
  "cancelled",
]);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

export const taskPriorityEnum = z.enum(["A", "B", "C"]);
export type TaskPriority = z.infer<typeof taskPriorityEnum>;

export type Task = Doc<"tasks">;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  status: taskStatusEnum.default("open"),
  priority: taskPriorityEnum.default("C"),
  dueDate: z.number().optional(),
  startDate: z.number().optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  orgId: z.string().optional(), // als String für Formulare, wird als Id genutzt
});

export type CreateTask = z.infer<typeof createTaskSchema>;

export const taskFormSchema = createTaskSchema.partial().extend({
  title: z.string().min(1, "Titel ist erforderlich"),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export const defaultTask: Partial<CreateTask> = {
  title: "",
  status: "open",
  priority: "C",
};
