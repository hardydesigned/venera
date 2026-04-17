"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateTask } from "@/convex/tasks/_model/task";

export function useTasks() {
  const tasks = useQuery(api.tasks.tasks.queries.listPersonal);
  const createMutation = useMutation(api.tasks.tasks.mutations.create);
  const updateMutation = useMutation(api.tasks.tasks.mutations.update);
  const removeMutation = useMutation(api.tasks.tasks.mutations.remove);

  const create = async (
    data: CreateTask,
  ): Promise<{ data: Id<"tasks"> | null; error: Error | null }> => {
    try {
      const id = await createMutation(data);
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const update = async (
    id: Id<"tasks">,
    data: Partial<CreateTask>,
  ): Promise<{ data: Id<"tasks"> | null; error: Error | null }> => {
    try {
      await updateMutation({ id, ...data });
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const remove = async (
    id: Id<"tasks">,
  ): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({ id });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return {
    tasks: tasks ?? [],
    isLoading: tasks === undefined,
    create,
    update,
    remove,
  };
}

export function useTask(id: Id<"tasks"> | undefined) {
  const task = useQuery(
    api.tasks.tasks.queries.get,
    id ? { id } : "skip",
  );

  return {
    task: task ?? null,
    isLoading: id !== undefined && task === undefined,
  };
}
