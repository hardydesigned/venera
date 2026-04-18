"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateOrg } from "@/convex/organizations/_model/organization";

export function useOrgs() {
  const orgs = useQuery(api.organizations.orgs.queries.listMine);
  const createMutation = useMutation(api.organizations.orgs.mutations.create);
  const removeMutation = useMutation(api.organizations.orgs.mutations.remove);

  const create = async (
    data: CreateOrg,
  ): Promise<{ data: Id<"organizations"> | null; error: Error | null }> => {
    try {
      const id = await createMutation(data);
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const remove = async (
    orgId: Id<"organizations">,
  ): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({ orgId });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return {
    orgs: orgs ?? [],
    isLoading: orgs === undefined,
    create,
    remove,
  };
}

export function useOrg(orgId: Id<"organizations"> | undefined) {
  const org = useQuery(
    api.organizations.orgs.queries.get,
    orgId ? { orgId } : "skip",
  );
  const members = useQuery(
    api.organizations.orgs.queries.getMembers,
    orgId ? { orgId } : "skip",
  );
  const addMemberMutation = useMutation(
    api.organizations.orgs.mutations.addMemberByEmail,
  );
  const removeMemberMutation = useMutation(
    api.organizations.orgs.mutations.removeMember,
  );
  const leaveMutation = useMutation(api.organizations.orgs.mutations.leave);

  const addMember = async (
    email: string,
  ): Promise<{ error: Error | null }> => {
    if (!orgId) return { error: new Error("Keine Organisation ausgewählt.") };
    try {
      await addMemberMutation({ orgId, email });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const removeMember = async (
    targetUserId: Id<"users">,
  ): Promise<{ error: Error | null }> => {
    if (!orgId) return { error: new Error("Keine Organisation ausgewählt.") };
    try {
      await removeMemberMutation({ orgId, targetUserId });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const leave = async (): Promise<{ error: Error | null }> => {
    if (!orgId) return { error: new Error("Keine Organisation ausgewählt.") };
    try {
      await leaveMutation({ orgId });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return {
    org: org ?? null,
    members: members ?? [],
    isLoading: orgId !== undefined && org === undefined,
    addMember,
    removeMember,
    leave,
  };
}
