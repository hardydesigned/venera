"use client";

export default function CodeDiffPage() {
  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Code Diff</h1>
        <p className="text-sm text-muted-foreground">
          GitHub-Repository verknüpfen und Datei-Reviews tracken
        </p>
      </div>
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Code-Diff-Ansicht – wird in T07 implementiert
      </div>
    </section>
  );
}
