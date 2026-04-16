# Function Index – Venera Projekt

## Svelte Frontend Funktionen (werden nach Convex migriert)

### Tasks API (`svelte-frontend/src/lib/api/tasks.ts`)
- `fetchInboxTasks()` - Alle Inbox-Tasks (kein Datum)
- `fetchAllTasks()` - Alle Tasks
- `createTask(input: CreateTaskInput)` - Task erstellen
- `updateTask(id, input: UpdateTaskInput)` - Task aktualisieren
- `deleteTask(id)` - Task löschen
- `batchCreateTasks(inputs[])` - Mehrere Tasks erstellen (wiederkehrende)

### Calendar Utils (`svelte-frontend/src/lib/features/calendar/calendar-utils.ts`)
- Kalender-Hilfsfunktionen (Datum-Berechnungen)

### Recurring Utils (`svelte-frontend/src/lib/features/calendar/recurring-utils.ts`)
- Wiederkehrende Aufgaben generieren

---

## Next.js / Convex Funktionen (werden laufend ergänzt)

### Auth (`nextjs-app/convex/lib/auth.ts`)
- `requireAuth(identity)` - Pflicht-Auth-Check ohne Org, gibt `{ userId }` zurück
- `requireOrgIdentity(identity)` - Pflicht-Auth-Check mit Org, gibt `{ userId, orgId }` zurück

### Tasks Hooks (`nextjs-app/app/(protected)/inbox/_controller/useTasks.ts`)
- `useTasks()` – Hook für vollständige Task-Liste + CRUD. Gibt `{ tasks, isLoading, create, update, remove }` zurück
- `useInboxTasks()` – Hook für Inbox (nur Tasks ohne Datum + nicht abgeschlossen)
