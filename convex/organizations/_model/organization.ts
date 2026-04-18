import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export const orgRoleEnum = z.enum(["owner", "member"]);
export type OrgRole = z.infer<typeof orgRoleEnum>;

export type Organization = Doc<"organizations">;
export type OrgMembership = Doc<"orgMemberships">;

export const createOrgSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  slug: z
    .string()
    .min(2, "Kürzel mindestens 2 Zeichen")
    .max(32, "Kürzel maximal 32 Zeichen")
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
});

export type CreateOrg = z.infer<typeof createOrgSchema>;

export const orgFormSchema = createOrgSchema;
export type OrgFormData = z.infer<typeof orgFormSchema>;

export const defaultOrg: Partial<CreateOrg> = {
  name: "",
  slug: "",
};

/** Mitglied mit Benutzer-Details (für Anzeige in UI) */
export interface OrgMemberWithUser {
  membership: OrgMembership;
  userId: string;
  email: string | null;
  displayName: string | null;
}
