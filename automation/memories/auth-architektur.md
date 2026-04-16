# Memory: Auth-Architektur

## Ausgangslage (Java Backend)
- Custom JWT Auth mit Spring Security
- OAuth2 Login (GitHub)
- Email/Password Login
- OTP (One Time Token) Login
- Password Reset via Email
- Refresh Tokens

## Ziel: Convex Auth (`@convex-dev/auth`)
- **Package**: `@convex-dev/auth`
- **Kein Clerk mehr** - reines Convex-basiertes Auth
- Unterstützt: Password, OTP, OAuth (GitHub, Google)
- Sessions werden in Convex gespeichert
- `auth.config.ts` in `convex/` Verzeichnis

## Convex Auth Setup
```
convex/auth.config.ts  <- Auth-Provider Konfiguration
convex/auth.ts         <- Exportierte Mutations/Queries für Auth
app/ConvexClientProvider.tsx <- Client-side Setup
```

## requireOrgIdentity Pattern
```typescript
// convex/lib/auth.ts
export async function requireOrgIdentity(identity: UserIdentity | null) {
  if (!identity) throw new Error("Unauthorized");
  const userId = identity.subject;
  const orgId = identity.orgId as string | undefined;
  return { userId, orgId };
}
```

## Persönlicher vs. Team-Account
- Persönlich: `orgId = null` (Tasks, Projekte gehören nur dem User)
- Team: `orgId = teamId` (geteilte Ressourcen)
- User kann in mehreren Teams sein
