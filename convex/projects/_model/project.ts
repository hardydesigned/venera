import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export type Project = Doc<"projects">;

export const projectColorEnum = z.enum([
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
]);
export type ProjectColor = z.infer<typeof projectColorEnum>;

export const createProjectSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  goal: z.string().optional(),
  color: projectColorEnum.optional(),
  orgId: z.string().optional(),
});

export type CreateProject = z.infer<typeof createProjectSchema>;

export const projectFormSchema = createProjectSchema.partial().extend({
  title: z.string().min(1, "Titel ist erforderlich"),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

export const defaultProject: Partial<CreateProject> = {
  title: "",
  color: "blue",
};
