# Deploy-guide — Portal på VPS:en

Driftsättning av Portal, speglad mot syntes/stronk. **Skillnaden:** Portal är en
**statisk Vite-sida** utan egen container. Den serveras direkt av Caddy (`file_server`)
från en monterad mapp — precis som syntes-dashboarden. Ingen `docker-compose` för portal
själv, ingen databas, inga hemligheter.

> **Verifierad setup (via SSH 2026-07-24):** VPS `root@65.109.143.130`. Caddy i
> `/root/apps/reverse-proxy/` (tjänst `caddy`), Authelia i `/root/apps/authelia/` — båda
> på Docker-nätet `proxy`. `portal.syntes.dev` ligger **bakom Authelia** (`one_factor`,
> som syntes-dashboarden). Servern har **ingen node** → bygget görs lokalt och `dist/`
> kopieras upp.

## Varför bygga lokalt (inte på servern)

Två skäl:

1. **Ingen node på VPS:en** — `npm run build` finns inte där.
2. **Statistiken kräver grann-repona.** `scripts/generate-stats.mjs` läser `../Signal`,
   `../todos`, `../stronk`, `../syntes` vid byggtid och bakar in `src/data/stats.json`.
   De finns på din dator, inte på servern. Bygger man på servern blir stats fallback-värden.

Därför: bygg där repona finns (din dator), skicka upp den färdiga `dist/`.

## Förutsättningar i infra

| Krav | Status |
|---|---|
| DNS: A-record `portal.syntes.dev` → `65.109.143.130` (Cloudflare, samma som övriga) | ✅ klar |
| Caddy-block för `portal.syntes.dev` (Authelia forward-auth + `file_server`) | ✅ klar (Del 3) |
| Authelia `access_control`-regel för `portal.syntes.dev` | ✅ klar (Del 4) |
| Volym `/root/apps/portal/dist` monterad i caddy-containern | ✅ klar (Del 2) |
| `proxy`-nätet (delas med Caddy/Authelia) | ✅ (skapas av reverse-proxy-stacken) |

---

## Del 1 — Bygg lokalt och kopiera upp

```bash
# i C:\Users\peter\Desktop\PROJEKT\LOKALT\portal
npm run build                        # kör stats-generatorn + vite build → dist/
ssh root@65.109.143.130 'mkdir -p /root/apps/portal/dist'
scp -r dist/* root@65.109.143.130:/root/apps/portal/dist/
```

> `dist/` är gitignorad — den versionshanteras inte, den byggs om vid varje deploy.

## Del 2 — Montera dist i Caddy-containern (engångs)

I `/root/apps/reverse-proxy/docker-compose.yml`, under `caddy:` → `volumes:`, bredvid
syntes-dashboard-raden:

```yaml
      - /root/apps/portal/dist:/srv/portal:ro
```

## Del 3 — Caddy-block (engångs)

I `/root/apps/reverse-proxy/Caddyfile`, bredvid de andra blocken:

```caddy
portal.syntes.dev {
    forward_auth authelia:9091 {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    encode gzip
    root * /srv/portal
    file_server
}
```

## Del 4 — Authelia-regel (engångs)

`default_policy: deny` → utan regel får du `403`. Portal är en read-only sida utan API,
skrivningar eller maskin-agenter → en enda `one_factor`-regel räcker (som syntes-dashboard).
I `/root/apps/authelia/config/configuration.yml`, under `access_control:` → `rules:`:

```yaml
    - domain: 'portal.syntes.dev'
      policy: 'one_factor'
```

## Del 5 — Validera och starta om (efter Del 2–4)

Validera **innan** omstart (fel YAML i Authelia låser ut alla appar):

```bash
docker exec authelia authelia validate-config --config /config/configuration.yml
cd /root/apps/reverse-proxy
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

Applicera:

```bash
docker restart authelia                 # laddar access_control-regeln
cd /root/apps/reverse-proxy
docker compose up -d                    # återskapar caddy med den nya volymen + blocket
```

## Del 6 — Verifiera utifrån

```bash
curl -sI https://portal.syntes.dev | head -n1
```

- `302` (redirect till `auth.syntes.dev`) = **klart** — Caddy → Authelia funkar. Öppna
  `https://portal.syntes.dev` i webbläsaren → login → portalen.
- `403` → Authelia-regeln saknas/felstavad (Del 4).
- `404`/tom → volymen inte monterad eller `dist/` saknas (Del 1–2).

---

## Uppdatera i framtiden (efter en kodändring)

Del 2–4 är engångsinfra. En vanlig redeploy är bara **bygg om + kopiera upp** — Caddy
plockar de nya filerna direkt, ingen omstart behövs:

```bash
# i portal/
npm run build
scp -r dist/* root@65.109.143.130:/root/apps/portal/dist/
```

Vill du vara helt säker på att inga borttagna filer ligger kvar: rensa först
(`ssh root@65.109.143.130 'rm -rf /root/apps/portal/dist/*'`) och kopiera sedan upp.

---

## Felsökning

| Symptom | Trolig orsak / åtgärd |
|---|---|
| `403` utifrån | Authelia-regel saknas/felstavad (Del 4). Kör `authelia validate-config`. |
| `302` men login → sidan tom/404 | Volymen inte monterad eller `dist/` tom → Del 1–2, sedan `docker compose up -d`. |
| Stats visar gamla värden | Bygget gjordes utan grann-repona bredvid → bygg om där `../syntes` m.fl. finns. |
| `network proxy ... could not be found` | Reverse-proxy-stacken körs inte → `cd /root/apps/reverse-proxy && docker compose up -d`. |

---

## Snabböversikt (hela deployen)

```bash
# DNS: A-record portal.syntes.dev -> 65.109.143.130   (klart, Cloudflare)

# lokalt:
npm run build
ssh root@65.109.143.130 'mkdir -p /root/apps/portal/dist'
scp -r dist/* root@65.109.143.130:/root/apps/portal/dist/

# på servern (engångsinfra):
# 1. reverse-proxy/docker-compose.yml: montera /root/apps/portal/dist:/srv/portal:ro
# 2. reverse-proxy/Caddyfile: portal.syntes.dev-block (forward_auth + file_server)
# 3. authelia/config/configuration.yml: - domain: 'portal.syntes.dev' / policy: 'one_factor'
docker exec authelia authelia validate-config --config /config/configuration.yml
docker restart authelia
cd /root/apps/reverse-proxy && docker compose up -d
curl -sI https://portal.syntes.dev | head -n1   # 302 = klart
```
