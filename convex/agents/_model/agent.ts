import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

// Verbindungstypen für Agenten
export const agentConnectionTypeEnum = z.enum([
  "datalake",
  "github",
]);
export type AgentConnectionType = z.infer<typeof agentConnectionTypeEnum>;

export type AIAgent = Doc<"aiAgents">;
export type AgentLog = Doc<"agentLogs">;

export const createAgentSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional(),
  prompt: z.string().min(1, "System-Prompt ist erforderlich"),
  schedule: z.string().optional(), // cron expression
  connections: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type CreateAgent = z.infer<typeof createAgentSchema>;

export const updateAgentSchema = createAgentSchema.partial().extend({
  id: z.string(),
});

export const SCHEDULE_OPTIONS = [
  { value: "", label: "Manuell (kein Zeitplan)" },
  { value: "0 9 * * 1", label: "Jeden Montag 9:00 Uhr" },
  { value: "0 9 * * 1-5", label: "Werktäglich 9:00 Uhr" },
  { value: "0 8 * * *", label: "Täglich 8:00 Uhr" },
  { value: "0 */6 * * *", label: "Alle 6 Stunden" },
];

export const defaultAgent: Partial<CreateAgent> = {
  name: "",
  description: "",
  prompt: "",
  schedule: "",
  connections: [],
  isActive: true,
};
