"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateConnection } from "@/convex/datalake/_model/connection";

export function useDataLakeConnections() {
  const connections = useQuery(api.datalake.connections.queries.list);
  const createMutation = useMutation(api.datalake.connections.mutations.create);
  const removeMutation = useMutation(api.datalake.connections.mutations.remove);
  const syncAction = useAction(api.datalake.sync.actions.syncFromNextcloud);

  const create = async (
    data: CreateConnection,
  ): Promise<{ data: Id<"dataLakeConnections"> | null; error: Error | null }> => {
    try {
      const id = await createMutation(data);
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const remove = async (
    id: Id<"dataLakeConnections">,
  ): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({ id });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const sync = async (
    connectionId: Id<"dataLakeConnections">,
  ): Promise<{ synced: number | null; error: Error | null }> => {
    try {
      const result = await syncAction({ connectionId });
      return { synced: result.synced, error: null };
    } catch (e) {
      return { synced: null, error: e as Error };
    }
  };

  return {
    connections: connections ?? [],
    isLoading: connections === undefined,
    create,
    remove,
    sync,
  };
}

export function useDataLakeConnection(id: Id<"dataLakeConnections"> | undefined) {
  const connection = useQuery(
    api.datalake.connections.queries.get,
    id ? { id } : "skip",
  );
  const items = useQuery(
    api.datalake.items.queries.listByConnection,
    id ? { connectionId: id } : "skip",
  );

  return {
    connection: connection ?? null,
    items: items ?? [],
    isLoading: id !== undefined && (connection === undefined || items === undefined),
  };
}
