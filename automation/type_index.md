# Type Index

Kompakte Auflistung aller relevanten TypeScript-Typen im Projekt.
Bevor ein neuer Typ erstellt wird, bitte hier nachschauen!

## Convex / Auth

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `Id<"users">` | convex/_generated/dataModel | Convex User ID |
| `Doc<"users">` | convex/_generated/dataModel | Convex User Dokument |

## Tasks

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `Task` | convex/tasks/_model/task.ts | `Doc<"tasks">` — Convex Task Dokument |
| `TaskStatus` | convex/tasks/_model/task.ts | `"open" \| "in_progress" \| "done" \| "cancelled"` |
| `TaskPriority` | convex/tasks/_model/task.ts | `"A" \| "B" \| "C"` |
| `CreateTask` | convex/tasks/_model/task.ts | Input-Schema für create/update Mutations |
| `TaskFormData` | convex/tasks/_model/task.ts | Formular-Schema (partial für react-hook-form) |

## Projekte

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `Project` | convex/projects/_model/project.ts | `Doc<"projects">` — Convex Projekt Dokument |
| `ProjectColor` | convex/projects/_model/project.ts | `"gray" \| "red" \| "orange" \| ...` |
| `CreateProject` | convex/projects/_model/project.ts | Input-Schema für create/update Mutations |
| `ProjectFormData` | convex/projects/_model/project.ts | Formular-Schema (partial für react-hook-form) |

## Kalender

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `CalendarEvent` | convex/calendar/_model/calendarEvent.ts | `Doc<"calendarEvents">` — Convex Kalender-Ereignis |
| `CreateCalendarEvent` | convex/calendar/_model/calendarEvent.ts | Input-Schema für create/update Mutations |
| `CalendarEventFormData` | convex/calendar/_model/calendarEvent.ts | Formular-Schema (partial für react-hook-form) |

## Code Diff

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `CodeDiffRepo` | convex/codediff/_model/repo.ts | `Doc<"codeDiffRepos">` — GitHub Repository |
| `CreateCodeDiffRepo` | convex/codediff/_model/repo.ts | Input-Schema für create Mutation |
| `RepoFormData` | convex/codediff/_model/repo.ts | Formular-Schema |
| `CodeDiffFile` | convex/codediff/_model/file.ts | `Doc<"codeDiffFiles">` — Datei mit Status |
| `FileStatus` | convex/codediff/_model/file.ts | `"needs_review" \| "reviewed" \| "todo" \| "always_green"` |

## Organisationen / Team

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `Organization` | convex/organizations/_model/organization.ts | `Doc<"organizations">` — Convex Org Dokument |
| `OrgMembership` | convex/organizations/_model/organization.ts | `Doc<"orgMemberships">` — Mitgliedschaft |
| `OrgRole` | convex/organizations/_model/organization.ts | `"owner" \| "member"` |
| `CreateOrg` | convex/organizations/_model/organization.ts | Input-Schema für create Mutation |
| `OrgFormData` | convex/organizations/_model/organization.ts | Formular-Schema |
| `OrgMemberWithUser` | convex/organizations/_model/organization.ts | Mitglied + User-Details für UI |

## Data Lake

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `DataLakeConnection` | convex/datalake/_model/connection.ts | `Doc<"dataLakeConnections">` — Storage-Verbindung |
| `Provider` | convex/datalake/_model/connection.ts | `"nextcloud" \| "onedrive" \| "googledrive"` |
| `CreateConnection` | convex/datalake/_model/connection.ts | Input-Schema für create Mutation |
| `ConnectionFormData` | convex/datalake/_model/connection.ts | Formular-Schema |
| `PROVIDER_LABELS` | convex/datalake/_model/connection.ts | Record<Provider, string> — Anzeigenamen |
| `DataLakeItem` | convex/datalake/_model/item.ts | `Doc<"dataLakeItems">` — gecachtes Datei/Ordner-Item |
| `ItemType` | convex/datalake/_model/item.ts | `"file" \| "folder"` |
| `SyncItem` | convex/datalake/_model/item.ts | Interface für WebDAV-geparste Einträge |

## UI

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `BadgeProps` | components/ui/badge.tsx | Badge-Komponenten-Props |
| `ButtonProps` | components/ui/button.tsx | Button-Komponenten-Props |
| `DeleteConfirmDialogProps` | components/DeleteConfirmDialog.tsx | Lösch-Dialog Props |
