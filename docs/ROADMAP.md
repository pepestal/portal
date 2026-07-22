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

_(Inga uppslag noterade ännu.)_

---

## v1.0 — mål

- Alla ekosystemets publika appar har ett kort med fungerande länk.
- Sidan är korrekt namngiven (`portal`) och byggbar (`npm run build`).

## Medvetet INTE i v1

- Riktig live-data i system-health — dekorativ simulering räcker tills en källa finns.
- Autentisering / personlig vy — Portal är en publik ingång.

## v2+ — framtid

- Dynamisk lista över appar (i stället för hårdkodade kort).
