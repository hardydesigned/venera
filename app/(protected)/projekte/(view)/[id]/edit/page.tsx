"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useProjects,
  useProject,
} from "@/app/(protected)/projekte/_controller/useProjects";
import { ProjectForm } from "@/app/(protected)/projekte/(view)/_components/ProjectForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateProject } from "@/convex/projects/_model/project";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { update, isLoading: isMutating } = useProjects();
  const { project, isLoading } = useProject(id as Id<"projects">);

  const handleSubmit = async (data: CreateProject) => {
    const { error } = await update(id as Id<"projects">, data);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Projekt gespeichert");
    router.push("/projekte");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Projekt nicht gefunden.</p>
        <Link href="/projekte">
          <Button variant="outline">Zurück zu Projekte</Button>
        </Link>
      </div>
    );
  }

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
            Projekt bearbeiten
          </h1>
        </div>
      </div>

      <ProjectForm
        project={project}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />
    </section>
  );
}
