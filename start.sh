#!/usr/bin/env bash
# Venera – Start-Skript für Datenbank, Backend und Frontend
# Nutzung: ./start.sh [befehl]
#   befehl: db | backend | frontend | all | docker | status | stop | help

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BACKEND_PID_FILE="$SCRIPT_DIR/.backend.pid"
BACKEND_LOG_FILE="$SCRIPT_DIR/backend.log"
POSTGRES_PORT="${POSTGRES_HOST_PORT:-5433}"

usage() {
  echo "Venera – Start-Skript"
  echo ""
  echo "Nutzung: ./start.sh [befehl]"
  echo ""
  echo "Befehle:"
  echo "  (ohne Argument)  Alles starten (DB + Backend im Hintergrund + Frontend im Vordergrund)"
  echo "  all              Wie oben"
  echo "  db               Nur PostgreSQL (Docker) starten"
  echo "  backend          Nur Backend starten (startet DB falls nötig)"
  echo "  frontend         Nur Frontend starten"
  echo "  docker           Alles via Docker Compose (Profile app)"
  echo "  status           Status von DB, Backend und Frontend anzeigen"
  echo "  stop             Lokale Prozesse und Docker-Container stoppen"
  echo "  help             Diese Hilfe anzeigen"
  echo ""
  echo "Ports: Frontend 5173, Backend 8080, Postgres 5433 (Host)"
}

ensure_db() {
  if ! docker compose ps postgres 2>/dev/null | grep -q "Up"; then
    echo "→ Starte PostgreSQL..."
    docker compose up -d postgres
    echo "→ Warte auf PostgreSQL (Port $POSTGRES_PORT)..."
    for i in $(seq 1 30); do
      if nc -z localhost "$POSTGRES_PORT" 2>/dev/null; then
        echo "→ PostgreSQL bereit."
        return 0
      fi
      sleep 1
    done
    echo "Fehler: PostgreSQL nicht erreichbar." >&2
    return 1
  fi
  return 0
}

cmd_db() {
  docker compose up -d postgres
  echo "PostgreSQL läuft auf localhost:$POSTGRES_PORT"
}

cmd_backend() {
  ensure_db
  echo "→ Starte Backend (java-backend)..."
  cd "$SCRIPT_DIR/java-backend"
  exec ./mvnw spring-boot:run
}

cmd_frontend() {
  echo "→ Starte Frontend (svelte-frontend)..."
  cd "$SCRIPT_DIR/svelte-frontend"
  if [ ! -d node_modules ]; then
    echo "→ npm install..."
    npm install
  fi
  exec npm run dev
}

cmd_all() {
  ensure_db
  echo "→ Starte Backend im Hintergrund..."
  cd "$SCRIPT_DIR/java-backend"
  nohup ./mvnw spring-boot:run > "$BACKEND_LOG_FILE" 2>&1 &
  echo $! > "$BACKEND_PID_FILE"
  echo "   Backend-PID: $(cat "$BACKEND_PID_FILE"), Log: $BACKEND_LOG_FILE"
  echo "→ Warte 15 Sekunden auf Backend-Start..."
  sleep 15
  echo "→ Starte Frontend (Vordergrund, Strg+C beendet nur Frontend)..."
  cd "$SCRIPT_DIR/svelte-frontend"
  if [ ! -d node_modules ]; then
    npm install
  fi
  exec npm run dev
}

cmd_docker() {
  docker compose --profile app up -d --build
  echo "Docker-Services gestartet. Frontend: http://localhost:${FRONTEND_HOST_PORT:-5173}, Backend: http://localhost:${BACKEND_HOST_PORT:-8080}"
}

cmd_status() {
  echo "=== Docker (Postgres) ==="
  docker compose ps postgres 2>/dev/null || true
  echo ""
  echo "=== Backend (lokal) ==="
  if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
    echo "  Läuft (PID: $(cat "$BACKEND_PID_FILE"))"
  else
    echo "  Nicht gestartet (oder PID ungültig)"
  fi
  echo ""
  echo "=== Ports ==="
  nc -z localhost 5173 2>/dev/null && echo "  5173 (Frontend): offen" || echo "  5173 (Frontend): geschlossen"
  nc -z localhost 8080 2>/dev/null && echo "  8080 (Backend):  offen" || echo "  8080 (Backend):  geschlossen"
  nc -z localhost "$POSTGRES_PORT" 2>/dev/null && echo "  $POSTGRES_PORT (Postgres): offen" || echo "  $POSTGRES_PORT (Postgres): geschlossen"
}

cmd_stop() {
  if [ -f "$BACKEND_PID_FILE" ]; then
    PID=$(cat "$BACKEND_PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo "→ Stoppe Backend (PID $PID)..."
      kill "$PID" 2>/dev/null || true
    fi
    rm -f "$BACKEND_PID_FILE"
  fi
  echo "→ Docker-Container stoppen..."
  docker compose --profile app down 2>/dev/null || true
  docker compose down 2>/dev/null || true
  echo "Fertig."
}

case "${1:-all}" in
  db)       cmd_db ;;
  backend)  cmd_backend ;;
  frontend) cmd_frontend ;;
  all)      cmd_all ;;
  docker)   cmd_docker ;;
  status)   cmd_status ;;
  stop)     cmd_stop ;;
  help)     usage ;;
  *)        echo "Unbekannter Befehl: $1"; usage; exit 1 ;;
esac
