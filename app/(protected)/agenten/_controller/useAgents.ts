"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateAgent } from "@/convex/agents/_model/agent";

export function useAgents() {
  const agents = useQuery(api.agents.agents.queries.list);
  const createMutation = useMutation(api.agents.agents.mutations.create);
  const updateMutation = useMutation(api.agents.agents.mutations.update);
  const removeMutation = useMutation(api.agents.agents.mutations.remove);
  const runAgentAction = useAction(api.agents.run.actions.runAgent);

  const create = async (
    data: CreateAgent,
  ): Promise<{ data: Id<"aiAgents"> | null; error: Error | null }> => {
    try {
      const id = await createMutation(data);
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const update = async (
    id: Id<"aiAgents">,
    data: Partial<CreateAgent>,
  ): Promise<{ error: Error | null }> => {
    try {
      await updateMutation({ id, ...data });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const remove = async (
    id: Id<"aiAgents">,
  ): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({ id });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const run = async (
    id: Id<"aiAgents">,
  ): Promise<{ success: boolean; summary?: string; error?: string }> => {
    try {
      return await runAgentAction({ agentId: id });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  };

  return {
    agents: agents ?? [],
    isLoading: agents === undefined,
    create,
    update,
    remove,
    run,
  };
}

export function useAgent(id: Id<"aiAgents"> | undefined) {
  const agent = useQuery(
    api.agents.agents.queries.get,
    id ? { id } : "skip",
  );
  const logs = useQuery(
    api.agents.logs.queries.listByAgent,
    id ? { agentId: id } : "skip",
  );

  return {
    agent: agent ?? null,
    logs: logs ?? [],
    isLoading: id !== undefined && agent === undefined,
  };
}
