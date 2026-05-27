# Daylear

Cross-platform product (iOS, Android, web) plus a separate marketing site. **TypeScript only** for clients and server.

## Architecture

```text
daylear/
├── apps/
│   ├── marketing/     # Vite + React + Tailwind — public site (no Ionic)
│   ├── app/           # Vite + React + Tailwind + Ionic + Capacitor — product
│   └── api/           # entire backend: HTTP, tRPC, domain, DB, auth
├── packages/
│   ├── types/         # shared types (e.g. AppRouter, DTOs, enums for clients)
│   └── ui/            # optional shared UI (tokens, Button, Logo)
```

**Rule:** all server code lives in **`apps/api`**. **`packages/`** is only for code shared by multiple frontends (and type-only exports the clients need from the API).

| Surface | Stack | Deploy target (planned) |
|--------|--------|-------------------------|
| **Marketing** | Vite, React, Tailwind, React Router | `daylear.com` (static) |
| **App (web)** | Same as marketing + Ionic UI | `app.daylear.com` |
| **App (native)** | Same build as web → Capacitor `dist/` | App Store / Play Store |
| **API** | Hono + tRPC + Postgres | `api.daylear.com` |

## Data flow

```text
  daylear.com (marketing)     app.daylear.com / native WebView
            │                              │
            └──────────────┬───────────────┘
                           ▼
              api.daylear.com
              ├── /trpc          ← app + marketing (typed procedures)
              └── /auth/*        ← sessions / OAuth callbacks
                           ▼
                      PostgreSQL
```

---

## Backend layering (domain-driven, per resource)

**Domain** here means the **business/domain layer** (entities, rules, authorization), not DNS hostnames. See [Hostnames](#hostnames-dns) for URLs.

Keep each **resource** isolated: its own **api → domain → persistence** files. Start as files; promote to a subdirectory when a resource gets too large. ("too large" is subjective. Just use your best judgment.)

### Request flow

```text
Client (tRPC)
    → api.*.router.ts      # parse input, auth context, map errors, call domain
        → *.domain.ts      # business rules, invariants, authorization
            → *.persistence.ts   # SQL/Drizzle only; maps rows ↔ domain types
                → PostgreSQL (schema in apps/api)
```

- **api** (driving): tRPC procedures — thin; no SQL; no business rules beyond input shape.
- **domain**: pure TS; receives `AuthContext` + domain types; calls persistence ports.
- **persistence** (driven): reads/writes DB; returns domain types (not raw Drizzle rows in domain).

Non-tRPC surfaces (auth callbacks, health) live under `apps/api/src/routes/` and call **domain** + **persistence** when they touch product data.

### `apps/api` layout

Top-level server wiring, `db/`, then one folder per resource (three files each):

```text
apps/api/src/
├── index.ts                # Hono app, listen()
├── middleware/             # CORS, logging
├── routes/
│   ├── auth.ts             # Better Auth / OAuth callbacks
│   └── health.ts           # GET /health
│
├── trpc.ts                 # mount /trpc on Hono
├── context.ts              # createContext: session, userId, db
├── root.ts                 # merges resource routers → AppRouter
├── errors.ts               # TRPCError mapping (optional)
│
├── db/
│   ├── client.ts           # Drizzle client
│   ├── schema/             # table definitions per resource
│   │   ├── users.ts
│   │   ├── calendars.ts
│   │   └── …
│   └── migrations/
│
├── shared/                 # cross-resource domain types, permission enums
│
├── users/
│   ├── users.router.ts     # tRPC api layer
│   ├── users.domain.ts
│   └── users.persistence.ts
├── calendars/
│   ├── calendars.router.ts
│   ├── calendars.domain.ts
│   └── calendars.persistence.ts
├── meals/
│   ├── meals.router.ts
│   ├── meals.domain.ts
│   └── meals.persistence.ts
├── lists/
│   ├── lists.router.ts
│   ├── lists.domain.ts
│   └── lists.persistence.ts
├── todos/
│   ├── todos.router.ts
│   ├── todos.domain.ts
│   └── todos.persistence.ts
├── chores/
│   ├── chores.router.ts
│   ├── chores.domain.ts
│   └── chores.persistence.ts
└── …                       # add folders as features land
```

When a resource grows, split without changing layers:

```text
calendars/
├── calendars.router.ts
├── calendars.domain.ts
├── calendars.persistence.ts
├── event.domain.ts         # still domain layer, same folder
└── recurrence.domain.ts
```

### Schema vs persistence

| Location | Responsibility |
|----------|----------------|
| **`apps/api/src/db/schema/`** | Table definitions, enums, relations (no business rules) |
| **`apps/api/src/db/client.ts`** | Shared Drizzle `db` instance |
| **`*.persistence.ts`** | Queries and transactions for one resource |

### `packages/types` (clients only)

No server logic — types and schemas the frontends need:

```text
packages/types/src/
├── index.ts
└── api.ts                  # export type { AppRouter } from apps/api (type-only)
```

- **`apps/app`** and **`apps/marketing`** depend on `@daylear/types` for tRPC inference.
- Optionally duplicate **Zod input types** or shared enums here if you want clients free of `apps/api` imports.
- Use `export type` / `import type` only from `apps/api` to avoid pulling server code into the browser bundle.

### Cross-resource rules

- Domain **must not** import another resource’s persistence directly; use domain calls or types in `apps/api/src/shared/`.
- Shared concepts (visibility, permission levels, resource IDs) → `apps/api/src/shared/` or `db/schema` enums.
- **users** is special: auth identity + profile; other resources reference `userId`.

### Resources (initial)

| Resource | Notes |
|----------|--------|
| `users` | Auth identity, profile, settings |
| `calendars` | Calendars, events (in-app via tRPC) |
| `meals` | Recipes, meal planning |
| `lists` | Lists, items |
| `todos` | Todo items |
| `chores` | Chores / household tasks |
| … | Add folders as features land; don’t pre-build empty routers |

---

## Server (TypeScript) — options by layer

### tRPC API layer (app features)

| Option | Notes |
|--------|--------|
| **Hono + `@trpc/server` adapter** (recommended) | One `apps/api` process; mount `/trpc`; export `AppRouter` type via `packages/types`. |
| **Fastify + tRPC** | Same idea; slightly more boilerplate than Hono. |
| **Express + tRPC** | Fine; heavier for greenfield. |
| **tRPC on Vercel serverless** | Possible for `/trpc` only; fine if auth routes fit the same deployment model. |

**Default to pick:** everything in `apps/api` (Hono + tRPC + domain + Drizzle). Clients use `@trpc/client` + `@daylear/types` + `VITE_API_URL`.

---

### Authentication

Requirements: **email/password now**; **Google / Facebook / Twitter (X) / etc. later**; same identity for all app API calls.

| Option | Email/password | Social OAuth | Fits Hono + Capacitor |
|--------|----------------|--------------|------------------------|
| **Better Auth** | Yes | Plugins for Google, GitHub, etc.; extend for FB/X | Strong fit; session/JWT; works without Next |
| **Lucia + Drizzle** | Yes (manual) | Bring your own OAuth | Lightweight; more wiring for each provider |
| **Auth.js (@auth/core)** | Yes | Many providers | Usually paired with a framework; usable with Hono with effort |
| **Clerk / Auth0 / Supabase Auth** | Hosted | Hosted | Fast; vendor lock-in; validate JWT in tRPC context |
| **Custom** (bcrypt/argon2 + `jose` JWT) | Full control | Add OAuth routes per provider | More code; duplicates solved problems |

**Default to pick:** **Better Auth** (or **Lucia** if you want minimal dependencies). Store users/sessions in Postgres via `apps/api/src/db`. tRPC `createContext` reads session/JWT and attaches `userId`.

---

### Hostnames (DNS)

| Host | Purpose |
|------|---------|
| `daylear.com` | Marketing static site |
| `app.daylear.com` | Product web (Vite SPA) |
| `api.daylear.com` | Hono: `/trpc`, `/auth`, health |
| `staging-api.daylear.com` | Staging API |

Production API should use **HTTPS**. CORS on API: allow `daylear.com` and `app.daylear.com`.

---

### Database

| Option | Notes |
|--------|--------|
| **PostgreSQL + Drizzle** (recommended) | Schema + queries live in `apps/api` |
| **PostgreSQL + Prisma** | Same; more codegen, great DX |
| **Neon / Supabase / Railway Postgres** | Managed hosting for prod |
| **SQLite** | Local dev only unless you standardize on Turso |

**Default to pick:** **Postgres + Drizzle** in `apps/api/src/db`; Docker Compose at repo root for local dev; migrations via `drizzle-kit`.

---

## Recommended default stack (TS-only)

| Layer | Choice |
|-------|--------|
| Runtime | Node 20+ |
| HTTP | Hono (`apps/api`) |
| Backend | `apps/api` only (tRPC + domain + Drizzle + auth) |
| Validation | Zod (in `apps/api`; shared inputs optionally in `packages/types`) |
| ORM | Drizzle (`apps/api/src/db`) |
| DB | PostgreSQL |
| Auth | Better Auth (email/password → OAuth providers) |
| Client types | `packages/types` (`AppRouter`, shared DTOs) |
| Deploy API | Fly.io / Railway / Render (always-on) |
| Deploy frontends | Static hosts (Cloudflare Pages, Vercel static, S3) |

---

## Why this split (clients)

- **No Next.js** — Capacitor needs a static client bundle; marketing and app are Vite SPAs.
- **Ionic only in `apps/app`** — mobile UI; marketing stays plain React + Tailwind.
- **tRPC in `apps/api`** — one typed contract; `packages/types` exposes `AppRouter` to clients.

## Shared vs app-specific

**Share:** `packages/types`, optional `packages/ui`, Tailwind preset (if extracted later).

**Backend only:** everything under `apps/api` (not in `packages/`).

**App only:** Ionic, Capacitor, native plugins, authenticated routes.

**Marketing only:** Landing, pricing, legal; optional tRPC for forms.

## SEO (marketing)

Vite SPA by default. Plan prerender for `/`, `/pricing`, legal when SEO matters.

## Environment variables (planned)

| Variable | Used by |
|----------|---------|
| `VITE_API_URL` | `apps/app`, `apps/marketing` |
| `DATABASE_URL` | `apps/api` only |
| Auth secrets (Better Auth / OAuth client IDs) | `apps/api` only |

## Native dev notes

- Capacitor `webDir` → Vite `dist/` after build.
- Live reload: `server.url` in `capacitor.config.ts` → LAN IP + Vite port (dev only).
- API calls from device/simulator must use LAN IP or deployed `api.daylear.com`, not `localhost`.

## Bootstrap order

1. Monorepo tooling (pnpm workspaces + Turborepo)
2. `apps/api` — Hono + `db/` (users schema) + `trpc.ts` + `users/*` (router + domain + persistence)
3. `packages/types` — `export type { AppRouter }` from api (type-only)
4. Add resources under `apps/api/src/` one at a time (`calendars`, `lists`, …)
5. `apps/app` — Vite + Ionic + Capacitor + tRPC client
6. `apps/marketing` — Vite shell

## Open decisions

- [ ] App ID / bundle ID (e.g. `com.daylear.app`)
- [ ] Auth: Better Auth vs Lucia
- [ ] ORM: Drizzle vs Prisma
- [ ] API host (Fly / Railway / Render)
- [ ] Marketing: static-only vs tRPC on day one

## Status

**Proof of concept scaffolded** — see [Getting started](#getting-started) below.

Implemented: `apps/api` (Hono, tRPC, Drizzle, Better Auth), `users` + `todos` resources (`router.ts` / `domain.ts` / `persistence.ts`), `apps/app` (Vite, Ionic, Capacitor config), `apps/marketing`, `packages/types`.

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env and start Postgres
cp .env.example .env
pnpm db:up

# 3. Push schema (from repo root, loads apps/api drizzle config)
export $(grep -v '^#' .env | xargs) && pnpm db:push

# 4. Run API + app + marketing
pnpm dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| App | http://localhost:5173 |
| Marketing | http://localhost:5174 |

**PoC flow:** open the app → sign up → add todos (tap to toggle). Marketing site calls public `health` tRPC query.

**Capacitor (optional):** from `apps/app`, run `pnpm build` then `npx cap add ios` / `android` and `npx cap sync`.

**Language policy:** TypeScript end-to-end.
