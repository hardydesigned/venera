# Function Index

Kompakte Auflistung aller wiederverwendbaren Funktionen, Hooks und Utilities.
Bevor eine neue Funktion implementiert wird, bitte hier nachschauen!

## Utilities

| Funktion | Datei | Beschreibung |
|----------|-------|-------------|
| `cn(...classes)` | lib/utils.ts | Tailwind class merging (clsx + tailwind-merge) |

## Auth-Helpers (Convex-Backend)

| Funktion | Datei | Beschreibung |
|----------|-------|-------------|
| `requireAuth(ctx)` | convex/lib/auth.ts | Gibt `{ userId }` zurück, wirft bei nicht-authentifiziert |

## Hooks (Frontend)

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useTasks()` | app/(protected)/inbox/_controller/useTasks.ts | Tasks laden + CRUD (create, update, remove) |
| `useTask(id)` | app/(protected)/inbox/_controller/useTasks.ts | Einzelne Task laden per ID |

## Convex Queries

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `listPersonal` | api.tasks.tasks.queries.listPersonal | Persönliche Tasks des Users |
| `listByOrg` | api.tasks.tasks.queries.listByOrg | Team-Tasks einer Organisation |
| `get` | api.tasks.tasks.queries.get | Einzelne Task per ID |

## Convex Mutations

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.tasks.tasks.mutations.create | Task erstellen |
| `update` | api.tasks.tasks.mutations.update | Task aktualisieren |
| `remove` | api.tasks.tasks.mutations.remove | Task löschen |

## Hooks — Projekte

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useProjects()` | app/(protected)/projekte/_controller/useProjects.ts | Projekte laden + CRUD |
| `useProject(id)` | app/(protected)/projekte/_controller/useProjects.ts | Einzelnes Projekt per ID |

## Hooks — Kalender

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useCalendarEvents(startAt, endAt)` | app/(protected)/kalender/_controller/useCalendarEvents.ts | Events in Zeitraum + CRUD |

## Convex Queries — Projekte

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `listPersonal` | api.projects.projects.queries.listPersonal | Persönliche Projekte des Users |
| `get` | api.projects.projects.queries.get | Einzelnes Projekt per ID |

## Convex Mutations — Projekte

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.projects.projects.mutations.create | Projekt erstellen |
| `update` | api.projects.projects.mutations.update | Projekt aktualisieren |
| `remove` | api.projects.projects.mutations.remove | Projekt löschen (Tasks entkoppeln) |

## Convex Queries — Kalender

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `listByRange` | api.calendar.events.queries.listByRange | Events in Zeitraum (startAt/endAt) |
| `get` | api.calendar.events.queries.get | Einzelnes Event per ID |

## Convex Mutations — Kalender

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.calendar.events.mutations.create | Event erstellen |
| `update` | api.calendar.events.mutations.update | Event aktualisieren |
| `remove` | api.calendar.events.mutations.remove | Event löschen |

## Komponenten

| Komponente | Datei | Beschreibung |
|------------|-------|-------------|
| `DeleteConfirmDialog` | components/DeleteConfirmDialog.tsx | Wiederverwendbarer Lösch-Bestätigungs-Dialog |
| `TaskList` | app/(protected)/inbox/(view)/_components/TaskList.tsx | Aufgaben-Liste mit Dropdown-Menü |
| `TaskForm` | app/(protected)/inbox/(view)/_components/TaskForm.tsx | Formular für Erstellen/Bearbeiten |
| `ProjectList` | app/(protected)/projekte/(view)/_components/ProjectList.tsx | Projektkarten-Raster mit Farbstreifen |
| `ProjectForm` | app/(protected)/projekte/(view)/_components/ProjectForm.tsx | Formular für Projekt Erstellen/Bearbeiten |
| `MonthCalendar` | app/(protected)/kalender/(view)/_components/MonthCalendar.tsx | Monatsansicht mit klickbaren Tagen |
| `CalendarEventDialog` | app/(protected)/kalender/(view)/_components/CalendarEventDialog.tsx | Dialog für Kalender-Ereignis Erstellen/Bearbeiten |
