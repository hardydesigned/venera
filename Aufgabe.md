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
**Status:** ⬜ Offen
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [ ] Persönlicher Account: private Aufgaben (user_id)
- [ ] Team-Account: Aufgaben auf Organisations-Ebene (org_id)
- [ ] Aufgaben anderen Mitgliedern zuweisen
- [ ] Konvex Schema: Tasks mit `user_id` und optional `org_id`
- [ ] UI: Umschalten zwischen persönlichem und Team-Modus

---

### [feature] AUFG-005: Data Lake Integration (Nextcloud)
**Status:** ⬜ Offen
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [ ] Nextcloud API Integration (WebDAV)
- [ ] Abstraktionslayer für austauschbaren Storage (Nextcloud / OneDrive / Google Drive)
- [ ] Seite: Datei-Übersicht mit Vorschau/Link
- [ ] Seite: Verschiedene Daten-Kategorien (Ideen, Marketing, etc.)
- [ ] Dateien im Browser anzeigen

---

### [feature] AUFG-006: KI-Agenten-Portal
**Status:** ⬜ Offen
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001, AUFG-005

- [ ] Recherche: LangChain.js Deep/Agent Framework (Context7 + Web)
- [ ] Convex Schema: `aiAgents` (Name, Beschreibung, Zeitplan, Verbindungen, Prompt)
- [ ] Seite: Agenten-Übersicht und -Konfiguration
- [ ] Agenten-Verbindungen: Nextcloud/Storage (Lesen + Schreiben), GitHub (Lesen)
- [ ] Zeitgesteuerte Agenten (Cron-basiert)
- [ ] Agent-Logs anzeigen
- [ ] Sicherheit: Keine Lösch-/Änderungsrechte für Agenten in externen Systemen

---

### [feature] AUFG-007: Telegram Bot Integration
**Status:** ⬜ Offen
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-006

- [ ] Telegram Bot API Integration
- [ ] Agenten via Telegram starten/stoppen
- [ ] Status-Updates via Telegram
- [ ] Chat mit Agenten via Telegram

---

### [feature] AUFG-008: Nutzer-Feedback-Dialog
**Status:** ⬜ Offen
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

- [ ] Dialog-Komponente: Feature-Wunsch / Feedback eingeben
- [ ] Convex Mutation: Feedback speichern
- [ ] Optional: Automatischer GitHub-Issue oder E-Mail an Developer

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
