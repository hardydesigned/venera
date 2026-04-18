# Projekt-Memory

Kompakte Erinnerung für zukünftige Läufe. Enthält wichtige Erkenntnisse, sensible Stellen und Kontext.

## Index der Feature-Memory-Dateien
- [Telegram Bot Feature](memory/telegram-bot.md) — Telegram Bot Integration, Webhook-Setup, Commands, requireAuth ActionCtx
- [Next.js + Convex Migration](memory/migration-convex.md) — Grundlegende Migration von Java+Svelte zu Next.js+Convex
- [Convex Auth Setup](memory/convex-auth.md) — Authentifizierung mit @convex-dev/auth statt Clerk
- [Inbox / Tasks Feature](memory/inbox-tasks.md) — Aufgabenverwaltung (CRUD) mit Convex + React Hook Form
- [Code Diff Feature](memory/code-diff.md) — GitHub Repository Review-Tracking, SHA-Change-Detection, Sync-Action
- [Team / Org Feature](memory/team-org.md) — Organisations- und Team-Verwaltung, Mitglieder, Org-Tasks
- [Data Lake Feature](memory/data-lake.md) — Nextcloud/WebDAV Integration, Storage-Abstraction, File-Browser
- [KI-Agenten Portal](memory/ai-agents.md) — Anthropic API, Convex Actions, Agent-Logs, Data Lake Kontext, Cron-Scheduler
- [Feedback Dialog](memory/feedback-dialog.md) — Nutzer-Feedback-Dialog, Sidebar-Integration, Convex-Backend

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

### Erkenntnisse aus Lauf #11 (2026-04-18)
- AUFG-009 vollständig erledigt: AGENTS.md Authentication-Dokumentation vollständig korrigiert
- Mutations/Queries-Beispiele zeigen jetzt `requireAuth(ctx)` → `{ userId }` (nicht `requireOrgIdentity`)
- Autorisierung: `entity.userId !== userId` für persönliche Ressourcen; `orgMemberships`-Tabelle für Org-Ressourcen
- Neue Sektion 3a in AGENTS.md: vollständiges Convex Auth Pattern dokumentiert
- Common Issues: Clerk-Troubleshooting durch Convex Auth Troubleshooting ersetzt
- Nächster Agent in Rotation: SECURITY_AGENT (alle FEATURE-Tasks abgeschlossen)

### Erkenntnisse aus Lauf #10 (2026-04-18)
- AUFG-006 Cron-Scheduler vollständig implementiert
- `convex/crons.ts` — Convex `cronJobs()` alle 15 Minuten → `runScheduledAgents`
- `convex/agents/lib/schedule.ts` — `computeNextRunAt(schedule, fromMs)` für SCHEDULE_OPTIONS-Expressions
- `convex/agents/run/scheduled.ts` — `runScheduledAgents` (internalAction) + `runAgentById` (internalAction)
- `convex/agents/agents/mutations.ts` — `updateNextRun` (internalMutation) + nextRunAt in create/update
- `convex/agents/agents/queries.ts` — `listDueForRun` + `getInternal` (internalQuery)
- `convex/datalake/items/queries.ts` — `listByConnectionInternal` (internalQuery)
- Schema: `nextRunAt` Feld + `by_next_run` Index auf `aiAgents`
- Wichtig: Cron-Action muss `"use node"` haben, weil sie `fetch` für Anthropic nutzt
- `internal.*` Referenzen funktionieren anders als `api.*` — nur für internalQuery/Mutation/Action
- Nächste offene Aufgaben: AUFG-009 (Dokumentation), AUFG-002 Bugs

### Erkenntnisse aus Lauf #9 (2026-04-18)
- AUFG-006 Folgeaufgabe: Agent-Connections UI vollständig implementiert
- `AgentForm.tsx` erweitert: neue Card-Sektion mit Checkbox-Liste für Data Lake Verbindungen
  - `connections` field: `["datalake:${id}", ...]` Format bereits im Modell/run-action vorhanden
  - `form.watch("connections")` + `form.setValue(...)` für manuelles Array-Toggle
  - prop `dataLakeConnections: DataLakeConnection[]` hinzugefügt
- `new/page.tsx`: lädt jetzt `useDataLakeConnections()` und gibt sie an AgentForm weiter
- `[id]/edit/page.tsx`: neu erstellt — vollständige Agent-Bearbeitungsseite mit React 19 `use(params)`
- `AgentList.tsx`: "Bearbeiten" Link im Dropdown hinzugefügt (`/agenten/${id}/edit`)
- `[id]/page.tsx`: Bearbeiten-Button + Card mit verknüpften Connections (Badge-Darstellung)
- Alle Dateien unter 250 Zeilen ✅
- Nächste offene Aufgaben: AUFG-009 (Dokumentation), AUFG-006 Cron-Scheduler, AUFG-002 Bugs

### Erkenntnisse aus Lauf #8 (2026-04-17)
- AUFG-007 vollständig implementiert: Telegram Bot Integration
- Schema: `telegramSettings` Tabelle neu in schema.ts
- `convex/lib/auth.ts` → `requireAuth` jetzt für `QueryCtx | MutationCtx | ActionCtx` (vorher fehlte ActionCtx-Support)
- Webhook-Architektur: HTTP POST /telegram/webhook → handleWebhook → `internal.telegram.bot.queries.getByChatId` → `internal.agents.agents.queries.listByUser`
- Interne Queries (`internalQuery`) werden für den unauthentifizierten Webhook-Handler benötigt
- Telegram-Befehle: /start, /help, /list, /run <Name>, /status
- Sicherheit: Nur autorisierte Chat-IDs können den Bot steuern (Lookup via by_chat Index)
- Nächste Priorität: AUFG-009 (Dokumentation) oder weitere AUFG-006 Folgeaufgaben (Agent-Connections UI, Cron Scheduler)

### Erkenntnisse aus Lauf #7 (2026-04-17)
- AUFG-008 vollständig erledigt: Feedback-Dialog (Schema, Mutation, Query, FeedbackDialog-Komponente, Sidebar-Button)
- AUFG-006 teilweise erledigt: KI-Agenten-Portal (Schema, Backend, Frontend, Sidebar-Link)
- `components/ui/switch.tsx` erstellt (war fehlend, @radix-ui/react-switch war bereits in package.json)
- KI-Agenten nutzen direkte Anthropic API in Convex Actions (`"use node"`) — kein LangChain nötig für Basisfälle
- Modell: `claude-haiku-4-5-20251001` für Agenten (schnell + kostengünstig)
- `ANTHROPIC_API_KEY` muss als Convex Env-Variable gesetzt werden
- Agenten-Sicherheit: nur Lesezugriff auf Data Lake (listByConnection), kein Schreiben/Löschen
- Nächste Priorität: AUFG-006 Folgeaufgaben (Agent-Connections UI, Cron Scheduler) oder AUFG-007 (Telegram Bot)

### Erkenntnisse aus Lauf #6 (2026-04-17)
- AUFG-005 teilweise implementiert: Data Lake Integration (Nextcloud WebDAV)
- Schema: `dataLakeConnections` + `dataLakeItems` Tabellen neu
- Convex Action `syncFromNextcloud` nutzt `"use node"` für Node.js `Buffer`-API
- WebDAV PROPFIND XML wird per Regex geparst (kein XML-Parser nötig)
- API-Pfade: `api.datalake.connections.queries.*`, `api.datalake.items.*`, `api.datalake.sync.actions.*`
- Provider-Enum: `nextcloud | onedrive | googledrive` — nur Nextcloud implementiert
- Noch offen: Datei-Browser (auth. Proxy), Kategorien-Ansicht, weitere Provider
- Nächste Priorität: AUFG-008 (Feedback-Dialog) oder AUFG-006 (KI-Agenten recherchieren)

### Erkenntnisse aus Lauf #5 (2026-04-17)
- AUFG-004 vollständig implementiert: Org-Verwaltung + Team-Aufgaben
- Schema: `organizations` + `orgMemberships` Tabellen neu, `tasks.orgId` von `v.string()` → `v.id("organizations")`
- Org-Autorisierung: Mitgliedschaft wird in allen Org-bezogenen Queries/Mutations geprüft
- Tabs-Komponente (Radix UI @radix-ui/react-tabs) erstellt
- API-Pfade: `api.organizations.orgs.queries.*` und `api.organizations.orgs.mutations.*`
- Nächste Priorität: AUFG-005 (Data Lake Integration Nextcloud) oder AUFG-008 (Feedback-Dialog)

### Erkenntnisse aus Lauf #4 (2026-04-17)
- svelte-frontend + java-backend vollständig entfernt (AUFG-002 Teilaufgabe abgeschlossen)
- Code Diff Feature vollständig implementiert (AUFG-003)
  - Convex Action `syncRepoFromGitHub` nutzt GitHub Trees API (recursive)
  - SHA-basierte Change-Detection: geänderte Dateien → `needs_review` (außer `always_green`)
  - Hierarchischer Dateibaum (buildTree-Funktion, rekursiv) mit Expand/Collapse
  - FILE_STATUS_NEXT Map für Click-to-Cycle Status-Wechsel
- Nächste Priorität: AUFG-004 (Persönliche & Team To-dos) oder AUFG-002 Bugs fixen

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
