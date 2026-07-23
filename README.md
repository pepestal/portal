# Portal

> En landningssida som samlar ekosystemets appar i ett nav.

Portal är ekosystemets **ingång i webbläsaren**: en minimalistisk startsida som
länkar vidare till de övriga apparna (Signal, Todo, …) med små animationer och en
system-health-widget. Den är **fristående** — den pratar inte med händelsenavet
**Syntes** och äger ingen egen data.

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

- **Stil-system:** flera estetiker (`terminal`, `editorial`, `bank`) delar ett och
  samma skelett men bär egen palett, typografi och animationer. Stilen **roterar
  slumpmässigt** vid varje besök; en switcher låter dig bläddra och **låsa** en favorit.
- **Info-paneler + systemhälsa** visar riktig projektdata (filer, rader, språk, stack)
  som genereras vid **byggtid** ur grann-repona — inte via runtime-koppling.

Ren presentation — ingen inloggning, inget runtime-API, ingen databas.

## Arkitektur i korthet

Statisk klient utan backend. Vite bygger `index.html` + `src/` till statiska filer.
Länkar ut till andra appar via URL; ingen runtime app-till-app-kommunikation.

- `src/main.js` — renderar skelettet, sköter stilrotation, info-paneler och systemhälsa.
- `src/apps.js` — appregistret (lägg till en app = en rad).
- `src/styles.js` + `src/style.css` — stilregister och per-stil tokens/animationer.
- `scripts/generate-stats.mjs` → `src/data/stats.json` — byggtidsstatistik (körs via
  `predev`/`prebuild`). Se **dokumenterat undantag** i [`CLAUDE.md`](CLAUDE.md).

## Teknikstack

| Lager | Val |
|-------|-----|
| Frontend | Vite + vanilla JS (ES modules) |
| Styling | Ren CSS (`src/style.css`) |
| Backend | – (ingen) |
| Databas | – (ingen) |

## Snabbstart

```bash
git clone https://github.com/pepestal/portal.git
cd portal
npm install
npm run dev        # regenererar stats + startar Vite dev-server
npm run build      # regenererar stats + produktionsbygge till dist/
npm run stats      # bara: regenerera src/data/stats.json ur grann-repona
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
