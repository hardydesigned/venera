"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const tasks = useQuery(api.tasks.tasks.queries.listPersonal);

  if (tasks === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const openTasks = tasks.filter((t) => t.status === "open");
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const today = new Date();
    const due = new Date(t.dueDate);
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  });

  return (
    <section className="flex h-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guten Tag!</h1>
        <p className="text-muted-foreground">
          Hier ist dein Überblick für heute.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Offene Aufgaben</p>
          <p className="mt-1 text-3xl font-bold">{openTasks.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Heute fällig</p>
          <p className="mt-1 text-3xl font-bold">{todayTasks.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Gesamt</p>
          <p className="mt-1 text-3xl font-bold">{tasks.length}</p>
        </div>
      </div>

      {todayTasks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Heute fällig</h2>
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold bg-primary text-primary-foreground">
                  {task.priority}
                </span>
                <span className="flex-1 text-sm font-medium">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
