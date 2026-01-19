# syntax=docker/dockerfile:1

FROM node:20-slim AS base
WORKDIR /repo

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable

# ---------------- deps ----------------
FROM base AS deps
ENV NODE_ENV=development

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY prisma ./prisma

RUN pnpm install --no-frozen-lockfile

# ---------------- build ----------------
FROM deps AS build

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# ✅ 1) GENERAR PRISMA CLIENT PRIMERO
RUN pnpm --filter @uzeed/api prisma generate

# ✅ 2) LUEGO COMPILAR (tsup ya encuentra el path)
RUN pnpm --filter @uzeed/api build

# ---------------- runner ----------------
FROM node:20-slim AS runner
WORKDIR /repo
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api
COPY --from=build /repo/prisma ./prisma

WORKDIR /repo/apps/api
EXPOSE 3001

CMD ["node", "dist/index.js"]
