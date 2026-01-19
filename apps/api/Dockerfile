# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /repo

# Prisma needs OpenSSL on Alpine
RUN apk add --no-cache openssl

# Enable pnpm via Corepack
RUN corepack enable

# -------------------- deps --------------------
FROM base AS deps

# Copy only manifests first (no lockfile required)
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY prisma ./prisma

# IMPORTANT: do NOT ignore scripts (prisma/tooling needs a normal install)
RUN pnpm install --no-frozen-lockfile

# -------------------- build --------------------
FROM deps AS build

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# Generate Prisma Client (EXPLÍCITO y en workspace correcto)
RUN pnpm --filter @uzeed/api exec prisma generate

# Build API
RUN pnpm --filter @uzeed/api build

# Prune to only runtime dependencies
RUN pnpm prune --prod

# -------------------- runner --------------------
FROM base AS runner
WORKDIR /repo
ENV NODE_ENV=production

# Copy runtime artifacts
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api
COPY --from=build /repo/prisma ./prisma
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml

WORKDIR /repo/apps/api
EXPOSE 3001

CMD ["node", "dist/index.js"]

