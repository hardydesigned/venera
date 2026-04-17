"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCodeDiffRepos } from "@/app/(protected)/code-diff/_controller/useCodeDiff";
import { RepoForm } from "@/app/(protected)/code-diff/(view)/_components/RepoForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreateCodeDiffRepo } from "@/convex/codediff/_model/repo";

export default function NewRepoPage() {
  const router = useRouter();
  const { create, sync } = useCodeDiffRepos();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateCodeDiffRepo) => {
    setIsLoading(true);
    const { data: repoId, error } = await create(data);
    if (error || !repoId) {
      toast.error(error?.message ?? "Fehler beim Speichern");
      setIsLoading(false);
      return;
    }

    // Initial-Sync direkt durchführen
    toast.info("Repository wird synchronisiert...");
    const { fileCount, error: syncError } = await sync(repoId);
    setIsLoading(false);

    if (syncError) {
      toast.warning(
        `Repository gespeichert, aber Sync fehlgeschlagen: ${syncError.message}`,
      );
    } else {
      toast.success(`Repository hinzugefügt — ${fileCount ?? 0} Dateien geladen`);
    }

    router.push(`/code-diff/${repoId}`);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/code-diff">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Repository hinzufügen
          </h1>
          <p className="text-sm text-muted-foreground">
            GitHub Repository verlinken und Dateistatus tracken
          </p>
        </div>
      </div>

      <RepoForm onSubmit={handleSubmit} isLoading={isLoading} />
    </section>
  );
}
