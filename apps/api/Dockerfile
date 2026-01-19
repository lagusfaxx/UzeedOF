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

# Install deps - allow postinstall scripts to generate Prisma client
# Use || true to continue even if postinstall fails (Prisma warnings won't stop build)
RUN pnpm install --no-frozen-lockfile || true

FROM deps AS build

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# Generate Prisma client explicitly if it wasn't generated during install
RUN cd apps/api && pnpm exec prisma generate || true

# Build shared + api
RUN pnpm --filter @uzeed/api build

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