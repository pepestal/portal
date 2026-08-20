# Layoutkravet — två spalter på dator, en på mobil, aldrig skroll

Beställt av Peter 2026-08-20, efter att sex appar visat att det gamla skelettet inte
bär. Det ersätter den outtalade regeln *"alla länkar under varandra"* som gällt sedan
portalen byggdes med fyra appar.

Alla siffror nedan är **mätta 2026-08-20** mot `agent/ekosystemet-1b` (commit `bd1da8d`)
i Chromium, tre vyporter: `1440×900`, `1280×720` och Pixel 9 (`412×915`, `isMobile`).

---

## Kravet

> **Detta är en showroom-sida. Det ska ALDRIG behöva skrollas.**

1. **Mobil:** länkarna staplade på höjden, nedskalade så att allt ryms på en skärm.
   Drag nedåt (uppdatering) ska ladda en ny, slumpad stil.
2. **Dator:** skelettet anpassas till antalet länkar och staplar dem i **två spalter**.
   Skroll ska aldrig behövas.

Regeln är **mekaniskt testbar** och ska testas så:
`document.documentElement.scrollHeight - window.innerHeight === 0` **och**
`scrollWidth - innerWidth === 0`, i samtliga stilar, i samtliga tre vyporter.

⚠️ **Testa aldrig detta med `fullPage: true`-skärmdumpar.** En fullPage-bild renderar
hela dokumentet och ser perfekt ut även när halva sidan ligger utanför skärmen. Det var
precis så överflödet slank igenom när ekosystemet gick från fyra kort till sex
(PR [#7](https://github.com/pepestal/portal/pull/7)).

---

## Mätt nuläge

Vertikalt överflöd i pixlar (`scrollHeight − innerHeight`). `0` = ryms.

| Stil | 1440×900 | 1280×720 | Pixel 9 | Knappmått | Helscen |
|---|---:|---:|---:|---|---|
| terminal | 356 | 536 | 296 | 480×116 | — |
| editorial | 350 | 530 | 288 | 480×116 | — |
| bank | 352 | 532 | 290 | 480×116 | — |
| vaxel | 355 | 535 | 293 | 480×116 | — |
| jacquard | 358 | 538 | 296 | 480×116 | — |
| sprangskiss | 356 | 536 | 296 | 480×116 | — |
| synop | 354 | 534 | 292 | 480×116 | — |
| bikupa | 375 | 555 | 313 | 487×118 | — |
| fuga | 375 | 555 | 313 | 487×118 | — |
| sinus | 374 | 554 | 312 | 480×116 | — |
| tryckark | 354 | 534 | 292 | 480×116 | — |
| alv | 352 | 532 | 290 | 480×116 | — |
| tunnelbana | 349 | 529 | 287 | 480×116 | — |
| kardan-chatgpt | 353 | 533 | 291 | 480×116 | — |
| **singularitet** | 177 | 678 | **1092** | 260×260 | — |
| orrery | 0 | 0 | 0 | — | ✅ |
| pangea | 0 | 0 | 0 | — | ✅ |
| lodet | 0 | 0 | 0 | — | ✅ |
| dynamo | 0 | 0 | 0 | — | ✅ |
| hinnan | 0 | 0 | 0 | — | ✅ |

**Tre slutsatser ur tabellen:**

1. **Femton av sexton skelettstilar spiller över exakt lika mycket.** Överflödet kommer
   inte ur stilarna utan ur skelettet — samma `.rows`-geometri i alla. Rättas den, rättas
   femton stilar på en gång.
2. **Kravet går att uppfylla utan att en stil tappar sitt uttryck.** `kvitto` mätte
   `0 px` överflöd i både dator- och mobilläge genom att göra raderna 34 px höga i
   stället för 116 — beviset finns alltså, även om stilen sedan togs bort på Peters
   begäran (2026-08-20). Det som bär är att krympa raden, inte att offra formen.
3. **De fem helscenerna spiller inte över alls** — de ersätter skelettet och skalar sig
   själva. De berörs inte av spaltarbetet, bara av mobilgranskningen.

### 🔴 En tredjedel av mobilens skroll är inte korten

Pixel 9, `terminal`: korten själva slutar på `1002 px` mot en vyport på `915` — alltså
`87 px` för mycket. Men `scrollHeight` är `1211`. Skillnaden på **209 px** är de sex
**stängda info-panelerna**.

Panelerna är `position: absolute` inuti `.app-row` (som är `position: relative`), och en
absolut positionerad ättling som sticker ut **förlänger scrollHeight** även när den är
osynlig. Sista radens panel är 270 px hög och bottnar på `1211`.

Det här är alltså ett eget fel, oberoende av kortstorleken, och det billigaste att
åtgärda av allt i det här dokumentet. Panelen ska inte bidra till dokumentets höjd när
den är stängd.

### Höjdbudget

| Vyport | Topbar | `.rows` padding | Gap | Kvar till korten |
|---|---:|---:|---:|---:|
| 1440×900 | 74 | 32 + 64 | 36 | 730 |
| 1280×720 | 74 | 32 + 64 | 36 | 550 |
| Pixel 9 (412×915) | **110** (staplad) | 32 + 64 | 20 | 709 |

**Dimensionerande fall är `1280×720`** — inte mobilen. Sex kort i två spalter blir tre
rader: `3 × 116 + 2 × 36 = 420 px` av 550 tillgängliga. Det ryms med marginal, och
kortens nuvarande höjd behöver alltså **inte** ändras på dator.

**På mobil** krävs däremot nedskalning: `6 × 116 + 5 × 20 = 796` av 709 tillgängliga.
Med kort på `92 px` och gap `10 px` blir det `6 × 92 + 5 × 10 = 602` — ryms med 107 px
över, vilket räcker till topbarens variation mellan telefoner.

---

## Den nya layoutmodellen

Allt nedan bor i `src/style.css` och `src/main.js`. **Ingen stil ska behöva veta om
det** — den som skriver en ny stil ska ärva rätt layout gratis.

### Dator (≥ 900 px bred)

`.rows` blir ett rutnät i stället för en kolumn:

```
repeat(2, minmax(0, var(--btn-max)))   ·   6 appar → 3 rader
```

- Spalterna är lika breda, och `--btn-max` sänks så att två spalter plus mellanrum
  ryms i vyportens bredd utan horisontell scroll.
- **Läsordningen är radvis** (`1 2` / `3 4` / `5 6`), inte spaltvis. Registret i
  `src/apps.js` styr ordningen, och den vilande Syntes ligger först — den ska inte
  hamna ensam i en spalt.
- **Antalet spalter härleds ur antalet appar, inte hårdkodas.** Fem appar ska ge
  `3 + 2`, sju ska ge `4 + 3`. Skelettet ska tåla nästa app utan en ny PR.

### Mobil (< 900 px bred)

En spalt, men nedskalad:

- Korthöjd `92 px` (från 116), gap `10 px` (från 20), `.rows`-padding `1rem` (från
  `2rem`/`4rem`).
- **Tryckytan får inte krympa under 44 × 44 px.** Kortet är 92 px högt och nästan hela
  bredden — det är inte problemet. Problemet är `.info-toggle`, som i dag är `30 px`.
- Namnet skalas med kortet; ingen text under ~11 px efter SVG-skalning.

### Aldrig skroll — hur det upprätthålls

Ett kort som inte ryms ska **krympa**, inte skjutas utanför. Det betyder att
höjdbudgeten ska räknas i CSS, inte antas:

```
--kort-h: min(116px, (100dvh - var(--topbar-h) - var(--rows-pad-y)) / var(--rader) - var(--rad-gap));
```

`dvh` och inte `vh` — på Android ändras `vh` inte när adressfältet fälls in, och en
sida som ryms i `100vh` kan ändå skrolla i `100dvh`.

---

## Drag nedåt på mobil — sidan äger gesten

🔴 **Rättelse 2026-08-21.** Det här avsnittet påstod tidigare att ingenting behövde
byggas, eftersom `pickInitial()` slumpar en stil vid varje sidladdning och
`overscroll-behavior` var `auto`. **Slutsatsen var fel, och verifieringen bakom den var
otillräcklig:** den visade att en *omladdning* slumpar om stilen, inte att *gesten*
utlöser en omladdning. Peter testade på sin Pixel 9 och gesten gjorde ingenting.

Webbläsarens egen pull-to-refresh är en funktion i Chromes **gränssnitt**, inte i sidan.
Den syns inte i DOM:en, går inte att känna av från JS, och finns inte alls i en
headless-webbläsare. Den kan alltså varken verifieras eller felsökas härifrån — och en
funktion som inte går att testa ska inte bära ett krav.

✅ **Sidan äger därför gesten själv** (`Drag nedåt = ny stil` i `src/main.js`):

- `overscroll-behavior-y: contain` på `<html>` stänger av webbläsarens variant, så de
  två aldrig kan skjuta i samma rörelse.
- Ett drag nedåt från sidans topp, längre än **88 px**, byter till en ny slumpad stil ur
  den aktiva poolen — samma val som vid sidladdning, aldrig samma stil två gånger i rad.
- En ring uppe i kanten följer fingret och tänds när tröskeln är passerad, så gesten är
  synlig innan man släpper.
- Bytet sker **i sidan**, inte som omladdning: omedelbart, ingen vit blink och ingen risk
  för en ny Authelia-runda. Resultatet är detsamma — en ny slumpad stil.

Verifierat med syntetiska touch-events 2026-08-21 (`~/shots/drag-test.mjs`):

| Gest | Utfall |
|---|---|
| Drag 140 px nedåt | ✅ stilen byts |
| Drag 40 px (under tröskeln) | ✅ ignoreras |
| Drag i sidled | ✅ ignoreras |
| Drag uppåt | ✅ ignoreras |
| Sex drag i rad | 5 unika, aldrig samma två i rad |
| `lodet` | ✅ orörd — stilen äger dragrörelsen själv |

⚠️ **Låset gäller före gesten.** Är en stil låst (`portal.lockedStyle`) ligger den kvar
även vid drag. Det är avsiktligt — men knappen är lätt att träffa av misstag på en
telefon, och att den är på borde synas tydligare än i dag.

🛑 **`lodet` sätter `egenDrag: true`** i sin modul och undantas. Stilens hela mönsterbrott
är att dragrörelsen vinschar ett lod i stället för att flytta sidan; att låta samma gest
byta stil hade upphävt just det.

---

## Genomgång per stil

Verdikt: **A** = ärver den nya layouten gratis, bara verifiering behövs · **B** = fungerar
i två spalter men behöver justeras · **C** = metaforen bryts av två spalter, kräver
omtanke · **D** = eget fall.

### A — ärver layouten (4 stilar)

Ingen sidnivågeometri alls; allt bor inuti knappen.

| Stil | Att göra |
|---|---|
| `terminal` | Verifiera att `viz--curl`, `viz--scale` och `viz--health` inte blir för breda i en smalare spalt. Scanline-effekten är oberoende av layout. |
| `editorial` | Samma. `viz--notrad` är 136 px bred och `viz--larm` 124 — båda ryms i halv spalt. |
| `bank` | Samma. `viz--drift` (30 dygnsfält, 168 px) är den bredaste — kontrollera vid `--btn-max` under ~300 px. |
| `vaxel` | Samma. `viz--klaviatur` (8 tangenter à 13 px + övertangenter) och `viz--klaff` (14 klaffar) är breda men skalbara. |

### B — fungerar, men behöver justeras (7 stilar)

Dessa ritar ett sidnivålager som **mäter radernas verkliga positioner** i DOM:en
(`getBoundingClientRect`) och ritar om sig efter dem. De kraschar alltså inte av två
spalter — men bilden behöver ses över, och flera bär siffror som antar tre eller fyra
appar.

| Stil | Vad som händer i två spalter | Att göra |
|---|---|---|
| `bikupa` | **Blir bättre.** En vaxkaka är ett tvådimensionellt fält; sex celler i två spalter är mer kaka än sex i rad. | Cellernas sexkantsraster ska följa rutnätet i stället för en kolumn. Etiketterna är redan ett ord. |
| `sprangskiss` | Fungerar. En sprängskiss är en 2D-ritning med positionsnummer. | `SK_PART` har fyra poster — scales och ser/sys saknas. Namnrutan och `POS. N` ska numrera sex delar. |
| `synop` | Fungerar. En väderkarta är 2D. | Lågtrycket `L` är fortfarande navets; hela tryckfältet ska komponeras om (se nav-arbetet i PR 1b). Stationsmodellerna följer rader och behöver två nya. |
| `tunnelbana` | **Blir bättre.** Ett linjenät i två spalter är mer nät än sex stationer på en linje. | `TB_MIN` har tre poster. Bytespunkten är navets och ska bort. Restiderna räknas ur `stats.json` och behöver nya tal. |
| `tryckark` | Fungerar. Ett tryckark är 2D och passmärken sitter i hörnen. | Nyckelplåten `K` är navets roll. Fyra plåtar → sex; `PLÅT Y/C/M/K` behöver två färger till. |
| `jacquard` | Fungerar. Varptrådarna löper lodrätt bakom hela ytan, inte bakom en kolumn. | `.jq-column` är låst till `--btn-max` och en spalt — den ska spänna hela rutnätet. Sex trådar ska fördelas över två spalters bredd. |
| `kardan-chatgpt` | Fungerar med ändring. `.rows::before` ritar **en** lodrät axel mitt på sidan; med två spalter behövs **två** axlar — vilket är autentiskt, ett maskinrum har flera transmissionsaxlar. | Axeln blir en per spalt. Kuggringen sitter redan mitt i varje knapp och följer med. |

### C — metaforen bryts (3 stilar)

Alla tre är avgjorda — besluten står i högerspalten.

Här räcker det inte att flytta korten. Stilen påstår något som två spalter gör falskt.

| Stil | Problemet | Möjlig väg |
|---|---|---|
| `alv` | Älven är **strikt enkelriktad**: KM 0 överst, biflöden som rinner in nedströms, och huvudfårans bredd är bevisligen summan av delarna. Två spalter ger två älvar utan sammanflöde. | ✅ **Beslut (Peter, 2026-08-20): delta.** Fåran delar sig nedströms i stället för att samlas — vattnet konserveras fortfarande, men åt andra hållet: huvudfårans bredd ÄR summan av grenarna den delar sig i. Aritmetiken blir lika kontrollerbar, och två spalter blir två deltaarmar i stället för två älvar. ⚠️ Dessutom trasig redan nu: `AQ` läser `stats.projects.syntes` som inte längre finns → källans flöde är `0`, och `scales`/`sersys` saknas helt. |
| `sinus` | EKG-remsan har **en gemensam tidsaxel**: alla kanaler delar nollpunkt och taktstreck, och fördröjningarna är räkningsbara millimeterrutor åt höger. Två spalter = två remsor med varsin tid, och då betyder `+0,04 s` ingenting. | ✅ **Beslut: en spalt, via `enspalt: true` i stilmodulen.** Sex kanaler på en remsa är fortfarande en remsa — en riktig EKG har tolv avledningar. Vid ~92 px per kanal blir kolumnen 602 px av 730 tillgängliga på dator, alltså ingen skroll. Att tvinga in instrumentet i två spalter hade gjort dess enda påstående falskt: att `+0,04 s` ÄR två millimeterrutor åt höger på samma papper. |
| `fuga` | Systemen läses uppifrån och ner; rösterna sätter in i ordning. Två spalter är två partitursidor bredvid varandra. | Fungerar faktiskt — ett uppslag är två sidor. Men insatsordningen måste läsas radvis, och `T. 1–2` osv. behöver stämma med den ordningen. Fyra röster → sex. |

### D — egna fall (6 stilar)

| Stil | Verdikt |
|---|---|
| `singularitet` | 🔴 **Värst på mobil: 1 092 px överflöd.** Portarna är kvadratiska; `--gate` är `clamp(200px, 24vw, 260px)`
  (`src/styles/singularitet.css:12`), alltså **golvet 200 px** som slår igenom på mobil.
  Två spalter hjälper på dator (177 → 0), men på mobil måste golvet ner till ~`110 px`. Stjärnfältet är `position: fixed` och berörs inte. |
| `orrery` | Helscen, 0 px överflöd. Berörs inte av spaltarbetet. Kvar: verifiera de sex kropparnas etiketter och tryckytor vid 412 px — banorna är polära och kropparna kan hamna för nära varandra på smal skärm. |
| `pangea` | Helscen, 0 px. Verifiera att sex plattor får plats utan att flyta ihop på 412 px. |
| `dynamo` | Helscen, 0 px. Sex glödtrådar i stället för fyra; verifiera på 412 px. |
| `hinnan` | Helscen, 0 px. **Redan klar:** 3×2-rutnät på bred skärm och en kolumn under 620 px (gjordes i PR #7). Kan användas som referens för hur brytpunkten ska sättas. |
| `lodet` | Helscen, 0 px, och stilen **förbjuder redan skroll** — hjulet vinschar lodet i stället. Konceptuellt den renaste uppfyllelsen av kravet. ⚠️ Men `touchmove` gör att ett drag nedåt både vinschar och laddar om. Beslut behövs: låta båda ske (lodet rycker till precis innan sidan byts — kanske charmigt), eller sätta `overscroll-behavior-y: contain` på scenen och offra pull-to-refresh i just den stilen. |

---

## Cross-cutting: det som gäller alla

Kvarstår oförändrat från [`PROMPT_EKOSYSTEMET.md`](PROMPT_EKOSYSTEMET.md) beslut 6, och
är **inte** löst av spaltarbetet:

- **336 `:hover`-regler, noll `@media (hover: hover)`.** På touch är hover-buret innehåll
  osynligt, och Android ger sticky hover vid tap. Varje hover-effekt behöver en
  touch-motsvarighet eller vara ren dekoration.
- **`.info-toggle` är 30 × 30 px** — under tryckytegolvet 44 × 44.
- **Info-panelerna förlänger dokumentet** (209 px på Pixel 9), se ovan.
- **Systemhälsan** (`.system`) sitter `position: fixed` i nedre högra hörnet
  (`src/style.css:155`) och kan hamna över det sista kortet i en två-spaltslayout.
  Dess egen knapp är 44 × 44 px och alltså redan rätt — det är `.info-toggle` som är
  för liten.

---

## Undantaget: `enspalt`

Skelettet får **ett** dokumenterat sätt att välja bort rutnätet: `enspalt: true` i
stilmodulen (`src/styles/<id>.js`), som sätter `data-enspalt` på `<html>`. Det är
avsiktligt trubbigt och avsiktligt sällsynt — i dag använder bara `sinus` det.

🛑 **Det är inte en ursäkt för att slippa tänka.** En stil som väljer enspalt måste
fortfarande rymmas utan skroll; flaggan ändrar bara *hur* korten fördelas, inte om de får
spilla över. Ett bidrag som sätter `enspalt` utan att kunna motivera varför metaforen
kräver det ska underkännas.

## Vad som INTE ändras

- Registret i `src/apps.js`, adresserna, och att Syntes är vilande utan `href`.
- Att en stil bor i egna filer och läggs till med en rad i `src/styles.js`.
- Textransoneringen (`npm run check:copy`).
- Att sidan är statisk, utan backend.

## Följdändringar i andra dokument

När modellen är byggd ska den skrivas in i [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md) och
[`PROMPT_CHAOS.md`](PROMPT_CHAOS.md) som en hård regel — annars lämnar nästa bidrag in en
stil som skrollar. Båda säger i dag ingenting om varken spalter eller skrollförbud.
