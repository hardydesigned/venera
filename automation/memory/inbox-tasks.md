---
name: Inbox / Tasks Feature
description: Aufgabenverwaltung (CRUD) mit Convex + React Hook Form — vollständige Frontend + Backend Implementierung
type: project
---

# Inbox / Tasks Feature

## Backend (Convex)

- **Schema**: `convex/schema.ts` → `tasks` Table mit `userId`, `orgId`, `title`, `description`, `status`, `priority`, `dueDate`, `startDate`, `projectId`, `assigneeId`
- **Modell**: `convex/tasks/_model/task.ts` → `taskStatusEnum`, `taskPriorityEnum`, `Task`, `CreateTask`, `TaskFormData`, `defaultTask`
- **Queries**: `convex/tasks/tasks/queries.ts` → `listPersonal`, `listByOrg`, `get`
- **Mutations**: `convex/tasks/tasks/mutations.ts` → `create`, `update`, `remove`
- **API-Pfade**: `api.tasks.tasks.queries.*`, `api.tasks.tasks.mutations.*`

## Frontend

- **Hook**: `app/(protected)/inbox/_controller/useTasks.ts`
  - `useTasks()` → tasks, isLoading, create, update, remove
  - `useTask(id)` → task, isLoading
- **Komponenten**:
  - `app/(protected)/inbox/(view)/_components/TaskList.tsx`
  - `app/(protected)/inbox/(view)/_components/TaskForm.tsx`
- **Pages (Route-Gruppe `(view)`)**:
  - `/inbox` → `app/(protected)/inbox/(view)/page.tsx`
  - `/inbox/new` → `app/(protected)/inbox/(view)/new/page.tsx`
  - `/inbox/[id]/edit` → `app/(protected)/inbox/(view)/[id]/edit/page.tsx`

## Wichtige Details
- Edit-Page nutzt React 19 `use(params)` für async params
- Form nutzt react-hook-form + zodResolver mit `taskFormSchema`
- TaskList zeigt Priority-Badge (A/B/C) + Status-Badge + DropdownMenu
- `defaultTask` enthält `status: "open"`, `priority: "C"`

**Why:** Grundfeature für persönliches Aufgabenmanagement
**How to apply:** Bei weiteren Aufgaben-Features (Team-Tasks, Zuweisung) auf diesem Muster aufbauen
