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

# tzdata — utan det paketet ignoreras TZ=Europe/Stockholm tyst. Alpines musl slår
# upp zonen i /usr/share/zoneinfo, som inte finns i basimagen, och faller tillbaka
# på UTC utan att varna. Mätt 2026-08-16: containern loggade UTC trots att compose
# satte TZ korrekt. Kostar ~3 MB. Se handbok/docs/server_drift.md §1.4.
RUN apk add --no-cache tzdata
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
