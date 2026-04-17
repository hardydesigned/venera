"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCalendarEvents } from "@/app/(protected)/kalender/_controller/useCalendarEvents";
import { MonthCalendar } from "@/app/(protected)/kalender/(view)/_components/MonthCalendar";
import { CalendarEventDialog } from "@/app/(protected)/kalender/(view)/_components/CalendarEventDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateCalendarEvent } from "@/convex/calendar/_model/calendarEvent";
import type { CalendarEvent } from "@/convex/calendar/_model/calendarEvent";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default function KalenderPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"calendarEvents"> | null>(null);

  const startAt = new Date(year, month, 1).getTime();
  const endAt = new Date(year, month + 1, 0, 23, 59, 59).getTime();

  const { events, create, update, remove, isLoading } = useCalendarEvents(startAt, endAt);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (id: Id<"calendarEvents">) => {
    const ev = events.find((e) => e._id === id) ?? null;
    setEditingEvent(ev);
    setSelectedDate(undefined);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateCalendarEvent) => {
    if (editingEvent) {
      const { error } = await update(editingEvent._id, data);
      if (error) { toast.error(error.message); return; }
      toast.success("Ereignis aktualisiert");
    } else {
      const { error } = await create(data);
      if (error) { toast.error(error.message); return; }
      toast.success("Ereignis erstellt");
    }
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) { toast.error(error.message); }
    else { toast.success("Ereignis gelöscht"); }
    setDeleteId(null);
    setDialogOpen(false);
    setEditingEvent(null);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Kalender</h1>
          <p className="text-sm text-muted-foreground">
            {MONTH_NAMES[month]} {year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditingEvent(null); setSelectedDate(new Date()); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Ereignis
          </Button>
        </div>
      </div>

      <MonthCalendar
        year={year}
        month={month}
        events={events}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />

      <CalendarEventDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingEvent(null); }}
        event={editingEvent}
        defaultDate={selectedDate}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {editingEvent && (
        <div className="fixed bottom-4 right-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteId(editingEvent._id)}
          >
            Ereignis löschen
          </Button>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Ereignis löschen"
        description="Möchtest du dieses Ereignis wirklich löschen?"
      />
    </section>
  );
}
