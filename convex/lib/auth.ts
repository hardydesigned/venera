import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Gibt die authentifizierte User-ID zurück.
 * Wirft einen Fehler, wenn der Nutzer nicht eingeloggt ist.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Nicht authentifiziert. Bitte einloggen.");
  }
  return { userId };
}
