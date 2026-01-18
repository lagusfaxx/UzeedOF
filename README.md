# UZEED MVP (OnlyFans-like) — Monorepo

**Dominio web:** uzeed.cl  
**Dominio API:** api.uzeed.cl  
**Stack:** Next.js (App Router) + Express + Postgres 17 + Prisma + pnpm monorepo

## Estructura
- `apps/web` — Next.js 14+ (App Router)
- `apps/api` — Node.js + Express (TypeScript → JS en `dist/`)
- `packages/shared` — Tipos/utilidades (SIEMPRE compilado a JS, nunca TS en runtime)
- `prisma` — Prisma schema + migraciones
- `infra` — guías de deploy (Coolify)

## Reglas críticas (ya aplicadas)
- **NO** se ejecuta Prisma CLI en runtime.
- `packages/shared` se compila a JS (`dist/`) antes de correr API.
- Node en producción ejecuta **solo JS**.
- Docker build context: **raíz del repo**.

## Desarrollo (local)
1) Copia variables de entorno:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```
2) Levanta Postgres + API + WEB:
```bash
pnpm install
pnpm --filter @uzeed/api db:migrate
pnpm dev
```

Alternativa con Docker:
```bash
docker compose up --build
```

## Deploy (Coolify)
Ver `infra/COOLIFY.md`.
