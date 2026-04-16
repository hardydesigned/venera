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

### Auth (`convex/lib/auth.ts`)
- `requireOrgIdentity(identity)` - Pflicht-Auth-Check, gibt `{ userId, orgId }` zurück

*(weitere werden bei Implementierung hinzugefügt)*
