# Memory: Team / Org Feature

**Erstellt:** Lauf #5, 2026-04-17

## Implementierung

### Backend-Pfade
- Model: `convex/organizations/_model/organization.ts`
- Mutations: `convex/organizations/orgs/mutations.ts`
- Queries: `convex/organizations/orgs/queries.ts`

### API-Pfade (nach convex dev)
- `api.organizations.orgs.queries.listMine` — alle Orgs des Users
- `api.organizations.orgs.queries.get` — einzelne Org (mit Mitgliedschaftsprüfung)
- `api.organizations.orgs.queries.getMembers` — Mitgliederliste einer Org
- `api.organizations.orgs.mutations.create` — Org erstellen (erstellt automatisch Owner-Membership)
- `api.organizations.orgs.mutations.addMemberByEmail` — Mitglied per E-Mail einladen
- `api.organizations.orgs.mutations.removeMember` — Mitglied entfernen (nur Owner)
- `api.organizations.orgs.mutations.leave` — Org verlassen (nur Mitglieder, nicht Owner)
- `api.organizations.orgs.mutations.remove` — Org löschen (nur Owner, cascade)

### Frontend-Pfade
- Hook: `app/(protected)/team/_controller/useOrg.ts` — `useOrgs()` + `useOrg(orgId)`
- Hook: `app/(protected)/inbox/_controller/useTasks.ts` — `useOrgTasks(orgId)` (neu)
- Pages: `/team` (Übersicht + Erstellen), `/team/[orgId]` (Mitgliederverwaltung)
- Inbox: Tabs "Persönlich" / "Team" mit Org-Auswahl-Dropdown

### Schema
- `organizations`: name, slug (unique), ownerId
- `orgMemberships`: orgId, userId, role (owner/member), invitedBy
- `tasks.orgId`: `v.optional(v.id("organizations"))` — war zuvor `v.string()`

## Wichtige Entscheidungen
- Org-Erstellung erstellt automatisch Owner-Membership
- addMemberByEmail sucht User in `users` Tabelle nach Email-Feld
- Owner kann Org nicht verlassen (muss sie löschen)
- Alle Org-Queries/Mutations prüfen Mitgliedschaft über `by_org_user` Index

## Offene Folgeaufgaben
- Assignee-Anzeige in TaskList (name/email anzeigen statt nur ID)
- Task-Erstellung in Team-Modus (New-Task-Page mit Org-Kontext)
- Org-Aufgaben direkt per `/inbox/new?orgId=...` erstellen
