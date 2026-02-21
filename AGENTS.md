# AGENTS.md

## Projektziel
Venera ist eine produktive To-Do-, Projekt- und Kalender-App mit Svelte-Frontend und Spring-Boot-Backend in Onion-Architektur. Fokus: Lernbarkeit, sauberes Domain-Modell, Sicherheit, Docker-Compose-Startbarkeit.

## Tech-Stack
- Frontend: SvelteKit (TypeScript), TailwindCSS, Flowbite-Svelte, TanStack Query
- Backend: Java 21, Spring Boot, Spring Security, OAuth2 (Google), JDBC
- Datenbank: PostgreSQL
- Infra: Docker Compose

## Architekturprinzipien
- Backend folgt Onion-Architektur:
  - `domain`: Entitäten, Value Objects, Domain-Regeln, Repository-Interfaces
  - `application`: Use Cases, Commands/Queries, Ports
  - `adapters`: `web`, `persistence`, `security`
  - `configuration`: Spring Wiring
- Domain bleibt framework-frei.
- Adapter kennen Domain, Domain kennt keine Adapter.

## Security-Vorgaben
- Login nur via Google OAuth2 (kein E-Mail/Passwort).
- Session-Cookies: `HttpOnly`, `Secure` (außer lokal), `SameSite=Lax`.
- Autorisierung strikt mandantenbezogen (`user_id`-Filter auf alle nutzerbezogenen Daten).
- CSRF-Schutz für state-changing Requests aktiv halten.

## Datenmodell (MVP)
- `User`
- `Project` (Titel, Beschreibung, Ziel)
- `TaskItem` (Titel, Beschreibung, Datum, Bucket A/B/C, Status)
- `SubTask`
- `CalendarEvent` (Start/Ende, Farbe, Projektbezug optional, Taskbezug optional)

## UI/UX-Richtlinien
- Flowbite-Svelte für Basiskomponenten (Buttons, Modals, Forms, Navbar, Dropdowns, Tabs).
- Eigene Feature-Komponenten für domänenspezifische Widgets (Kanban, Wochenmatrix, Gantt, Kalender-Zeitslots).
- Responsiv: Mobile-first, dann Desktop-Erweiterungen.

## Frontend-Ordnung
- Feature-basierte Struktur unter `src/lib/features/*`.
- Routen unter `src/routes` bleiben dünn und verwenden Feature-Komponenten.
- API-Zugriffe zentral in `src/lib/api/*`.
- Server-State und Caching laufen über TanStack Query (`@tanstack/svelte-query`).

## Backend-Ordnung
- Paketstruktur:
  - `...domain...`
  - `...application...`
  - `...adapters.web...`
  - `...adapters.persistence...`
  - `...adapters.security...`
  - `...configuration...`
- Persistenzzugriff mit Spring JDBC / `JdbcTemplate`.
- Schemaänderungen nur über Migrationen (Flyway).

## Definition of Done pro Feature
- Domain-Regeln implementiert und getestet.
- Use Case + Adapter implementiert.
- API-Endpunkt dokumentiert.
- Frontend-View integriert.
- Security/Autorisierung geprüft.
- Relevante Tests grün.

## Nicht-Ziele (frühe Phasen)
- Kein Microservice-Split.
- Keine unnötige Event-Sourcing-Komplexität.
- Keine zweite Auth-Strategie parallel zu Google.

## Arbeitsweise mit Codex
- Codex liefert kleine, nachvollziehbare Schritte statt "alles auf einmal".
- Vor größeren Änderungen: kurzer Plan.
- Nach Änderungen: konkrete Next Steps + Prüfkommandos.
