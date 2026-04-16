# Automation Memory – Venera Projekt

## Projektüberblick
- **Aktueller Stack**: Svelte 5 + SvelteKit Frontend, Java Spring Boot Backend
- **Zielstack**: Next.js 16 (App Router) + Convex Backend + Convex Auth
- **Auth-Änderung**: Clerk RAUS, Convex Auth (eigene Implementierung mit `@convex-dev/auth`) REIN
- **Arbeits-Branch**: `claude/auto-coder`

## Bestehende Features (Svelte App)
- **Tasks**: CRUD, Priorität A/B/C, Status OPEN/IN_PROGRESS/DONE/CANCELLED, Dauer-Schätzung
- **Calendar**: Monat/Woche/Tag/Jahr-Ansichten, Drag & Drop, wiederkehrende Aufgaben
- **Inbox**: Aufgaben ohne Datum/Kontext
- **Projects**: Projekte mit Gantt-Ansicht
- **Teams**: OWNER/MEMBER Rollen, Einladungen per E-Mail

## Java Backend Entitäten (müssen in Convex migriert werden)
- `User` (id, email, passwordHash, name)
- `Organization` (id, name, ownerId)
- `Task` (id, title, description, startDate, dueDate, category, status, estimatedDurationMinutes, actualDurationMinutes)
- Teams + TeamInvitations

## Wichtige Architektur-Entscheidungen
- Neue App wird in `nextjs-app/` angelegt (svelte-frontend bleibt während Transition)
- Convex Auth statt Clerk für Authentifizierung
- Keine externe Auth-Service-Abhängigkeit mehr
- Personal Account + Team/Org Account (Convex unterstützt beides)

## Feature Memories (Index)
- [Tasks-Modul](./memories/tasks-modul.md) - Details zum Task-Datenmodell
- [Auth-Architektur](./memories/auth-architektur.md) - Convex Auth Details

## Letzte Runs
- **Run 1** (2026-04-16): Automation-Infrastruktur angelegt, Aufgaben aus NUTZER_ÄNDERUNGEN.md erstellt, Next.js App Scaffolding begonnen
