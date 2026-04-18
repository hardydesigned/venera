"use client";

import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { Task } from "@/convex/tasks/_model/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Check } from "lucide-react";

const categoryColors: Record<string, string> = {
  A: "destructive",
  B: "secondary",
  C: "outline",
};

const categoryLabels: Record<string, string> = {
  A: "A-Priorität",
  B: "B-Priorität",
  C: "C-Priorität",
};

interface TaskCardProps {
  task: Task;
  onComplete: (id: Id<"tasks">) => void;
  onDelete: (id: Id<"tasks">) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  return (
    <Card
      className="transition-shadow hover:shadow-sm"
      data-testid="task-card"
    >
      <CardContent className="flex items-start gap-3 p-4">
        <Button
          variant="outline"
          size="icon"
          className="mt-0.5 h-5 w-5 shrink-0 rounded-full"
          onClick={() => onComplete(task._id)}
          data-testid="task-complete-btn"
        >
          {task.status === "DONE" && <Check className="h-3 w-3" />}
        </Button>

        <div className="flex-1 min-w-0">
          <Link
            href={`/inbox/${task._id}`}
            className="hover:underline"
            data-testid="task-title-link"
          >
            <p
              className={
                task.status === "DONE"
                  ? "line-through text-muted-foreground"
                  : "font-medium"
              }
            >
              {task.title}
            </p>
          </Link>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={categoryColors[task.category] as "destructive" | "secondary" | "outline"}>
              {categoryLabels[task.category]}
            </Badge>
            {task.estimatedDurationMinutes && (
              <span className="text-xs text-muted-foreground">
                ~{task.estimatedDurationMinutes} Min.
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none">
            <EllipsisVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/inbox/${task._id}`} className="w-full">Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(task._id)}
            >
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
