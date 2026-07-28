# Changelog

Alla meningsfulla ändringar i Portal noteras här. Nyast överst. Format enligt
[Keep a Changelog](https://keepachangelog.com/sv/); rader skrivs i imperativ.

## [Ej släppt]

### Tillagt
- **Kaosstil: Pangea** (`pangea`, första kaosbidraget) — sidan har ingen bakgrund.
  Mönsterbrottet: varje pixel i viewporten navigerar. Det som ser ut som bakgrund
  är smält berg, och smältan ÄR Syntes — ett enda fullskärms-`<a>` underst i
  scenen; underapparna är basaltplattor som flyter på navet, så särställningen är
  topologi: mellan två plattor korsar man alltid Syntes. Plattornas area skalar
  med `rader` ur `stats.json` (Signal en kontinent, Todos en kobbe), driften drivs
  av samma konvektionsfält som för gnistorna, och varje tillstånd har mekanik:
  smältan konvekterar i vila; en glöd följer markören **under** skorpan
  (närmandet); hovrad platta pinnas (lätt att träffa) och hettas underifrån medan
  raderna räknas upp; lämnad platta svalnar långsamt (efterglöd); klicket får
  eruptionsring + vitglött uppflammande utan att navigationen kapas; hovrad smälta
  tänder SYNTES med värmedaller och navets radantal. Tab når alla fyra (navet
  först), fokus ger vitglött rim längs klippformen i stället för skelettets
  rektangel, reduced motion fryser scenen till stillbild med konceptet intakt,
  och cleanupen river scen, canvas, lyssnare och rAF-loop. Kaos-togglen har
  därmed sitt första bidrag och är aktiv.
- **Stil: Tunnelbanan** (`tunnelbana`, sextonde bidraget) — en linjenätskarta i
  Becks schematiska tradition: papper, primärfärger, bara räta vinklar och mjuka
  krökar. Grön linje är Signal, röd Todos, blå Stronk, och navmekaniken är ren
  **topologi**: Syntes är nätets **enda bytespunkt**. Linjerna korsar varandra ute
  på kartan utan station — den enda plats där de delar perrong är navets rad, där
  alla tre löper parallellt genom bytespunktens kapsel; en underapp kan inte nå en
  annan utan att passera navet. Mekaniken syns i vilan: knapparna är genomskinliga
  stationer som linjerna löper igenom, varje underapp bär sin restid till
  bytespunkten (`◉ N MIN`, 1 station = 1 minut) och mellanstationerna ritas ut på
  den lodräta sträckan så att talet går att räkna på kartan (N−1 punkter + ankomst);
  navet bär `SPÅR 1–6` — den enda station som behöver sex spår, räknebara i navets
  hover. Rörelse-etiken är den tryckta kartans: allt som rör sig är tåg, och tåg
  går bara när en station pekas ut — då dämpas övriga linjer, ett tåg löper längs
  linjen IN mot navet (aldrig ut) och bytespunktens kapselring kvitterar med den
  ankommande linjens färg; pekas navet ut går alla tre tågen samtidigt. Hovers som
  kartans förstoringsrutor: bytesplanen med sex spår, tre samtidiga tåg och två
  resenärer som byter in mot mittenlinjen (syntes), blocksignaler som slår om
  bakom ett accelererande tåg, 80 km/h (signal), vagnskartan ovanför dörren där
  markören stegar sex hållplatser från kapseln och de passerade fylls i (todos),
  bergrumssektionen där rulltrappan dras ner till plattformen och djupmåttet växer
  till −30 m (stronk). Nätet mäts i DOM:en, ritas om vid resize/scroll och rivs
  vid stilbyte; tågen ställs in helt vid reduced motion och tangentbordsfokus ger
  samma upplevelse som hover.
- **Stil: Älven** (`alv`, femtonde bidraget) — en driftbild över ett vattendrag i
  mörker. Syntes är **källan**: KM 0 som kilometertalen räknas från och den enda
  raden uppströms om allt; underapparna är **biflöden** med var sitt vatten (klart
  fjällvatten, humusbrunt myrvatten, grön glaciärmjölk). Navmekaniken är
  **konservering som geometri**: enhancern ritar varje gren med bredden k × rader
  ur `stats.json` (samma k för alla fyra), vattnen blandas inte vid sammanflödena
  utan ligger kvar som band — huvudfårans bredd ÄR summan av delarna, och
  pegelplåtarna skriver samma aritmetik i riktiga tal (4 470 → 57 2xx → 59 1xx →
  66 4xx, identiskt med systemhälsan). Pekas ett biflöde ut spåras dess vatten
  hela vägen genom fåran och tillskottet (`+52 xxx`) skrivs vid sammanflödet;
  pekas källan ut tänds hela systemet. Hovers: älvens längsprofil som stegar i
  grenarnas färger vid varje sammanflöde (syntes), vårflodens hydrograf med
  HQ-linje (signal), flottningens räkneverk med drivande stockar (todos),
  turbinen under last med fallhöjden 171 m = 712 − 541 ur hörntaggarnas höjdtal
  (stronk). Kartlagret mäts i DOM:en, ritas om vid resize/scroll och viker sig
  helt när vänstermarginalen inte rymmer fåran; tangentbordsfokus ger samma
  upplevelse som hover och stilens berättarfördröjningar nollas vid
  reduced motion.
- **Kaosklass i tävlingen.** Stilsystemet delas i två pooler: klassisk och kaos. En
  stilmodul som sätter `chaos: true` hamnar i kaos-poolen och visas bara när den nya
  **Kaos-togglen** i topbaren är på; pilar/rotation bläddrar inom aktiv pool, och
  `?style=<id>` och låset följer stilens klass. Togglen är avstängd (med förklarande
  `title`) tills första kaosbidraget finns — i dag är kaos-poolen tom. Ny
  tävlingsprompt [`PROMPT_CHAOS.md`](PROMPT_CHAOS.md): inget skelett, fritt
  mönsterbrott, bara de fyra länkarna (ur `src/apps.js`) plus tangentbord,
  reduced-motion, cleanup och `check:copy` är heliga; bedöms på WHOA-faktor.
  [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md) förtydligad som **klassiska klassens**
  prompt: klassiska bidrag sätter aldrig `chaos: true`.

### Ändrat
- **Knapparna länkar skarpt** i stället för `#`: Syntes → `https://syntes.dev`, Signal →
  `https://signal.syntes.dev`, Todos → `https://ethos.syntes.dev`, Stronk →
  `https://stronk.syntes.dev`. Todos bor på *ethos*; app-id:t `todos` lämnas orört
  eftersom alla stilars selektorer (`[data-app="todos"]`) och stats-nyckeln hänger på det.
  Gäller båda vägarna in — skelettets knappar och orrery-scenens världar läser samma
  `src/apps.js`.
- **En stil = en modul.** All per-stil-kod flyttas ur `main.js`/`style.css` till
  `src/styles/<id>.js` + `src/styles/<id>.css`. `styles.js` blir registret som
  importerar dem, och modulen default-exporterar `{ id, label, anim, enhancer? }` och
  importerar sin egen CSS. `main.js` går från 1992 till 234 rader och vet inte längre
  något om enskilda stilar; `style.css` från 3239 till 260 (bara skelettet). Det delade
  blir `src/shared.js` (`nf`, `prefersReduced`, `countUp`, `makeCountEnhancer`).
  Bakgrund: varje nytt tävlingsbidrag redigerade samma två filer, vilket gör att
  samtidiga bidrag krockar och att en tävlande måste läsa tolv stilars kod för att hitta
  sin egen. **Bygget påverkas inte** — Vite buntar statiska importer till samma utfil,
  och `orrery` låg redan i egen fil utan att ge en egen chunk. Filuppdelningen är för
  människor, inte för webbläsaren.
- **Bara den aktiva stilens hover-markup renderas.** Förr bakade `appRow` in alla
  stilars varianter i varje knapp och CSS visade en av dem — med tretton stilar blev det
  45 dolda `.av`-block och 1232 DOM-noder, och kostnaden växte med varje bidrag. Nu byter
  `mountAnim` ut markupen vid stilbyte: **285 noder, 4 varianter**. Samtidigt försvinner
  en dold koppling — listan i `style.css` där varje stil måste räkna upp sig själv för
  att synas alls är ersatt av en enda regel. Cleanup körs före markupbytet, så enhancers
  aldrig håller kvar element som rivits.
- **Textransonera samtliga tretton stilar.** Efter tretton bidrag hade ett mönster satt
  sig: stilarna *berättade* sitt koncept i stället för att visa det. Värst var
  förklaringsraden under knappen (`.app-btn::before`), som låg framme i vila och i
  klartext förklarade appens förhållande till navet — `DUX · HÄRIFRÅN HÄMTAR DE TRE SIN
  TONFÖLJD`, `DANSGOLVET · TOM CELL — HÄR BLIR LASS TILL RIKTNING`, `TUSKAFT · HÄR BLIR
  TRÅD TILL TYG`. Alla 32 sådana rader är borta eller nerkortade till en term
  (`DUX`, `DANSGOLVET`, `NEKTAR`, `POS. 2 · SIGNALGIVARE`). Hörntaggen (`::after`) står
  kvar orörd — `⊕ │ Ø0,2 │ A`, `α 40° · 1,4 km`, `KAN 2 · FÖRMAK · +0,04 s` är mätvärden,
  inte bildtext, och det är de som bär hierarkin. Hover-texterna kortas till siffra och
  term (`R 12 mm · 2,4 mV` i stället för `KAMMARE · R 12 mm ÖVER NOLLINJEN — MEN TAKTEN ÄR
  NODENS`), och rollspelsskämten torrläggs: kvittots `varav moms 25% på kreativitet`,
  `Rabatt: "UTANFÖR BOXEN"` och `Du har sparat idag — en backend` bort, kassörsnamnet
  avsignerat; växelns påhittade firmanamn bort; singularitets `vinn designtävlingen` bytt
  mot riktiga todo-rader. Synops etymologifotnot (`SYNOPTISK, GR. synoptikós — "SEDD
  TILLSAMMANS"`) och sinus `NODENS EGEN KURVA SAKNAS PÅ REMSAN — DEN LÄSES UR DE TRE` är
  borta helt — en stil ska inte argumentera för sig själv. Ingen stil tappar sitt koncept:
  bikupan är fortfarande en vaxkaka med ett tomt dansgolv, sinus fortfarande en remsa vars
  navkanal saknar kurva. Sidan slutar bara förklara det. Underlag och rad-för-rad-beslut:
  [`TEXTGRANSKNING.md`](TEXTGRANSKNING.md).

### Tillagt
- Stil `tryckark` ("Tryckarket") — fjortonde stilen i rotationen: sidan är ett **ark på väg
  genom en fyrfärgspress** (papper i obestruket offset-vitt med nyckelplåtens eget
  45°-raster, skärmärken i hörnen, passaxlar genom navets rad, vinkelmätare i
  vänstermarginalen, passkors i höger, färgkontrollremsa längs bakkanten och slugrad i
  foten). Konceptet vilar på en bokstav de flesta läser fel: **K i CMYK står för KEY, inte
  black.** Nyckelplåten är den plåt som bär bilden — konturen, detaljen, all text — medan
  de tre andra bara bär färg; tar man bort en färgplåt blir arket felfärgat, tar man bort
  nyckeln blir det oläsbart. Syntes är nyckelplåten, Signal är C, Todos är Y, Stronk är M,
  och varenda läsbar bokstav på sidan är tryckt i nyckelns svarta — underapparna syns
  bara som rastertoner och dubbelkonturer. Särställningen är mekanisk och dubbel, och
  båda benen syns i vilotillståndet: **rastervinkeln** — C 15°, Y 0°, M 75° är alla satta
  mot nyckelns 45°, så vinkelmätarna i marginalen delar referensben och nyckelns mätare
  är den enda med ett enda ben — och **passningen** — de tre plåtarna vandrar (pappret
  sträcker sig i pressen) och lämnar en färgad dubbelkontur, men nyckeln kan per
  definition inte ligga snett, för den ÄR nollan de andra ställs in efter. Sidans enda
  rörelse i vila är tre plåtar som söker sig kring en fjärde som står still. En
  `tryckark`-enhancer skriver plåtdata (färg, vinkel, passningsfel) som CSS-variabler på
  raderna och injicerar arket mätt i DOM:en (rivs vid stilbyte, ritas om vid resize);
  rastercellen ≈ 9 px står i både CSS (`--tr-cell`) och JS (`TR_CELL`), så passningsfelen
  är samma bråkdelar av samma cell överallt. Fyra hovrar med pressens egna mätdon:
  passkorsen dras i pass och lupen går från moiré till rosett — fyra raster i rätt
  inbördes vinkel ger ett mönster ingen av dem innehåller — samtidigt som **hela arket**
  dras i pass via `:has` (Syntes), rastret vrids från nyckelns 45° ned till sina egna 15°
  och moirébältena löses upp medan gradbågen mäter Δ30° (Signal), tonkilen skrivs ut
  steg för steg och 50 %-fältet trycks som de 58 % punktökningen gör det till (Todos),
  och fältet körs till fullton medan densitometernålen slår till D 1,45 — under nyckelns
  inristade 1,80, alltid högst på arket (Stronk). Rörelse-etiken är pressens: färg ligger
  på pappret eller inte, så allt i knapparna sker i steg (`steps(1)`, ett tryckverk i
  taget) och det enda som glider är pappersdriften. Under `prefers-reduced-motion`
  stannar driften men plåtarna lämnas kvar **ur pass** — felet ska synas, bara inte röra
  sig. Skelettet orört; `:is(:hover, :focus-visible)` genomgående. Arkiverad som
  skärmdumpar i `variations/tryckark/`.
- `scripts/check-copy.mjs` + `npm run check:copy` — byggkontroll som failar på synlig text
  som förklarar i stället för att visa: knappetiketter över 30 tecken eller 5 ord,
  hover-texter över 40 tecken, och formuleringar som `härifrån`, `utgår från`, `hämtar`
  och moralkakor efter tankstreck (`— men …`). Granskar bara synliga strängar —
  kodkommentarer får och ska fortsätta förklara konceptet. Ingår i `prebuild`, så ett
  bidrag som inte passerar går inte att deploya. Körd mot koden före ransoneringen fångar
  den 48 strängar.
- Separationskravet i [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md): bidraget bor i egna
  filer, `main.js` och `style.css` rörs inte, och modulkontraktet står utskrivet med
  kodexempel.
- Avsnittet **”Skriv inte det du kan visa”** i [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md) —
  hårda regler för nästa tävlande agent, plus testet: täck över all text i din stil, syns
  det fortfarande vilken rad som är navet? Prompten var orsaken — den bad om en *mekanisk*
  särställning och gav exempel som agenterna skrev ut som bildtext i stället för att rita.
- [`docs/TEXTGRANSKNING.md`](TEXTGRANSKNING.md) — genomgången av all synlig text i de
  tretton stilarna, med diagnos, beslut per sträng och vad som medvetet lämnades kvar.
- Stil `sinus` ("Sinusrytmen") — trettonde stilen i rotationen: sidan är en **EKG-remsa på
  millimeterpapper** (fin ruta 1 mm, storruta 5 mm, tegelrött rutnät på varmt papper, fyra
  kanaler med baslinje och maskinens kalibreringspuls, remsans huvud med inställningar och
  slagräknare, avläsningen nere till vänster). Konceptet vilar på ett faktum ingen annan
  stil kunnat använda: **sinusknutan går inte att avbilda.** Nodens signal är för svag för
  att nå huden, så den kanal som ÄR taktgivaren är den enda som är tom — allt man någonsin
  ser av navet är de tre andra. Därför bär navets kanal bara röda taktstreck (tid), medan
  de tre bär kurvor (spänning): Signal är förmaket med P-vågen, Todos är AV-noden som
  *håller* impulsen 0,08 s, Stronk är kammaren med QRS. Särställningen är mekanisk och
  syns i vilotillståndet: varje underapp bär sin **egenrytm** — 60, 45 och 32/min, vad den
  slår om noden tystnar — och sedan samma **drivna 72/min**; tre olika egna tal, ett
  gemensamt lånat. Placeringen säger samma sak igen: varje kurva sitter `fördröjning ×
  pappershastighet` till höger om taktstrecket, alltså 2, 6 och 10 millimeterrutor — mätbart
  på papperet, inte påstått. Även takten kan räknas ur pappret (`600 ÷ 8,3 storrutor =
  72/min`). En `sinus`-enhancer injicerar remsan (baslinjer mätta på radernas mittlinjer,
  kalibreringspuls per kanal, taktstreck ur nodens frekvens tvärs alla fyra, måttsättning
  vid första slaget) och river den vid stilbyte; rutnätets millimetertal i CSS och JS är
  desamma, annars vore måttsättningen en lögn. I vila är sidans enda rörelse **gnistan som
  vandrar taktstreck för taktstreck längs navets kanal** i verklig tid — noden fyrar av
  vare sig någon tittar eller ej. Pekar man på en underapp skrivs hennes andel av slaget ut
  vid varje taktstreck; pekar man på navet skrivs alla tre samtidigt och **retledningen**
  dras nedför sidan, en lutande linje vars lutning ÄR fördröjningen. Fyra hovrar med fyra
  olika verb: hela slaget samlat och skrivet med de tre andras pennor, i verklig tid, två
  slag 0,83 s isär (Syntes), stylusen som drar P-vågen i konstant fart över ett utsnitt med
  dubbel förstärkning (Signal), impulsen som **stannar** i porten medan fyra rutor räknas av
  och sedan släpps vidare till kammaren (Todos), och kraftslaget som mäts mot
  kalibreringspulsen — 12 mm = 2,4 mV, egen kraft men lånad takt (Stronk). Rörelse-etiken är
  stylusens: `--anim-ease` är `linear` i hela stilen, för pappret matas med konstant
  hastighet, och allt som händer är en andel av `--sn-rr` — sidans enda tempo. Skelettet
  orört; `:is(:hover, :focus-visible)` genomgående och fördröjningarna nollas under
  `prefers-reduced-motion`. Arkiverad som skärmdumpar i `variations/sinus/`.
- Stil `fuga` ("Fugan") — tolfte stilen i rotationen: sidan är ett **arbetsblad ur en fuga
  i öppen partitur** (handgjort papper med formens vattrade linjer, järngallbläck brunnat
  av tid, fyra system med altklav, tonart och taktart, klammer och systemtaktstreck, samt
  namnruta nere till vänster). Konceptet är kontrapunktens hierarki, hårdare än någon
  annan stils: **i en fuga finns ingen andra melodi.** Allt som klingar ÄR subjektet,
  omskrivet. Syntes ställer det — en enda gång, i takt 1 — och de tre andra äger ingen
  egen tonföljd alls: Signal är svaret en kvint upp (`comes`), Todos samma toner speglade
  kring b (`inversio`), Stronk samma toner i dubbla notvärden (`augmentatio`). Det står
  också i koden: bara `FG_SUBJ` finns, de tre räknas fram ur den. Särställningen syns i
  vilotillståndet på tre mekaniska sätt — navets system är det enda som **har musik** på
  bladets vänstersida, de tre bär i stället en **flerstaktspaus** vars siffra är deras
  väntan på navet (2, 4 och 6 takter), och navet är det enda som är skrivet i **bläck**
  medan de tre står i analyspennans kritfärger, för en härledning är en anteckning om
  något annat. Insatserna bär dessutom sin tid i sekunder (`T. 3 · +6,7 s`), ett tal som
  bara existerar för att navet satt `M.M. 72`. En `fuga`-enhancer injicerar bladet (fyra
  system mätta på radernas mittlinjer, klammer, pauser, subjektet till vänster och
  härledningarna till höger) och river det vid stilbyte; noterna skrivs bara ut när
  marginalerna rymmer dem, annars står systemen tomma. Bladet svarar på pekaren: en
  härledning kan **aldrig** visas utan sin källa — pekar man på någon av de tre skrivs
  deras insats ut till höger samtidigt som subjektet till vänster mörknar till fullt
  bläck; pekar man på navet skrivs alla tre på en gång och navets eget system får
  strettot. Fyra hovrar i samma notspråk: strettot där fyra insatser ljuder samtidigt, var
  och en i sin apps kritfärg (Syntes), svaret som stiger en kvint ur blyertskällan med den
  enda formelbrytande tonen inringad, det tonala svaret (Signal), noterna som faller till
  sin spegelbild kring en ritad axel (Todos), och notvärdena som fördubblas — huvudena
  öppnar sig, två taktstreck till måste dras (Stronk). Rörelse-etiken är skrivandets:
  ingenting glider och ingenting lyser, noterna sätts en i taget **i takt**, och
  fördröjningen räknas ur notens läge i takten — därför tar augmentationen exakt dubbelt
  så lång tid att skriva ut som subjektet. All notskrift är ritad geometri (klav, förtecken,
  nothuvuden, balkar), inte ett notteckensnitt. Skelettet orört; `:is(:hover,
  :focus-visible)` genomgående och skrivtakten nollas under `prefers-reduced-motion`.
  Arkiverad som skärmdumpar i `variations/fuga/`.
- Stil `bikupa` ("Bikupan") — elfte stilen i rotationen: sidan är en **vaxkaka i motljus**
  (ljuset uppifrån, kupans mörker i kanterna, cellrutnät i ljust vax, foder lagrat högt
  och ramens ovanlist överst med biodlarens krita). Konceptet ligger i vad cellerna
  innehåller: tre av dem **lagrar** något — Signal är nektarcellen, Todos den täckta
  yngelcellen, Stronk den packade pollencellen — medan **navets cell är den enda tomma**.
  Bina håller dansgolvet putsat och propolislackat just för att det inte ska ligga något
  där: det lagrar ingen sak, det lagrar **riktning**. Ett lass nektar är stumt tills det
  dansas, och det som lämnar golvet är en anvisning — en bäring och ett avstånd åt de
  andra. Kakans grammatik bär hierarkin: den hänger lodrätt, och på en lodrät kaka betyder
  "rakt upp" **mot solen**, så sidans lodlinje är sollinjen, dansens vinkel α mot den är en
  kompassriktning, och varje underapp bär sin egen bäring **ur** navet (`α 40° · 1,4 km`)
  medan navet bär temperaturen det håller åt hela kakan (`35,0 °C ±0,2`). Knapparna är
  klippta till långsträckta sexkanter (`clip-path`), där knappens egen bakgrund är
  cellväggen och `.app-btn__fx` kärlet den omsluter; navet får dubbel vägg i propolis.
  En `bikupa`-enhancer injicerar kakan (cellmönster, fyllt foder, yngelvärme centrerad på
  navets rad, solmärke med lodlinje ner i dansgolvet och de tre flygvektorerna, mätta i
  DOM:en och ritade om vid resize) och river den vid stilbyte. Kakan svarar på pekaren —
  hovras en underapp dras **bara hennes** bäring, och den startar alltid i dansgolvets
  cellvägg; hovras navet dras alla tre på en gång, solen tänds och yngelvärmen slår ut.
  Fyra hovrar i samma kupspråk: svansdansen löps varv efter varv med referenslinjen mot
  solen, vinkeln α och tre åskådare som lämnar i var sin bäring (Syntes), refraktometern
  mäter nektarns sockerhalt till 46 % — över tröskeln → KÖP (Signal), tre celler fylls och
  förseglas med vaxlock, en i taget (Todos), dragbiet lastar pollenkorgen i tre turer till
  30 mg = en tredjedel av kroppsvikten (Stronk). Rörelse-etiken är kupans: ingenting kopplas
  om, allt byggs — och sidans **enda** snabba rörelse är svansrunets 13 Hz, som bara navet
  har. Skelettet orört; `:is(:hover, :focus-visible)` genomgående, och eftersom sexkanten
  klipper bort en vanlig `outline` är fokusmarkeringen cellväggen själv, som slår om till
  pollenblått och lyser i sin egen form. Arkiverad som skärmdumpar i `variations/bikupa/`.
- Stil `synop` ("Synoptiken") — tionde stilen i rotationen: sidan är en **synoptisk
  väderanalys** (blekt kartpapper med väderfaxets svepränder, kustlinje, graticule-kryss
  och namnruta nere till vänster). Konceptet ligger i ordet: *synoptisk* är grekiskans
  "sedd tillsammans" — en synoptisk karta **är** en syntes, spridda observationer
  sammanförda till en bild. **Syntes är lågtryckscentrum L**, och kartan känner bara en
  hierarki: isobarerna är slutna kurvor kring L, de tre fronterna **utgår ur** L, och varje
  underapp läser ett högre tryck än navets 984 hPa med tendenspilen nedåt — hela tryckfältet
  lutar inåt mot navet. Underapparna är fronttyper (Signal = kallfront, Todos = varmfront,
  Stronk = ocklusion) och kan per definition inte finnas utan systemet de tillhör; navet kan.
  En `synop`-enhancer injicerar kartunderlaget och analysen (isobarer, fronter med riktiga
  frontsymboler, stationsmodeller, namnruta byggd ur appregistret + byggtidsstatistiken med
  giltighetstid i UTC) och river den vid stilbyte; analysen mäts in på navets rad i DOM:en,
  så allt är polärt uttryckt kring den punkten. Kartan svarar på pekaren — hovras en underapp
  tänds dess front och legendraden kvitterar `→ L`; hovras navet dras hela analysen ihop:
  isobarerna sluter sig tätare, alla tre fronterna tänds, observationerna rinner in mot
  centrum längs streckade stråk och systemet börjar vrida sig moturs. Fyra hovrar i samma
  kartspråk: lågtrycket analyseras fram — isobarerna sluts inifrån och ut, de tre fronterna
  dras ut ur centrum och systemet roterar cyklonalt (Syntes), kallfronten passerar stationen
  och observationen skrivs om i samma stund den går förbi → SÄLJ (Signal), molnmängden
  klarnar upp station för station 8/8 → 4/8 → 0/8 (Todos), vindpilen fjädras upp halvfjäder
  för fjäder till vimpel, 95 knop = orkan (Stronk). Skelettet orört;
  `:is(:hover, :focus-visible)` genomgående så tangentbordsfokus ger samma upplevelse som
  hover. Arkiverad som skärmdumpar i `variations/synop/`.
- Stil `sprangskiss` ("Sprängskissen") — nionde stilen i rotationen: sidan är ett
  **ritningsblad i cyanotypi** (preussiskblå kopia, vit tusch, ritningsram med zonlister,
  stycklista och namnruta nere till vänster). Konceptet: en sammanställningsritning känner
  bara **en** hierarki — POS. 1 är sammanställningen, resten är detaljer som *ingår i* den.
  **Syntes är POS. 1**, den enda vyn ritad i snitt (45°-hatchade väggar, dubbel ram) — man
  ser in i navet; de tre andra är POS. 2–4 med benämning efter sin funktion i maskinen
  (Signalgivare, Spärrverk, Fjäderpaket). Hierarkin står dessutom i ritningens egen
  grammatik och syns i vilotillståndet: navet bär referensbeteckningen `▲ A` och varje
  underapp en lägestolerans `⊕ Ø0,2 A` — deras läge är definierat **från** navet, aldrig
  tvärtom. En `sprangskiss`-enhancer injicerar bladet (ram, zoner A–D/1–6, stycklista och
  namnruta byggd ur appregistret + byggtidsstatistiken) och river det vid stilbyte; bladet
  svarar på pekaren — den vy man hovrar markeras i stycklistan, och hovras navet kvitteras
  alla tre som `MONT.`. Fyra hovrar i samma koncept: sprängskissen sluter sig — de tre
  delarna gängas in på navets monteringsaxel, ballongnumren slocknar och sammanställningen
  måttsätts (Syntes), mätserien plottas kryss för kryss mot toleransgränserna tills sista
  värdet bryter övre gränsen och ringas in med rödpennan → SÄLJ (Signal), spärrhjulet
  klickar tre tänder med spärrhaken fallande i efter var och en, 3/3 utan återgång (Todos),
  fjädern pressas mot fast inspänning medan måttet h krymper och kraften räknas upp till
  1 200 N (Stronk). Skelettet orört; `:is(:hover, :focus-visible)` genomgående så
  tangentbordsfokus ger samma upplevelse som hover. Arkiverad som skärmdumpar i
  `variations/sprangskiss/`.
- Stil `jacquard` ("Jacquardväven") — åttonde stilen i rotationen: sidan är uppspänd i en
  vävstol (oblekt lin, växtfärgad varp i krapprott/vejdeblått/resedagult, mönsterkort).
  Konceptet: **de tre underapparna ÄR varptrådar** — parallella, uppspända, utan kontakt
  med varandra — och **Syntes är inslaget**, det enda som går på tvären och binder dem till
  tyg. Det syns i vilotillståndet: underapparnas paneler bär bara lodräta trådar (ofärdig
  varp, streckade klippkanter, fransad nederkant) medan navets panel är riktigt tyg — varp
  i alla tre växtfärgerna korsad av inslag, med bunden stadkant. En `jacquard`-enhancer
  injicerar varplagret (tre trådar som löper bakom hela knappkolumnen och syns i gliporna)
  och navets inslag: en tvärlinje genom **hela sidan** med en skyttel som far igenom
  Syntes-panelen. Hovras navet öppnas skälet i hela väven — sidans varptrådar skiftar isär
  och tänds en efter en när skytteln passerar; underapparnas varp skiftar med. Riktningen är
  enkelriktad med flit: navet rör de tre, aldrig tvärtom. Fyra hovrar i samma koncept:
  skytteln binder tre lösa trådar till tyg (Syntes), varptråden knäpps an och darrar ut med
  spänning i cN (Signal), hålkortet matas fram i tre steg och stansas — en uppgift = ett hål
  (Todos), trampan trycks så skaftet lyfter och skälet öppnas, 12 skott i repsväv (Stronk).
  Skelettet orört; `:is(:hover, :focus-visible)` genomgående så tangentbordsfokus ger samma
  upplevelse som hover. Arkiverad som skärmdumpar i `variations/jacquard/`.
- **Driftsatt live på `https://portal.syntes.dev`** (2026-07-24), bakom Authelia-login
  (`one_factor`, SSO över `.syntes.dev` — spegling av signal/stronk/syntes-dashboard).
- **`Dockerfile` + `docker-compose.yml`** — portal kör nu som egen container (`portal`) på
  `proxy`-nätet, precis som övriga appar. Tvåstegs-bygge: Node-steg (`npm ci && npm run
  build`) → Caddy-steg som serverar `dist/`; intern [`deploy/Caddyfile`](../deploy/Caddyfile).
  VPS:en behöver ingen node — bygget sker i containern. Yttre Caddy `reverse_proxy portal:80`.
  Uppdatering är nu **`git pull && docker compose up -d --build`**, identiskt med syntes/stronk.
  Ny deploy-guide: [`docs/DEPLOY.md`](DEPLOY.md).
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
- **`singularitet`: Stronk ramlade ned på en andra rad — alla fyra portar ligger på en rad igen.**
  Regression från scroll-fixen: den delade `.app-row` fick en bredd avsedd för den **lodräta**
  kolumnen (`min(100%, knapp + gap + info)` ≈ 500 px). `singularitet` är den enda stil som lägger
  raderna **på tvären**, och där blev den bredden flexbasis per port — fyra av dem sprängde
  raden, så `flex-wrap` bröt i förtid trots att portarna (cirklar på ~260 px) hade fått plats.
  Raden hugger nu porten (`width: auto`) från den bredd där alla fyra faktiskt ryms (≥ 1380 px).
  Under den brytpunkten behålls skelettets bredd med flit: hallen radbryter ändå där, och en port
  ute i kanten skulle annars knuffa ut sin info-panel (ankrad i porten, 360 px) ur sidan — samma
  horisontella scroll som scroll-fixen tog bort. Verifierat 360–3440 px över alla tio stilar:
  noll horisontell scroll, fyra portar på rad från 1380 px och uppåt.
- **Horisontell scroll på smal skärm i alla stilar.** Knappens bredd var `min(480px, 86vw)`
  medan raden också rymmer mellanrum + info-knapp och `.rows` har sidopadding — `vw` räknar
  dessutom in rullisten. Summan blev bredare än sidan under ~580px, så varje besök på mobil
  fick en sidledes rullist. Radens geometri ligger nu i fyra tokens (`--btn-max`, `--row-gap`,
  `--info-size`, `--rows-pad`); raden kapas till `min(100%, knapp + gap + info)` och knappen
  krymper med den (`min-width: 0`) i stället för att räkna i `vw`. Samma `vw`-fälla rättad i
  kvittots kassaapparat (`min(520px, 96vw)` → `96%`), och jacquards varplager följer nu
  knappens bredd via samma tokens så trådarna står kvar i linje med panelerna i alla bredder.
  Verifierat 0 px överskott i alla nio stilar vid 320/360/390/430/560/600 px, även med
  info-panel och systemhälsa öppna.
- Animationerna kunde klippas av knappkanten på smal skärm när knappen krympte
  (`.viz`-måtten är satta mot en bredare knapp) — `.viz, .viz svg { max-width: 100% }`.
- Stilnamnet i switchern spillde ut över låsknappen i kvitto på smal skärm; kortas nu med
  ellips i stället. 11ch-golvet finns kvar där det får plats, så switchern inte hoppar.
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
