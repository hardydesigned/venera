# Aufgabe.md – Venera Projekt

## Offene Aufgaben

### [feature] T01: Next.js App mit Convex + Convex Auth aufsetzen
**Priorität:** Hoch | **Status:** In Arbeit (90% fertig)
Initialisierung der neuen Next.js 16 App (App Router) als Ersatz für svelte-frontend + java-backend.
- [x] `nextjs-app/` Verzeichnis anlegen und Next.js 16 scaffolden
- [x] Convex einrichten (`convex/` Verzeichnis, schema.ts, lib/auth.ts)
- [x] `@convex-dev/auth` installieren und konfigurieren (ersetzt Clerk)
- [x] Tailwind 4 + Shadcn/UI einrichten
- [x] Basis-Layout mit Sidebar/Navigation erstellen
- [x] Protected Route Layout (`(protected)/layout.tsx`)
- [x] AGENTS.md / CLAUDE.md auf Convex Auth anpassen (Clerk entfernen)
- [ ] **WICHTIG**: `rm -rf nextjs-app/.git` ausführen damit nextjs-app als reguläre Dateien im Repo ist
- [ ] `npx convex dev` ausführen um _generated/ Typen zu generieren und Convex-Projekt zu verknüpfen

### [feature] T02: Auth-Seiten migrieren (Login, Register, Passwort vergessen)
**Priorität:** Hoch | **Status:** In Arbeit (80% fertig) | **Abhängig von:** T01
- [x] Login-Seite (`/login`)
- [x] Register-Seite (`/register`)
- [x] Forgot-Password-Seite (`/forgot-password`)
- [x] Auth-Callback-Handling (API-Route `/api/auth/[...convexauth]`)
- [ ] Convex Auth Backend: Passwort-basierte Authentifizierung (braucht `npx convex dev`)
- [ ] Passwort-Reset-Flow vollständig implementieren

### [feature] T03: Tasks-Modul migrieren (Convex Backend + Next.js Frontend)
**Priorität:** Hoch | **Status:** In Arbeit (60% fertig) | **Abhängig von:** T01
- [x] Convex Schema: `tasks` Tabelle
- [x] Convex Mutations: create, update, remove
- [x] Convex Queries: list, get, listInbox
- [x] Frontend Hook: `useTasks.ts`
- [x] Komponenten: TaskCard, CreateTaskDialog
- [x] Seite: Inbox (`/inbox`)
- [ ] Task-Edit-Dialog implementieren
- [ ] Task-Detail-Seite
- [ ] Batch-Create für wiederkehrende Aufgaben

### [feature] T04: Calendar-Modul migrieren
**Priorität:** Mittel | **Status:** Offen | **Abhängig von:** T03
- [ ] Calendar Monat/Woche/Tages-Ansicht
- [ ] Drag & Drop für Task-Termine
- [ ] Wiederkehrende Aufgaben
- [ ] Calendar-Toolbar

### [feature] T05: Projects-Modul migrieren
**Priorität:** Mittel | **Status:** Offen | **Abhängig von:** T01
- [ ] Convex Schema: `projects`, `projectTasks`
- [ ] CRUD für Projekte
- [ ] Gantt-Ansicht oder Board-Ansicht
- [ ] Projekt-Detail-Seite

### [feature] T06: Teams/Orgs-Modul migrieren
**Priorität:** Mittel | **Status:** Offen | **Abhängig von:** T01
- [ ] Persönlicher Account + Team-Account
- [ ] Team-Erstellung, Mitglieder einladen
- [ ] Aufgaben auf Teamebene zuweisen
- [ ] Rollen: OWNER, MEMBER

### [feature] T07: Code Diff Seite – GitHub Repository Review Tracking
**Priorität:** Mittel | **Status:** Offen | **Abhängig von:** T01
GitHub-Repository verlinken und Datei-Review-Status tracken.
- [ ] GitHub Repository verbinden (OAuth oder Personal Access Token)
- [ ] Dateiliste eines Repos laden (GitHub API)
- [ ] Datei-Status-Modell: `to_review`, `reviewed`, `ignored`, `changed`
- [ ] Beim Git-Pull: geänderte Dateien erkennen und Status zurücksetzen
- [ ] Convex Schema: `githubRepos`, `fileReviewStatus`
- [ ] UI: Dateiliste mit Status-Badges, Klick zum Status-ändern
- [ ] Filter: nur unreviewed / alle

### [feature] T08: Nextcloud / Data Lake Integration
**Priorität:** Niedrig | **Status:** Offen | **Abhängig von:** T01
- [ ] Nextcloud-Verbindung (WebDAV oder Nextcloud API)
- [ ] Datei-Übersicht-Seite (Data Lake Ansicht)
- [ ] Dateien verlinken zum Browser-Öffnen
- [ ] Abstrakte Storage-Interface damit auch OneDrive/Google Drive austauschbar

### [feature] T09: KI-Agenten Portal
**Priorität:** Niedrig | **Status:** Offen | **Abhängig von:** T01, T08
KI-Agenten die auf Nextcloud-Daten zugreifen und Dokumente erstellen.
- [ ] Recherche: Manus/ähnliche Agenten-Frameworks (LangChain vs. eigene Lösung)
- [ ] Agent-Konfiguration: Name, Beschreibung, Datenquellen, Zeitplan
- [ ] Agent-Ausführung (cron-basiert oder manuell)
- [ ] Readonly-Zugriff + Write für neue Dokumente (kein Delete)
- [ ] Agent-Log / Ergebnis anzeigen

### [feature] T10: Telegram Integration für Agenten
**Priorität:** Niedrig | **Status:** Offen | **Abhängig von:** T09
- [ ] Telegram Bot einrichten
- [ ] Agenten starten/stoppen per Telegram
- [ ] Status und Ergebnisse per Telegram empfangen
- [ ] Chat-Interface im Frontend mit Bot

### [feature] T11: Feature-Request Dialog für Nutzer
**Priorität:** Niedrig | **Status:** Offen | **Abhängig von:** T01
- [ ] Dialog: Nutzer kann Änderungswunsch eingeben
- [ ] Speicherung als Convex-Dokument
- [ ] Optional: GitHub Issue automatisch erstellen

---

## Laufende Aufgaben

*(keine)*

---

## Erledigte Aufgaben

*(keine)*

---

## Bekannte Bugs / Technische Schulden

- [ ] Svelte-Frontend: Diverse Bugs in bestehenden Features (T01-T06 Migrations lösen das durch Neuimplementierung)
- [ ] Java-Backend: wird komplett ersetzt durch Convex

---

## Neue Aufgaben (entdeckt bei der Arbeit)

*(werden laufend ergänzt)*
