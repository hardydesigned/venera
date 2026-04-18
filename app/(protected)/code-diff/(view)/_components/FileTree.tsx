"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, ChevronRight, ChevronDown, FileIcon, FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { CodeDiffFile, FileStatus } from "@/convex/codediff/_model/file";
import { FILE_STATUS_LABELS, FILE_STATUS_COLORS, FILE_STATUS_NEXT } from "@/convex/codediff/_model/file";

interface FileTreeProps {
  files: CodeDiffFile[];
  onStatusChange: (id: Id<"codeDiffFiles">, status: FileStatus) => void;
  isLoading: boolean;
}

type TreeNode = {
  name: string;
  fullPath: string;
  type: "file" | "dir";
  children: TreeNode[];
  file?: CodeDiffFile;
};

function buildTree(files: CodeDiffFile[]): TreeNode[] {
  const root: TreeNode = { name: "", fullPath: "", type: "dir", children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = parts.slice(0, i + 1).join("/");
      const isFile = i === parts.length - 1;
      let node = current.children.find((n) => n.name === part);
      if (!node) {
        node = {
          name: part,
          fullPath,
          type: isFile ? "file" : "dir",
          children: [],
          file: isFile ? file : undefined,
        };
        current.children.push(node);
      }
      if (!isFile) current = node;
    }
  }

  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => sort(n.children));
  };
  sort(root.children);
  return root.children;
}

function TreeNodeItem({
  node,
  depth,
  onStatusChange,
  search,
}: {
  node: TreeNode;
  depth: number;
  onStatusChange: (id: Id<"codeDiffFiles">, status: FileStatus) => void;
  search: string;
}) {
  const [open, setOpen] = useState(true);

  if (node.type === "file" && node.file) {
    if (search && !node.file.path.toLowerCase().includes(search.toLowerCase())) {
      return null;
    }
    const status = node.file.status as FileStatus;
    const nextStatus = FILE_STATUS_NEXT[status];
    return (
      <div
        className="flex items-center gap-2 rounded px-2 py-1 hover:bg-accent group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        data-testid="file-row"
      >
        <FileIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm">{node.name}</span>
        <button
          className={cn(
            "shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-opacity",
            FILE_STATUS_COLORS[status],
          )}
          onClick={() => onStatusChange(node.file!._id, nextStatus)}
          title={`Status ändern auf: ${FILE_STATUS_LABELS[nextStatus]}`}
          data-testid="file-status-badge"
        >
          {FILE_STATUS_LABELS[status]}
        </button>
      </div>
    );
  }

  const hasMatchingChild =
    !search ||
    node.children.some((c) => c.file?.path.toLowerCase().includes(search.toLowerCase()));
  if (search && !hasMatchingChild) return null;

  return (
    <div>
      <button
        className="flex w-full items-center gap-2 rounded px-2 py-1 hover:bg-accent"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <FolderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium">{node.name}</span>
      </button>
      {open &&
        node.children.map((child) => (
          <TreeNodeItem
            key={child.fullPath}
            node={child}
            depth={depth + 1}
            onStatusChange={onStatusChange}
            search={search}
          />
        ))}
    </div>
  );
}

export function FileTree({ files, onStatusChange, isLoading }: FileTreeProps) {
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Noch keine Dateien. Bitte Repository synchronisieren.
      </div>
    );
  }

  const reviewedCount = files.filter((f) => f.status === "reviewed" || f.status === "always_green").length;
  const tree = buildTree(files);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {Object.entries(FILE_STATUS_LABELS).map(([status, label]) => {
            const count = files.filter((f) => f.status === status).length;
            return (
              <span key={status} className="flex items-center gap-1">
                <span className={cn("inline-block h-2.5 w-2.5 rounded-full", FILE_STATUS_COLORS[status as FileStatus].split(" ")[0])} />
                {label}: {count}
              </span>
            );
          })}
        </div>
        <span className="text-sm font-medium">
          {reviewedCount}/{files.length} abgearbeitet
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Datei suchen..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-380px)] rounded-md border">
        <div className="py-2">
          {tree.map((node) => (
            <TreeNodeItem
              key={node.fullPath}
              node={node}
              depth={0}
              onStatusChange={onStatusChange}
              search={search}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
