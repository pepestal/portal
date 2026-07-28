# Portal

> En landningssida som samlar ekosystemets appar i ett nav.

Portal är ekosystemets **ingång i webbläsaren**: en minimalistisk startsida som
länkar vidare till apparna (Syntes, Signal, Todos, Stronk) med små animationer och en
system-health-widget. **Syntes är navet** — den övergripande dashboard som tar emot,
syntetiserar och pumpar information mellan underapparna — och stilarna ger den en
särställning. Portal är **fristående** — den *länkar* till Syntes men pratar aldrig
med den i runtime och äger ingen egen data.

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

- **Stil-system:** flera estetiker (`terminal`, `editorial`, `bank`, `singularitet`, `kvitto`, `vaxel`, `jacquard`, `sprangskiss`, `synop`, `bikupa`, `fuga`, `sinus`, `tryckark`, `alv`)
  delar ett och samma skelett men bär egen palett, typografi och animationer; `orrery` är en
  **helscen** som medvetet ersätter skelettet (förankrat undantag). Stilen **roterar slumpmässigt**
  vid varje besök; en switcher låter dig bläddra och **låsa** en favorit. `?style=<id>` i URL:en
  deep-linkar till en specifik stil. Sedan 2026-07-28 finns även en **kaosklass**
  (moduler med `chaos: true` — fritt mönsterbrott utan skelett, se
  [`docs/PROMPT_CHAOS.md`](docs/PROMPT_CHAOS.md)) bakom en Kaos-toggle i topbaren,
  med egen rotation; poolen är ännu tom och togglen avstängd tills första bidraget.
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

> `stats`-steget läser `../Signal`, `../todos`, `../stronk`, `../syntes`. Finns de inte
> bredvid (t.ex. på servern) behålls senast kända värden i `src/data/stats.json`.

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
