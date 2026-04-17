"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import {
  useCodeDiffRepos,
  useCodeDiffFiles,
} from "@/app/(protected)/code-diff/_controller/useCodeDiff";
import { FileTree } from "@/app/(protected)/code-diff/(view)/_components/FileTree";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { FileStatus } from "@/convex/codediff/_model/file";

interface RepoPageProps {
  params: Promise<{ repoId: string }>;
}

export default function RepoFilesPage({ params }: RepoPageProps) {
  const { repoId } = use(params);
  const typedRepoId = repoId as Id<"codeDiffRepos">;

  const { repos, sync } = useCodeDiffRepos();
  const { files, isLoading, updateStatus } = useCodeDiffFiles(typedRepoId);
  const [isSyncing, setIsSyncing] = useState(false);

  const repo = repos.find((r) => r._id === typedRepoId);

  const handleSync = async () => {
    setIsSyncing(true);
    const { fileCount, error } = await sync(typedRepoId);
    setIsSyncing(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${fileCount ?? 0} Dateien synchronisiert`);
    }
  };

  const handleStatusChange = async (
    id: Id<"codeDiffFiles">,
    status: FileStatus,
  ) => {
    const { error } = await updateStatus(id, status);
    if (error) toast.error(error.message);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/code-diff">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {repo ? `${repo.owner}/${repo.name}` : "Repository"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {files.length} Dateien gespeichert
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing}
          data-testid="sync-button"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
          />
          {isSyncing ? "Synchronisiert..." : "Synchronisieren"}
        </Button>
      </div>

      <FileTree
        files={files}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
    </section>
  );
}
