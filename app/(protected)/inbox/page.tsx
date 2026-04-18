"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useTasks, useInboxTasks } from "./_controller/useTasks";
import { TaskCard } from "./_components/TaskCard";
import { CreateTaskDialog } from "./_components/CreateTaskDialog";
import { EditTaskDialog } from "./_components/EditTaskDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import type { Id } from "@/convex/_generated/dataModel";
import type { Task, CreateTask, TaskCategory, TaskStatus } from "@/convex/tasks/_model/task";

export default function InboxPage() {
  const { create, update, remove } = useTasks();
  const { tasks, isLoading } = useInboxTasks();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<Id<"tasks"> | null>(null);

  const handleCreate = async (
    data: Omit<CreateTask, "userId" | "orgId">,
  ) => {
    setIsSubmitting(true);
    const { error } = await create(data);
    setIsSubmitting(false);

    if (error) {
      toast.error("Fehler beim Erstellen der Aufgabe");
      return;
    }
    toast.success("Aufgabe erstellt");
    setIsCreateOpen(false);
  };

  const handleComplete = async (id: Id<"tasks">) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;

    const newStatus = task.status === "DONE" ? "OPEN" : "DONE";
    const { error } = await update(id, { status: newStatus });

    if (error) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (
    id: Id<"tasks">,
    data: Partial<{
      title: string;
      description: string;
      category: TaskCategory;
      status: TaskStatus;
      estimatedDurationMinutes: number | null;
    }>,
  ) => {
    setIsEditSubmitting(true);
    const { error } = await update(id, data);
    setIsEditSubmitting(false);

    if (error) {
      toast.error("Fehler beim Speichern der Aufgabe");
      return;
    }
    toast.success("Aufgabe gespeichert");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error("Fehler beim Löschen");
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
            Aufgaben ohne Datum – erfasse alles, was noch keinen Termin hat
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="create-task-btn">
          <Plus className="mr-2 h-4 w-4" />
          Neue Aufgabe
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">Inbox ist leer</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Erste Aufgabe erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="flex flex-col gap-2 pr-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={(id) => setDeleteId(id)}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <CreateTaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />

      <EditTaskDialog
        task={editTask}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditTask(null);
        }}
        onSubmit={handleEditSubmit}
        isLoading={isEditSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Aufgabe löschen"
        description="Möchten Sie diese Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </section>
  );
}
