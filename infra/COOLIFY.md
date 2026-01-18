# Coolify (Ubuntu 24.04) — Deploy UZEED (web + api + Postgres)

## 0) Pre-requisitos
- Dominio web: `uzeed.cl`
- Dominio API: `api.uzeed.cl`
- Coolify instalado en tu VPS
- Repo GitHub con este monorepo

## 1) Base Directory (IMPORTANTE)
En Coolify, al crear la app desde GitHub:
- **Base Directory = `/`** (raiz del repo)
- **Dockerfile** se especifica por servicio (web/api)

## 2) Crear base de datos (Postgres 17)
1. `Projects` -> tu proyecto -> `Add Resource` -> `PostgreSQL`.
2. Version/Tag: `17`.
3. Crea:
   - DB: `uzeed`
   - User: `postgres`
   - Password: una fuerte
4. Copia la **Connection String** (DATABASE_URL).

## 3) Deploy API (api.uzeed.cl)
1. `Add Resource` -> `Dockerfile`.
2. Git repo: tu repo.
3. **Dockerfile**: `apps/api/Dockerfile`
4. **Base Directory**: `/`
5. Puerto interno: `3001`
6. Dominio: `api.uzeed.cl`
7. Variables (Environment):
   - `NODE_ENV=production`
   - `PORT=3001`
   - `DATABASE_URL=<la del Postgres de Coolify>`
   - `SESSION_SECRET=<min 16 chars>`
   - `WEB_ORIGIN=https://uzeed.cl`
   - `SUBSCRIPTION_PRICE_CLP=5000`
   - `KHIPU_API_KEY=e5bee36b-82a7-45c5-9a3c-3498990ed708`
   - `KHIPU_RECEIVER_ID=511091`
   - `KHIPU_API_HOST=https://payment-api.khipu.com`
   - `KHIPU_SUBSCRIPTION_NOTIFY_URL=https://api.uzeed.cl/webhooks/khipu/subscription`
   - `KHIPU_CHARGE_NOTIFY_URL=https://api.uzeed.cl/webhooks/khipu/charge`
   - `KHIPU_RETURN_URL=https://uzeed.cl/billing/return`
   - `KHIPU_CANCEL_URL=https://uzeed.cl/billing/error`

8. Deploy.

### Migraciones (Prisma)
En la primera vez, debes ejecutar **una sola vez**:
- Comando: `pnpm --filter @uzeed/api db:migrate`

En Coolify puedes usar "Execute Command" dentro del servicio (API) para correrlo.

## 4) Deploy WEB (uzeed.cl)
1. `Add Resource` -> `Dockerfile`.
2. Repo: el mismo.
3. **Dockerfile**: `apps/web/Dockerfile`
4. **Base Directory**: `/`
5. Puerto interno: `3000`
6. Dominio: `uzeed.cl`
7. Variables:
   - `NEXT_PUBLIC_API_URL=https://api.uzeed.cl`
8. Deploy.

## 5) DNS
- `A` record `uzeed.cl` -> IP del VPS
- `A` record `api.uzeed.cl` -> IP del VPS

## 6) Checklist final
- [ ] `https://api.uzeed.cl/health` responde `{ ok: true }`
- [ ] Registro/Login crea cookie `uzeed.sid`
- [ ] `Feed` muestra blur y CTA si no hay membresia
- [ ] Boton `Suscribirme` redirige a Khipu
- [ ] Webhook activa membresia (ver en `/dashboard`)
- [ ] Admin crea posts (panel `/admin`)
