"use client";

export default function CalendarPage() {
  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Kalender</h1>
        <p className="text-sm text-muted-foreground">
          Aufgaben mit Terminen im Überblick
        </p>
      </div>
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Kalender-Ansicht – wird in T04 implementiert
      </div>
    </section>
  );
}
