# Roadmap — Portal

Versionsplan och medvetet uppskjutet arbete. Vad som ligger *efter* v1, och
när/om det är tänkt att komma. Scope-disciplin: varje utelämnad funktion är ett
aktivt val, dokumenterat här.

**Innehåll:**

- [Idéer / att utreda](#idéer--att-utreda)
- [v1.0 — mål](#v10--mål)
- [Medvetet INTE i v1](#medvetet-inte-i-v1)
- [v2+ — framtid](#v2--framtid)

---

## Idéer / att utreda

Fritt utrymme för snabba tankar om möjliga utvecklingsdelar — innan de är
versionsplacerade eller ens beslutade. Skriv ner uppslaget löst; **ingen punkt här
är ett åtagande.** Ett eget område att fylla på när något slår dig, och som senare
kan tas upp med en agent för diskussion.

När en idé mognar flyttas den vidare:
- blir det en fråga som måste avgöras snart → [STATUS.md](STATUS.md) → `Öppna beslut`,
- placeras den i en version → flytta ner till rätt `v1.x`/`v2`-rubrik nedan,
- blir det ett fattat *hur*-beslut → arkitektur/implementationsdokumentet.

<!-- Skriv dina idéer här, t.ex.: -->
<!-- - **Kort rubrik** — vad tanken är och varför den kan vara värd något. -->

### Spridda korta tankar:
- Animera textförflyttning vid hover på olika sätt för de olika stilarna
- Mer gym-styrkelyft tema för stronk
- signal bättre graf för bank tema
- större/längre candles på moderism temat

_(Inga uppslag noterade ännu.)_

---

## v1.0 — mål

- ~~Sidan är korrekt namngiven (`portal`) och byggbar (`npm run build`).~~ ✅
- ~~Stil-system med flera roterande estetiker och per-app hover-animationer.~~ ✅ (showroom)
- ~~System-health/info med riktig projektdata (byggtidsgenererad).~~ ✅
- Alla app-knappar har en fungerande länk (nu `#` tills URL:er finns).

## Medvetet INTE i v1

- **Runtime**-live-data från apparna — byggtidsstatistik räcker och håller sidan statisk
  (se dokumenterat undantag i CLAUDE.md). Runtime-fetch mot apparna är medvetet bortvalt.
- Autentisering / personlig vy — Portal är en publik ingång.

## v2+ — framtid

- ~~Dynamisk lista över appar i stället för hårdkodade kort.~~ ✅ (drivs av `src/apps.js`)
- ~~Per-app **unika** animationer per stil.~~ ✅ (nio st, matris app × stil)
- ~~Fler stilar i rotationen.~~ ✅ (`singularitet` — fjärde, `kvitto` — femte, `orrery` — sjätte
  och första helscenen, `vaxel` — sjunde; alla ur tävlingsbidrag; fler kan läggas till löpande)
- ~~Helscen-stil som ersätter skelettet.~~ ✅ (`orrery`, förankrat undantag från "skelettet står still")
- Självhostade typsnitt i stället för Google Fonts-`<link>`.
