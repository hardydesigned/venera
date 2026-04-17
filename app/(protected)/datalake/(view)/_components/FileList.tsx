"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File, Search, FolderOpen } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { DataLakeItem } from "@/convex/datalake/_model/item";
import { formatFileSize } from "@/convex/datalake/_model/item";

interface FileListProps {
  items: DataLakeItem[];
  isLoading: boolean;
}

function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function FileIcon({ item }: { item: DataLakeItem }) {
  if (item.type === "folder") return <Folder className="h-4 w-4 text-amber-500 shrink-0" />;
  return <File className="h-4 w-4 text-blue-500 shrink-0" />;
}

export function FileList({ items, isLoading }: FileListProps) {
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground" />
          <p className="font-medium">Keine Dateien gefunden</p>
          <p className="text-sm text-muted-foreground">
            Synchronisiere die Verbindung, um Dateien zu laden.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.path.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const folders = filtered.filter((i) => i.type === "folder");
  const files = filtered.filter((i) => i.type === "file");
  const sorted = [...folders, ...files];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Dateien suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length} Einträge ({folders.length} Ordner, {files.length} Dateien)
      </div>

      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="space-y-1">
          {sorted.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary"
            >
              <FileIcon item={item} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{item.path}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.type === "file" && item.contentType && (
                  <Badge variant="outline" className="text-xs hidden sm:flex">
                    {getFileExtension(item.name) || item.contentType}
                  </Badge>
                )}
                {item.size !== undefined && item.size > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)}
                  </span>
                )}
                {item.lastModified && (
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {new Date(item.lastModified).toLocaleDateString("de-DE")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
