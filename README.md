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

Portal renderar en enda sida (`src/main.js` + `src/style.css`) med en knapp per app
i ekosystemet. Varje knapp har en liten temaanimation och en info-panel som
beskriver appen. En hopfällbar "system health"-panel visar simulerade drift-värden
(temp, CPU, minne). Ren presentation — ingen inloggning, inget API, ingen databas.

## Arkitektur i korthet

Statisk klient utan backend. Vite bygger `index.html` + `src/` till statiska filer
som kan serveras var som helst. Länkar ut till de andra apparna via URL; ingen
app-till-app-kommunikation sker här.

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
npm run dev        # startar Vite dev-server
npm run build      # produktionsbygge till dist/
```

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
