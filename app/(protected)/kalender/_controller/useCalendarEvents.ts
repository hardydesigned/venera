"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateCalendarEvent } from "@/convex/calendar/_model/calendarEvent";

export function useCalendarEvents(startAt: number, endAt: number) {
  const events = useQuery(api.calendar.events.queries.listByRange, {
    startAt,
    endAt,
  });
  const createMutation = useMutation(api.calendar.events.mutations.create);
  const updateMutation = useMutation(api.calendar.events.mutations.update);
  const removeMutation = useMutation(api.calendar.events.mutations.remove);

  const create = async (
    data: CreateCalendarEvent,
  ): Promise<{ data: Id<"calendarEvents"> | null; error: Error | null }> => {
    try {
      const id = await createMutation(data);
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const update = async (
    id: Id<"calendarEvents">,
    data: Partial<CreateCalendarEvent>,
  ): Promise<{ data: Id<"calendarEvents"> | null; error: Error | null }> => {
    try {
      await updateMutation({ id, ...data });
      return { data: id, error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  const remove = async (
    id: Id<"calendarEvents">,
  ): Promise<{ error: Error | null }> => {
    try {
      await removeMutation({ id });
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return {
    events: events ?? [],
    isLoading: events === undefined,
    create,
    update,
    remove,
  };
}
