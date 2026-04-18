---
name: Code Diff Feature
description: GitHub Repository Review-Tracking — Architektur, Besonderheiten und Folgearbeiten
type: project
---

# Code Diff Feature (AUFG-003)

Implementiert in Lauf #4 (2026-04-17).

## Architektur

- **Convex Schema**: `codeDiffRepos` (owner, name, token, defaultBranch, lastSyncAt) + `codeDiffFiles` (repoId, path, status, blobSha)
- **GitHub API**: `GET /repos/{owner}/{name}/git/trees/{branch}?recursive=1` — liefert alle Blob-SHA flach
- **Change Detection**: SHA-Vergleich per Datei. Ändert sich SHA → Status auf `needs_review` (außer `always_green`)
- **Sync**: Convex Action `syncRepoFromGitHub` (kein Mutation, weil externes HTTP) → ruft `bulkSync` Mutation auf
- **Status-Werte**: `needs_review` (gelb) → `reviewed` (grün) → `todo` (rot) → `always_green` (hellgrün)
- **Click-to-Cycle**: Status-Badge klicken wechselt zum nächsten Status

## Wichtige Pfade

- `convex/codediff/` — Backend (models, repos, files, sync)
- `app/(protected)/code-diff/` — Frontend (controller, view, components)
- API-Pfade: `api.codediff.repos.queries.*`, `api.codediff.files.mutations.*`, `api.codediff.sync.actions.*`

## Offene Punkte

- **Webhook-Integration**: Automatischer Sync bei GitHub Push fehlt noch (AUFG-003 Folgeaufgabe)
- **Token-Sicherheit**: Tokens werden plain im Convex DB gespeichert — bei Bedarf Verschlüsselung ergänzen
- **Große Repos**: GitHub truncates bei >100k Dateien (Feld `truncated: true`) — wird zurückgemeldet, aber nicht gehandhabt
- **Editieren**: Kein Edit-Formular für bestehende Repos (nur Create + Delete)

## Why: GitHub Trees API

Statt Inhalts-API nutzen wir die Trees API weil:
1. Liefert alle Dateien rekursiv in einem Request
2. Enthält Blob-SHAs zur Change-Detection
3. Kein Paging bei normalen Repos (nur Truncation bei sehr großen)
