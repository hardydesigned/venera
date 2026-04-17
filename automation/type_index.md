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

## UI

| Typ | Datei | Beschreibung |
|-----|-------|-------------|
| `BadgeProps` | components/ui/badge.tsx | Badge-Komponenten-Props |
| `ButtonProps` | components/ui/button.tsx | Button-Komponenten-Props |
| `DeleteConfirmDialogProps` | components/DeleteConfirmDialog.tsx | Lösch-Dialog Props |
