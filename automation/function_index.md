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

## Komponenten

| Komponente | Datei | Beschreibung |
|------------|-------|-------------|
| `DeleteConfirmDialog` | components/DeleteConfirmDialog.tsx | Wiederverwendbarer Lösch-Bestätigungs-Dialog |
| `TaskList` | app/(protected)/inbox/(view)/_components/TaskList.tsx | Aufgaben-Liste mit Dropdown-Menü |
| `TaskForm` | app/(protected)/inbox/(view)/_components/TaskForm.tsx | Formular für Erstellen/Bearbeiten |
