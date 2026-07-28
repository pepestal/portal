# Textgranskning — bort med bildtexterna

Genomgång av all synlig text i de tretton stilarna, 2026-07-28. Underlag: live-koll
av varje stil via `?style=<id>` samt alla strängar i `src/style.css`, `src/main.js`
och `src/orrery.js`.

**Slutsats:** hantverket är genomgående starkt. Det som drar ner är copyn — stilarna
*berättar* sitt koncept i stället för att visa det. Det här dokumentet är ett förslag,
inget är ändrat.

---

## Diagnos: tre återkommande fel

### 1. Förklaringsraden under knappen (värst)

Åtta stilar har en `.app-btn::before` som i klartext förklarar appens förhållande
till navet. Den ligger framme **hela tiden**, inte bara vid hover.

```
DANSGOLVET · TOM CELL — HÄR BLIR LASS TILL RIKTNING
NEKTARCELL · SPEJAREN RAPPORTERAR TILL DANSGOLVET
DUX · HÄRIFRÅN HÄMTAR DE TRE SIN TONFÖLJD
TAKTGIVARE · HÄRIFRÅN HAR ALLA FYRA SIN FREKVENS
TUSKAFT · HÄR BLIR TRÅD TILL TYG
▼ LÅGTRYCKSCENTRUM · TRE FRONTER UTGÅR HÄRIFRÅN
POS. 1 · HUVUDENHET · REFERENSPLAN FÖR POS. 2–4
VÄXELBORD · TELEFONIST I TJÄNST
```

Det är 32 strängar över åtta stilar, och de gör alla samma sak: talar om att
metaforen bär. Om isobarerna sluter sig kring L behövs ingen rad som säger att de
gör det. Ordet **"härifrån"** förekommer i tre stilar och är den tydligaste
markören — den dyker upp exakt när en agent inte litar på sin egen bild.

Notera kontrasten mot hörntaggen (`::after`), som är stilarnas bästa idé:
`⊕ │ Ø0,2 │ A`, `α 40° · 1,4 km`, `T. 3 · +6,7 s`, `KAN 2 · FÖRMAK · +0,04 s`,
`1002 ↘`. Ett mätvärde, inte en mening. Den ska stå kvar.

Att skelettets egen mobil-CSS redan kortar raderna (`style.css:3234–3246`, med
kommentaren *"etiketterna kortas till relationen"*) är i praktiken ett erkännande:
den långa versionen behövdes aldrig.

### 2. Rollspelsskämten

Skämt som pekar på att de är skämt.

```
Varav moms 25% på kreativitet          (kvitto)
Rabatt: "UTANFÖR BOXEN"        −100%   (kvitto)
Du har sparat idag        en backend   (kvitto)
Bytesrätt gäller ej hyperlänkar.       (kvitto)
Kassör: FABLE-5                        (kvitto — agenten signerar produkten)
vinn designtävlingen                   (singularitet — tävlingen läcker in i sidan)
ANKN. 303 · ATLETKLUBBEN               (vaxel)
tre linjer · en telefonist             (vaxel)
tre världar · en puls                  (singularitet)
3 världar · 1 nav · systemet nominellt (orrery)
```

Kvittot är det svåraste fallet, för formen är utmärkt: en portal som säljs som
styckegods *är* rolig. Men fyra punchline-rader i rad förklarar skämtet i stället
för att låta det ligga. Torrare kvitto = roligare kvitto.

### 3. Hover-texten som dubblerar bilden

Varje hover-viz har en `.cap` under sig. Många beskriver det man just tittar på,
och lägger ofta på en moralkaka efter tankstrecket:

```
KAMMARE · R 12 mm ÖVER NOLLINJEN — MEN TAKTEN ÄR NODENS
AV-NOD · HÅLLER 80 ms — MEN FÅR ALLTID SITT UPPDRAG UTIFRÅN
FÖRMAK · P-VÅG 40 ms EFTER NODEN — ALDRIG FÖRE
NODEN SYNS ALDRIG SJÄLV · 3 PENNOR SVARAR
STRETTO · 4 INSATSER — ETT SUBJEKT
SVANSDANS α 40° · 3 ANVISNINGAR UT
```

Allt efter tankstrecket är stilen som argumenterar för sig själv. Siffran är värd
att behålla (uppräkningen är en fin mekanik) — satsen är det inte.

Och den enskilt värsta raden i repot, synops fotnot:

```
SYNOPTISK, GR. synoptikós — ”SEDD TILLSAMMANS”
```

En stil som förklarar sin egen ordvits i en fotnot.

---

## Förslag per stil

Format: `nuvarande` → **förslag**. "Bort" = ta bort regeln/raden helt.

### terminal, editorial, bank
Inget att göra. `~/`, `= syntes`, `Uträttat`, `100 % samlat`, `SET 3/3 · 12 reps`
är redan återhållna. Om något: `Uträttat` → `klart`.

### singularitet
| Nu | Förslag |
| --- | --- |
| `hjärtats/marknadens/ordningens/järnets dimension` | Bort (4 st). Fyra runda portar + navets hjärtslag bär det redan |
| `kliv igenom →` | Bort, eller bara `→` |
| `tre världar · en puls` | Bort |
| `öppna portalen` / `hälsa på grannarna` / `vinn designtävlingen` | `pull main` / `write tests` / `deploy` — återanvänd `TASKS`, torrt och verkligt |

### kvitto
| Nu | Förslag |
| --- | --- |
| `Portal & Söner`, `— LÄNKHANDEL SEDAN 1994 —` | Behåll — torrt och i världen |
| `Kassör: FABLE-5` | `Kassör 03` — agenten ska inte signera |
| `Varav moms 25% på kreativitet` | `Varav moms 25 %` |
| `Rabatt: "UTANFÖR BOXEN" −100%` | Bort (hela raden) |
| `Du har sparat idag — en backend` | Bort (hela raden) |
| `Bytesrätt gäller ej hyperlänkar.` | `Öppet köp 30 dagar mot kvitto.` |
| `Betalsätt HOVER` | `Betalsätt KORT` |
| `navet!` (hover) | Bort — bläckringen runt raden ÄR poängen |
| `1 st LÄNK,` / `1 st NAV,`, `*PIIP*`, `RIV HÄR`, `TACK FÖR DITT BESÖK` | Behåll allihop |

### orrery
| Nu | Förslag |
| --- | --- |
| `Syntes · navet` | `Syntes` |
| `3 världar · 1 nav · systemet nominellt` | `SYSTEM NOMINELLT` |
| `portfölj · +2,4 %`, `set 3/3 · 12 reps` m.fl. | Behåll — instrumentavläsningar |

### vaxel
| Nu | Förslag |
| --- | --- |
| `VÄXELBORD · TELEFONIST I TJÄNST` | `VÄXELBORD` |
| `ANKN. 101 · FONDBÖRSEN` (+ 202, 303) | `ANKN. 101` / `202` / `303` — numret är det fina, påhittade firmanamn är det inte |
| `telegram: KÖP — vidare till växeln` | `KÖP` |
| `24 vev · ringer upp styrkan` | `24 vev` |
| `tre linjer · en telefonist` | Bort |
| `INKOMMANDE ANROP`, `· RIKSTELEFON` | Behåll — lampskylt resp. märkning |

### jacquard
| Nu | Förslag |
| --- | --- |
| `TUSKAFT · HÄR BLIR TRÅD TILL TYG` | `TUSKAFT` |
| `VARPTRÅD I · KRAPPROTT` (+ II, III) | `KRAPP` / `VEJDE` / `RESEDA` — färgnamnen är detaljen som bär |
| `512 cN · varpen darrar` | `512 cN` |
| `tre hål · dagens mönster stansat` | `3 hål` |
| `12 skott · repsväv` | `12 skott` |
| `inslaget binder de tre` | Bort |

### sprangskiss
| Nu | Förslag |
| --- | --- |
| `POS. 1 · HUVUDENHET · REFERENSPLAN FÖR POS. 2–4` | `POS. 1 · HUVUDENHET` |
| `POS. 2 · SIGNALGIVARE · INGÅR I POS. 1` (+ 3, 4) | `POS. 2 · SIGNALGIVARE` osv. |
| `▲ │ A` och `⊕ │ Ø0,2 │ A` | Behåll — stilens bästa grepp, ren GD&T |
| `POS. 1 · HUVUDENHET — 3 DELAR MONTERADE` | `3 DELAR` |
| `MÄTVÄRDE 42,41 · ÖVER ÖVRE GRÄNS → SÄLJ` | `42,41 · ÖVER GRÄNS` |
| Namnrutan (`SKALA 1:1`, `RITN.NR P-0004`, materialrad ur stats) | Behåll allt |

### synop
| Nu | Förslag |
| --- | --- |
| `▼ LÅGTRYCKSCENTRUM · TRE FRONTER UTGÅR HÄRIFRÅN` | `▼ LÅGTRYCKSCENTRUM`, eller bort — `L 984 ↓↓` säger det |
| `▲▲▲ KALLFRONT · UTGÅR FRÅN L` (+ varm, ockl.) | `KALLFRONT` / `VARMFRONT` / `OCKLUSION` |
| `SYNOPTISK, GR. synoptikós — ”SEDD TILLSAMMANS”` | **Bort** |
| `L 984 hPa · 3 FRONTER · ETT SYSTEM` | `L 984 hPa` |
| `UPPKLARNANDE · 3/3 AVKLARADE` | `3/3` |
| `VINDSTYRKA 12 BEAUFORT · ORKAN` | `12 BEAUFORT` |
| Stationsmodellerna (`SV 6 m/s · +14° · 1014 hPa ↗`) | Behåll — perfekta |

### bikupa
| Nu | Förslag |
| --- | --- |
| `DANSGOLVET · TOM CELL — HÄR BLIR LASS TILL RIKTNING` | `DANSGOLVET` |
| `NEKTARCELL · SPEJAREN RAPPORTERAR TILL DANSGOLVET` | `NEKTAR` |
| `YNGELCELL · BYGGBIET FÅR SIN SYSSLA AV DANSGOLVET` | `YNGEL` |
| `POLLENCELL · DRAGAREN FLYGER DANSGOLVETS BÄRING` | `POLLEN` |
| `α 40° · 1,4 km` m.fl., `SOLEN · 0°` | Behåll — utan solen betyder α ingenting |
| `SVANSDANS α 40° · 3 ANVISNINGAR UT` | `α 40°` |
| `SOCKERHALT 46 % · RIK KÄLLA — KÖP` | `SOCKERHALT 46 %` |
| `3 CELLER TÄCKTA · FÖRRÅDET SLUTET` | `3 CELLER TÄCKTA` |
| `LAST 30 mg · TUR 3/3 · HEM TILL KAKAN` | `LAST 30 mg` |
| `1/3 AV KROPPSVIKTEN` | Bort |

### fuga
| Nu | Förslag |
| --- | --- |
| `DUX · HÄRIFRÅN HÄMTAR DE TRE SIN TONFÖLJD` | `DUX` |
| `COMES · SUBJEKTET EN KVINT UPP, TONALT SVAR` | `COMES` |
| `INVERSIO · SUBJEKTET SPEGLAT KRING b` | `INVERSIO` |
| `AUGMENTATIO · SUBJEKTET I DUBBLA NOTVÄRDEN` | `AUGMENTATIO` |
| `T. 1 · M.M. 72`, `T. 3 · +6,7 s` m.fl. | Behåll |
| `SUBJEKTET STÄLLS EN GÅNG — BESVARAS TRE` (fot) | Bort |
| `TIGER 2 TAKTER` (+ 4, 6) | Bort — siffran över flerstaktspausen säger redan 2 |
| `SUBJEKTET · T. 1–2` | `T. 1–2` |
| `T. 9 · STRETTO · ALLA FYRA PÅ EN GÅNG` | `T. 9 · STRETTO` |
| `STRETTO · 4 INSATSER — ETT SUBJEKT` | `STRETTO` |
| `COMES · SVARET EN KVINT UPP — INSATS T. 3` | `COMES · T. 3` |
| `INVERSIO · SUBJEKTET SPEGLAT — INSATS T. 5` | `INVERSIO · T. 5` |
| `AUGMENTATIO · SAMMA TONER PÅ 4 TAKTER` | `AUGMENTATIO · 4 T.` |
| `SPEGELAXEL b`, `TONALT SVAR` | Behåll — konstruktionslinjer, inte bildtext |

### sinus
| Nu | Förslag |
| --- | --- |
| `TAKTGIVARE · HÄRIFRÅN HAR ALLA FYRA SIN FREKVENS` | Bort — den tomma kanalen ÄR påståendet |
| `EGEN 60/min → DRIVEN 72/min` (×3, under knappen) | Bort — står redan på kanaletiketten till vänster |
| `TAKTGIVARE · 72/min · EJ AVBILDBAR` (kanaletikett) | `SA-NOD · 72/min` |
| `NODENS EGEN KURVA SAKNAS PÅ REMSAN — DEN LÄSES UR DE TRE` (fot) | Bort |
| `KAN 2 · FÖRMAK · +0,04 s` m.fl. | Behåll |
| `RYTM: SINUS…`, `TAKT UR PAPPRET: 600 ÷ 8,3 STORRUTOR = 72/min` | Behåll — verkliga, kontrollerbara |
| `NODEN SYNS ALDRIG SJÄLV · 3 PENNOR SVARAR` | `R–R 0,83 s` |
| `FÖRMAK · P-VÅG 40 ms EFTER NODEN — ALDRIG FÖRE` | `P-VÅG +40 ms` |
| `AV-NOD · HÅLLER 80 ms — MEN FÅR ALLTID SITT UPPDRAG UTIFRÅN` | `AV-NOD 80 ms` |
| `KAMMARE · R 12 mm ÖVER NOLLINJEN — MEN TAKTEN ÄR NODENS` | `R 12 mm · 2,4 mV` |

---

## Tillägg (så det inte kommer tillbaka)

### 1. Hård regel i `PROMPT_TAVLING.md`

Prompten är orsaken. Den säger i dag att navets särställning ska vara *mekanisk*
och ger exempel — "en lägestolerans mot referensplanet, ett tryck som lutar in mot
L, en bäring som mättes på dansgolvet". Agenter läser det och skriver ut det som
bildtext. Föreslagen ny sektion:

> ## Skriv inte det du kan visa
>
> Bidraget bedöms på vad som SYNS, inte på vad det påstår om sig självt.
>
> - **Ingen förklaringsrad under knappen.** Navets särställning ska framgå av
>   geometri, färg, läge eller rörelse — aldrig av en rad som säger att den är navet.
> - **Etiketter är mätvärden, inte meningar.** Max ~16 tecken, inga verb, inget
>   efterled efter tankstreck. `⊕ Ø0,2 A`, `+0,04 s`, `1002 ↘`, `T. 3` är rätt.
>   `HÄRIFRÅN HÄMTAR DE TRE SIN TONFÖLJD` är fel.
> - **Förklara aldrig din egen metafor.** Ingen ordboksfotnot, ingen
>   "härifrån"-formulering, inget skämt som pekar på att det är ett skämt.
> - Konceptet förklaras i `docs/CHANGELOG.md`, inte på skärmen.

### 2. Byggkontroll (valfritt)

`scripts/check-copy.mjs` som plockar ut varje `content:`-sträng under
`.app-btn::before/::after` i `style.css` och varje `.cap`-literal i `main.js`, och
failar om någon överstiger gränsen. Kopplas till `prebuild`. Gör smakfrågan
mekanisk — nästa agent kan inte återinföra den utan att bygget säger ifrån.

### 3. Flytta prosan till info-panelen

`i`-knappen finns redan på varje rad och används i dag bara till tagline + stats.
Ett fält `note` per stil i `styles.js` skulle ge konceptet en plats på begäran i
stället för påtvingat i vila. Det betalar för borttagen ovan: texten finns kvar
för den som vill ha den, men skriker inte.

---

## Omfattning

- 32 förklaringsrader under knapparna → bort eller ner till 1–2 ord
- ~25 hover-captions → kortas till siffra + term
- ~8 skämtrader i kvitto/vaxel/singularitet/orrery → bort eller torrläggs
- 1 ordboksfotnot (synop) → bort
- Allt `::after`-mätvärde, alla namnrutor, alla stationsmodeller → **orört**

Ingen stil tappar sitt koncept. Bikupan är fortfarande en vaxkaka med ett tomt
dansgolv; sinus är fortfarande en remsa med en kanal som saknar kurva. Skillnaden
är att sidan slutar förklara det.
