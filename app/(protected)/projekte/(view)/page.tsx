"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useProjects } from "@/app/(protected)/projekte/_controller/useProjects";
import { ProjectList } from "@/app/(protected)/projekte/(view)/_components/ProjectList";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function ProjektePage() {
  const { projects, remove, isLoading } = useProjects();
  const [deleteId, setDeleteId] = useState<Id<"projects"> | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Projekt gelöscht");
    }
    setDeleteId(null);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Projekte</h1>
          <p className="text-sm text-muted-foreground">
            Deine persönlichen Projekte
          </p>
        </div>
        <Link href="/projekte/new">
          <Button data-testid="new-project-button">
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt
          </Button>
        </Link>
      </div>

      <ProjectList
        projects={projects}
        onDelete={setDeleteId}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Projekt löschen"
        description="Möchtest du dieses Projekt wirklich löschen? Zugehörige Aufgaben werden nicht gelöscht."
      />
    </section>
  );
}
