# Convex Auth Setup

## Paket
`@convex-dev/auth` — direkt in Convex, kein externer Service

## Wichtige Dateien
| Datei | Zweck |
|-------|-------|
| `convex/auth.ts` | Provider-Konfiguration, exportiert auth/signIn/signOut/store/isAuthenticated |
| `convex/auth.config.ts` | Auth-Konfiguration (Domain, ApplicationID) |
| `convex/http.ts` | HTTP-Routes, `auth.addHttpRoutes(http)` muss aufgerufen werden |
| `convex/schema.ts` | Muss `...authTables` spreaden |
| `middleware.ts` | `convexAuthNextjsMiddleware` für Route-Protection |
| `app/layout.tsx` | `ConvexAuthNextjsServerProvider` umschließt die App |
| `components/ConvexClientProvider.tsx` | `ConvexAuthNextjsProvider` mit ConvexReactClient |

## Env-Variablen
```env
NEXT_PUBLIC_CONVEX_URL=...       # Convex Deployment URL
CONVEX_AUTH_PRIVATE_KEY=...      # Für Production: JWT Private Key
SITE_URL=http://localhost:3000   # Für E-Mail Links
# Optional (für OAuth):
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

## Auth-Provider Auswahl
- `Password` — E-Mail + Passwort
- `GitHub` — GitHub OAuth (optional)
- `Google` — Google OAuth (optional)

## Middleware-Muster
```typescript
const isPublicRoute = createRouteMatcher(["/login", "/register", "/api/auth(.*)"]);
// Nicht authentifizierte Nutzer → /login
// Authentifizierte Nutzer auf /login → /
```

## Server-Side Auth
```typescript
import { getAuthUserId } from "@convex-dev/auth/server";
// In Convex queries/mutations:
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Nicht authentifiziert");
```
