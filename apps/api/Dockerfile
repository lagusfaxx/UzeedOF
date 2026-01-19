# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /repo

# Install OpenSSL which Prisma needs
RUN apk add --no-cache openssl

# Enable pnpm via Corepack
RUN corepack enable

FROM base AS deps

# Copy only manifests first (no lockfile required)
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY prisma ./prisma

# Install deps without production env restriction to get devDependencies
RUN pnpm install --no-frozen-lockfile

FROM deps AS build

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# Generate Prisma client (must happen after install with devDependencies)
RUN pnpm exec prisma generate

# Build shared + api
RUN pnpm --filter @uzeed/api build

# Prune to only runtime dependencies
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /repo
ENV NODE_ENV=production

# Copy runtime artifacts - including generated Prisma client
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api
COPY --from=build /repo/prisma ./prisma
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml

WORKDIR /repo/apps/api
EXPOSE 3001

CMD ["node", "dist/index.js"]