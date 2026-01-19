# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /repo

RUN apk add --no-cache openssl
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

RUN pnpm --filter @uzeed/api build
RUN pnpm --filter @uzeed/api prisma generate
RUN pnpm prune --prod

# ---------------- runner ----------------
FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api
COPY --from=build /repo/prisma ./prisma

WORKDIR /repo/apps/api
EXPOSE 3001

CMD ["node", "dist/index.js"]
