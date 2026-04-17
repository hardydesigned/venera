import type { Doc } from "../../_generated/dataModel";

export type FileStatus = "needs_review" | "reviewed" | "todo" | "always_green";

export const FILE_STATUS_LABELS: Record<FileStatus, string> = {
  needs_review: "Zu reviewen",
  reviewed: "Reviewed",
  todo: "TODO",
  always_green: "Immer grün",
};

export const FILE_STATUS_COLORS: Record<FileStatus, string> = {
  needs_review: "bg-yellow-500 text-white",
  reviewed: "bg-green-600 text-white",
  todo: "bg-red-500 text-white",
  always_green: "bg-green-300 text-green-900",
};

export const FILE_STATUS_NEXT: Record<FileStatus, FileStatus> = {
  needs_review: "reviewed",
  reviewed: "todo",
  todo: "always_green",
  always_green: "needs_review",
};

export type CodeDiffFile = Doc<"codeDiffFiles">;
