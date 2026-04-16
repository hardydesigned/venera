# Type Index – Venera Projekt

## Svelte Frontend Types (werden nach Convex migriert)

### Tasks (`svelte-frontend/src/lib/features/tasks/types.ts`)
- `TaskStatus`: `'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'`
- `TaskPriorityCategory`: `'A' | 'B' | 'C'`
- `Task`: `{ id, title, description, startDate, dueDate, category, status, estimatedDurationMinutes, actualDurationMinutes }`
- `CreateTaskInput`: (ohne id)
- `UpdateTaskInput`: (ohne id)

### Teams (`svelte-frontend/src/lib/features/teams/types.ts`)
- `TeamRole`: `'OWNER' | 'MEMBER'`
- `TeamInvitationStatus`: `'PENDING' | 'ACCEPTED' | 'DECLINED'`
- `Team`: `{ id, name, description, role, memberCount }`
- `TeamInvitation`: `{ id, teamId, teamName, email, status, invitedByUserId, createdAt, respondedAt }`
- `CreateTeamInput`: `{ name, description? }`
- `InviteMemberInput`: `{ teamId, email }`

---

## Next.js / Convex Types (`nextjs-app/`)

### Tasks (`convex/tasks/_model/task.ts`)
- `TaskStatus`: `z.enum(["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"])`
- `TaskCategory`: `z.enum(["A", "B", "C"])`
- `Task`: `Doc<"tasks">` – mit allen task-Feldern (userId, title, description, startDate, dueDate, category, status, etc.)
- `CreateTask`: `z.infer<typeof createTaskSchema>` – ohne _id, _creationTime
- `TaskFormData`: Partielle Form-Version von CreateTask
- `defaultTask`: Partial<CreateTask> – Default-Werte für Formulare

### Auth (`convex/lib/auth.ts`)
- `AuthIdentity`: `{ userId: string; orgId?: string }` – Rückgabe von requireAuth()
