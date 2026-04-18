# Migration: Java+Svelte → Next.js+Convex

## Status
Lauf #1: Foundation erstellt

## Entscheidungen
- Next.js App direkt im Root-Verzeichnis (nicht in Unterordner)
- svelte-frontend/ und java-backend/ bleiben als Referenz bis alle Features migriert sind
- Dann werden beide Verzeichnisse gelöscht

## Betroffene Dateien (alt → neu)
| Alt | Neu |
|-----|-----|
| svelte-frontend/src/routes/(protected)/inbox | app/(protected)/inbox/ |
| svelte-frontend/src/routes/(protected)/projects | app/(protected)/projects/ |
| svelte-frontend/src/routes/(protected)/calendar | app/(protected)/calendar/ |
| java-backend/src/.../TaskItem | convex/tasks/_model/task.ts |
| java-backend/src/.../Project | convex/projects/_model/project.ts |
| java-backend/src/.../CalendarEvent | convex/calendar/_model/event.ts |

## Convex Schema Tabellen (geplant)
- `tasks` — Aufgaben (persönlich + Team)
- `projects` — Projekte
- `calendarEvents` — Kalenderereignisse
- `codeDiffRepos` — GitHub Repos für Code Review
- `codeDiffFiles` — Datei-Review-Status
- `aiAgents` — KI-Agenten-Definitionen
