import type { UserIdentity } from "convex/server";

export interface AuthIdentity {
  userId: string;
  orgId?: string;
}

export async function requireAuth(
  identity: UserIdentity | null,
): Promise<AuthIdentity> {
  if (!identity) {
    throw new Error("Nicht authentifiziert");
  }
  return {
    userId: identity.subject,
  };
}

export async function requireOrgIdentity(
  identity: UserIdentity | null,
): Promise<Required<AuthIdentity>> {
  const auth = await requireAuth(identity);
  const orgId = (identity as UserIdentity & { orgId?: string }).orgId;
  if (!orgId) {
    throw new Error("Keine aktive Organisation");
  }
  return { userId: auth.userId, orgId };
}
