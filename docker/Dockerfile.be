FROM node:22-alpine

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/server/package.json ./apps/server/package.json

RUN pnpm install

COPY apps/server ./apps/server

RUN pnpm db:generate
RUN pnpm build:server

EXPOSE 8080

CMD ["pnpm", "start:server"]
