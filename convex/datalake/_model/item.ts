import type { Doc } from "../../_generated/dataModel";

export type DataLakeItem = Doc<"dataLakeItems">;
export type ItemType = "file" | "folder";

export interface SyncItem {
  path: string;
  name: string;
  type: ItemType;
  size?: number;
  lastModified?: number;
  contentType?: string;
  etag?: string;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
