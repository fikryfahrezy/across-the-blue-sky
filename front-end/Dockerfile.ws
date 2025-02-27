FROM node:22.14.0-bookworm AS base

# 1. Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN corepack enable pnpm && pnpm i;

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:ws

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 ws

COPY --from=builder --chown=ws:nodejs /app/dist/ws.js ./ws.js


USER ws

ARG PORT=3001
EXPOSE ${PORT}

ENV PORT=${PORT}
CMD ["node", "ws.js"]