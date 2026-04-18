"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProjects } from "@/app/(protected)/projekte/_controller/useProjects";
import { ProjectForm } from "@/app/(protected)/projekte/(view)/_components/ProjectForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreateProject } from "@/convex/projects/_model/project";

export default function NewProjectPage() {
  const router = useRouter();
  const { create, isLoading } = useProjects();

  const handleSubmit = async (data: CreateProject) => {
    const { error } = await create(data);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Projekt erstellt");
    router.push("/projekte");
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/projekte">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Neues Projekt
          </h1>
        </div>
      </div>

      <ProjectForm onSubmit={handleSubmit} isLoading={isLoading} />
    </section>
  );
}
