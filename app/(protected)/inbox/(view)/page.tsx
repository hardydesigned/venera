"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTasks } from "@/app/(protected)/inbox/_controller/useTasks";
import { TaskList } from "@/app/(protected)/inbox/(view)/_components/TaskList";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function InboxPage() {
  const { tasks, remove, isLoading } = useTasks();
  const [deleteId, setDeleteId] = useState<Id<"tasks"> | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Aufgabe gelöscht");
    }
    setDeleteId(null);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Deine persönlichen Aufgaben
          </p>
        </div>
        <Link href="/inbox/new">
          <Button data-testid="new-task-button">
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
          </Button>
        </Link>
      </div>

      <TaskList
        tasks={tasks}
        onDelete={setDeleteId}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Aufgabe löschen"
        description="Möchtest du diese Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </section>
  );
}
