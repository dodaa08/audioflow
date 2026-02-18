FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./

COPY packages/redis ./packages/redis
COPY packages/supabase ./packages/supabase

COPY apps/workers ./apps/workers

RUN pnpm install

RUN pnpm build:worker

CMD ["pnpm", "start:worker"]
