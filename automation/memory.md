# Projekt-Memory

Kompakte Erinnerung für zukünftige Läufe. Enthält wichtige Erkenntnisse, sensible Stellen und Kontext.

## Index der Feature-Memory-Dateien
- [Next.js + Convex Migration](memory/migration-convex.md) — Grundlegende Migration von Java+Svelte zu Next.js+Convex
- [Convex Auth Setup](memory/convex-auth.md) — Authentifizierung mit @convex-dev/auth statt Clerk
- [Inbox / Tasks Feature](memory/inbox-tasks.md) — Aufgabenverwaltung (CRUD) mit Convex + React Hook Form

## Aktueller Projektstatus (Stand: 2026-04-17)

### Stack
- **Alt (zu ersetzen)**: Java 21 + Spring Boot Backend, SvelteKit Frontend
- **Neu (Ziel)**: Next.js 15 (App Router) + Convex Backend + Convex Auth

### Bestehende Features (im Svelte-Frontend)
- Inbox / To-dos (Aufgabenmanagement)
- Projekte
- Kalender (Wochenansicht)
- Auth (Google OAuth, E-Mail/Passwort)

### Implementierte New-Stack Features (Stand Lauf #3)
- ✅ Next.js + Convex Foundation (Auth, Schema, Middleware)
- ✅ Shadcn UI Komponenten (13 Komponenten)
- ✅ DeleteConfirmDialog (wiederverwendbar)
- ✅ Inbox / Tasks (CRUD) — Backend + Frontend komplett
  - Hook: `useTasks()` + `useTask(id)`
  - Pages: `/inbox`, `/inbox/new`, `/inbox/[id]/edit`
- ✅ Sidebar mit Dashboard + Inbox + Projekte + Kalender + Code Diff (Links)
- ✅ Projekte (CRUD) — Backend + Frontend komplett
  - Backend: `convex/projects/_model/project.ts`, `projects/queries.ts`, `projects/mutations.ts`
  - Hook: `useProjects()` + `useProject(id)`
  - Pages: `/projekte`, `/projekte/new`, `/projekte/[id]/edit`
  - Farbige Projektkarten (8 Farben)
- ✅ Kalender (CRUD) — Backend + Frontend komplett
  - Backend: `convex/calendar/_model/calendarEvent.ts`, `events/queries.ts`, `events/mutations.ts`
  - Hook: `useCalendarEvents(startAt, endAt)` (Zeitraum-basiert)
  - Page: `/kalender` (Monatsansicht mit Monat-Navigation)
  - CalendarEventDialog für Erstellen/Bearbeiten

### Geplante Features (aus NUTZER_ÄNDERUNGEN.md)
1. **Projekte-Seite** (AUFG-010) — als Nächstes
2. **Kalender-Seite** (AUFG-011) — danach
3. **Code Diff Seite** (AUFG-003) — GitHub Repository Review Tracking
4. **Persönliche & Team To-dos** (AUFG-004) — Org-Modus für Inbox
5. **Data Lake Integration** (AUFG-005) — Nextcloud WebDAV
6. **KI-Agenten-Portal** (AUFG-006)
7. **Telegram Bot** (AUFG-007)
8. **Nutzer-Feedback-Dialog** (AUFG-008)

### Wichtige Entscheidungen
- **Convex Auth** statt Clerk (User-Anforderung: keine externen Auth-Services)
- **Persönlicher Account + Team-Account** Trennung in Convex via userId und orgId
- **250 Zeilen** Limit pro Datei (CLAUDE.md Regel)
- **Route-Gruppe**: `/inbox/(view)/` → URL: `/inbox`, `/inbox/new`, `/inbox/[id]/edit`
- **Dashboard** (`/`) zeigt Statistik, **Inbox** (`/inbox`) zeigt CRUD
- **Convex Tasks-API-Pfad**: `api.tasks.tasks.queries.*` und `api.tasks.tasks.mutations.*`

### Sensible/problematische Stellen
- Convex Auth benötigt `CONVEX_SITE_URL` Env-Variable für den HTTP-Router
- Bei Convex Auth: `auth.addHttpRoutes(http)` muss in `convex/http.ts` aufgerufen werden
- Das `authTables` Schema muss in `convex/schema.ts` importiert werden
- Convex Auth Middleware: Package-Name ist `@convex-dev/auth/nextjs/server`
- `convex/_generated/` fehlt noch (wird durch `convex dev` erstellt) — Build nicht möglich ohne
- Inbox Edit-Page nutzt React 19 `use(params)` für async params

### Erkenntnisse aus Lauf #3 (2026-04-17)
- Projekte-Feature vollständig: Backend + Hook + Form + List + 3 Pages
- Kalender-Feature vollständig: Backend + Hook + MonthCalendar + CalendarEventDialog
- Sidebar-Links `/projekte` und `/kalender` bereits korrekt vorhanden
- (view) Route-Gruppen sind URL-transparent: `/projekte/(view)/page.tsx` → URL `/projekte`
- Kalender nutzt Zeitraum-Query (startAt/endAt) für effizienten Datenbankzugriff
- Nächste Priorität: AUFG-002 Restarbeiten (Bugs fixen, svelte/java entfernen) + AUFG-003 (Code Diff)

### Erkenntnisse aus Lauf #2 (2026-04-17)
- Shadcn-Komponenten vollständig gebaut (14 Komponenten)
- `app/(auth)/layout.tsx` erstellt
- `components/DeleteConfirmDialog.tsx` als wiederverwendbarer Lösch-Dialog
- Inbox-Feature vollständig: Hook + Form + List + 3 Pages (list, new, edit)
- `convex/tasks/tasks/queries.ts` um `get` Query erweitert
- Sidebar: Dashboard-Icon auf LayoutDashboard geändert, Inbox hinzugefügt
- Nächste Priorität: AUFG-002 weiter (Projekte-Seite = AUFG-010)
