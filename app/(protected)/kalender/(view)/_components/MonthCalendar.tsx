"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/convex/calendar/_model/calendarEvent";
import type { Id } from "@/convex/_generated/dataModel";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const colorClasses: Record<string, string> = {
  gray: "bg-gray-200 text-gray-800",
  red: "bg-red-200 text-red-800",
  orange: "bg-orange-200 text-orange-800",
  yellow: "bg-yellow-200 text-yellow-800",
  green: "bg-green-200 text-green-800",
  blue: "bg-blue-200 text-blue-800",
  purple: "bg-purple-200 text-purple-800",
  pink: "bg-pink-200 text-pink-800",
};

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (id: Id<"calendarEvents">) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  // Monday=0
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function MonthCalendar({
  year,
  month,
  events,
  onDayClick,
  onEventClick,
}: MonthCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const today = new Date();

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (day: number): CalendarEvent[] => {
    const start = new Date(year, month, day, 0, 0, 0).getTime();
    const end = new Date(year, month, day, 23, 59, 59).getTime();
    return events.filter((e) => e.startAt >= start && e.startAt <= end);
  };

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "min-h-24 bg-card p-1 text-sm",
              day ? "cursor-pointer hover:bg-accent/50" : "bg-muted/30",
            )}
            onClick={() => day && onDayClick(new Date(year, month, day))}
            data-testid={day ? `calendar-day-${day}` : undefined}
          >
            {day && (
              <>
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday(day) && "bg-primary text-primary-foreground",
                  )}
                >
                  {day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {eventsForDay(day).slice(0, 3).map((ev) => (
                    <button
                      key={ev._id}
                      className={cn(
                        "w-full truncate rounded px-1 py-0.5 text-left text-xs font-medium",
                        colorClasses[ev.color ?? "blue"] ?? colorClasses.blue,
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev._id);
                      }}
                    >
                      {ev.title}
                    </button>
                  ))}
                  {eventsForDay(day).length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{eventsForDay(day).length - 3} weitere
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
