"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EllipsisVertical, FolderKanban, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { Project } from "@/convex/projects/_model/project";

const colorClasses: Record<string, string> = {
  gray: "bg-gray-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: Id<"projects">) => void;
  isLoading: boolean;
}

export function ProjectList({ projects, onDelete, isLoading }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">Keine Projekte vorhanden</p>
          <Link href="/projekte/new">
            <Button data-testid="new-project-empty">
              <Plus className="mr-2 h-4 w-4" />
              Neues Projekt
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pr-4">
        {projects.map((project) => {
          const colorClass = colorClasses[project.color ?? "blue"] ?? "bg-blue-500";
          return (
            <Card
              key={project._id}
              className="overflow-hidden transition-shadow hover:shadow-md"
              data-testid="project-item"
            >
              <div className={`h-2 w-full ${colorClass}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/projekte/${project._id}/edit`} className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold hover:underline">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                    {project.goal && (
                      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground italic">
                        Ziel: {project.goal}
                      </p>
                    )}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/projekte/${project._id}/edit`}>Bearbeiten</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(project._id)}
                      >
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
