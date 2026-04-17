import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

/**
 * Gibt die authentifizierte User-ID zurück.
 * Wirft einen Fehler, wenn der Nutzer nicht eingeloggt ist.
 * Unterstützt Query-, Mutation- und Action-Kontexte.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx,
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Nicht authentifiziert. Bitte einloggen.");
  }
  return { userId };
}
