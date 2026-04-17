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
import { ScrollArea } from "@/components/ui/scroll-area";
import { EllipsisVertical, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { Task, TaskStatus } from "@/convex/tasks/_model/task";

const statusLabels: Record<TaskStatus, string> = {
  open: "Offen",
  in_progress: "In Arbeit",
  done: "Erledigt",
  cancelled: "Abgebrochen",
};

const statusVariants: Record<
  TaskStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  open: "outline",
  in_progress: "default",
  done: "secondary",
  cancelled: "destructive",
};

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: Id<"tasks">) => void;
  isLoading: boolean;
}

export function TaskList({ tasks, onDelete, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <p className="font-medium text-muted-foreground">Keine Aufgaben vorhanden</p>
          <Link href="/inbox/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Aufgabe
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-2 pr-4">
        {tasks.map((task) => (
          <Card
            key={task._id}
            className="transition-shadow hover:shadow-md"
            data-testid="task-item"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                {task.priority}
              </span>
              <div className="flex-1 min-w-0">
                <Link href={`/inbox/${task._id}/edit`}>
                  <p className="truncate font-medium hover:underline">{task.title}</p>
                </Link>
                {task.description && (
                  <p className="truncate text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
              </div>
              <Badge variant={statusVariants[task.status]}>
                {statusLabels[task.status]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/inbox/${task._id}/edit`}>Bearbeiten</Link>
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
        ))}
      </div>
    </ScrollArea>
  );
}
