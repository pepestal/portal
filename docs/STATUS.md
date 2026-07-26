# Status — Portal

> 🚧 **Status:** fungerande showroom-prototyp — stora app-knappar med hover-animationer,
> ett stil-system som roterar slumpmässigt, och info-paneler med byggtidsgenererad projektdata.
>
> 🟢 **Live:** [`https://portal.syntes.dev`](https://portal.syntes.dev) (sedan 2026-07-24),
> bakom Authelia-login. Driftsättning: se [`DEPLOY.md`](DEPLOY.md).

Ingången för den som ska **ta vid**: var vi står, vad nästa steg är, och vilka
beslut/förutsättningar som gäller just nu.

## Var vi står

Portal är medvetet ett **design-experiment / showroom** — inte en nyttosida man
faktiskt navigerar via. Fokus ligger på hur det känns, inte på länkarna.

- **Delat skelett** (`src/main.js`): stora centrerade knappar, en per app (Syntes,
  Signal, Todos, Stronk), var med en info-knapp; plus en systemhälsa-panel.
- **Syntes är navet** — den övergripande dashboarden som tar emot, syntetiserar och
  pumpar information mellan underapparna (t.ex. säljsignal från Signal → uppgift i
  Todos). Varje stil ger den en särställning: merge-diagram (terminal), venn-snitt
  (editorial), samlad allokering (bank), största porten med hjärtslag (singularitet),
  inringad NAV-rad med kassörens penna (kvitto), det lysande navet i mitten (orrery),
  växelbordet där det ringer när en underapp hovras (vaxel), inslaget som binder de tre
  varptrådarna till tyg (jacquard).
- **Stil-system** (`src/styles.js` + `src/style.css`): åtta stilar — `terminal`
  (Terminal Modernism), `editorial` (Editorial Light), `bank` (Private Bank),
  `singularitet` (Singularitet — ur tävlingsbidraget `variations/index.html`: cirkulära
  portar, stjärnfält, levande siffror), `kvitto` (Kvittot — ur tävlingsbidraget
  `variations/kvitto.html`: topbaren blir kassaapparat, apparna varurader på ett
  termokvitto som skrivs ut), `orrery` (Orrery — himlainstrument: apparna som
  världar i omlopp kring ett nav, byggd i `src/orrery.js`), `vaxel` (Växeln —
  telefonstation ~1915: bakelit, mässingsplåtar, linjelampor; Syntes är växelbordet
  och inkommande-lampan ringer via `:has` när en underapp hovras) och `jacquard`
  (Jacquardväven — uppspänd vävstol i oblekt lin med växtfärgad varp: underapparna
  är varptrådar, Syntes är inslaget som går på tvären och binder dem till tyg).
  Varje stil bär egen
  palett, typografi och animationsuttryck under sin `[data-style]`. Skelettet står still
  för alla **utom `orrery`**, som är en helscen och medvetet ersätter det (döljer
  knappkolumn + systemhälsa och bygger en egen scen) — förankrat undantag, se
  CLAUDE.md/styles.js.
- **Rotation:** slumpad stil vid varje besök (undviker samma som förra). Switcher i
  topbaren för att bläddra, plus **lås** som pinnar en favorit (localStorage);
  `?style=<id>` deep-linkar.
- **Trettiotvå unika hover-animationer** — tjugoåtta i skelett-matrisen (fyra appar × sju stilar,
  `.viz--*` i `src/style.css`; på hover viker knappnamnet upp och animationen tar scenen)
  plus orrery's tre världar och nav i sin egen scen. Enhancers per stil: count-up för terminal/bank/vaxel;
  singularitet injicerar stjärnfält/parallax/3D-tilt och tickande siffror (kurs, reps);
  kvitto injicerar kvittots huvud/fot med realtidsklocka och streckkod (hover: kassörens penna,
  skanner-laser, gummistämpel, termohuvud); orrery bygger hela scenen (stjärnfält, banor, reticle,
  siktlinjer) och väcker per app en sparkline, en bockad lista respektive en laddad skivstång
  med uppräkning — samt navet Syntes i mitten, som tänder alla siktlinjer; jacquard injicerar
  varplagret bakom knappkolumnen och navets inslag tvärs över hela sidan (skyttel + skäl som
  öppnas när navet hovras) och delar count-up-enhancern.
- **Byggtidsdata:** `scripts/generate-stats.mjs` går igenom grann-repona och skriver
  `src/data/stats.json` (filer, rader, språk, stack). Info-panelerna och systemhälsan
  läser den. Körs automatiskt via `predev`/`prebuild`. Se dokumenterat undantag i CLAUDE.md.
- Projektnamnet är nu `portal` (var `landing-page`); `<title>` likaså.

## Nästa konkreta steg

1. **Riktiga URL:er** på knapparna (nu `#` i `src/apps.js`) när apparnas adresser finns.
2. **Fler stilar** — `singularitet` (fjärde), `kvitto` (femte), `orrery` (sjätte,
   första helscenen) och `vaxel` (sjunde) kom 2026-07-23, `jacquard` (åttonde)
   2026-07-26; en ny skelett-stil = token/`.viz--*`-block + en rad i `styles.js`,
   en helscen = egen modul (som `src/orrery.js`) + en rad i `styles.js`.
3. Överväg **självhostade typsnitt** (Inter/JetBrains Mono/Fraunces) i stället för Google Fonts-`<link>`.

## Öppna beslut

- Ska Stronk vara en aktiv knapp direkt eller markeras som "planerad" tills den är publik?
- Hur ofta ska stats regenereras — bara vid deploy (nuvarande) eller schemalagt?

## Förutsättningar (infra, nycklar, miljö)

- Statisk frontend, inga hemligheter, ingen `.env`.
- Byggtidsstatistiken kräver att grann-repona finns bredvid (`../Signal`, `../todos`,
  `../stronk`, `../syntes`). Saknas de behålls senast kända värden i `stats.json`.
- **Drift:** VPS `root@65.109.143.130`, egen container `portal` (git-klon i
  `/root/apps/portal/`) som övriga appar. Bygget sker i Dockerfilens Node-steg → VPS:en
  behöver ingen node. Yttre Caddy (`/root/apps/reverse-proxy/`) kör `reverse_proxy portal:80`
  bakom `forward_auth`; Authelia-regeln i `/root/apps/authelia/`. Uppdatering:
  `git pull && docker compose up -d --build`. Steg för steg: [`DEPLOY.md`](DEPLOY.md).
  Stats (`src/data/stats.json`) genereras lokalt (grann-repona finns där) och committas
  in i bygget — i containern behålls den som fallback.
