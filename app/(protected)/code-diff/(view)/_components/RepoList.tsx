"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, GitBranch, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { CodeDiffRepo } from "@/convex/codediff/_model/repo";

interface RepoListProps {
  repos: CodeDiffRepo[];
  onDelete: (id: Id<"codeDiffRepos">) => void;
  onSync: (id: Id<"codeDiffRepos">) => void;
  syncingId: Id<"codeDiffRepos"> | null;
  isLoading: boolean;
}

function formatDate(ts: number | undefined) {
  if (!ts) return "Noch nicht synchronisiert";
  return new Date(ts).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RepoList({
  repos,
  onDelete,
  onSync,
  syncingId,
  isLoading,
}: RepoListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground" />
          <p className="font-medium">Noch keine Repositories hinzugefügt</p>
          <Link href="/code-diff/new">
            <Button data-testid="add-first-repo">Repository hinzufügen</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => {
        const isSyncing = syncingId === repo._id;
        return (
          <Card
            key={repo._id}
            className="overflow-hidden transition-shadow hover:shadow-md"
            data-testid="repo-card"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/code-diff/${repo._id}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="font-semibold truncate">
                    {repo.owner}/{repo.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <GitBranch className="mr-1 h-3 w-3" />
                      {repo.defaultBranch}
                    </Badge>
                    {repo.token && (
                      <Badge variant="outline" className="text-xs">
                        privat
                      </Badge>
                    )}
                  </div>
                  {repo.description && (
                    <p className="mt-2 text-sm text-muted-foreground truncate">
                      {repo.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sync: {formatDate(repo.lastSyncAt)}
                  </p>
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onSync(repo._id)}
                    disabled={isSyncing}
                    title="Synchronisieren"
                    data-testid="sync-repo-button"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/code-diff/${repo._id}`}>Dateien ansehen</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(repo._id)}
                        data-testid="delete-repo-button"
                      >
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
