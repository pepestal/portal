# Tävlingsprompt — designtävling i portalen (klassiska klassen)

Återanvändbar prompt för nästa tävlande agent i den **klassiska klassen**.
Klistra in allt nedanför linjen. Uppdatera vid behov: stil-lista och regler
ändras när nya bidrag vinner mark.

Tävlingen har **två klasser som aldrig blandas** — använd rätt prompt:

- **Klassisk** (denna prompt): bidraget klär det gemensamma skelettet.
  Återhållsamhet, mekanisk precision, sex jämnstarka appar. Ligger i den
  vanliga rotationen.
- **Kaos** ([`PROMPT_CHAOS.md`](PROMPT_CHAOS.md)): inget skelett, fritt
  mönsterbrott — bara de sex apparna är heliga. Bidragen bär `chaos: true`
  och visas bara bakom kaos-togglen i topbaren, i en egen rotation.

---

Du är frontend-utvecklare i en designtävling — den **klassiska klassen**. Ditt
bidrag är en **ny stil i portalens stilsystem** — byggd direkt i produktion,
inte som fristående demo.

Klassen bedöms på återhållsamhet och koncept: skelettet står still, uttrycket
sitter i palett, typografi, geometri och hover-mekanik. (Tävlingen har också en
kaosklass med egen prompt och egen pool — den här prompten är inte den. Sätt
**aldrig** `chaos: true` på ett klassiskt bidrag: flaggan flyttar stilen ur den
vanliga rotationen och in bakom kaos-togglen, och ditt bidrag försvinner ur sin
klass.)

## Ramarna (läs först, bryt aldrig utan att flagga)

- Läs `CLAUDE.md`, `docs/STATUS.md` och `README.md` innan du börjar.
- **Ditt bidrag bor i egna filer — `src/main.js` och `src/style.css` rörs inte.**
  En stil = `src/styles/<id>.js` + `src/styles/<id>.css` + **en rad** i registret
  `src/styles.js`. Modulen default-exporterar:

  ```js
  import './<id>.css'
  import { makeCountEnhancer } from '../shared.js'   // valfritt

  const viz = (app, inre) => `
    <div class="av" data-for="<id>" aria-hidden="true">
      <div class="viz viz--<eget-namn>">${inre}</div>
    </div>`

  export default {
    id: '<id>',
    label: '<Namnet i växlaren>',
    anim: {
      syntes: viz('syntes', `…`),
      signal: viz('signal', `…`),
      todos: viz('todos', `…`),
      stronk: viz('stronk', `…`),
    },
    enhancer: minEnhancer,     // valfritt — se nedan
  }
  ```

  `anim` är hover-markupen per app. Varje variant är ett
  `<div class="av" data-for="<id>" aria-hidden="true">` — `data-for` behövs för att
  `makeCountEnhancer` ska hitta sina siffror, och `aria-hidden` för att animationen
  är dekor: knappens tillgängliga namn är app-namnet, inte din viz. Bara den aktiva
  stilens markup renderas, så din stil kostar ingenting i DOM:en när någon annan
  visas — men den byggs också om vid varje stilbyte, så lägg ingenting där som
  antar att den överlevt.

  `enhancer` körs efter att markupen satts och ska returnera en cleanup som river
  allt du injicerat. Behöver du bara uppräkning av siffror räcker
  `makeCountEnhancer('<id>')` ur `src/shared.js`. Följ mönstret från
  `singularitet`/`kvitto`: injicera vid stilbyte, städa i cleanup.

  Allt du delar med andra stilar ska hämtas ur `src/shared.js` (`nf`,
  `prefersReduced`, `countUp`, `makeCountEnhancer`). Lägg inte till nya delade
  hjälpare utan att flagga — hör de bara hemma i din stil ska de bo i din fil.
- **Flyttar du raderna: sätt `width` själv.** Skelettets `.app-row` bär en bredd
  avsedd för den lodräta kolumnen (`min(100%, knapp + gap + info)` ≈ 500 px). Lägger
  din stil raderna på tvären blir den bredden flexbasis per rad, och radbrytningen
  slår till långt innan knapparna faktiskt är för breda (så tappade `singularitet`
  sin fjärde port). Kolla horisontell scroll på smal skärm efteråt: `.info-panel`
  är ankrad mitt i raden, så en rad ute i kanten kan knuffa ut den ur sidan.
- **Klipper du knappens form (`clip-path`): ersätt fokusringen.** Skelettets
  `a:focus-visible { outline }` ligger utanför formen och klipps bort helt — tangentbords-
  fokus blir osynligt. Rita den inåt i stället (t.ex. låt knappens bakgrund/ram byta färg)
  och lägg glödet med `filter: drop-shadow()`, som följer clip-path; `box-shadow` gör det
  inte, den ritas mot den rektangulära boxen och klipps av på diagonalerna.
- **Påstår din stil ett mått måste det stämma på båda ställena.** Ligger rutnätet i CSS
  (`background-image`) och geometrin i JS (enhancerns `getBoundingClientRect`) räknar de i
  var sitt tal — och i samma sekund du skriver ut "+0,04 s = 2 rutor" har du lovat att de
  är lika. Lägg skalan i en variabel på båda ställena, bryt på samma bredder, och snäpp
  det som ska gå att räkna till rutan.
- **Skelettets markup rörs aldrig.** Vill du bygga en helscen som ersätter det
  (à la `orrery`) måste avsteget flaggas och dokumenteras som förankrat undantag;
  sätt då `fullscene: true` i modulen och lämna `anim` tomt. Är det friheten från
  skelettet du är ute efter är det **kaosklassen** du söker (`PROMPT_CHAOS.md`) —
  inte ett undantag i den här.
- Alla **sex appar** (Syntes, Signal, Ethos, Hexis, scales, ser/sys) ska ha **en egen,
  unik hover-animation per app** — samma koncept i sex uttryck räknas, sex kopior gör det
  inte. De fem levande ska vara klickbara länkar. **Syntes ska inte vara det:** kortet är
  vilande och renderas utan `href` av skelettet, så gör det inte klickbart i din stil
  heller.
- **Länkarna är skarpa och adressen kommer ur `src/apps.js` — aldrig ur din kod.**
  Knapparna går till `syntes.dev`, `signal.syntes.dev`, `ethos.syntes.dev` och
  `stronk.syntes.dev` (Todos bor på *ethos*; app-id:t är ändå `todos`, för alla
  stilars selektorer och stats-nyckeln hänger på det — byt det inte). Klär du bara
  om skelettet sköter `main.js` länkarna och du behöver inte göra något. Bygger du
  en **helscen** med egna `<a>` måste du läsa `apps.js` som `orrery` gör
  (`appById[id].url`) — hårdkoda aldrig en adress och skriv aldrig `href="#"`, då
  bryter din stil sidans enda funktion. `src/apps.js` redigeras inte av ett bidrag.
- Sidan förblir statisk. Respektera `prefers-reduced-motion` och ge
  tangentbordsfokus samma upplevelse som hover.
- **Texten är ransonerad.** Se ”Skriv inte det du kan visa” nedan — den är inte en
  stilfråga utan en regel, och den kontrolleras av `npm run check:copy` i bygget.

## Sex jämnstarka appar — och en vilande plats

Det finns **inget nav**. Fram till 2026-08-20 var Syntes ett händelsenav som tog emot,
syntetiserade och pumpade vidare mellan apparna, och tävlingens konceptuella kärna var att
ge den en särställning. Händelsebussen är riven — containrar, databas, Caddy-block,
Authelia-regel och tunnelrutter är borta, och `syntes.dev` svarar 404.

De fem levande apparna är alltså **jämnstarka**. Ingen av dem definierar de andra, och en
komposition som gör en av dem till centrum beskriver ett ekosystem som inte finns.

🔴 **Uppgiften är i stället svårare, och mer intressant: Syntes plats står kvar, tom.**
Kortet renderas utan länk (`dormant: true` i `src/apps.js`, och `.app-row.is-dormant` i
CSS:en). Din stil ska visa att där finns en plats som inte är fylld — **utan att skriva
det**. Det är samma regel som styr all annan text på sidan, och det är här den är svårast.

Grepp som redan är använda, så att du gör något annat: terminalens `HTTP/2 404`, editorialens
ombrutna men tomma spalt, bankens position som töms till `0,00`, växelbordets urkopplade
propp, jacquardvävens avklippta varptråd, kvittots strukna varurad, orrerys utslocknade
kropp som ligger kvar i sin bana, och hinnans slaka fläck där materialet tappat spänsten.
Mönstret i alla åtta är detsamma: **den vilande platsen är gjord av samma material som de
levande, men saknar det som gör dem levande.** Inte en gråtonad kopia, inte en varningsikon.

⚠️ **Flera äldre stilar bär fortfarande nav-kompositionen** — de komponerades när navet
fanns och är under ombyggnad. Kopiera dem inte som förebild; läs `docs/CHANGELOG.md` för
vilka som är omgjorda.

**Ett grepp som visat sig bära:** låt skillnaden synas redan i vilotillståndet, inte bara
vid hover — och låt den vara *mekanisk*, inte dekorativ. Det starkaste är när den vilande
platsen saknar något som stilens egen fysik kräver: en tråd som inte bär, en yta som inte
spänner, en krets som inte sluts.

**Men:** de exemplen är *geometri*, inte text. En lägestolerans är två tecken i ett
hörn, inte en mening om referensplan. Läs nästa avsnitt innan du skriver en enda
bokstav på skärmen — det är den vanligaste och dyraste missen i tävlingen.

## Skriv inte det du kan visa

Bidraget bedöms på vad som **syns**, inte på vad det påstår om sig självt. Sexton
bidrag in är det här den enskilt största kvalitetsskillnaden mellan stilarna, och
den vanligaste anledningen till att ett i övrigt skickligt bygge känns fjantigt.

- **Ingen förklaringsrad under knappen.** `.app-btn::before` med en mening i är
  förbjuden mark. Att en plats är vilande ska framgå av geometri, färg, läge eller
  rörelse — aldrig av en rad som talar om att den är vilande.
- **Etiketter är mätvärden, inte meningar.** Riktmärke ~16 tecken, inga verb, inget
  efterled efter tankstreck. `⊕ Ø0,2 A`, `+0,04 s`, `1002 ↘`, `T. 3` är rätt.
  `DUX · HÄRIFRÅN HÄMTAR DE TRE SIN TONFÖLJD` är fel — och skrev du "härifrån",
  "här blir", "utgår från" eller "får sin … av" har du med största sannolikhet just
  ersatt en bild med en bildtext.
- **Hover-texten beskriver inte bilden.** Man tittar redan på den. Siffra och term
  räcker: `P-VÅG +40 ms`, inte `FÖRMAK · P-VÅG 40 ms EFTER NODEN — ALDRIG FÖRE`.
- **Förklara aldrig din egen metafor.** Ingen ordboksfotnot, ingen etymologi, inget
  skämt som pekar på att det är ett skämt, ingen rad som argumenterar för konceptet.
- **Rollspela inte.** Påhittade firmanamn, "kassör: <ditt modellnamn>", interna
  skämt om tävlingen eller om att sidan saknar backend — bort. Formen bär humorn;
  copy som pekar på skämtet dödar det.
- Konceptet förklaras i `docs/CHANGELOG.md` och i kodkommentarer, **inte på skärmen**.

Testet innan du lämnar in: täck över all text i din stil. Syns det fortfarande vilken
rad som är den vilande? Gör det inte det är det geometrin som ska fixas, inte texten.

## Tävlingens kärna: konceptet

Studera de befintliga stilarna via `?style=<id>` (`terminal`, `editorial`,
`bank`, `singularitet`, `kvitto`, `orrery`, `vaxel`, `jacquard`, `sprangskiss`, `synop`,
`bikupa`, `fuga`, `sinus`, `tryckark`, `alv`, `tunnelbana`) — inte för inspiration utan för att
**inte** återanvända deras grepp. Varje stil ligger i `src/styles/<id>.js` och
`src/styles/<id>.css`, så du kan läsa en i taget. Tolka uppgiften oväntat; en
stark idé konsekvent genomförd slår tio effekter.

## Innan du lämnar in

1. **Verifiera live:** kör dev-servern, ta skärmdumpar av grundläget + alla
   sex hover-tillstånden (forcera `:hover` vid behov), och regressionskolla
   minst en befintlig stil.
2. **Kör `npm run check:copy`.** Den failar på för långa etiketter och på de
   formuleringar som listas ovan. Den ingår i `prebuild` — ett bidrag som inte
   passerar den går inte att deploya.
3. **Kontrollera att länkarna lever i din stil.** Ingen `href="#"`, inga
   hårdkodade adresser:

   ```js
   [...document.querySelectorAll('a[href]')].map((a) => [a.dataset.name || a.dataset.app, a.getAttribute('href')])
   ```

   **Fem** rader ut, alla mot `*.syntes.dev` — den vilande Syntes ska INTE finnas med,
   den har inget `href`. Klipper din stil knappens form eller lägger något ovanpå den:
   klicka faktiskt på alla fem och kontrollera att inget overlay-lager äter träffytan
   (`pointer-events: none` på dekor).
4. **Uppdatera docs** enligt CLAUDE.md: `CHANGELOG.md`, `STATUS.md`,
   `ROADMAP.md`, `README.md` vid behov.
5. **Arkivera bidraget:** spara en representativ skärmdump (gärna med hover
   aktiv) i `variations/<stil-id>/`. Fristående kodversioner av bidraget görs
   inte — stilen i produktion ÄR bidraget.

## Inlämning!
Bidrag anses inlämnat när det är live på sidan portal.syntes.dev tillsammans med de övriga bidragen, och är en del av rotationen. 

## Terminal & shell (agenten har stående tillåtelse)

Du har stående tillåtelse att köra alla terminal-/shell-kommandon som är relevanta för
uppgiften (bygga, testa, installera, scripts, git m.m.) — fråga inte per kommando.
Destruktiva/svåråterställbara åtgärder bekräftas dock med mig först.

## Server & deploy (agenten har stående tillåtelse)

Jag (Peter) har SSH-access till produktionsservern via **nyckel som redan finns på datorn —
inget lösenord behövs**. Du som agent har **stående tillåtelse att köra server-kommandon
som hör till uppgiften** (SSH in, curl, deploy m.m.) — du behöver inte fråga varje gång. De
konkreta serveruppgifterna (adress, sökvägar, deploy-kommandon) för det aktuella projektet
finns i projektets egen dokumentation (`.claude/` / `docs/`) eller i `password.md` i
LOKALT-roten.

Må bäste agent vinna.

OBSERVERA! 
Det kan vara en annan agent, eller flera, som jobbar med deras bidrag inom samma kodbas. Detta kan leda till att filer committas, eller övrig påverkan på repot. Ignorera detta, och bygg ditt egen bidrag oberoende av vad som pågår inom repot. Du behöver inte oroa dig för att validera filintegriteten eller dylikt för andra filer än just de som du arbetar med för ditt bidrag. Du ska alltså inte bli side-tracked med repo-status eller andra agenters arbete utan fokusera på att skapa ett så kreativt bidrag du bara kan! 