# Deploy-guide — Portal på VPS:en

Driftsättning av Portal, **speglad mot syntes/stronk**: git-repo på servern + egen
container, uppdaterad med `git pull && docker compose up -d --build`. Portalen är en
statisk Vite-sida — bygget sker i ett Node-**byggsteg inuti Dockerfilen**, så VPS:en
behöver ingen node. En liten Caddy i containern serverar de byggda filerna; den yttre
reverse-proxy-Caddy:n sköter TLS + Authelia.

> **Verifierad setup (via SSH 2026-07-24):** VPS `root@65.109.143.130`, appar i
> `/root/apps/<app>/`. Reverse-proxy-Caddy i `/root/apps/reverse-proxy/` (tjänst `caddy`),
> Authelia i `/root/apps/authelia/` — båda på Docker-nätet `proxy`. `portal.syntes.dev`
> ligger **bakom Authelia** (`one_factor`, som syntes-dashboarden). Portal-containern
> (`portal`) ligger på `proxy`-nätet; Caddy når den via `reverse_proxy portal:80`.

## Så hänger det ihop

- **`Dockerfile`** — tvåstegs: (1) `node:22-alpine` kör `npm ci && npm run build` → `dist/`,
  (2) `caddy:2-alpine` kopierar in `dist/` och serverar den på `:80` (intern
  [`deploy/Caddyfile`](../deploy/Caddyfile)).
- **`docker-compose.yml`** (repo-roten) — bygger imagen, container `portal` på `proxy`-nätet,
  binder `127.0.0.1:8300:80` för felsökning.
- **Yttre Caddy** (`/root/apps/reverse-proxy/Caddyfile`) — `portal.syntes.dev`-block med
  `forward_auth authelia:9091` + `reverse_proxy portal:80`.
- **Authelia** (`/root/apps/authelia/config/configuration.yml`) — regel `portal.syntes.dev
  → one_factor`.

### Om statistiken (`src/data/stats.json`)

`scripts/generate-stats.mjs` (kört av `prebuild`) läser grann-repona i **LOKALT-roten**
(`../Signal/backend`, `../Signal/signal_frontend`, `../todos`, `../stronk`, `../syntes`) och
bakar in siffrorna. De finns på **din dator**, inte i containern (och inte i den layouten på
servern). I containerbygget hittar generatorn därför inga grannar och **behåller den
committade `stats.json`** som fallback. Vill du ha färska siffror: kör `npm run build`
lokalt (där grann-repona finns) och **committa `stats.json` innan push** — den följer med in
i bygget. Se dokumenterat undantag i [`../CLAUDE.md`](../CLAUDE.md).

---

## Första gången på servern (engångs)

```bash
ssh root@65.109.143.130
cd /root/apps
git clone https://github.com/pepestal/portal.git
cd portal
docker compose up -d --build         # Node-byggsteg + Caddy-servesteg, startar container 'portal'
docker ps | grep portal              # 'portal' Up
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8300/   # 200 = servas
```

### Yttre Caddy — koppla in blocket (engångs)

I `/root/apps/reverse-proxy/Caddyfile`, bredvid de andra blocken:

```caddy
portal.syntes.dev {
    forward_auth authelia:9091 {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy portal:80
}
```

Ladda om:

```bash
cd /root/apps/reverse-proxy
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

### Authelia — släpp in domänen (engångs)

`default_policy: deny` → utan regel `403`. Portal är read-only utan API/skrivning/agenter →
en enda `one_factor`-regel (som syntes-dashboard). I
`/root/apps/authelia/config/configuration.yml` under `access_control:` → `rules:`:

```yaml
    - domain: 'portal.syntes.dev'
      policy: 'one_factor'
```

Validera **innan** omstart (fel YAML låser ut alla appar), starta sedan om:

```bash
docker exec authelia authelia validate-config --config /config/configuration.yml
docker restart authelia
```

---

## Uppdatera i framtiden — **samma som övriga appar**

```bash
# valfritt men rekommenderat: färska stats. Lokalt, där grann-repona finns:
#   npm run build && git add src/data/stats.json && git commit && git push

ssh root@65.109.143.130
cd /root/apps/portal
git pull
docker compose up -d --build
```

---

## Verifiera utifrån

```bash
curl -sI https://portal.syntes.dev | head -n1
```

- `302` (redirect till `auth.syntes.dev`) = **klart** — Caddy → Authelia funkar. Öppna
  `https://portal.syntes.dev` i webbläsaren → login → portalen.
- `403` → Authelia-regeln saknas/felstavad.
- `502/503` → `portal`-containern nere → `docker logs portal`; `curl 127.0.0.1:8300/`.

---

## Felsökning

| Symptom | Trolig orsak / åtgärd |
|---|---|
| `403` utifrån | Authelia-regel saknas/felstavad. Kör `authelia validate-config`. |
| `502/503` | `portal` svarar inte → `docker logs portal`; `docker compose up -d --build`. |
| `git pull` säger "not a git repository" | Servern har en gammal scp-mapp, inte en klon → `cd /root/apps && rm -rf portal && git clone …`. |
| Stats visar gamla värden | Bygget saknar grann-repona (server/container) → bygg om lokalt och committa `stats.json`. |
| Bygget hänger på `npm ci` | Första bygget laddar deps; ge det en stund. Lockfile osynk → committa uppdaterad `package-lock.json`. |
| `network proxy ... could not be found` | Reverse-proxy-stacken körs inte → `cd /root/apps/reverse-proxy && docker compose up -d`. |

---

## Snabböversikt (hela deployen)

```bash
# DNS: A-record portal.syntes.dev -> 65.109.143.130   (klart, Cloudflare)
ssh root@65.109.143.130
cd /root/apps && git clone https://github.com/pepestal/portal.git && cd portal
docker compose up -d --build
curl -s http://127.0.0.1:8300/ -o /dev/null -w "%{http_code}\n"   # 200

# Yttre Caddy: portal.syntes.dev-block (forward_auth + reverse_proxy portal:80)
cd /root/apps/reverse-proxy && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

# Authelia: - domain: 'portal.syntes.dev' / policy: 'one_factor'
docker exec authelia authelia validate-config --config /config/configuration.yml && docker restart authelia

curl -sI https://portal.syntes.dev | head -n1   # 302 = klart
```
