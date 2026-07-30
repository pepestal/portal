# CLAUDE.md — instruktioner för AI-agenter

Läses automatiskt av Claude Code och gäller alla agenter i portal-repot. Håll den
**kort och operativ**; djup finns i länkade dokument.

## Läs detta först

- [`README.md`](README.md) — teknisk ingång: struktur, stack, snabbstart, konventioner.
- [`docs/STATUS.md`](docs/STATUS.md) — var vi står och nästa steg. **Börja här om du ska ta vid.**
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — vad som hänt. Notera dina ändringar här.

**Vid konflikt** mellan en ad hoc-instruktion och ett fastställt beslut i dokumenten:
**flagga konflikten innan du agerar.** Fatta inte tysta arkitekturbeslut.

## Hårda regler (bryt aldrig utan att flagga)

- Portal är en **statisk frontend** — ingen backend, ingen databas, ingen
  Syntes-koppling. Inför inte sådant utan att först flagga och förankra beslutet.
- Länkar ut till andra appar går via URL. Läs aldrig i en annan apps data direkt.
- **Undantag (förankrat):** `scripts/generate-stats.mjs` läser grann-repona vid
  **byggtid** och bakar in en statisk `src/data/stats.json`. Det är inte en
  runtime-koppling — sidan förblir statisk och läser aldrig en annan app live.
  Utöka inte detta till runtime-fetch mot apparna utan att flagga.

## När du är klar med en ändring

1. Uppdatera [`README.md`](README.md) om struktur/stack/uppstart ändrats.
2. Notera ändringen i [`docs/CHANGELOG.md`](docs/CHANGELOG.md) (imperativ, svenska).
3. Uppdatera [`docs/STATUS.md`](docs/STATUS.md)/[`docs/ROADMAP.md`](docs/ROADMAP.md) om nuläge/plan ändrats.
4. 📸 **Syns ändringen i appen: spara en skärmdump i [`docs/dev_pics/`](docs/dev_pics/)** —
   ny mapp `NNN_kort_beskrivning/`, bild tagen med Playwright MCP mot **live-adressen om
   ändringen är deployad, annars lokal dev-server**, plus en rad i
   [`docs/dev_pics/README.md`](docs/dev_pics/README.md). Flödet och namnreglerna står där.
   Portal är **nästan bara** UI — i praktiken kräver varje ändring här en bild. Rör
   ändringen en kaosstil: fota den stilen, och ta med ett läge där animationen/interaktionen
   syns. Ingen visuell effekt → hoppa över, men **säg att du hoppade över och varför**.

Kravet är absolut, på samma nivå som changelog-kravet. Bilderna är projekthistorik: de
committas, och en gammal mapp döps aldrig om eller skrivs över.

## Ton & arbetssätt

Peter kan stacken. Var koncis och teknisk. Föreslå, överraska inte. När något är
gjort och verifierat, säg det rakt; när ett test failar, säg det med utdata.
