# docs/ — dokumentation

Index över Portals dokumentation. Den samlade tekniska ingången är
[`../README.md`](../README.md); djupdykningar och löpande loggar bor här.

## Innehåll

| Fil | Roll |
|---|---|
| [`STATUS.md`](STATUS.md) | Nuläge: var vi står, nästa steg, öppna beslut. **Börja här om du ska ta vid.** |
| [`CHANGELOG.md`](CHANGELOG.md) | Kronologisk logg över ändringar och beslut. |
| [`ROADMAP.md`](ROADMAP.md) | Versionsplan och vad som medvetet ligger efter v1. |
| [`DEPLOY.md`](DEPLOY.md) | Driftsättning på VPS:en: bygg lokalt → scp `dist/` → Caddy `file_server` + Authelia. |
| [`dev_pics/`](dev_pics/) | **Visuell tidslinje** — skärmdumpar per uppdatering, äldst först. Obligatorisk vid varje UI-synlig ändring (se [`dev_pics/README.md`](dev_pics/README.md)). |

> Portal rör inte Syntes och har ingen djup datamodell, därför saknas
> `INTEGRATION.md` och `ARCHITECTURE.md` medvetet. Läggs till om behovet uppstår.

## Var finns vad (hela projektet)

| Dokument | Roll |
|---|---|
| [`../README.md`](../README.md) | Teknisk ingång: struktur, stack, snabbstart, konventioner. |
| [`../CLAUDE.md`](../CLAUDE.md) | Hårda regler och instruktioner för AI-agenter. |

Följer den gemensamma
[dokumentationsstandarden](https://github.com/pepestal/lokalt-docs/blob/main/docs/documentation_standard.md).
När du lägger till ett dokument: uppdatera tabellen ovan och notera i
[`CHANGELOG.md`](CHANGELOG.md).
