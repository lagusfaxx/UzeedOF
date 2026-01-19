# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /repo

# Prisma necesita OpenSSL
RUN apk add --no-cache openssl

# Habilitar pnpm
RUN corepack enable

# -------------------- deps --------------------
FROM base AS deps

# ⚠️ FORZAR devDependencies
ENV NODE_ENV=development

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY prisma ./prisma

RUN pnpm install --no-frozen-lockfile

# -------------------- build --------------------
FROM deps AS build

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# Build shared + api
RUN pnpm --filter @uzeed/api build

# Generar Prisma Client
RUN pnpm --filter @uzeed/api prisma generate

# Dejar solo prod deps
RUN pnpm prune --prod

# -------------------- runner --------------------
FROM node:20-alpine AS runner
WORKDIR /repo

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api
COPY --from=build /repo/prisma ./prisma
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml

WORKDIR /repo/apps/api
EXPOSE 3001

CMD ["node", "dist/index.js"]

