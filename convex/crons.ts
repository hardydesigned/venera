import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Alle 15 Minuten prüfen, ob zeitgesteuerte Agenten ausgeführt werden sollen.
 * Agenten mit nextRunAt <= now und isActive = true werden gestartet.
 */
crons.interval(
  "run-scheduled-agents",
  { minutes: 15 },
  internal.agents.run.scheduled.runScheduledAgents,
  {},
);

export default crons;
