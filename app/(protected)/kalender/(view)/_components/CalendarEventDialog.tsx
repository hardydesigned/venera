"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  type CreateCalendarEvent,
  type CalendarEventFormData,
  calendarEventFormSchema,
  defaultCalendarEvent,
} from "@/convex/calendar/_model/calendarEvent";
import type { CalendarEvent } from "@/convex/calendar/_model/calendarEvent";

interface CalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  onSubmit: (data: CreateCalendarEvent) => Promise<void>;
  isLoading: boolean;
}

function dateToInput(ts: number) {
  return new Date(ts).toISOString().slice(0, 16);
}

function inputToTs(val: string): number {
  return new Date(val).getTime();
}

export function CalendarEventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSubmit,
  isLoading,
}: CalendarEventDialogProps) {
  const defaultStart = defaultDate ?? new Date();
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

  const form = useForm<CalendarEventFormData>({
    resolver: zodResolver(calendarEventFormSchema),
    defaultValues: {
      ...defaultCalendarEvent,
      startAt: event?.startAt ?? defaultStart.getTime(),
      endAt: event?.endAt ?? defaultEnd.getTime(),
      title: event?.title ?? "",
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        color: event.color,
      });
    } else {
      form.reset({
        ...defaultCalendarEvent,
        title: "",
        startAt: defaultStart.getTime(),
        endAt: defaultEnd.getTime(),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, open]);

  const handleSubmit = async (data: CalendarEventFormData) => {
    await onSubmit(data as CreateCalendarEvent);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Ereignis bearbeiten" : "Neues Ereignis"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel *</FormLabel>
                  <FormControl>
                    <Input placeholder="Titel eingeben" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beginn *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={dateToInput(field.value)}
                      onChange={(e) => field.onChange(inputToTs(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ende *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={dateToInput(field.value)}
                      onChange={(e) => field.onChange(inputToTs(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : event ? (
                  "Speichern"
                ) : (
                  "Erstellen"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
