# Status — Portal

> 🚧 **Status:** fungerande showroom-prototyp — stora app-knappar med hover-animationer,
> ett stil-system som roterar slumpmässigt, och info-paneler med byggtidsgenererad projektdata.

Ingången för den som ska **ta vid**: var vi står, vad nästa steg är, och vilka
beslut/förutsättningar som gäller just nu.

## Var vi står

Portal är medvetet ett **design-experiment / showroom** — inte en nyttosida man
faktiskt navigerar via. Fokus ligger på hur det känns, inte på länkarna.

- **Delat skelett** (`src/main.js`): stora centrerade knappar, en per app (Signal,
  Todos, Stronk), var med en info-knapp; plus en systemhälsa-panel.
- **Stil-system** (`src/styles.js` + `src/style.css`): tre stilar — `terminal`
  (Terminal Modernism), `editorial` (Editorial Light), `bank` (Private Bank). Varje
  stil bär egen palett, typografi och animationsuttryck under sin `[data-style]`.
  Skelettet står still; bara stilen byts.
- **Rotation:** slumpad stil vid varje besök (undviker samma som förra). Switcher i
  topbaren för att bläddra, plus **lås** som pinnar en favorit (localStorage).
- **Nio unika hover-animationer** — en egen form per app i varje stil (matris
  app × stil, `.viz--*` i `src/style.css`). På hover viker knappnamnet upp och
  animationen tar scenen. Räknare (count-up) via enhancers för terminal/bank.
- **Byggtidsdata:** `scripts/generate-stats.mjs` går igenom grann-repona och skriver
  `src/data/stats.json` (filer, rader, språk, stack). Info-panelerna och systemhälsan
  läser den. Körs automatiskt via `predev`/`prebuild`. Se dokumenterat undantag i CLAUDE.md.
- Projektnamnet är nu `portal` (var `landing-page`); `<title>` likaså.

## Nästa konkreta steg

1. **Riktiga URL:er** på knapparna (nu `#` i `src/apps.js`) när apparnas adresser finns.
2. **Fler stilar** — arkitekturen gör det till ett token/`.viz--*`-block + en rad i `styles.js`.
3. Överväg **självhostade typsnitt** (Inter/JetBrains Mono/Fraunces) i stället för Google Fonts-`<link>`.

## Öppna beslut

- Ska Stronk vara en aktiv knapp direkt eller markeras som "planerad" tills den är publik?
- Hur ofta ska stats regenereras — bara vid deploy (nuvarande) eller schemalagt?

## Förutsättningar (infra, nycklar, miljö)

- Statisk frontend, inga hemligheter, ingen `.env`.
- Byggtidsstatistiken kräver att grann-repona finns bredvid (`../Signal`, `../todos`,
  `../stronk`, `../syntes`). Saknas de behålls senast kända värden i `stats.json`.
