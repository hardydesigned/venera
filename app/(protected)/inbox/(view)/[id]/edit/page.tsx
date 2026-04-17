"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTasks, useTask } from "@/app/(protected)/inbox/_controller/useTasks";
import { TaskForm } from "@/app/(protected)/inbox/(view)/_components/TaskForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { CreateTask } from "@/convex/tasks/_model/task";
import type { Id } from "@/convex/_generated/dataModel";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { update, isLoading } = useTasks();
  const { task, isLoading: taskLoading } = useTask(id as Id<"tasks">);

  const handleSubmit = async (data: CreateTask) => {
    const { error } = await update(id as Id<"tasks">, data);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Aufgabe gespeichert");
    router.push("/inbox");
  };

  if (taskLoading) {
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
          <h1 className="text-3xl font-semibold tracking-tight">
            Aufgabe nicht gefunden
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/inbox">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Aufgabe bearbeiten
          </h1>
        </div>
      </div>

      <TaskForm task={task} onSubmit={handleSubmit} isLoading={isLoading} />
    </section>
  );
}
