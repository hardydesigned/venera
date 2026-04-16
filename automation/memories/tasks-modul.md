# Memory: Tasks-Modul

## Datenmodell (aus Java Backend + Svelte Frontend)
- `id`: string
- `title`: string (required)
- `description`: string
- `startDate`: ISO date string | null
- `dueDate`: ISO date string | null
- `category`: A | B | C (Eisenhower-Matrix / ABC-Priorität)
- `status`: OPEN | IN_PROGRESS | DONE | CANCELLED
- `estimatedDurationMinutes`: number | null
- `actualDurationMinutes`: number | null

## Convex Ziel-Schema
- Tabelle: `tasks`
- Index: `by_user` (userId), `by_org` (orgId), `by_status`
- Persönliche Tasks haben orgId=null, Team-Tasks haben orgId gesetzt

## Inbox-Logik
- Inbox = Tasks ohne startDate UND ohne dueDate
- Tasks mit Datum erscheinen im Kalender

## Wichtige UI-Patterns
- A-Priorität = rot/dringend
- B-Priorität = gelb/wichtig
- C-Priorität = grün/kann warten
- Drag & Drop im Kalender für Datum-Zuweisung
- Zeitschätzung als Pflichtfeld optional
