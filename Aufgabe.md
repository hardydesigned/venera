# Aufgaben – Venera

Quelle: NUTZER_ÄNDERUNGEN.md (2026-04-16)

---

## Laufend

### [feature] AUFG-002: Bestehende Features migrieren (Inbox, Projekte, Kalender)
**Status:** 🔄 Teilweise erledigt (Lauf #4)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

Migration der bestehenden Svelte-Features nach Next.js + Convex:
- [x] Inbox / Aufgabenmanagement (CRUD mit Convex) — Hook, Form, List, Pages
- [x] Projekte-Seite — Convex Backend + Frontend (Hook, Form, List, Pages) — Lauf #3
- [x] Kalender (Monatsansicht mit Event-Dialog) — Convex Backend + Frontend — Lauf #3
- [x] svelte-frontend und java-backend Verzeichnisse entfernt — Lauf #4
- [ ] Bugs in bestehenden Features fixen (nach Runtime-Test mit `convex dev`)

---

## Offen

### [feature] AUFG-003: Code Diff Seite implementieren
**Status:** ✅ Erledigt (Lauf #4)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

GitHub-Repository-Review-Tracking:
- [x] Convex Schema: `codeDiffRepos`, `codeDiffFiles` mit Indizes
- [x] Backend: repos/queries.ts + mutations.ts (create, update, remove mit Cascade)
- [x] Backend: files/queries.ts + mutations.ts (updateStatus, bulkSync)
- [x] Backend: sync/actions.ts — GitHub Trees API (recursive), SHA-basierte Change-Detection
- [x] Frontend: useCodeDiff.ts Hook (useCodeDiffRepos + useCodeDiffFiles)
- [x] UI: RepoList (Karten mit Sync-Button, Last-Sync-Anzeige)
- [x] UI: RepoForm (Owner, Name, Branch, Description, Token)
- [x] UI: FileTree (hierarchisch, Expand/Collapse, Suche, Status-Badge zum Klicken)
- [x] Pages: /code-diff, /code-diff/new, /code-diff/[repoId]
- [x] 4 Status-Werte: needs_review → reviewed → todo → always_green (Click-to-Cycle)
- [x] Fortschrittsanzeige (X/Y Dateien abgearbeitet)
- [ ] Webhook-Integration für automatische Sync bei GitHub Push — als Folgeaufgabe

---

### [feature] AUFG-004: Persönliche & Team To-dos
**Status:** ✅ Erledigt (Lauf #5)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [x] Persönlicher Account: private Aufgaben (userId) — bereits vorhanden
- [x] Team-Account: Aufgaben auf Organisations-Ebene (orgId als `Id<"organizations">`)
- [x] Convex Schema: `organizations` + `orgMemberships` Tabellen
- [x] Backend: Org-Mutations (create, addMemberByEmail, removeMember, leave, remove)
- [x] Backend: Org-Queries (listMine, get, getMembers)
- [x] Backend: Task-Queries/Mutations mit Org-Autorisierung
- [x] Frontend: useOrgs + useOrg Hook (Mitgliederverwaltung)
- [x] Frontend: useOrgTasks Hook (Team-Aufgaben)
- [x] UI: Inbox-Tabs (Persönlich / Team) mit Team-Auswahl
- [x] UI: Team-Seite `/team` (Org-Übersicht + Erstellen)
- [x] UI: Team-Detail `/team/[orgId]` (Mitglieder einladen/entfernen)
- [x] Sidebar: Team-Link hinzugefügt
- [ ] Aufgaben-Zuweisung (assigneeId) im TeamModus visuell anzeigen — als Folgeaufgabe

---

### [feature] AUFG-005: Data Lake Integration (Nextcloud)
**Status:** 🔄 Teilweise erledigt (Lauf #6)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [x] Nextcloud API Integration (WebDAV PROPFIND) — Convex Action `syncFromNextcloud`
- [x] Abstraktionslayer für austauschbaren Storage (Provider-Enum: nextcloud/onedrive/googledrive)
- [x] Convex Schema: `dataLakeConnections` + `dataLakeItems` mit Indizes
- [x] Backend: connections/queries.ts (list, get) + mutations.ts (create, update, remove, setLastSync)
- [x] Backend: items/queries.ts (listByConnection) + mutations.ts (bulkSync)
- [x] Backend: sync/actions.ts — WebDAV XML-Parsing, PROPFIND, Cascade-Sync
- [x] Frontend: useDataLakeConnections + useDataLakeConnection Hooks
- [x] UI: ConnectionList (Karten mit Sync-Button, Provider-Badge)
- [x] UI: ConnectionForm (Name, Anbieter, WebDAV-URL, Username, Passwort)
- [x] UI: FileList (Suche, Ordner/Datei-Icons, Größe, Datum)
- [x] Pages: /datalake, /datalake/new, /datalake/[connectionId]
- [x] Sidebar: Data Lake Link hinzugefügt
- [ ] Dateien im Browser öffnen (authentifizierter Proxy oder direkte Verlinkung) — Folgeaufgabe
- [ ] Kategorien-Ansicht (Ideen, Marketing etc.) — Folgeaufgabe
- [ ] OneDrive + Google Drive Provider implementieren (nur Nextcloud/WebDAV aktiv) — Folgeaufgabe

---

### [feature] AUFG-006: KI-Agenten-Portal
**Status:** 🔄 Teilweise erledigt (Lauf #9)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001, AUFG-005

- [x] Recherche: LangChain.js Deep/Agent Framework (Context7)
- [x] Convex Schema: `aiAgents` + `agentLogs` Tabellen
- [x] Backend: agents/mutations.ts (create, update, remove, setLastRun)
- [x] Backend: agents/queries.ts (list, get)
- [x] Backend: logs/mutations.ts (createLog, finishLog)
- [x] Backend: logs/queries.ts (listByAgent)
- [x] Backend: run/actions.ts — Anthropic API (Claude Haiku) mit Data Lake Kontext
- [x] Frontend: useAgents + useAgent Hooks
- [x] UI: AgentList (Karten mit Status, Zeitplan, Run-Button)
- [x] UI: AgentForm (Name, Beschreibung, Prompt, Zeitplan, aktiv-Toggle)
- [x] UI: Agent-Detailseite mit Logs (Status-Icons, Zusammenfassung)
- [x] Pages: /agenten, /agenten/new, /agenten/[id]
- [x] Sidebar: KI-Agenten Link hinzugefügt
- [x] Sicherheit: Agenten haben nur Lesezugriff auf Data Lake (kein Schreiben/Löschen)
- [x] Agenten-Verbindungen: UI zum Verknüpfen mit Data Lake Verbindungen — Lauf #9
- [x] Edit-Page: /agenten/[id]/edit — Lauf #9
- [x] Detail-Page: Verknüpfte Connections anzeigen + Edit-Button — Lauf #9
- [ ] Zeitgesteuerte Agenten (Convex Scheduler / Cron) — Folgeaufgabe
- [ ] Telegram Bot Integration (AUFG-007) für Agent-Steuerung

---

### [feature] AUFG-007: Telegram Bot Integration
**Status:** ✅ Erledigt (Lauf #8)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-006

- [x] Convex Schema: `telegramSettings` Tabelle (botToken, authorizedChatId, webhookRegistered)
- [x] Backend: `convex/telegram/_model/telegram.ts` — Zod-Schema + Typen
- [x] Backend: `convex/telegram/bot/queries.ts` — getMine + getByChatId (internalQuery)
- [x] Backend: `convex/telegram/bot/mutations.ts` — upsertSettings, setWebhookRegistered, removeSettings
- [x] Backend: `convex/telegram/bot/actions.ts` — registerWebhook, removeWebhook (Telegram API)
- [x] Backend: `convex/telegram/webhook/actions.ts` — handleWebhook HTTP-Action
- [x] Backend: `convex/agents/agents/queries.ts` — listByUser (internalQuery für Webhook)
- [x] Backend: `convex/http.ts` — POST /telegram/webhook Route registriert
- [x] Backend: `convex/lib/auth.ts` — requireAuth für ActionCtx erweitert
- [x] Frontend: `useTelegram()` Hook — save, remove, registerWebhook, removeWebhook
- [x] UI: `/agenten/telegram` — Setup-Anleitung, Token-Eingabe, Chat-ID, Webhook-Management
- [x] Sidebar: Telegram Bot Link hinzugefügt
- [x] Befehle: /start, /help, /list, /run <Name>, /status
- [ ] Telegram-Benachrichtigung nach Agent-Run (Push-Notification) — Folgeaufgabe
- [ ] /stop Befehl (laufenden Agenten abbrechen) — Folgeaufgabe

---

### [feature] AUFG-008: Nutzer-Feedback-Dialog
**Status:** ✅ Erledigt (Lauf #7)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [x] Convex Schema: `userFeedback` Tabelle (type, title, description, status)
- [x] Convex Mutation: `submit` (feedback/feedback/mutations.ts)
- [x] Convex Query: `listMine` (eigene Feedbacks abrufen)
- [x] `components/FeedbackDialog.tsx` — Dialog mit Typ (Feature/Bug/Sonstiges), Titel, Beschreibung
- [x] Sidebar: Feedback-Button im unteren Bereich hinzugefügt
- [ ] Optional: Automatischer GitHub-Issue oder E-Mail an Developer — als Folgeaufgabe

---

### [maintenance] AUFG-009: AGENTS.md und CLAUDE.md aktualisieren
**Status:** 🔄 Teilweise erledigt (Lauf #1)
**Agent:** MAINTENANCE_AGENT

- [x] Clerk-Referenzen durch Convex Auth ersetzen
- [x] Tech Stack aktualisieren (@convex-dev/auth statt @clerk/nextjs)
- [x] Projektname von "SentryCommand" auf "Venera" aktualisiert
- [ ] Authentifizierungs-Pattern mit Convex Auth vollständig dokumentieren
- [ ] Code-Beispiele in AGENTS.md auf requireAuth() aktualisieren (nicht requireOrgIdentity)

---

### [feature] AUFG-010: Projekte-Seite implementieren
**Status:** ✅ Erledigt (Lauf #3)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [x] Convex: Projekte-Queries (listPersonal, get) + Mutations (create, update, remove)
- [x] Frontend: useProjects Hook + useProject(id)
- [x] UI: Projektkarten-Raster mit Farbstreifen
- [x] UI: Projekt-Formular (Erstellen/Bearbeiten) mit Titel, Beschreibung, Ziel, Farbe
- [ ] UI: Projekte nach Priorität A/B/C trennen (Wochenansicht) — als Folgeaufgabe offen
- [ ] Aufgaben einem Projekt zuordnen — als Folgeaufgabe offen

---

### [feature] AUFG-011: Kalender-Seite implementieren
**Status:** ✅ Erledigt (Lauf #3)
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [x] Convex: CalendarEvents-Queries (listByRange, get) + Mutations (create, update, remove)
- [x] Frontend: useCalendarEvents(startAt, endAt) Hook
- [x] UI: Monatsansicht (MonthCalendar) mit Tagesklick
- [x] UI: Events erstellen, bearbeiten, löschen (CalendarEventDialog)
- [ ] UI: Wochen-/Tagesansicht — als Folgeaufgabe offen

---

## Erledigt

### [feature] AUFG-001: Next.js + Convex Foundation aufbauen
**Status:** ✅ Erledigt (Lauf #1 + #2)
**Agent:** FEATURE_AGENT

- [x] package.json mit allen Abhängigkeiten
- [x] next.config.ts
- [x] tsconfig.json, postcss.config.mjs
- [x] convex/schema.ts mit authTables + tasks/projects/calendarEvents
- [x] convex/auth.ts (Convex Auth Password Provider)
- [x] convex/auth.config.ts
- [x] convex/http.ts (HTTP-Routes für Auth)
- [x] convex/lib/auth.ts (requireAuth Helper)
- [x] convex/tasks/_model/task.ts (Zod Schema)
- [x] convex/tasks/tasks/queries.ts (listPersonal, listByOrg, get)
- [x] convex/tasks/tasks/mutations.ts (create, update, remove)
- [x] middleware.ts (Route Protection via convexAuthNextjsMiddleware)
- [x] app/layout.tsx (Root Layout mit ConvexAuthNextjsServerProvider)
- [x] app/(auth)/layout.tsx — Auth-Wrapper-Layout
- [x] app/globals.css (Tailwind v4 + CSS Variables)
- [x] lib/utils.ts (cn() Helper)
- [x] components/ConvexClientProvider.tsx
- [x] app/(auth)/login/page.tsx — Login-Seite
- [x] app/(auth)/register/page.tsx — Registrierungs-Seite
- [x] app/(protected)/layout.tsx — Geschützte Layout mit Sidebar
- [x] app/(protected)/_components/Sidebar.tsx — Navigation
- [x] app/(protected)/page.tsx — Dashboard
- [x] components/ui/{button,input,label,card,form,select,dialog,badge,scroll-area,dropdown-menu,separator,checkbox,textarea}.tsx (Shadcn-Basis)
- [x] components/DeleteConfirmDialog.tsx — Wiederverwendbarer Lösch-Dialog
- [x] .env.local.example
- [ ] **Noch offen**: `pnpm install` + `convex dev` für erste Runtime-Prüfung (manuell erforderlich)
