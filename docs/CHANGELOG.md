# Changelog

Alla meningsfulla ändringar i Portal noteras här. Nyast överst. Format enligt
[Keep a Changelog](https://keepachangelog.com/sv/); rader skrivs i imperativ.

## [Ej släppt]

### Tillagt
- **Driftsatt live på `https://portal.syntes.dev`** (2026-07-24), bakom Authelia-login
  (`one_factor`, SSO över `.syntes.dev` — spegling av signal/stronk/syntes-dashboard).
  Statisk `dist/` byggs lokalt (grann-repona finns → riktiga stats) och serveras av Caddy
  `file_server` via en monterad volym i reverse-proxy-stacken; ingen egen container. Ny
  deploy-guide: [`docs/DEPLOY.md`](DEPLOY.md).
- Piltangenter ←/→ bläddrar stil (samma som prev/next-knapparna). Hoppar över när
  fokus ligger i ett textfält så vanlig markörnavigation inte kapas. Stegnings-logiken
  bruten ut till `stepStyle(delta)` i `main.js` och delas av knappar och tangentbord.
- Stil `vaxel` ("Växeln") — sjunde stilen i rotationen: Portal som manuell telefonstation
  ~1915 (bakelitpaneler med mässingsskruvar, graverade mässingsplåtar, linjelampor).
  Konceptet: **Syntes ÄR växelbordet** — underapparna är abonnenter med anknytningsnummer
  och ingen linje når en annan utan att gå genom telefonisten: hovra en underapp och
  inkommande-lampan ringer på Syntes-panelen (`:has`-koppling i ren CSS). Fyra hovrar i
  samma koncept, fyra uttryck: telefonisten proppar in de tre linjerna i jacken och
  lamporna tänds (Syntes), telegrafremsa knattrar fram "KÖP" i morse (Signal), samtalskön
  expedieras lampa för lampa (Todos), magnetveven dras och voltmätarens visare stiger med
  varvräknare via count-up-enhancern (Stronk). Skelettet orört; tangentbordsfokus ger
  samma upplevelse som hover (`:is(:hover, :focus-visible)` genomgående, till skillnad
  från äldre stilar). Arkiverad som skärmdumpar i `variations/vaxel/`.
- **Syntes som fjärde app och nav** i skelettet (`src/apps.js`): den övergripande
  dashboarden som pumpar information mellan underapparna. Varje stil ger navet en
  särställning och en egen hover: merge-diagram som typas (`terminal`), venn-diagram i
  bläck (`editorial`), tre allokeringar samlas till 100 % (`bank`), största porten med
  hjärtslag i dubbelslag och stoft från de tre världarnas färger (`singularitet`),
  "1 st NAV, SYNTES" som kassörens gröna penna ringar in med anteckningen "navet!"
  (`kvitto`), samt orrery-scenens lysande nav i mitten som blev Syntes-länken — hover
  tänder siktlinjerna till alla tre världar (statusrad: "3 världar · 1 nav").
- `docs/PROMPT_TAVLING.md` — återanvändbar tävlingsprompt för kommande bidrag: bygg
  direkt i produktion som ny stil, fyra appar med unika hovrar, Syntes särställning,
  verifierings- och dokumentationskrav; bidrag arkiveras som skärmdump i `variations/`.
- Stil `orrery` — sjätte stilen i rotationen och den **första helscenen**: till skillnad från de
  övriga stilarna ersätter den skelettet (döljer knappkolumn + systemhälsa via CSS) och `src/orrery.js`
  bygger en egen scen — Portal som ett *himlainstrument*. De tre underapparna är världar på koncentriska
  omloppsbanor kring navet (Syntes, se ovan); hover tänder banan, väcker världens väsen (sparkline /
  bockad lista / laddad skivstång) och räknar upp ett värde. Att hovra navet drar de tre världarnas
  stoft in i hjärtat längs siktlinjerna — Syntes tar emot och syntetiserar. Canvas-stjärnfält med
  parallax, 3D-tilt och siktlinjer som tänds; alla scen-klasser prefixade `orr-`. Medvetet åtskild från
  `singularitet` (radiell komposition, reticle, dämpad stjärnatlas-palett, Fraunces — inte neonvirvlar).
- Stil `kvitto` — femte stilen i rotationen, tävlingsbidraget invävt i stil-systemet:
  topbaren blir kassaapparaten (slits, status-LED, mörka knappar), raderna blir varurader
  på ett termokvitto som skrivs ut hackigt vid stilbyte och hänger gungande; systemhälsan
  blir kortterminal med grön LCD. Hover per app: skanner-laser + *PIIP* (Signal),
  gummistämpel "KLART" (Todos), termohuvud som bränner om raden (Stronk). Kvitto-enhancern
  injicerar huvud/fot med realtidsklocka och deterministisk streckkod, städas vid stilbyte.
- Deep-link till stil via `?style=<id>` i URL:en.
- Tävlingsbidrag `variations/kvitto.html` ("Kvittot") — fristående sida där uppgiften får ett
  kvitto på sig själv: ett termokvitto från "Portal & Söner AB" skrivs ut ur en kassaapparat;
  de tre varuraderna är länkarna, med varsin hover (skanner-laser + *PIIP*, gummistämpel
  "ÖPPNAD", termohuvud som bränner om raden). Ren HTML/CSS + minimal JS (klocka, streckkod).
- Stil `singularitet` — fjärde stilen i rotationen, tävlingsbidraget invävt i stil-systemet:
  knapparna blir cirkulära portar (CSS-only, skelettet orört) med virvelringar och stoft som
  sugs in vid hover; stjärnfält med parallax + 3D-tilt + levande siffror via egen enhancer.
  Tre nya hover-världar (`.viz--pulse`/`--selfcheck`/`--lift`): puls + tickande kurs,
  självbockande lista, skivstång med reps-räknare som aldrig nollställs.
- Tävlingsbidrag `variations/index.html` — fristående design-experiment ("Portalen tog sitt
  namn på allvar"): tre app-länkar som dimensionsportar med levande interiörer vid hover.
  Helt statiskt, ingen koppling till stil-systemet eller bygget.
- Initial dokumentationsstruktur enligt gemensam standard (`README.md`, `CLAUDE.md`, `docs/`).
- Stil-system: tre estetiker (`terminal`, `editorial`, `bank`) med egen palett, typografi
  och animationsuttryck, drivet av `src/styles.js` + `[data-style]` i `src/style.css`.
- Slumpad stilrotation vid varje besök, med switcher och lås (localStorage) i topbaren.
- Stora app-knappar; på hover viker namnet upp och lämnar scenen åt animationen. App-registret i `src/apps.js`.
- Info-panel per app och systemhälsa som läser byggtidsgenererad projektdata.
- **Nio unika hover-animationer** — en egen form per app i varje stil (`.viz--*`):
  - Signal: candlesticks som printas (terminal) · graverad linje ritar sig + annoterad punkt (editorial) · mjuk area-kurva sveper fram + värde räknas upp (bank).
  - Todos: `[ ]→[x]`-checklista som bockas (terminal) · bläck-bock ritas + hårlinje stryker över (editorial) · cirkulär progress-ring sluts + bock (bank).
  - Stronk: ASCII load-bar + reps-räknare (terminal) · tally-streck i loggbok (editorial) · viktplattor glider in och staplas + kg räknas upp (bank).
- Stil-ambiance: scanline-svep + blinkande caret + marching-grid (terminal), sheen-svep + lyft (bank), stilla bläck (editorial).
- Enhancer-livscykel i `main.js` med räknare (count-up) för terminal/bank; kopplas in/ur vid stilbyte.
- Byggtidsgenerator `scripts/generate-stats.mjs` → `src/data/stats.json` (filer, rader,
  språk, stack per grann-repo); körs via `predev`/`prebuild`.

### Ändrat
- Åtkomstbeslut: Portal är **inte längre en publik ingång** utan ligger bakom Authelia
  (infra-skydd, inte app-egen auth — sidan förblir statisk). `docs/ROADMAP.md` uppdaterad.
- Tävlingsmappen `tavling/` har döpts om till `variations/`; alla referenser i docs och
  kodkommentarer uppdaterade.
- Invarianten "skelettet står still" gäller nu alla stilar **utom** `orrery` — en förankrad helscen
  som medvetet ersätter skelettet. `src/styles.js`-kommentaren, README och STATUS uppdaterade därefter.
- Projektnamn `landing-page` → `portal` i `package.json`; `<title>` → `Portal`.
- `index.html`: `lang="sv"`, `color-scheme`, typsnitt via `<link>`/`preconnect` (inte CSS-`@import`).
- CLAUDE.md: dokumenterat undantag för byggtidsläsning av grann-repona (ej runtime-koppling).

### Fixat
- Orrery kraschade i produktion: `canvas.clientWidth = innerWidth` kastar TypeError i
  strict mode (ES-moduler) — tilldelningen till read-only-egenskapen borttagen. Den
  fristående `design-lab/orrery.html` kör sloppy mode där felet tystas, vilket är exakt
  den demo-vs-live-divergens som PROMPT_TAVLING.md nu förbjuder.
- Termobränningen i kvitto-stilen lämnade radens vänsterkant blek i slutläget
  (gradient-overshoot utanför `no-repeat`-ytan); rättad i stilen och i `variations/kvitto.html`.
- Info-paneler droppar under knappen (centrerat) i stället för fasta pixel-offset som
  hamnade utanför skärmen på smala vyer.
- Ersatt de self-running animationerna (blinkande prick, darrande telemetri) med rörelse
  som bara svarar på hover; `prefers-reduced-motion` respekteras.

### Borttaget
- Simulerad sci-fi-telemetri (CORE TEMP/CPU/MEMORY) — ersatt av ärlig ekosystem-statistik.
