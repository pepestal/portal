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
- **Knapparna länkar skarpt** (sedan 2026-07-28): `syntes.dev`, `signal.syntes.dev`,
  `ethos.syntes.dev` (Todos bor på *ethos* — id:t `todos` är kvar eftersom stilarnas
  selektorer och stats-nyckeln hänger på det) och `stronk.syntes.dev`.
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
  avbilda, så allt man ser av den ÄR de tre andra (sinus), nyckelplåten K — plåten som bär
  konturen och all text, den de tre färgplåtarna riktas mot och den enda som inte kan
  ligga ur pass (tryckark), källan — KM 0 som kilometertalen räknas från, där de tre
  biflödenas vatten ligger kvar som band i fåran så att älvens bredd ÄR summan av
  delarna (alv), bytespunkten — nätets enda station där alla tre linjer delar perrong,
  som underapparna bär sin restid till i räknebara mellanstationer (tunnelbana).
- **Stil-system** (`src/styles.js` + `src/styles/<id>.{js,css}`): sexton stilar — `terminal`
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
  på pappret) och `tryckark` (Tryckarket — ett ark på väg genom en fyrfärgspress: K i CMYK
  står för KEY, inte black, och Syntes är nyckelplåten — den som bär konturen och all text
  medan C/Y/M bara bär färg. De tre är vinkelmätta mot nyckelns 45° och vandrar ur pass
  med varsin färgad dubbelkontur; nyckeln kan per definition inte ligga snett, för den är
  nollan de ställs in efter) och `alv` (Älven — en driftbild över ett vattendrag i
  mörker: Syntes är källan, KM 0 som kilometertalen räknas från, underapparna är
  biflöden med var sitt vatten. Grenarna ritas med bredden k × rader ur stats.json,
  vattnen blandas inte vid sammanflödena utan ligger kvar som band — huvudfårans
  bredd ÄR summan av delarna, och pegelplåtarna skriver samma aritmetik i riktiga
  tal, identiska med systemhälsans) och `tunnelbana` (Tunnelbanan — en
  linjenätskarta i Becks schematiska tradition: grön/röd/blå linje är
  Signal/Todos/Stronk och Syntes är nätets ENDA bytespunkt — linjerna korsar
  varandra ute på kartan utan station, men delar perrong bara i navets rad, där
  alla tre löper genom bytespunktens kapsel. Knapparna är genomskinliga stationer
  som linjerna löper igenom; varje underapp bär restiden `◉ N MIN` till navet och
  mellanstationerna ritas ut så att talet går att räkna på kartan).
  Varje stil bär egen
  palett, typografi och animationsuttryck under sin `[data-style]`. Skelettet står still
  för alla **utom `orrery`**, som är en helscen och medvetet ersätter det (döljer
  knappkolumn + systemhälsa och bygger en egen scen) — förankrat undantag, se
  CLAUDE.md/styles.js.
- **Rotation:** slumpad stil vid varje besök (undviker samma som förra). Switcher i
  topbaren för att bläddra, plus **lås** som pinnar en favorit (localStorage);
  `?style=<id>` deep-linkar. Tangentbord: ←/→ bläddrar i aktiv pool, ↑/↓ växlar
  mellan vanligt läge och kaos.
- **Två tävlingsklasser (2026-07-28):** *klassisk* (klär skelettet, vanliga
  rotationen — [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md)) och *kaos* (`chaos: true`
  i modulen — inget skelett, fritt mönsterbrott, bara de fyra länkarna heliga;
  [`PROMPT_CHAOS.md`](PROMPT_CHAOS.md)). Kaos-poolen ligger bakom en **Kaos-toggle**
  i topbaren och har egen rotation; `?style=` och låset följer stilens klass.
  **Första kaosbidraget `pangea` landade 2026-07-28** — sidan utan bakgrund:
  smältan är ett fullskärms-`<a>` till Syntes och underapparna basaltplattor som
  flyter på navet, area ∝ rader ur stats.json. **Andra kaosbidraget `lodet`
  landade 2026-07-28** — scrollhjulet flyttar aldrig sidan; det vinschar i
  stället ut ett lod genom en mörk vattenpelare, och det är lodets NÄRHET, inte
  skrollposition, som avgör vad som lyser upp. De tre underapparna är beten på
  fasta djup (grunt→djupt = stigande radantal ur stats.json), Syntes är
  havsbottnen som aldrig vilar i totalt mörker. **Tredje kaosbidraget `dynamo`
  landade 2026-07-28** — sidan har ingen egen kraft: pekarens rörelse driver
  svänghjulet, och står du still faller spänningen tills sidan brunnit ner till
  glöd. Varje länk är en glödtråd med märkström ur stats.json (rader/1000 A);
  Syntes ÄR skenan de tre hänger i, så all deras ström går genom navet och varje
  skensegment lyser efter vad det bär. Tänds den tunga lasten sjunker spänningen
  för allt annat, och huvudsäkringen (största IEC-storleken UNDER anslutna
  lasten, 63 A mot ~67 A) gör "allt kan inte lysa samtidigt" sant per
  konstruktion — ett ryck mot den tyngsta lampan ger inrush nog att lösa ut den
  och släcka sidan. Elmätaren räknar kWh och nollas aldrig (localStorage).
  **Fjärde kaosbidraget `hinnan` landade 2026-07-28** — sidan har en baksida:
  hela scenen är en spänd hinna, och ingenting ligger på den. Allt man ser är
  något som trycker på den inifrån — länkarna är svällningar och namnen är
  relief pressad ut bakifrån, nästan utplånad i vila och skärpt av trycket.
  Pekaren trycker åt motsatt håll och buktar in duken; höjdfältet körs genom
  vågekvationen och skuggas mot ett släpljus per bildpunkt. Materialet är
  ändligt (en av de tre ut ⇒ de andra två plana), navet är den breda
  svällningen de tre trycker igenom PÅ och kan aldrig ligga lägre än den
  högsta av dem, och underappernas radie är rader^¼ ur stats.json. Slakheten
  där dina händer varit sparas mellan besöken (localStorage), och står du
  still en stund trycks en hand igenom hinnan — som drar sig undan om du går
  emot den. Togglen har nu fyra bidrag.
- **Sextiofyra unika hover-animationer** — sextio i skelett-matrisen (fyra appar × femton skelett-stilar,
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
  tryckark skriver plåtdata (färg, rastervinkel, passningsfel) som CSS-variabler på
  raderna — knappens raster, dubbelkonturen och pappersdriften läser dem därifrån — och
  injicerar arket mätt i DOM:en (skärmärken, passaxlar genom navets rad, passkors med
  varsitt passningsfel, vinkelmätare med nyckelns 45° som gemensamt referensben,
  färgkontrollremsa, slugrad), rivet vid stilbyte och omritat vid resize; ryms inte
  marginalen (smal skärm) hoppas instrumenten över och hörnstämpeln bär vinkeln ensam.
  Rastercellen ≈ 9 px står i både CSS (`--tr-cell`) och JS (`TR_CELL`) och måste hållas
  lika. Hovras navet dras hela arket i pass via `:has`. Delar count-up.
  alv injicerar kartlagret (källpunkt på navets radmitt, fyra grenar strukna med bredden
  k × rader ur stats, pegelplåtar med kumulativ summa efter varje sammanflöde, fotrad med
  avläsningsdatum), mätt i DOM:en och omritat vid resize/scroll — hovras ett biflöde
  spåras dess vatten genom hela fåran och tillskottet skrivs vid sammanflödet; hovras
  källan tänds alla fyra. Ryms inte fåran i vänstermarginalen döljs lagret helt. Delar
  count-up.
  tunnelbana injicerar linjenätet (tre linjer mätta på radernas mittlinjer med
  90°-krökar, mellanstationer jämnt på lodsträckan så hörnetiketternas `◉ N MIN`
  går att räkna, kartram), mätt i DOM:en och omritat vid resize/scroll — hovras en
  underapp dämpas de andra linjerna, ett tåg (dash längs pathen) löper in mot navet
  och bytespunktens kapselring tar linjens färg via `:has`; hovras navet går alla
  tre tågen samtidigt. Tågen ställs in vid reduced motion. Delar count-up.
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

1. **Fler stilar** — `singularitet` (fjärde), `kvitto` (femte), `orrery` (sjätte,
   första helscenen) och `vaxel` (sjunde) kom 2026-07-23, `jacquard` (åttonde)
   2026-07-26 samt `sprangskiss` (nionde), `synop` (tionde), `bikupa` (elfte)
   2026-07-27 samt `fuga` (tolfte), `sinus` (trettonde), `tryckark` (fjortonde),
   `alv` (femtonde) och `tunnelbana` (sextonde) 2026-07-28; en ny skelett-stil =
   modulen `src/styles/<id>.{js,css}` + en rad i `styles.js`; en helscen (som
   `src/styles/orrery.js`) sätter dessutom `fullscene: true`.
2. **Fler kaosbidrag** — första (`pangea`, helscen: smältan som navlänk,
   plattor med area ∝ rader) kom 2026-07-28; andra (`lodet`, helscen: scroll
   vinschar ett lod genom en vattenpelare i stället för att flytta sidan) kom
   2026-07-28; tredje (`dynamo`, helscen: sidan har ingen egen kraft — din
   rörelse är generatorn, ljus kostar ström och säkringen kan lösa ut) kom
   2026-07-28; fjärde (`hinnan`, helscen: sidan är en yta med en baksida —
   allt man ser är något som trycker på hinnan inifrån) kom 2026-07-28;
   nästa kaos-agent kör [`PROMPT_CHAOS.md`](PROMPT_CHAOS.md).
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
