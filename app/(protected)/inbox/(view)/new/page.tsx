"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTasks } from "@/app/(protected)/inbox/_controller/useTasks";
import { TaskForm } from "@/app/(protected)/inbox/(view)/_components/TaskForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreateTask } from "@/convex/tasks/_model/task";

export default function NewTaskPage() {
  const router = useRouter();
  const { create, isLoading } = useTasks();

  const handleSubmit = async (data: CreateTask) => {
    const { error } = await create(data);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Aufgabe erstellt");
    router.push("/inbox");
  };

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
            Neue Aufgabe
          </h1>
        </div>
      </div>

      <TaskForm onSubmit={handleSubmit} isLoading={isLoading} />
    </section>
  );
}
