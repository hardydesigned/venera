"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateProject } from "@/convex/projects/_model/project";

export function useProjects() {
  const projects = useQuery(api.projects.projects.queries.listPersonal);
  const createMutation = useMutation(api.projects.projects.mutations.create);
  const updateMutation = useMutation(api.projects.projects.mutations.update);
  const removeMutation = useMutation(api.projects.projects.mutations.remove);

  const create = async (
    data: CreateProject,
  ): Promise<{ data: Id<"projects"> | null; error: Error | null }> => {
    try {
      const id = await createMutation(data);
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const update = async (
    id: Id<"projects">,
    data: Partial<CreateProject>,
  ): Promise<{ data: Id<"projects"> | null; error: Error | null }> => {
    try {
      await updateMutation({ id, ...data });
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const remove = async (
    id: Id<"projects">,
  ): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({ id });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
    create,
    update,
    remove,
  };
}

export function useProject(id: Id<"projects"> | undefined) {
  const project = useQuery(
    api.projects.projects.queries.get,
    id ? { id } : "skip",
  );

  return {
    project: project ?? null,
    isLoading: id !== undefined && project === undefined,
  };
}
