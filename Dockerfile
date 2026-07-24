# --- byggsteg: bygg statiska filer med Vite (node behövs bara här, inte på VPS:en) ---
FROM node:22-alpine AS build
WORKDIR /app

# installera deps reproducerbart ur lockfilen
COPY package.json package-lock.json ./
RUN npm ci

# resten av källan (dist/ och node_modules exkluderas via .dockerignore)
COPY . .

# `npm run build` kör prebuild = scripts/generate-stats.mjs. I containern finns inga
# grann-repon → generatorn behåller den committade src/data/stats.json som fallback
# (se docstring i scriptet). Bygg där grann-repona finns för färska siffror; committa
# stats.json innan push.
RUN npm run build

# --- servesteg: Caddy serverar dist/ på :80 (utåt nås den via reverse-proxy-Caddy) ---
FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
