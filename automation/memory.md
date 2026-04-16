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

## Kritische Hinweise
- **nextjs-app/.git Problem**: `pnpm create next-app` hat ein eigenes `.git` erstellt. User muss `rm -rf nextjs-app/.git` ausführen, damit die Dateien im Haupt-Repo getracked werden. Bis dahin ist nextjs-app als "Submodul" registriert.
- **Convex Setup**: Vor dem Start muss `npx convex dev` in `nextjs-app/` ausgeführt werden. Das generiert `convex/_generated/` und verknüpft das Convex-Projekt.
- **ConvexClientProvider**: Verwendet Placeholder-URL für Build ohne env. Im echten Betrieb muss `NEXT_PUBLIC_CONVEX_URL` gesetzt sein.

## Letzte Runs
- **Run 1** (2026-04-16): 
  - Automation-Infrastruktur angelegt (Aufgabe.md, state.json, log.md, memory.md, type_index.md, function_index.md)
  - nextjs-app/ erstellt: Next.js 16 + Convex + Convex Auth + Shadcn/UI
  - Auth-Seiten: Login, Register, Forgot-Password
  - Inbox-Seite mit Task-CRUD implementiert
  - Build erfolgreich (pnpm build bestanden)
  - CLAUDE.md auf Convex Auth aktualisiert
- **Run 2** (2026-04-16):
  - EditTaskDialog.tsx: vorausgefüllter Edit-Dialog für Tasks (alle Felder)
  - DeleteConfirmDialog.tsx: wiederverwendbarer Bestätigungs-Dialog (components/)
  - inbox/page.tsx verdrahtet: Edit + Delete mit Confirmation
  - Build erfolgreich (pnpm build bestanden)
  - T03 jetzt 75% fertig
- **Run 3** (2026-04-16):
  - `useTask` Hook (single task) zu useTasks.ts hinzugefügt
  - Task-Detail-Seite implementiert: `/inbox/[id]/page.tsx`
    - Zeigt alle Task-Details (Titel, Beschreibung, Priorität, Status, Dauer)
    - Inline Edit via EditTaskDialog + Löschen via DeleteConfirmDialog
    - Nach Löschen: Redirect zurück zu /inbox
  - TaskCard.tsx: Titel-Link zur Detail-Seite + "Details" im Dropdown-Menü
  - nextjs-app/.git konnte nicht entfernt werden (sensitive Operation, User-Aktion nötig)
  - Build erfolgreich: 11 Routen incl. /inbox/[id] ✓
  - T03 jetzt 90% fertig (nur Batch-Create fehlt noch)

## Wiederverwendbare Komponenten (components/)
- `DeleteConfirmDialog` – allgemeiner Bestätigungs-Dialog für Lösch-Aktionen
