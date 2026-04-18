import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export const providerEnum = z.enum(["nextcloud", "onedrive", "googledrive"]);
export type Provider = z.infer<typeof providerEnum>;

export const PROVIDER_LABELS: Record<Provider, string> = {
  nextcloud: "Nextcloud (WebDAV)",
  onedrive: "Microsoft OneDrive",
  googledrive: "Google Drive",
};

export type DataLakeConnection = Doc<"dataLakeConnections">;

export const createConnectionSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  provider: providerEnum,
  webdavUrl: z.string().url("Muss eine gültige URL sein").optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type CreateConnection = z.infer<typeof createConnectionSchema>;

export const connectionFormSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  provider: providerEnum,
  webdavUrl: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export type ConnectionFormData = z.infer<typeof connectionFormSchema>;

export const defaultConnection: ConnectionFormData = {
  name: "",
  provider: "nextcloud",
  webdavUrl: "",
  username: "",
  password: "",
};
