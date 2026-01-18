# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /repo
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --no-frozen-lockfile --filter @uzeed/web...

FROM deps AS build
COPY apps/web ./apps/web
RUN pnpm --filter @uzeed/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next standalone output
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./.next/static
COPY --from=build /repo/apps/web/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
