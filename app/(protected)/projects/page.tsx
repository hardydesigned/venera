"use client";

export default function ProjectsPage() {
  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Projekte</h1>
        <p className="text-sm text-muted-foreground">
          Aufgaben nach Projekten organisieren
        </p>
      </div>
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Projekte-Ansicht – wird in T05 implementiert
      </div>
    </section>
  );
}
