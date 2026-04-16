# Aufgaben – Venera

Quelle: NUTZER_ÄNDERUNGEN.md (2026-04-16)

---

## Laufend

### [feature] AUFG-001: Next.js + Convex Foundation aufbauen
**Status:** 🔄 In Bearbeitung (Lauf #1)
**Agent:** FEATURE_AGENT

Aufbau der kompletten Next.js + Convex Basis als Ersatz für den bestehenden Svelte+Java Stack.

- [x] package.json mit allen Abhängigkeiten
- [x] next.config.ts
- [x] tsconfig.json, postcss.config.mjs
- [x] convex/schema.ts mit authTables + tasks/projects/calendarEvents
- [x] convex/auth.ts (Convex Auth Password Provider)
- [x] convex/auth.config.ts
- [x] convex/http.ts (HTTP-Routes für Auth)
- [x] convex/lib/auth.ts (requireAuth Helper)
- [x] convex/tasks/_model/task.ts (Zod Schema)
- [x] convex/tasks/tasks/queries.ts (listPersonal, listByOrg)
- [x] convex/tasks/tasks/mutations.ts (create, update, remove)
- [x] middleware.ts (Route Protection via convexAuthNextjsMiddleware)
- [x] app/layout.tsx (Root Layout mit ConvexAuthNextjsServerProvider)
- [x] app/globals.css (Tailwind v4 + CSS Variables)
- [x] lib/utils.ts (cn() Helper)
- [x] components/ConvexClientProvider.tsx
- [x] app/(auth)/login/page.tsx — Login-Seite
- [x] app/(auth)/register/page.tsx — Registrierungs-Seite
- [x] app/(protected)/layout.tsx — Geschützte Layout mit Sidebar
- [x] app/(protected)/_components/Sidebar.tsx — Navigation
- [x] app/(protected)/page.tsx — Dashboard
- [x] components/ui/{button,input,label,card}.tsx (Shadcn-Basis)
- [x] .env.local.example
- [ ] **Noch offen**: `pnpm install` + `convex dev` für erste Runtime-Prüfung
- [ ] **Noch offen**: app/(auth)/layout.tsx (optionales Wrapper-Layout)
- [ ] **Noch offen**: Vollständige Shadcn-Komponenten (form, select, dialog, etc.)

---

## Offen

### [feature] AUFG-002: Bestehende Features migrieren (Inbox, Projekte, Kalender)
**Status:** ⬜ Offen
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

Migration der bestehenden Svelte-Features nach Next.js + Convex:
- [ ] Inbox / Aufgabenmanagement (CRUD mit Convex)
- [ ] Projekte-Seite mit Wochenansicht A/B/C
- [ ] Kalender (Tag/Woche/Monat/Jahr)
- [ ] Bugs in bestehenden Features fixen
- [ ] svelte-frontend und java-backend Verzeichnisse entfernen

---

### [feature] AUFG-003: Code Diff Seite implementieren
**Status:** ⬜ Offen
**Agent:** FEATURE_AGENT
**Abhängigkeit:** AUFG-001

GitHub-Repository-Review-Tracking:
- [ ] GitHub API Integration (Repository-Inhalte abrufen)
- [ ] Convex Schema: `codeDiffRepos`, `codeDiffFiles`
- [ ] Seite: Repository mit GitHub verlinken
- [ ] Pro Datei: Status setzen (fertig / zu reviewen / TODO / immer grün)
- [ ] Bei Pull/Push: geänderte Dateien automatisch auf "zu reviewen" zurücksetzen
- [ ] Webhook oder Polling für GitHub-Änderungen
- [ ] UI: Dateibaum mit Status-Badges

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

## Erledigt

_(Noch leer – erste erledigte Aufgaben folgen nach Verifikation)_
