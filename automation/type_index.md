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

## Next.js / Convex Types (werden laufend ergänzt)

*(noch keine - werden bei Implementierung hinzugefügt)*
