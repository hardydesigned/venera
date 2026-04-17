"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateCodeDiffRepo } from "@/convex/codediff/_model/repo";
import type { FileStatus } from "@/convex/codediff/_model/file";

export function useCodeDiffRepos() {
  const repos = useQuery(api.codediff.repos.queries.list);
  const createMutation = useMutation(api.codediff.repos.mutations.create);
  const removeMutation = useMutation(api.codediff.repos.mutations.remove);
  const syncAction = useAction(api.codediff.sync.actions.syncRepoFromGitHub);

  const create = async (
    data: CreateCodeDiffRepo,
  ): Promise<{ data: Id<"codeDiffRepos"> | null; error: Error | null }> => {
    try {
      const id = await createMutation({
        ...data,
        defaultBranch: data.defaultBranch || "main",
      });
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const remove = async (
    id: Id<"codeDiffRepos">,
  ): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({ id });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const sync = async (
    id: Id<"codeDiffRepos">,
  ): Promise<{ fileCount?: number; error: Error | null }> => {
    try {
      const result = await syncAction({ repoId: id });
      return { fileCount: result.fileCount, error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return {
    repos: repos ?? [],
    isLoading: repos === undefined,
    create,
    remove,
    sync,
  };
}

export function useCodeDiffFiles(repoId: Id<"codeDiffRepos"> | undefined) {
  const files = useQuery(
    api.codediff.files.queries.listByRepo,
    repoId ? { repoId } : "skip",
  );
  const updateStatusMutation = useMutation(
    api.codediff.files.mutations.updateStatus,
  );

  const updateStatus = async (
    id: Id<"codeDiffFiles">,
    status: FileStatus,
  ): Promise<{ error: Error | null }> => {
    try {
      await updateStatusMutation({ id, status });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return {
    files: files ?? [],
    isLoading: files === undefined,
    updateStatus,
  };
}
