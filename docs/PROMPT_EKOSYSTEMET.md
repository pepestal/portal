# Uppdragsprompt — portalen ska visa ekosystemet som det faktiskt ser ut

Ett **engångsuppdrag**, till skillnad från [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md) och
[`PROMPT_CHAOS.md`](PROMPT_CHAOS.md) som är återanvändbara tävlingsprompter. Beställt av
Peter 2026-08-20, samma dag som händelsenavet Syntes revs.

Alla siffror nedan är **mätta 2026-08-20**, inte uppskattade. Klistra in allt nedanför
linjen.

---

Du arbetar i `~/lab/portal` — Peters publika showroom på `portal.syntes.dev`.

🛑 **Repot är publikt och CI kör hos GitHub, inte på hemserverns runner.** Flytta aldrig
ett jobb till `self-hosted` här; `vakt.yml` fäller dig om du gör det.

## Vad som är fel i dag

Portalen visar fyra appar. En finns inte, två har fel namn, och tre appar som lever
saknas helt.

| Kortet säger | Ska bli |
|---|---|
| `id: 'syntes'` · **Syntes** · `https://syntes.dev` | **Syntes** står kvar — men **aldrig mer som "navet"**. Se beslut 3 |
| `id: 'signal'` · **Signal** | oförändrad |
| `id: 'todos'` · **Todos** · `ethos.syntes.dev` | `id: 'ethos'` · **Ethos** |
| `id: 'stronk'` · **Stronk** | `id: 'hexis'` · **Hexis** (bytte namn 2026-08-20, `stronk#17`) |
| — | **scales** · `https://scales.syntes.dev` — övningslogg för piano |
| — | **ser/sys** · `https://sys.syntes.dev` — serverns notiscentrum |

## Sex beslut som redan är fattade — ompröva dem inte

1. **Byt både `id` och `name`.** Frestelsen är att bara ändra `name` och låta `id` vara —
   `apps.js` bär redan kommentaren *"Appen heter Todos i portalen men bor på
   ethos.syntes.dev — id:t styr"*. Den genvägen är själva skulden. Byt id:t och följ det
   genom varje `data-app="…"` och varje hårdkodad sträng.
2. **Sex appar, inte fyra.** Det är den största risken i uppdraget, inte namnbytet.
3. 🔴 **Syntes är inte längre ett nav.** Händelsebussen revs 2026-08-20 — containrar,
   databas, Caddy-block, Authelia-regel och tunnelrutter är borta. Peter behåller platsen
   för att han *"säkert kommer använda den till något"*. Så: kortet finns kvar,
   nav-språket ska bort överallt, och `syntes.dev` svarar **404** i dag. **Default:
   rendera kortet utan länk** (eller som tydligt vilande) tills det finns något bakom.
   DNS-posten ligger kvar hos Cloudflare, så adressen går att återuppliva.
4. **`kladd` ska inte in.** Det är testytan, inte en app i showroomet.
5. **Domänen `syntes.dev` lever.** Bara *appen* Syntes är borta. Rör aldrig `*.syntes.dev`
   som basdomän.
6. **Samtliga 21 stilar ska fungera på mobil.** Eget avsnitt nedan.

## Omfattningen — mätt, inte uppskattad

21 stilar. Av dem är 8 helt dynamiska (läser `apps`-arrayen) och klarar sig nästan själva.
Resten hårdkodar:

- **13 JS-filer**, 67 förekomster av `'syntes'|'signal'|'todos'|'stronk'`
  (`dynamo` 10, `fuga` 8, `tunnelbana` 8, `bikupa` 7, `sinus` 6, `alv` 5, `hinnan` 4,
  `pangea` 4, `tryckark` 4, `lodet` 3, `orrery` 3, `synop` 3, `singularitet` 2)
- **16 CSS-filer**, 293 `data-app=`/`data-name=`-selektorer
  (`bikupa` 38, `synop` 32, `fuga` 31, `tryckark` 29, `alv` 25, `sinus` 24, `tunnelbana` 22,
  `sprangskiss` 19, `jacquard` 16, `kvitto` 16, `vaxel` 14, `kardan-chatgpt` 10,
  `singularitet` 5, `bank` 4, `editorial` 4, `terminal` 4)

**Flera stilar är komponerade kring att Syntes är centrum:** solen i `orrery`, havet i
`pangea`, temat (DUX) i `fuga`, hubben i `hinnan`/`dynamo`/`tunnelbana`. `fuga` har fyra
röster i en fyrstämmig fuga; `sinus` skriver ut `${apps.length} KANALER`. Att gå från fyra
till sex är därför en **omkomposition**, inte en sökning-och-ersättning.

## Beslut 6 i sin helhet: mobil

Peters telefon är en **Pixel 9 — 412 px bred, Roboto**. Aldrig iPhone, aldrig iOS Safari.

🔴 **Det stora problemet är inte bredd, det är hover.** Stilarna bär **336 `:hover`-regler**
och repot har **noll** `@media (hover: hover)`, noll `pointer: coarse` och **en** enda
`touchstart`. På touch betyder det två fel samtidigt:

1. Allt som bara avslöjas vid hover är **osynligt** på telefonen — i ett showroom vars hela
   poäng är att visa hantverk.
2. Android ger **sticky hover** vid tap: knappen fastnar i hovertillstånd tills man trycker
   någon annanstans. Två tryck i rad lämnar två knappar "tända".

**Regeln:** varje hover-effekt måste ha en touch-motsvarighet, eller vara ren dekoration som
inget beror på. Mönstret är `@media (hover: hover) { … }` för pekare, och ett explicit
tillstånd (klass eller `:focus-visible`) för touch. **Ingen information får bo enbart i
hover.**

### Nuläge

| Läge | Stilar |
|---|---|
| **Ingen media query alls** | 14 — `bank`, `bikupa`, `dynamo`, `editorial`, `fuga`, `hinnan`, `jacquard`, `kvitto`, `lodet`, `orrery`, `pangea`, `sinus`, `terminal`, `vaxel` |
| En mobil-breakpoint | 4 — `alv`, `kardan-chatgpt`, `tryckark`, `tunnelbana` |
| Mobilt basläge via `min-width` | 3 — `singularitet`, `sprangskiss`, `synop` |

✅ **Grunden är bättre än den ser ut.** 17 av 21 stilar ritar SVG med `viewBox` och skalar
alltså av sig själva; fasta px-bredder är få (max 3 per fil, i `synop`, `tryckark`,
`sprangskiss`, `bank`). Arbetet är därför mest **typografi, brytpunkter, tryckytor och
touch** — inte att bygga om ritytorna.

⚠️ **De tre `min-width`-stilarna är förebilden, inte undantaget.** `synop`, `sprangskiss`
och `singularitet` döljer sina tunga block på små skärmar och lägger till dem på stora. Det
är progressiv förbättring och rätt håll. Kopiera det mönstret hellre än att krympa desktop.

### Krav per stil

- Läsbar och användbar på **412 px** utan horisontell scroll.
- **Tryckytor minst 44 × 44 px.** Sex appkort ska gå att träffa med tummen.
- Ingen text under ~11 px efter SVG-skalning — kontrollera i webbläsaren, inte i koden.
- Hover-innehåll måste nås på touch.
- Skelettet har redan brytpunkter vid **360** och **560 px** (`src/style.css`). Använd
  samma, hitta inte på nya nivåer per stil.

⚠️ **Sex appkort på 412 px är trängre än fyra.** Beslut 2 och 6 hänger ihop: en stil som
löser sex kort på desktop kan fortfarande falla isär på mobil. Kontrollera båda i samma
vända.

## Sju fällor

1. ⚠️ **`syntes` är också svenska verbet "synas" i dåtid.** *"Felet syntes i `git diff`"*,
   *"det syntes inte lokalt"*. Ett `sed -i s/syntes/…/g` förstör kodkommentarer i hela
   repot. Ersätt aldrig ordet blint — bara `'syntes'` i kod och `data-app="syntes"`.
2. 🔴 **`npm run check:copy` är en riktig grind** (`prebuild` kör den). Den förbjuder synlig
   text som *förklarar* konceptet i stället för att visa det — och de värsta exemplen i
   [`TEXTGRANSKNING.md`](TEXTGRANSKNING.md) är precis nav-bildtexter: `DUX · HÄRIFRÅN
   HÄMTAR DE TRE SIN TONFÖLJD`, `TAKTGIVARE · HÄRIFRÅN HAR ALLA FYRA SIN FREKVENS`. Åtta
   stilar har sådana. De ska bort ändå nu när navet inte finns — läs `TEXTGRANSKNING.md`,
   den är ett färdigt förslag från 2026-07-28 som aldrig genomfördes. **"ALLA FYRA" är
   dessutom fel siffra nu.**
3. 🛑 **De två tävlingsprompterna bygger in navet igen om de lämnas orörda.**
   [`PROMPT_TAVLING.md`](PROMPT_TAVLING.md) har ett eget avsnitt *"Syntes är navet — ge den
   en särställning"* och kräver *"alla fyra appar"*; [`PROMPT_CHAOS.md`](PROMPT_CHAOS.md)
   säger *"fyra fungerande länkar"*. **Uppdatera båda i det här uppdraget** — annars ärver
   nästa tävlingsbidrag exakt det som just revs.
4. **`stats.json` genereras av `scripts/generate-stats.mjs`, som letar grannrepon i `../`
   under namnen `Signal/backend`, `Signal/signal_frontend`, `todos`, `stronk`, `syntes`.**
   Från `~/lab` hittar den bara två av dem — resten faller tillbaka på gamla värden.
   Uppdatera `PROJECTS` till de faktiska katalognamnen (`signal_backend`,
   `signal_frontend`, `ethos`, `stronk`, `scales`, `sersys`) och kontrollera att
   `ecosystem.apps` blir rätt. ⚠️ Generatorn är tyst när ett repo saknas — verifiera
   utdata, lita inte på exitkoden.

   🔴 **Och den skriver `src/data/stats.json` varje gång du bygger.** `prebuild` kör
   `generate-stats.mjs` före `vite build`, så ett `npm run build` från en **worktree**
   — där `../` inte är `~/lab` utan `~/wt` — hittar inga grannrepon alls och stämplar
   varje projekt `"stale": true`. Verifierat 2026-08-20 medan den här prompten skrevs:
   en ren dokumentationsändring fick `stats.json` i `git status`. **Kontrollera
   `git status` efter varje build, och committa aldrig en `stale`-stämplad
   `stats.json`.** Vill du generera på riktigt: bygg från `~/lab/portal`, inte från en
   worktree.
5. **Flera stilar har fallbacks** av typen `appById.syntes || { url: '#', name: 'Syntes' }`
   (`hinnan`, `pangea`, `orrery` m.fl.). De döljer ett borttaget kort i stället för att
   fela. Låt inte en grön build betyda att kortet renderas rätt.
6. **Två kort saknar accentfärg och animation.** `scales` och `sersys` behöver `anim`-värde
   och per-stil-färger i de 16 CSS-filerna, annars ärver de något godtyckligt. `syntes` bär
   i dag `anim: 'hub'` — den animationen ska bort med nav-rollen.
7. **Rebasa alltid före merge.** CI kör bara på pull requests sedan 2026-08-19.

## Upplägg: två PR:er i följd

**PR 1 — registret och kompositionen.** `apps.js`, `stats.json`-generatorn, de 13
JS-stilarna, de 16 CSS-filerna, nav-språket bort, de två tävlingsprompterna. Skärmdumpar på
desktop.

**PR 2 — mobil.** Brytpunkter, touch, tryckytor, typografi. Skärmdumpar på 412 px.

Skälet är inte storleken utan granskningen: Peter ska kunna titta på *"ser ekosystemet rätt
ut?"* och *"fungerar det i handen?"* var för sig. En PR där båda blandas gör det omöjligt att
se vilken ändring som orsakade vad.

## Arbetsflöde

Worktree från `origin/main`, aldrig direkt på `main`. `npm run check:copy` och
`npm run build` lokalt före push (node 22 finns i `~/.local/opt/node/bin`). PR, grön CI,
rebasa, merga, sedan `sudo /root/scripts/agent-deploy.sh portal` som eget steg.

## Leverans

🔴 **Det här är visuellt arbete — en grön build bevisar ingenting.** Fota **varje stil** i
båda lägena, på 412 px och på desktop, före och efter. Chromium och receptet finns i
agentens minnesfil `skarmdumpar-mot-ethos`; portalen ligger bakom Authelia, och agentkontot
släpps in på `GET` utan andra faktor. Lägg bilderna i [`dev_pics/`](dev_pics/) enligt
repots mönster och **visa dem för Peter innan du mergar** — han har uttryckligen sagt att
stilarna är hans, inte agentens, att komponera om.

Uppdatera i samma PR: `TEXTGRANSKNING.md` (vad som faktiskt genomfördes), `README.md`,
`CHANGELOG.md` och `STATUS.md`.

## Utanför uppdraget

Domänen, DNS, Caddy, Authelia. Andra repon. Att återuppliva `syntes.dev` med innehåll — det
är Peters nästa idé, inte den här uppgiften.
