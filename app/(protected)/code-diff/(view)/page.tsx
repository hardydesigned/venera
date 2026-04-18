"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCodeDiffRepos } from "@/app/(protected)/code-diff/_controller/useCodeDiff";
import { RepoList } from "@/app/(protected)/code-diff/(view)/_components/RepoList";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function CodeDiffPage() {
  const { repos, remove, sync, isLoading } = useCodeDiffRepos();
  const [deleteId, setDeleteId] = useState<Id<"codeDiffRepos"> | null>(null);
  const [syncingId, setSyncingId] = useState<Id<"codeDiffRepos"> | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Repository gelöscht");
    }
    setDeleteId(null);
  };

  const handleSync = async (id: Id<"codeDiffRepos">) => {
    setSyncingId(id);
    const { fileCount, error } = await sync(id);
    setSyncingId(null);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${fileCount ?? 0} Dateien synchronisiert`);
    }
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Code Diff</h1>
          <p className="text-sm text-muted-foreground">
            GitHub Repositories reviewen und Dateistatus tracken
          </p>
        </div>
        <Link href="/code-diff/new">
          <Button data-testid="add-repo-button">
            <Plus className="mr-2 h-4 w-4" />
            Repository hinzufügen
          </Button>
        </Link>
      </div>

      <RepoList
        repos={repos}
        onDelete={setDeleteId}
        onSync={handleSync}
        syncingId={syncingId}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Repository löschen"
        description="Möchtest du dieses Repository wirklich entfernen? Alle gespeicherten Dateistatus werden gelöscht."
      />
    </section>
  );
}
