"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Task, TaskCategory, TaskStatus } from "@/convex/tasks/_model/task";
import type { Id } from "@/convex/_generated/dataModel";

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    id: Id<"tasks">,
    data: Partial<{
      title: string;
      description: string;
      category: TaskCategory;
      status: TaskStatus;
      estimatedDurationMinutes: number | null;
    }>
  ) => Promise<void>;
  isLoading: boolean;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("B");
  const [status, setStatus] = useState<TaskStatus>("OPEN");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setCategory(task.category);
      setStatus(task.status);
      setEstimatedMinutes(
        task.estimatedDurationMinutes != null
          ? String(task.estimatedDurationMinutes)
          : ""
      );
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    await onSubmit(task._id, {
      title,
      description,
      category,
      status,
      estimatedDurationMinutes: estimatedMinutes
        ? parseInt(estimatedMinutes, 10)
        : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="edit-task-dialog">
        <DialogHeader>
          <DialogTitle>Aufgabe bearbeiten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titel *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Aufgabe beschreiben..."
              required
              data-testid="edit-task-title-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Beschreibung</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as TaskCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A – Dringend & Wichtig</SelectItem>
                  <SelectItem value="B">B – Wichtig</SelectItem>
                  <SelectItem value="C">C – Später</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger data-testid="edit-task-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Offen</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Bearbeitung</SelectItem>
                  <SelectItem value="DONE">Erledigt</SelectItem>
                  <SelectItem value="CANCELLED">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-duration">Geschätzte Dauer (Min.)</Label>
            <Input
              id="edit-duration"
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="z.B. 30"
              min={1}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
