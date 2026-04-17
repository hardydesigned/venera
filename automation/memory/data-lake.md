---
name: Data Lake Feature
description: Nextcloud/WebDAV Storage Integration, File-Browser, Provider-Abstraktion
type: project
---

# Data Lake Feature (AUFG-005)

## Architektur

### Backend (Convex)
- **Schema**: `dataLakeConnections` (userId, name, provider, webdavUrl, username, password, lastSyncAt) + `dataLakeItems` (connectionId, path, name, type, size, lastModified, contentType, etag)
- **connections/queries.ts**: `list`, `get` (userId-Check)
- **connections/mutations.ts**: `create`, `update`, `remove` (Cascade auf items), `setLastSync`
- **items/queries.ts**: `listByConnection` (userId-Check via Connection)
- **items/mutations.ts**: `bulkSync` (delete all + reinsert)
- **sync/actions.ts**: `syncFromNextcloud` — PROPFIND WebDAV, Regex-XML-Parsing

### WebDAV Sync-Flow
1. `syncFromNextcloud` Action aufrufen mit `connectionId`
2. Credentials aus DB holen (via `ctx.runQuery`)
3. PROPFIND an `webdavUrl` mit `Depth: infinity`
4. XML-Antwort per Regex parsen (`<d:response>` Blöcke)
5. `bulkSync` Mutation: alle alten Items löschen, neue einfügen
6. `setLastSync` Mutation: `lastSyncAt = Date.now()`

### Wichtige Details
- **"use node"** direktive in sync/actions.ts (nutzt `Buffer.from().toString("base64")`)
- Regex-XML-Parser: Case-insensitive für `<d:` und `<D:` Prefixe
- Ordner erkannt durch `<d:collection` im XML-Block
- `Depth: infinity` kann bei sehr großen Repos langsam sein (Future: Depth: 1 + drill-down)

### Frontend
- **useDataLakeConnections()**: connections, create, remove, sync
- **useDataLakeConnection(id)**: connection, items, isLoading
- **ConnectionList**: Karten mit Sync-Button, Provider-Badge, last-sync Datum
- **ConnectionForm**: name, provider (Select), webdavUrl, username, password
- **FileList**: Suche, Sortierung (Ordner zuerst), Größe, Datum, Extension-Badge
- **Routen**: `/datalake`, `/datalake/new`, `/datalake/[connectionId]`
- **Sidebar**: Database-Icon, Link `/datalake`

## Noch offene Punkte
- Dateien direkt im Browser öffnen (braucht Proxy mit Auth oder Nextcloud-Share-Link)
- Kategorien-Ansicht (tag-basiert oder Ordner-Filterung)
- OneDrive/Google Drive Provider (nur UI-Enum vorhanden, kein Backend)

## Why
Nutzer will Unternehmensdaten in Nextcloud speichern und KI-Agenten darauf laufen lassen. Data Lake ist Basis für AUFG-006 (KI-Agenten).
