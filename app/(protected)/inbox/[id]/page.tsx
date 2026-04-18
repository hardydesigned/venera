"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EditTaskDialog } from "../_components/EditTaskDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useTask, useTasks } from "../_controller/useTasks";
import type { Id } from "@/convex/_generated/dataModel";
import type { TaskCategory, TaskStatus } from "@/convex/tasks/_model/task";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  A: "A – Dringend & Wichtig",
  B: "B – Wichtig",
  C: "C – Später",
};

const categoryVariants: Record<string, "destructive" | "secondary" | "outline"> = {
  A: "destructive",
  B: "secondary",
  C: "outline",
};

const statusLabels: Record<string, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Erledigt",
  CANCELLED: "Abgebrochen",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  OPEN: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
  CANCELLED: "outline",
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as Id<"tasks">;

  const { task, isLoading } = useTask(id);
  const { update, remove } = useTasks();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEditSubmit = async (
    taskId: Id<"tasks">,
    data: Partial<{
      title: string;
      description: string;
      category: TaskCategory;
      status: TaskStatus;
      estimatedDurationMinutes: number | null;
    }>,
  ) => {
    setIsEditSubmitting(true);
    const { error } = await update(taskId, data);
    setIsEditSubmitting(false);

    if (error) {
      toast.error("Fehler beim Speichern der Aufgabe");
      return;
    }
    toast.success("Aufgabe gespeichert");
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    const { error } = await remove(id);
    if (error) {
      toast.error("Fehler beim Löschen der Aufgabe");
      return;
    }
    toast.success("Aufgabe gelöscht");
    router.push("/inbox");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!task) {
    return (
      <section className="flex h-full flex-col gap-6 p-4">
        <div className="flex items-center gap-4">
          <Link href="/inbox">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Aufgabe nicht gefunden</h1>
        </div>
        <p className="text-muted-foreground">
          Diese Aufgabe existiert nicht oder du hast keinen Zugriff.
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col gap-6 p-4" data-testid="task-detail-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inbox">
            <Button variant="ghost" size="icon" data-testid="back-to-inbox-btn">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            data-testid="edit-task-btn"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            data-testid="delete-task-btn"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={categoryVariants[task.category]}>
          {categoryLabels[task.category]}
        </Badge>
        <Badge variant={statusVariants[task.status]}>
          {statusLabels[task.status]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Beschreibung</p>
                <p className="text-sm whitespace-pre-wrap">{task.description}</p>
              </div>
              <Separator />
            </>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {task.estimatedDurationMinutes != null && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">Geschätzte Dauer</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{task.estimatedDurationMinutes} Min.</span>
                </div>
              </div>
            )}
            {task.actualDurationMinutes != null && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">Tatsächliche Dauer</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{task.actualDurationMinutes} Min.</span>
                </div>
              </div>
            )}
            {task.startDate && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">Startdatum</p>
                <span>{task.startDate}</span>
              </div>
            )}
            {task.dueDate && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">Fälligkeitsdatum</p>
                <span>{task.dueDate}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        task={task}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEditSubmit}
        isLoading={isEditSubmitting}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Aufgabe löschen"
        description="Möchten Sie diese Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </section>
  );
}
