import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export const createCodeDiffRepoSchema = z.object({
  owner: z.string().min(1, "GitHub-Owner erforderlich"),
  name: z.string().min(1, "Repository-Name erforderlich"),
  token: z.string().optional(),
  description: z.string().optional(),
  defaultBranch: z.string().default("main"),
  orgId: z.string().optional(),
});

export type CreateCodeDiffRepo = z.infer<typeof createCodeDiffRepoSchema>;
export type CodeDiffRepo = Doc<"codeDiffRepos">;

export const repoFormSchema = createCodeDiffRepoSchema;
export type RepoFormData = z.infer<typeof repoFormSchema>;

export const defaultRepo: Partial<CreateCodeDiffRepo> = {
  owner: "",
  name: "",
  defaultBranch: "main",
};
