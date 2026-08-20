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
   live-adressen om ändringen är deployad, annars den lokala dev-servern.**
   ⚠️ **Playwright MCP finns inte i agentsessioner.** Kör då `playwright-core` mot
   chromium i `~/.cache/ms-playwright/` — skripten `~/shots/portal-stilar.mjs` (alla 21
   stilar) och `~/shots/portal-hover.mjs` (ett hover-läge per app) gör det. Två fällor:
   vänta **3,2 s efter `networkidle`** innan du mäter eller fotar, för kvittot skrivs ut
   ur slitsen i 2,6 s och ligger dessförinnan på negativ `y`; och använd `page.mouse.move`
   + `page.screenshot({clip})` i stället för `locator.hover()`/`locator.screenshot()`,
   som båda timeoutar på stilar med kontinuerlig animation. En bild per
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
| 001 | 2026-08-03 | Kardanen · chatgpt — klassisk stil med genomgående huvudaxel | Lokal `http://127.0.0.1:5176/?style=kardan-chatgpt` | `001_kardanen_chatgpt/start.png`, `start_mobil.png` |
| 002 | 2026-08-20 | Ekosystemet: sex appar, avnavad Syntes — samtliga 21 stilar före och efter | Lokal dev-server, 1440 px. `_fore` från `origin/main`, `_efter` från `agent/ekosystemet` | `002_ekosystemet_sex_appar/<stil>_fore.png` + `<stil>_efter.png` (21 par) |
