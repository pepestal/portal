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
  varptrådarna till tyg (jacquard), POS. 1 — sammanställningen i snitt som de tre
  detaljerna måttsätts från (sprangskiss), lågtryckscentrum L som isobarerna sluter sig
  kring och de tre fronterna utgår ur (synop), dansgolvet — kakans enda tomma cell, där
  lassen blir till bäringar för de tre andra (bikupa), subjektet — den enda tonföljd som
  finns, som de tre är omskrivningar av (fuga), sinusknutan — taktgivaren som inte går att
  avbilda, så allt man ser av den ÄR de tre andra (sinus).
- **Stil-system** (`src/styles.js` + `src/styles/<id>.{js,css}`): tretton stilar — `terminal`
  (Terminal Modernism), `editorial` (Editorial Light), `bank` (Private Bank),
  `singularitet` (Singularitet — ur tävlingsbidraget `variations/index.html`: cirkulära
  portar, stjärnfält, levande siffror), `kvitto` (Kvittot — ur tävlingsbidraget
  `variations/kvitto.html`: topbaren blir kassaapparat, apparna varurader på ett
  termokvitto som skrivs ut), `orrery` (Orrery — himlainstrument: apparna som
  världar i omlopp kring ett nav, byggd i `src/styles/orrery.js`), `vaxel` (Växeln —
  telefonstation ~1915: bakelit, mässingsplåtar, linjelampor; Syntes är växelbordet
  och inkommande-lampan ringer via `:has` när en underapp hovras), `jacquard`
  (Jacquardväven — uppspänd vävstol i oblekt lin med växtfärgad varp: underapparna
  är varptrådar, Syntes är inslaget som går på tvären och binder dem till tyg) och
  `sprangskiss` (Sprängskissen — ritningsblad i cyanotypi: Syntes är POS. 1,
  sammanställningen ritad i snitt och referensplanet `A`; underapparna är POS. 2–4
  och bär lägestolerans `⊕ Ø0,2 A` mot navet) och `synop` (Synoptiken — synoptisk
  väderanalys på kartpapper: *synoptisk* är grekiskans ”sedd tillsammans”, så kartan
  ÄR en syntes; Syntes är lågtryckscentrum `L 984 hPa`, underapparna är fronttyper
  som utgår ur det, och varje station läser ett högre tryck än navet) och `bikupa`
  (Bikupan — en vaxkaka i motljus: apparna är sexkantiga celler, och tre av dem *lagrar*
  något (nektar, yngel, pollen) medan navets är den enda **tomma** — dansgolvet, som inte
  lagrar en sak utan en riktning; på en lodrät kaka är "rakt upp" mot solen, så dansens
  vinkel α är en kompassriktning och varje underapp bär sin bäring `α …° · … km` ur navet)
  och `fuga` (Fugan — ett arbetsblad ur en fuga i öppen partitur: i en fuga finns ingen
  andra melodi, allt som klingar ÄR subjektet omskrivet. Syntes ställer det i takt 1;
  Signal är svaret en kvint upp, Todos samma toner speglade, Stronk samma toner i dubbla
  notvärden — bara `FG_SUBJ` finns i koden, de tre räknas fram ur den. De tre bär en
  flerstaktspaus vars siffra är väntan på navet, och står i krita medan navet står i bläck)
  och `sinus` (Sinusrytmen — en EKG-remsa på millimeterpapper: Syntes är sinusknutan, och
  poängen är att den **inte går att avbilda** — nodens signal når aldrig huden, så navets
  kanal är den enda tomma och allt man ser av den ÄR de tre andra. Signal är förmaket
  (P-vågen), Todos är AV-noden som håller impulsen 0,08 s, Stronk är kammaren (QRS). Var och
  en bär sin egenrytm — 60, 45 och 32/min — och sedan samma drivna 72/min, och sitter
  `fördröjning × pappershastighet` till höger om taktstrecket: 2, 6 och 10 rutor, mätbart
  på pappret).
  Varje stil bär egen
  palett, typografi och animationsuttryck under sin `[data-style]`. Skelettet står still
  för alla **utom `orrery`**, som är en helscen och medvetet ersätter det (döljer
  knappkolumn + systemhälsa och bygger en egen scen) — förankrat undantag, se
  CLAUDE.md/styles.js.
- **Rotation:** slumpad stil vid varje besök (undviker samma som förra). Switcher i
  topbaren för att bläddra, plus **lås** som pinnar en favorit (localStorage);
  `?style=<id>` deep-linkar.
- **Femtiotvå unika hover-animationer** — fyrtioåtta i skelett-matrisen (fyra appar × tolv stilar,
  `.viz--*` i stilens egen CSS; på hover viker knappnamnet upp och animationen tar scenen)
  plus orrery's tre världar och nav i sin egen scen. Enhancers per stil: count-up för terminal/bank/vaxel;
  singularitet injicerar stjärnfält/parallax/3D-tilt och tickande siffror (kurs, reps);
  kvitto injicerar kvittots huvud/fot med realtidsklocka och streckkod (hover: kassörens penna,
  skanner-laser, gummistämpel, termohuvud); orrery bygger hela scenen (stjärnfält, banor, reticle,
  siktlinjer) och väcker per app en sparkline, en bockad lista respektive en laddad skivstång
  med uppräkning — samt navet Syntes i mitten, som tänder alla siktlinjer; jacquard injicerar
  varplagret bakom knappkolumnen och navets inslag tvärs över hela sidan (skyttel + skäl som
  öppnas när navet hovras) och delar count-up-enhancern; sprangskiss injicerar ritningsbladet
  (ram, zonlister, stycklista och namnruta ur appregistret + stats) som markerar den hovrade
  vyn i stycklistan och kvitterar de tre som `MONT.` när navet hovras, och delar count-up;
  synop injicerar kartunderlaget (kust, graticule-kryss) och analysen (isobarer inmätta på
  navets rad, fronter med riktiga frontsymboler, stationsmodeller, namnruta med giltighetstid
  i UTC) som tänder den hovrade appens front och drar ihop hela lågtrycket när navet hovras,
  och delar count-up; bikupa injicerar kakan (cellmönster, foder lagrat högt, yngelvärme
  centrerad på navets rad, solmärke med lodlinje ner i dansgolvet) och de tre flygvektorerna,
  som mäts i DOM:en och ritas om vid resize — hovras en underapp dras bara hennes bäring, och
  alltid med start i dansgolvets cellvägg; hovras navet dras alla tre. Delar count-up.
  fuga injicerar bladet (fyra system mätta på radernas mittlinjer, klammer, altklavar,
  flerstaktspauser, subjektet till vänster och härledningarna till höger) och river det vid
  stilbyte — pekar man på en underapp skrivs hennes insats ut samtidigt som subjektet
  mörknar till fullt bläck, pekar man på navet skrivs alla tre och navets eget system får
  strettot. Delar count-up.
  sinus injicerar remsan (fyra kanalers baslinjer mätta på radernas mittlinjer,
  kalibreringspuls per kanal, taktstreck ritade ur nodens frekvens tvärs alla fyra, och
  måttsättningen av varje kanals fördröjning i millimeter) och river den vid stilbyte —
  i vila är sidans enda rörelse gnistan som vandrar taktstreck för taktstreck längs navets
  kanal i verklig tid; hovras en underapp skrivs hennes andel av slaget ut vid varje
  taktstreck, hovras navet skrivs alla tre och retledningen dras nedför sidan. Rutnätets
  millimetertal finns på båda ställena (CSS `--sn-mm`, JS `k`) och måste hållas lika.
  Delar count-up.
- **En stil = en modul (2026-07-28):** per-stil-koden bor i `src/styles/<id>.js` +
  `src/styles/<id>.css`; `styles.js` är registret, `shared.js` det lilla som delas, och
  `main.js` (234 rader) vet inget om enskilda stilar. Nya bidrag rör aldrig `main.js`
  eller `style.css` — se [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md). Bygget är oförändrat:
  Vite buntar ändå ihop allt till en JS- och en CSS-fil.
- **Bara aktiv stils markup i DOM:en (2026-07-28):** `mountAnim` byter hover-varianterna
  vid stilbyte i stället för att rendera alla tretton. 1232 → 285 DOM-noder, och en ny
  stil kostar inte längre något i vila.
- **Textransonering (2026-07-28):** samtliga stilar är genomgångna och rensade från
  bildtext som förklarar konceptet i stället för att visa det — förklaringsraden under
  knappen är borta i alla åtta stilar som hade en, hover-texterna kortade till siffra +
  term, rollspelsskämten torrlagda. Hörntaggarna (`::after`) är orörda; de är mätvärden
  och bär hierarkin. Regeln står i [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md) och kontrolleras
  av `npm run check:copy` i `prebuild`. Beslut per sträng:
  [`TEXTGRANSKNING.md`](TEXTGRANSKNING.md).
- **Byggtidsdata:** `scripts/generate-stats.mjs` går igenom grann-repona och skriver
  `src/data/stats.json` (filer, rader, språk, stack). Info-panelerna och systemhälsan
  läser den. Körs automatiskt via `predev`/`prebuild`. Se dokumenterat undantag i CLAUDE.md.
- Projektnamnet är nu `portal` (var `landing-page`); `<title>` likaså.

## Nästa konkreta steg

1. **Riktiga URL:er** på knapparna (nu `#` i `src/apps.js`) när apparnas adresser finns.
2. **Fler stilar** — `singularitet` (fjärde), `kvitto` (femte), `orrery` (sjätte,
   första helscenen) och `vaxel` (sjunde) kom 2026-07-23, `jacquard` (åttonde)
   2026-07-26 samt `sprangskiss` (nionde), `synop` (tionde), `bikupa` (elfte)
   2026-07-27 samt `fuga` (tolfte) och `sinus` (trettonde) 2026-07-28; en ny skelett-stil =
   modulen `src/styles/<id>.{js,css}` + en rad i `styles.js`; en helscen (som
   `src/styles/orrery.js`) sätter dessutom `fullscene: true`.
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
