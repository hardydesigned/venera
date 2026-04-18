# Venera – Next.js App

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend**: Convex (Realtime Database)
- **Auth**: Convex Auth (`@convex-dev/auth`) – Email/Passwort
- **UI**: Shadcn/UI + Tailwind CSS 4
- **Forms**: React Hook Form + Zod

## Setup

### 1. Convex Projekt erstellen

```bash
cd nextjs-app
npx convex dev
```

Beim ersten Mal: Neues Convex-Projekt erstellen oder bestehendes verknüpfen.
Dadurch wird `convex/_generated/` mit generierten Typen erstellt.

### 2. Convex Auth Keys generieren

```bash
npx @convex-dev/auth generate-key
```

Secrets im Convex Dashboard setzen:
- `JWT_PRIVATE_KEY`
- `JWKS`
- `SITE_URL` = `http://localhost:3000`

### 3. Env-Datei anlegen

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_CONVEX_URL aus dem Convex Dashboard eintragen
```

### 4. Entwicklung starten

```bash
# Terminal 1: Convex
npx convex dev

# Terminal 2: Next.js
pnpm dev
```

Öffne http://localhost:3000

## Projektstruktur

```
nextjs-app/
├── app/
│   ├── (auth)/           # Login, Register, Forgot Password
│   ├── (protected)/      # Auth-geschützte Seiten
│   │   ├── inbox/        # Aufgaben ohne Datum
│   │   ├── calendar/     # Kalender-Ansicht (T04)
│   │   ├── projects/     # Projekte (T05)
│   │   └── code-diff/    # GitHub Code Review (T07)
│   └── layout.tsx
├── convex/
│   ├── schema.ts         # Datenbankschema
│   ├── auth.config.ts    # Convex Auth Konfiguration
│   ├── lib/auth.ts       # Auth-Hilfsfunktionen
│   └── tasks/            # Tasks Modul
└── middleware.ts         # Auth-Middleware
```
