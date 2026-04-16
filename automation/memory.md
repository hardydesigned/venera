# Projekt-Memory

Kompakte Erinnerung für zukünftige Läufe. Enthält wichtige Erkenntnisse, sensible Stellen und Kontext.

## Index der Feature-Memory-Dateien
- [Next.js + Convex Migration](memory/migration-convex.md) — Grundlegende Migration von Java+Svelte zu Next.js+Convex
- [Convex Auth Setup](memory/convex-auth.md) — Authentifizierung mit @convex-dev/auth statt Clerk

## Aktueller Projektstatus (Stand: 2026-04-16)

### Stack
- **Alt (zu ersetzen)**: Java 21 + Spring Boot Backend, SvelteKit Frontend
- **Neu (Ziel)**: Next.js 15 (App Router) + Convex Backend + Convex Auth

### Bestehende Features (im Svelte-Frontend)
- Inbox / To-dos (Aufgabenmanagement)
- Projekte
- Kalender (Wochenansicht)
- Auth (Google OAuth, E-Mail/Passwort)

### Geplante Features (aus NUTZER_ÄNDERUNGEN.md)
1. **Vollständige Migration zu Next.js + Convex** (läuft)
2. **Code Diff Seite** — GitHub Repository Review Tracking
3. **Persönliche & Team To-dos** — Persönliche Aufgaben + Org-Level Aufgaben
4. **Data Lake Integration** — Nextcloud-ähnlicher Datei-Storage
5. **KI-Agenten-Portal** — LangChain Deep Agent, zeitgesteuerte Agenten
6. **Telegram Bot Integration** — Agenten via Telegram steuern
7. **Nutzer-Feedback-Dialog** — Feature-Wünsche an Developer senden

### Wichtige Entscheidungen
- **Convex Auth** statt Clerk (User-Anforderung: keine externen Auth-Services)
- **Persönlicher Account + Team-Account** Trennung in Convex via user_id und org_id
- **250 Zeilen** Limit pro Datei (CLAUDE.md Regel)
- **Convex-Helpers/Zod4** für Validierung verwenden

### Sensible/problematische Stellen
- Convex Auth benötigt `CONVEX_SITE_URL` Env-Variable für den HTTP-Router
- Bei Convex Auth: `auth.addHttpRoutes(http)` muss in `convex/http.ts` aufgerufen werden
- Das `authTables` Schema muss in `convex/schema.ts` importiert werden
- Convex Auth Middleware: Package-Name ist `@convex-dev/auth/nextjs/server`

### Erkenntnisse aus Lauf #1 (2026-04-16)
- Root-Level hatte keinen package.json → Next.js App direkt im Root angelegt ✅
- Altes svelte-frontend/ und java-backend/ bleiben vorerst als Referenz erhalten
- AGENTS.md: Clerk → Convex Auth aktualisiert ✅
- Convex Tasks-Modul: Pfad ist `convex/tasks/tasks/queries.ts` → API-Pfad: `api.tasks.tasks.queries.listPersonal`
- Build/Runtime konnte noch nicht geprüft werden (pnpm install + convex dev nötig)
- Convex _generated/ fehlt noch (wird durch `convex dev` erstellt)
- Nächste Priorität: AUFG-001 fertigstellen (remaining tasks) + AUFG-002 starten
