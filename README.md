# Portal

> En landningssida som samlar ekosystemets appar i ett nav.

Portal är ekosystemets **ingång i webbläsaren**: en minimalistisk startsida som
länkar vidare till apparna (Signal, Ethos, Hexis, scales, ser/sys) med små animationer
och en system-health-widget. En sjätte plats, **Syntes**, står kvar men är **vilande** —
appen var ett händelsenav fram till 2026-08-20, då bussen revs, och `syntes.dev` svarar
sedan dess `404`. Kortet renderas därför utan länk (`dormant: true` i `src/apps.js`).
Portal är **fristående** — den *länkar* till apparna men pratar aldrig med dem i runtime
och äger ingen egen data.

**Status:** se [`docs/STATUS.md`](docs/STATUS.md) — börja där om du ska ta vid.

---

## Innehåll

- [Vad appen gör](#vad-appen-gör)
- [Arkitektur i korthet](#arkitektur-i-korthet)
- [Teknikstack](#teknikstack)
- [Snabbstart](#snabbstart)
- [Konventioner](#konventioner)
- [Dokumentation](#dokumentation)

## Vad appen gör

Portal är ett **showroom / design-experiment** — en sida med stora app-knappar
(en per app i ekosystemet), var med en hover-animation och en info-knapp. Poängen
är hur det känns, inte att navigera vidare.

- **Stil-system:** flera estetiker (`terminal`, `editorial`, `bank`, `singularitet`, `kvitto`, `vaxel`, `jacquard`, `sprangskiss`, `synop`, `bikupa`, `fuga`, `sinus`, `tryckark`, `alv`, `tunnelbana`,
 `kardan-chatgpt`)
  delar ett och samma skelett men bär egen palett, typografi och animationer; `orrery` är en
  **helscen** som medvetet ersätter skelettet (förankrat undantag). Stilen **roterar slumpmässigt**
  vid varje besök; en switcher låter dig bläddra och **låsa** en favorit. `?style=<id>` i URL:en
  deep-linkar till en specifik stil. Sedan 2026-07-28 finns även en **kaosklass**
  (moduler med `chaos: true` — fritt mönsterbrott utan skelett, se
  [`docs/PROMPT_CHAOS.md`](docs/PROMPT_CHAOS.md)) bakom en Kaos-toggle i topbaren,
  med egen rotation; första bidraget är `pangea` — sidan utan bakgrund, där
  smältan är en fullskärmslänk och apparna plattor som flyter på den. ⚠️ `pangea` är
  en av de tretton stilar som ännu inte är omkomponerade efter att navet revs.
  Andra bidraget är `lodet` — scrollhjulet vinschar ett lod genom en vattenpelare
  i stället för att flytta sidan, och det är lodets närhet som avslöjar länkarna.
  Tredje bidraget är `dynamo` — sidan har ingen egen kraft: pekarens rörelse
  driver generatorn, varje länk är en glödtråd med märkström ur `stats.json`,
  Syntes är skenan de hänger i, och säkringen kan lösa ut så att sidan slocknar.
  Fjärde bidraget är `hinnan` — sidan är en yta med en baksida: allt man ser är
  något som trycker på en spänd hinna inifrån, länkarna är svällningar och
  namnen relief, pekaren buktar in duken och står man still trycks en hand igenom.
- **Info-paneler + systemhälsa** visar riktig projektdata (filer, rader, språk, stack)
  som genereras vid **byggtid** ur grann-repona — inte via runtime-koppling.

Ren presentation — ingen inloggning, inget runtime-API, ingen databas.

## Arkitektur i korthet

Statisk klient utan backend. Vite bygger `index.html` + `src/` till statiska filer.
Länkar ut till andra appar via URL; ingen runtime app-till-app-kommunikation.

- `src/main.js` — renderar skelettet, sköter stilrotation, info-paneler och systemhälsa.
  Vet ingenting om enskilda stilar.
- `src/style.css` — skelettets egen CSS (bas, topbar, rader, info-panel, systemhälsa).
- `src/apps.js` — appregistret (lägg till en app = en rad).
- `src/styles.js` — stilregistret: importerar en modul per stil.
- `src/styles/<id>.js` + `src/styles/<id>.css` — **en stil per filpar.** Modulen
  default-exporterar `{ id, label, anim, enhancer?, chaos? }` och importerar sin egen
  CSS; `chaos: true` lägger stilen i kaos-poolen bakom topbarens Kaos-toggle.
  `anim` är hover-markup per app; bara den aktiva stilens markup ligger i DOM:en.
  `src/styles/orrery.js` är helscenen som ersätter skelettet (`fullscene: true`).
- `src/shared.js` — det lilla stilarna delar: `nf`, `prefersReduced`, `countUp`,
  `makeCountEnhancer`.
- `scripts/generate-stats.mjs` → `src/data/stats.json` — byggtidsstatistik (körs via
  `predev`/`prebuild`). Se **dokumenterat undantag** i [`CLAUDE.md`](CLAUDE.md).
- `scripts/check-copy.mjs` — textransoneringen: failar bygget på knappetiketter och
  hover-texter som förklarar stilens koncept i stället för att visa det (körs via
  `prebuild`). Regeln står i [`docs/PROMPT_TAVLING.md`](docs/PROMPT_TAVLING.md).

## Teknikstack

| Lager | Val |
|-------|-----|
| Frontend | Vite + vanilla JS (ES modules) |
| Styling | Ren CSS (`src/style.css`) |
| Backend | – (ingen) |
| Databas | – (ingen) |
| Drift | Docker (Node-byggsteg → Caddy serverar `dist/`), bakom Authelia. Se [`docs/DEPLOY.md`](docs/DEPLOY.md). |

## Snabbstart

```bash
git clone https://github.com/pepestal/portal.git
cd portal
npm install
npm run dev        # regenererar stats + startar Vite dev-server
npm run build      # regenererar stats + produktionsbygge till dist/
npm run stats      # bara: regenerera src/data/stats.json ur grann-repona
npm run check:copy # textransoneringen: hittar bildtexter som borde vara bild
```

> `stats`-steget läser grannrepona i `../`: `signal_backend`, `signal_frontend`, `ethos`,
> `stronk` (Hexis bor kvar i den katalogen), `scales` och `sersys`. Finns de inte bredvid
> (t.ex. på servern) behålls senast kända värden i `src/data/stats.json`.
>
> ⚠️ **Kör bygget från en worktree hittas inga grannrepon** — `../` är då worktree-roten,
> inte `~/lab`, och varje projekt stämplas `"stale": true`. Lägg worktreen i `~/lab/` om
> du ska bygga, och kontrollera `git status` efteråt: en `stale`-stämplad `stats.json`
> ska aldrig committas.

## Konventioner

- Statisk frontend — inga hemligheter, ingen `.env`.
- Dokumentation uppdateras i samma commit som koden (se nedan).

## Dokumentation

All fördjupning ligger i [`docs/`](docs/) — se [`docs/README.md`](docs/README.md)
för index. Följer den gemensamma
[dokumentationsstandarden](https://github.com/pepestal/lokalt-docs/blob/main/docs/documentation_standard.md).

**Vid varje kodändring, i samma commit:**
1. Uppdatera denna `README.md` om struktur/stack/uppstart påverkas.
2. Lägg en rad i [`docs/CHANGELOG.md`](docs/CHANGELOG.md) under `## [Ej släppt]`.
