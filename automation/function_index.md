# Function Index

Kompakte Auflistung aller wiederverwendbaren Funktionen, Hooks und Utilities.
Bevor eine neue Funktion implementiert wird, bitte hier nachschauen!

## Utilities

| Funktion | Datei | Beschreibung |
|----------|-------|-------------|
| `cn(...classes)` | lib/utils.ts | Tailwind class merging (clsx + tailwind-merge) |

## Auth-Helpers (Convex-Backend)

| Funktion | Datei | Beschreibung |
|----------|-------|-------------|
| `requireAuth(ctx)` | convex/lib/auth.ts | Gibt `{ userId }` zurück, wirft bei nicht-authentifiziert |

## Hooks (Frontend)

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useTasks()` | app/(protected)/inbox/_controller/useTasks.ts | Tasks laden + CRUD (create, update, remove) |
| `useTask(id)` | app/(protected)/inbox/_controller/useTasks.ts | Einzelne Task laden per ID |

## Convex Queries

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `listPersonal` | api.tasks.tasks.queries.listPersonal | Persönliche Tasks des Users |
| `listByOrg` | api.tasks.tasks.queries.listByOrg | Team-Tasks einer Organisation |
| `get` | api.tasks.tasks.queries.get | Einzelne Task per ID |

## Convex Mutations

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.tasks.tasks.mutations.create | Task erstellen |
| `update` | api.tasks.tasks.mutations.update | Task aktualisieren |
| `remove` | api.tasks.tasks.mutations.remove | Task löschen |

## Hooks — Projekte

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useProjects()` | app/(protected)/projekte/_controller/useProjects.ts | Projekte laden + CRUD |
| `useProject(id)` | app/(protected)/projekte/_controller/useProjects.ts | Einzelnes Projekt per ID |

## Hooks — Kalender

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useCalendarEvents(startAt, endAt)` | app/(protected)/kalender/_controller/useCalendarEvents.ts | Events in Zeitraum + CRUD |

## Convex Queries — Projekte

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `listPersonal` | api.projects.projects.queries.listPersonal | Persönliche Projekte des Users |
| `get` | api.projects.projects.queries.get | Einzelnes Projekt per ID |

## Convex Mutations — Projekte

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.projects.projects.mutations.create | Projekt erstellen |
| `update` | api.projects.projects.mutations.update | Projekt aktualisieren |
| `remove` | api.projects.projects.mutations.remove | Projekt löschen (Tasks entkoppeln) |

## Convex Queries — Kalender

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `listByRange` | api.calendar.events.queries.listByRange | Events in Zeitraum (startAt/endAt) |
| `get` | api.calendar.events.queries.get | Einzelnes Event per ID |

## Convex Mutations — Kalender

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.calendar.events.mutations.create | Event erstellen |
| `update` | api.calendar.events.mutations.update | Event aktualisieren |
| `remove` | api.calendar.events.mutations.remove | Event löschen |

## Hooks — Team / Organisationen

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useOrgs()` | app/(protected)/team/_controller/useOrg.ts | Alle Orgs des Users + create + remove |
| `useOrg(orgId)` | app/(protected)/team/_controller/useOrg.ts | Einzelne Org + Mitglieder + addMember + removeMember + leave |
| `useOrgTasks(orgId)` | app/(protected)/inbox/_controller/useTasks.ts | Team-Aufgaben einer Org + CRUD |

## Convex Queries — Organisationen

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `listMine` | api.organizations.orgs.queries.listMine | Alle Orgs des Users (mit Rolle) |
| `get` | api.organizations.orgs.queries.get | Einzelne Org per ID (mit Mitgliedschaftsprüfung) |
| `getMembers` | api.organizations.orgs.queries.getMembers | Mitgliederliste einer Org (userId, role, email, name) |

## Convex Mutations — Organisationen

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.organizations.orgs.mutations.create | Org erstellen + Owner-Membership |
| `addMemberByEmail` | api.organizations.orgs.mutations.addMemberByEmail | Mitglied per E-Mail einladen |
| `removeMember` | api.organizations.orgs.mutations.removeMember | Mitglied entfernen (nur Owner) |
| `leave` | api.organizations.orgs.mutations.leave | Org verlassen (nur Mitglieder) |
| `remove` | api.organizations.orgs.mutations.remove | Org löschen (nur Owner, Cascade) |

## Hooks — Code Diff

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useCodeDiffRepos()` | app/(protected)/code-diff/_controller/useCodeDiff.ts | Repos laden + CRUD + GitHub-Sync |
| `useCodeDiffFiles(repoId)` | app/(protected)/code-diff/_controller/useCodeDiff.ts | Dateien eines Repos + updateStatus |

## Convex Queries — Code Diff

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `list` | api.codediff.repos.queries.list | Alle Repos des Users |
| `get` | api.codediff.repos.queries.get | Einzelnes Repo per ID |
| `listByRepo` | api.codediff.files.queries.listByRepo | Alle Dateien eines Repos |

## Convex Mutations — Code Diff

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.codediff.repos.mutations.create | Repo erstellen |
| `update` | api.codediff.repos.mutations.update | Repo aktualisieren |
| `remove` | api.codediff.repos.mutations.remove | Repo + Dateien löschen (Cascade) |
| `updateStatus` | api.codediff.files.mutations.updateStatus | Datei-Status setzen |
| `bulkSync` | api.codediff.files.mutations.bulkSync | Bulk-Upsert nach GitHub-Sync |

## Convex Actions — Code Diff

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `syncRepoFromGitHub` | api.codediff.sync.actions.syncRepoFromGitHub | GitHub Trees API abrufen + DB updaten |

## Hooks — Data Lake

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useDataLakeConnections()` | app/(protected)/datalake/_controller/useDataLake.ts | Verbindungen laden + create + remove + sync |
| `useDataLakeConnection(id)` | app/(protected)/datalake/_controller/useDataLake.ts | Einzelne Verbindung + ihre Items |

## Convex Queries — Data Lake

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `list` | api.datalake.connections.queries.list | Alle Verbindungen des Users |
| `get` | api.datalake.connections.queries.get | Einzelne Verbindung per ID |
| `listByConnection` | api.datalake.items.queries.listByConnection | Alle Items einer Verbindung |

## Convex Mutations — Data Lake

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `create` | api.datalake.connections.mutations.create | Verbindung erstellen |
| `update` | api.datalake.connections.mutations.update | Verbindung aktualisieren |
| `remove` | api.datalake.connections.mutations.remove | Verbindung + Items löschen (Cascade) |
| `setLastSync` | api.datalake.connections.mutations.setLastSync | lastSyncAt auf now() setzen |
| `bulkSync` | api.datalake.items.mutations.bulkSync | Alle Items ersetzen (delete all + reinsert) |

## Convex Actions — Data Lake

| Funktion | API-Pfad | Beschreibung |
|----------|----------|-------------|
| `syncFromNextcloud` | api.datalake.sync.actions.syncFromNextcloud | WebDAV PROPFIND + XML-Parse + bulkSync |

## Utilities — Data Lake

| Funktion | Datei | Beschreibung |
|----------|-------|-------------|
| `formatFileSize(bytes)` | convex/datalake/_model/item.ts | Bytes → human-readable (B/KB/MB/GB) |

## Komponenten

| Komponente | Datei | Beschreibung |
|------------|-------|-------------|
| `DeleteConfirmDialog` | components/DeleteConfirmDialog.tsx | Wiederverwendbarer Lösch-Bestätigungs-Dialog |
| `TaskList` | app/(protected)/inbox/(view)/_components/TaskList.tsx | Aufgaben-Liste mit Dropdown-Menü |
| `TaskForm` | app/(protected)/inbox/(view)/_components/TaskForm.tsx | Formular für Erstellen/Bearbeiten |
| `ProjectList` | app/(protected)/projekte/(view)/_components/ProjectList.tsx | Projektkarten-Raster mit Farbstreifen |
| `ProjectForm` | app/(protected)/projekte/(view)/_components/ProjectForm.tsx | Formular für Projekt Erstellen/Bearbeiten |
| `MonthCalendar` | app/(protected)/kalender/(view)/_components/MonthCalendar.tsx | Monatsansicht mit klickbaren Tagen |
| `CalendarEventDialog` | app/(protected)/kalender/(view)/_components/CalendarEventDialog.tsx | Dialog für Kalender-Ereignis Erstellen/Bearbeiten |
| `RepoList` | app/(protected)/code-diff/(view)/_components/RepoList.tsx | Repository-Karten mit Sync-Button |
| `RepoForm` | app/(protected)/code-diff/(view)/_components/RepoForm.tsx | Formular zum Repository hinzufügen |
| `FileTree` | app/(protected)/code-diff/(view)/_components/FileTree.tsx | Hierarchischer Dateibaum mit Status-Badges |
| `OrgForm` | app/(protected)/team/(view)/_components/OrgForm.tsx | Formular für Org erstellen (name + slug) |
| `ConnectionList` | app/(protected)/datalake/(view)/_components/ConnectionList.tsx | Storage-Verbindungskarten mit Sync-Button |
| `ConnectionForm` | app/(protected)/datalake/(view)/_components/ConnectionForm.tsx | Formular für Verbindung hinzufügen |
| `FileList` | app/(protected)/datalake/(view)/_components/FileList.tsx | Datei-Browser mit Suche, Icons, Größe/Datum |
