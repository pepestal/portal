# dev_pics/ — visuell tidslinje för Portal

Skärmdumpar av UI:t, en mapp per uppdatering, i kronologisk ordning. Syftet är att
kunna bläddra tillbaka och se hur appen faktiskt vuxit fram.

> **Bilderna är projekthistorik, inte felsökningsartefakter.** De **committas**, och en
> befintlig mapp döps aldrig om, flyttas inte och skrivs inte över — inte ens när den
> visar något som senare visade sig vara fel. Det är precis vad tidslinjen ska visa.

## Regeln (absolut, samma nivå som dokumentationskravet)

Syns en ändring i appen är uppgiften **inte klar** förrän en bild ligger här.

1. **Mapp:** `NNN_kort_beskrivning/` — tresiffrigt löpnummer, gemener, `_` som
   avskiljare. **Lista den här mappen först och ta nästa lediga nummer.** Inga luckor,
   aldrig ett återanvänt nummer — numret *är* kronologin.
2. **Fota med Playwright MCP** (`browser_take_screenshot`). **Källa: den publika
   live-adressen om ändringen är deployad, annars den lokala dev-servern.** En bild per
   ändrad yta; är ändringen mobil-relevant, ta även en variant med `browser_resize` till
   390 px bredd. Stäng med `browser_close`.
3. **Filnamn:** `<yta>[_<variant>].png` — t.ex. `start.png`, `start_mobil.png`,
   `lista_tomt_läge.png`.
4. **Flytta** bilden ur `.playwright-mcp/` (gitignorerad) hit in — kopiera den inte, och
   lämna inget kvar i artefaktmappen.
5. **Lägg en rad i tabellen nedan.**

**Undantag:** rena backend-, infra-, test- eller dokumentationsändringar utan visuell
effekt. Hoppa då över bilden, men **säg uttryckligen att du hoppade över och varför** —
en tyst utebliven bild räknas som drift.

Normen i sin helhet:
[`documentation_standard.md` §7](https://github.com/pepestal/lokalt-docs/blob/main/docs/documentation_standard.md#7-utvecklingsbilder-docsdev_pics).

## Tidslinje

**Nyast underst** — kronologisk läsordning, alltså motsatt [`../CHANGELOG.md`](../CHANGELOG.md).

| Nr | Datum | Uppdatering | Källa | Bilder |
|---|---|---|---|---|
| — | — | _Inga bilder än. Nästa uppdatering som syns i UI:t blir `001_...`._ | — | — |
