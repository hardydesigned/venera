# Venera Implementation Plan

## Phase 0: Projekt-Setup
- [x] Java 21, Maven, Node, pnpm lokal verifizieren
- [x] `.env.example` fuer lokale Variablen erstellen (Google OAuth, DB, URLs)
- [ ] Root `docker-compose.yml` anlegen (postgres, backend, frontend)
- [ ] Healthchecks fuer alle Services konfigurieren

## Phase 1: Backend-Struktur (Onion)
- [ ] Paketstruktur anlegen:
  - [ ] `com.hardytec.venera.domain`
  - [ ] `com.hardytec.venera.application`
  - [ ] `com.hardytec.venera.adapters.web`
  - [ ] `com.hardytec.venera.adapters.persistence`
  - [ ] `com.hardytec.venera.adapters.security`
  - [ ] `com.hardytec.venera.configuration`
- [ ] Flyway einbauen
- [ ] `application.properties` fuer Profiles `local`, `docker` vorbereiten

## Phase 2: Domain-Modell (MVP)
- [ ] Enums anlegen:
  - [ ] `TaskPriorityBucket` (`A`, `B`, `C`)
  - [ ] `TaskStatus` (`OPEN`, `IN_PROGRESS`, `DONE`, `CANCELLED`)
- [ ] Aggregate anlegen:
  - [ ] `TaskItem` (id, userId, projectId?, title, description?, dueDate?, bucket, status)
  - [ ] `SubTask` (id, taskId, title, done)
  - [ ] `Project` (id, userId, title, description?, goal?)
  - [ ] `CalendarEvent` (id, userId, projectId?, taskId?, title, startAt, endAt, color)
- [ ] Domain-Regeln als Methoden/Invarianten implementieren

## Phase 3: Datenbankschema (PostgreSQL)
- [ ] Migration `V1__init_core_tables.sql` erstellen:
  - [ ] `users`
  - [ ] `projects`
  - [ ] `tasks`
  - [ ] `subtasks`
  - [ ] `calendar_events`
- [ ] Indizes anlegen (`user_id`, `due_date`, `start_at`)
- [ ] FK-Constraints + ON DELETE Regeln definieren
- [ ] Audit-Spalten (`created_at`, `updated_at`) aufnehmen

## Phase 4: Inbox API (erstes vertikales Slice)
- [ ] Repository-Interfaces in `domain/application` definieren
- [ ] JDBC-Implementierung fuer Task + Subtask bauen
- [ ] Use Cases:
  - [ ] `CreateInboxTask`
  - [ ] `ListInboxTasks`
  - [ ] `UpdateTask`
  - [ ] `DeleteTask`
  - [ ] `DuplicateTask`
- [ ] REST-Endpunkte in `adapters.web` erstellen
- [ ] DTO-Mapping sauber trennen (kein Domain-Leak ins API)

## Phase 5: Frontend-Inbox (Svelte + Flowbite + TanStack Query)
- [ ] API-Client in `src/lib/api/http.ts` bauen
- [ ] Query Keys in `src/lib/api/queryKeys.ts` anlegen
- [ ] Inbox Feature-Struktur:
  - [ ] `src/lib/features/inbox/components/*`
  - [ ] `src/lib/features/inbox/queries.ts`
  - [ ] `src/lib/features/inbox/mutations.ts`
- [ ] Seite `src/routes/inbox/+page.svelte` auf echte Daten umstellen
- [ ] CRUD + Duplicate in UI verdrahten

## Phase 6: Google OAuth2 Security (Backend)
- [ ] Google OAuth2 Client in Spring Security konfigurieren
- [ ] Login/Logout-Endpunkte festlegen
- [ ] User-Provisioning bei erstem Login implementieren
- [ ] Session/Cookie-Sicherheit konfigurieren
  - [ ] `HttpOnly`
  - [ ] `Secure` (prod)
  - [ ] `SameSite=Lax`
- [ ] Autorisierung: immer nach `user_id` filtern

## Phase 7: Projekte-Wochenansicht (A/B/C)
- [ ] Endpoint: Wochenmatrix pro Projekt und Kalenderwoche
- [ ] Frontend Grid fuer Mo-So + Buckets A/B/C
- [ ] Task Drag/Move zwischen Bucket/Tag vorbereiten

## Phase 8: Kalender (Tag/Woche/Monat/Jahr)
- [ ] Event CRUD Endpunkte
- [ ] Wochenansicht mit Zeitslots (Start/Ende)
- [ ] Drag-to-create in Kalenderflaeche
- [ ] Farbcodierung nach Projekt
- [ ] View-Switch: Tag/Woche/Monat/Jahr

## Phase 9: Projekt-Detail (Goal + Kanban + Gantt)
- [ ] Projekt-Detailseite mit Titel/Beschreibung/Ziel
- [ ] Kanban-Board pro Projekt
- [ ] Gantt-Timeline (zuerst read-only)

## Phase 10: Hardening & Tests
- [ ] Domain Unit Tests
- [ ] JDBC Integration Tests mit Testcontainers
- [ ] Web/Security Tests fuer Auth und Zugriffsschutz
- [ ] CORS/CSRF final abstimmen
- [ ] Fehlerformat fuer API standardisieren

## Phase 11: Deployment-Readiness
- [ ] Dockerfiles fuer frontend/backend
- [ ] Compose fuer lokale Produktionstests
- [ ] Startskript + kurzes Operations-README
- [ ] Backup/Restore-Strategie fuer PostgreSQL dokumentieren

## Aktueller Fokus (Next 3 Tasks)
- [ ] `java-backend`: Onion-Paketstruktur + Flyway Dependency
- [ ] `java-backend`: `V1__init_core_tables.sql`
- [ ] `java-backend`: Inbox `Create/List` Endpunkte (ohne Auth, mit `X-User-Id` als temporaerer Platzhalter)
