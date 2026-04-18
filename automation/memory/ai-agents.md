---
name: KI-Agenten-Portal (AUFG-006)
description: Implementierungsdetails des KI-Agenten-Portals mit Anthropic API, Convex Actions und Data Lake Integration
type: project
---

## KI-Agenten-Portal — Implementierungsdetails

### Architektur
- Agenten werden in Convex Actions (`"use node"`) ausgeführt
- Direkte Anthropic API-Aufrufe (kein LangChain nötig für Basisfälle)
- Modell: `claude-haiku-4-5-20251001` (schnell + günstig für Agenten)
- ANTHROPIC_API_KEY muss in Convex Env-Variablen gesetzt werden

### Datenbankstruktur
- `aiAgents`: userId, name, description, prompt, schedule (cron), connections (Array), isActive, lastRunAt
- `agentLogs`: agentId, startedAt, finishedAt, status (running/success/error), summary, errorMessage

### API-Pfade
- `api.agents.agents.queries.list/get`
- `api.agents.agents.mutations.create/update/remove/setLastRun`
- `api.agents.logs.queries.listByAgent`
- `api.agents.logs.mutations.createLog/finishLog`
- `api.agents.run.actions.runAgent`

### Sicherheit
- Agenten haben **nur Lesezugriff** auf Data Lake (PROPFIND / listByConnection)
- Keine Schreib- oder Löschrechte für Agenten in externen Systemen
- Agent-Kontext wird über `listByConnection` Query aufgebaut (nur Dateinamen + Pfade)

### Noch offen
- Agent-Verbindungen UI (Data Lake Connections auswählen)
- Convex Cron Scheduler für zeitgesteuerte Ausführung
- Echtes Datei-Lesen (WebDAV GET) für Agenten-Kontext
- Telegram Bot Integration (AUFG-007)
