# ── Stage 1 : Build ─────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2 : Production ─────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Dépendances de production seulement (Express + runtime)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Bundle SSR compilé
COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "dist/support-connecte/server/server.mjs"]
