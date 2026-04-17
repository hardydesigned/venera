import { z } from "zod";
import type { Doc } from "../../_generated/dataModel";

export type CalendarEvent = Doc<"calendarEvents">;

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  startAt: z.number(),
  endAt: z.number(),
  color: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  orgId: z.string().optional(),
});

export type CreateCalendarEvent = z.infer<typeof createCalendarEventSchema>;

export const calendarEventFormSchema = createCalendarEventSchema
  .partial()
  .extend({
    title: z.string().min(1, "Titel ist erforderlich"),
    startAt: z.number(),
    endAt: z.number(),
  });

export type CalendarEventFormData = z.infer<typeof calendarEventFormSchema>;

export const defaultCalendarEvent: Partial<CreateCalendarEvent> = {
  title: "",
  color: "blue",
};
