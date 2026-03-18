# Venera

Eine produktive To-Do-, Projekt- und Kalender-App mit Svelte-Frontend und Spring-Boot-Backend.

## Tech-Stack

- **Frontend**: SvelteKit (TypeScript), TailwindCSS, Flowbite-Svelte
- **Backend**: Java 21, Spring Boot, Spring Security, OAuth2 (Google)
- **Datenbank**: PostgreSQL
- **Infra**: Docker Compose

## Schnellstart

Mit dem Start-Skript kannst du das gesamte Projekt bequem starten:

```bash
# Alles starten (Datenbank + Backend + Frontend)
./start.sh

# Oder nur spezifische Services:
./start.sh db        # Nur PostgreSQL-Datenbank
./start.sh backend   # Nur Backend (inkl. Datenbank)
./start.sh frontend  # Nur Frontend
./start.sh docker    # Alles via Docker Compose
./start.sh status    # Status anzeigen
./start.sh stop      # Alles stoppen
./start.sh help      # Hilfe anzeigen
```

## Manuelles Starten

### 1. Datenbank starten

```bash
docker compose up -d postgres
```

Die Datenbank läuft dann auf `localhost:5433` (Port 5433 auf dem Host, um Konflikte zu vermeiden).

### 2. Backend starten

```bash
cd java-backend
mvn spring-boot:run
```

Das Backend läuft auf http://localhost:8080

### 3. Frontend starten

```bash
cd svelte-frontend
npm install   # Nur beim ersten Mal
npm run dev
```

Das Frontend läuft auf http://localhost:5173

## Ports

| Service   | Port  | URL                     |
|-----------|-------|-------------------------|
| Frontend  | 5173  | http://localhost:5173   |
| Backend   | 8080  | http://localhost:8080   |
| Postgres  | 5433  | localhost:5433          |

## Docker Compose (Production-like)

```bash
# Alles starten
docker compose --profile app up -d --build

# Nur Datenbank starten
docker compose up -d postgres

# Stoppen
docker compose --profile app down
```

## Umgebungsvariablen

Die App benötigt folgende Umgebungsvariablen (in `.env` im Root-Verzeichnis):

```env
# Datenbank
POSTGRES_DB=venera
POSTGRES_USER=venera
POSTGRES_PASSWORD=venera

# OAuth2 (Google)
GOOGLE_CLIENT_ID=deine-client-id
GOOGLE_CLIENT_SECRET=dein-client-secret

# Ports (optional)
POSTGRES_HOST_PORT=5433
BACKEND_HOST_PORT=8080
FRONTEND_HOST_PORT=5173
```

## Projektstruktur

```
venera/
├── java-backend/       # Spring Boot Backend (Onion-Architektur)
│   ├── src/main/java/
│   │   └── com/hardytec/venera/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── adapters/
│   │       └── configuration/
│   └── pom.xml
├── svelte-frontend/    # SvelteKit Frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/    # API-Clients
│   │   │   └── features/
│   │   └── routes/
│   └── package.json
├── docker-compose.yml
└── start.sh            # Start-Skript
```

## Architektur

Das Backend folgt der Onion-Architektur:
- `domain`: Entitäten, Value Objects, Domain-Regeln
- `application`: Use Cases, Commands/Queries
- `adapters`: Web, Persistence, Security
- `configuration`: Spring Wiring

Das Frontend ist feature-basiert organisiert unter `src/lib/features/*`.
