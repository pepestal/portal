# Kaosprompt — designtävlingens kaosklass

Återanvändbar prompt för nästa tävlande agent i **kaosklassen**. Portalen har två
tävlingsklasser som aldrig blandas:

- **Klassisk** ([`PROMPT_TAVLING.md`](PROMPT_TAVLING.md)) — klär det gemensamma
  skelettet. Återhållsamhet, mekanisk elegans, sex jämnstarka appar. Ligger i den
  vanliga rotationen.
- **Kaos** (denna prompt) — inget skelett att respektera. Bidragen bär
  `chaos: true` i modulen och visas **bara** när kaos-togglen i topbaren är på.

Använd rätt prompt för rätt klass. Klistra in allt nedanför linjen.

---

Du är frontend-utvecklare i en designtävling — **kaosklassen**. Ditt bidrag är en
ny stil i portalens stilsystem, byggd direkt i produktion, men till skillnad från
den klassiska klassen finns här **inget skelett att följa**. Sidan är din. Riv
den, vänd den ut och in, gör den till något en länksida aldrig varit.

Det enda som är heligt: **fem fungerande länkar** till ekosystemets appar, och en
sjätte plats som står tom och ska synas göra det. Allt annat är förhandlingsbart.

## Golvet (det enda som inte får brytas)

Kaos är en frihet i uttrycket, inte i kontraktet. Detta gäller utan undantag:

- Läs `CLAUDE.md`, `docs/STATUS.md` och `README.md` innan du börjar.
- **Fem riktiga länkar** — Signal, Ethos, Hexis, scales, ser/sys — som `<a href>` med
  adresser ur `src/apps.js`. Aldrig `href="#"`, aldrig hårdkodade adresser, aldrig
  `preventDefault` som kapar navigationen: vanligt klick, ctrl/cmd-klick och
  mittenklick ska alla öppna appen. Hur gömd, rörlig eller förvriden länken än är
  måste den gå att träffa.
- 🔴 **Den sjätte, Syntes, ska INTE vara en länk.** Den bär `dormant: true` i
  registret och `syntes.dev` svarar 404. Rendera platsen, men utan `href` — ett kaos
  som länkar dit ljuger om ekosystemet. Läs `dormant`-flaggan, hårdkoda inte
  undantaget.
- **Alla fem länkarna nås med tangentbord.** Tab hittar dem, Enter följer dem, och
  fokus ger en upplevelse i klass med pekarens. En länk som bara kan fångas med
  mus är en trasig länk. Den vilande platsen ska inte fånga fokus alls.
- **Sidan förblir statisk.** Ingen backend, inga externa anrop, ingen
  Syntes-koppling. Kaoset är lokalt.
- **Ditt bidrag bor i egna filer:** `src/styles/<id>.js` + `src/styles/<id>.css`
  + en rad i registret `src/styles.js`. `src/main.js`, `src/style.css`,
  `src/apps.js`, `src/shared.js` och andras stiler rörs aldrig.
- **Enhancerns cleanup river ALLT.** Kaosläget togglas av med ett klick, och då
  ska nästa stil stå på en orörd sida — inga kvarglömda element, lyssnare,
  timers, klasser på `<html>/<body>` eller muterade skelettnoder. Testa genom
  att toggla fram och tillbaka flera gånger.
- **`prefers-reduced-motion` respekteras.** Kaos för ögat, inte för
  balansorganet: med reduced motion ska bidraget stå stilla och ändå bära sitt
  koncept. Inget blink över 3 Hz någonsin (flash-gränsen är inte estetik, den
  är säkerhet). Ljud får förekomma men aldrig starta utan en användargest.
- **`npm run check:copy` passerar.** Textransoneringen gäller även här — kaos
  är visuellt och mekaniskt, inte pratigt. En sida som förklarar sitt eget
  skämt är lika död i kaosklassen som i den klassiska.
- Prestandagolv: kaoset får inte segla under ~60 fps på en vanlig laptop eller
  äta batteri i vila. `requestAnimationFrame` som pausas när fliken är dold,
  transform/opacity före layout-egenskaper.

## Registrering — så bor ett kaosbidrag i systemet

```js
import './<id>.css'
import { apps } from '../apps.js'

const appById = Object.fromEntries(apps.map((a) => [a.id, a]))   // som orrery gör

export default {
  id: '<id>',
  label: '<Namnet i växlaren>',
  chaos: true,          // detta gör bidraget till kaosklass — obligatoriskt
  fullscene: true,      // normalfallet i kaos: du ersätter skelettet
  anim: {},             // helscen lämnar anim tomt
  enhancer: minScen,    // bygger allt, returnerar cleanup som river allt
}
```

I den klassiska klassen är en helscen ett flaggat undantag. **I kaosklassen är
den normalfallet** — sätt `fullscene: true`, dölj skelettet via din
`[data-style="<id>"]`-CSS och bygg scenen i enhancern, som `orrery` gör. Att i
stället vrida skelettet till oigenkännlighet med enbart CSS är också giltigt.
Kaosbidrag ingår inte i den vanliga rotationen: de visas bara när kaos-togglen
är på, och rotationen bläddrar då enbart bland kaosbidrag.

## Uppdraget: bryt mönstret

En länksida har outtalade regler. Besökaren vet hur den fungerar innan den
laddat klart: knappar väntar snällt, hover ger en liten belöning, klick
navigerar, sidan står still. **Ditt jobb är att hitta en av de reglerna och
bryta den så genomtänkt att besökaren tänker "WHOA".** Fyra riktningar att
pressa — exemplen är engångständstickor, inte förslag; det som redan står här
är per definition inte längre ett WHOA:

**VAD är en länk?** Ingenting säger att den ska se ut som en knapp. En länk kan
vara ett hål i sidan, en varelse som rör sig, skuggan av något man inte ser,
den enda lugna punkten i ett oväder, ett föremål som måste grävas fram, ett
ögonblick som bara finns var tionde sekund. Frågan är inte "hur stylar jag sex
knappar" utan "vad i den här världen råkar också gå att gå in i".

**HUR fungerar den?** Hover är ett av många verb. Länkar kan jagas, lockas,
fångas, vägas i handen, dras i som spakar, väckas, förhandlas med. De kan ha
humör: en som flyr, en som stirrar tillbaka, en som följer efter markören i
smyg. De kan svara på *hur* du närmar dig — långsamt mot snabbt, rakt mot i
båge. (Men golvet står kvar: hur lekfull jakten än är ska ett ärligt klick och
ett Tab+Enter alltid gå hem.)

**EFFEKTER — hela loopen, inte bara hover.** De klassiska stilarna animerar
`:hover`. Du har fem tillstånd till: *innan* (sidan i vila — lever den, andas
den, pågår något även när ingen tittar?), *närmandet* (märker sidan att
markören är på väg?), *hover*, *lämnandet* (läker såret, eller lämnar varje
besök spår som ackumuleras?), och *klicket* (vad händer med världen i
millisekunderna innan man rycks vidare?). De starkaste kaosbidragen har en
mekanik i varje tillstånd, inte en effekt i ett.

**BRYT sidans fysik.** Antagandena bakom varje webbsida är också material:
att sidan är en yta (inte ett rum, en organism, en maskin med baksida), att
layout ligger still, att markören är din (inte något sidan har åsikter om),
att scroll gör det scroll gör, att elementen inte känner till varandra, att
sidan inte minns dig mellan besöken (localStorage finns — en sida som ser
annorlunda ut femte gången väcker frågor). Välj ETT antagande och bryt det
hela vägen, hellre än att spräcka fem till hälften.

## Bedömningen

Klassen döms på **WHOA-faktor**: det oväntade, mönsterbrottet, det man visar
någon annan. Ett stilrent, tyst, smakfullt bidrag — hur skickligt som helst —
slår inte högt här; det hör hemma i den klassiska klassen. Höga betyg går till
bidrag som får en att omvärdera vad sidan *är*.

Men kaos är en vilja, inte en ursäkt. Skillnaden mellan WHOA och jippo:

- **En idé, hela vägen.** Tio löst hängande effekter är inte kaos, det är
  brus. Det starkaste är en enda regel som bryts med total konsekvens — där
  varje detalj lyder under brottet.
- **Hantverket bär upplevelsen.** Ett hack i animationen, en länk som inte går
  att träffa, en scen som lämnar skräp efter sig när togglen slås av — allt
  sådant dödar ett WHOA snabbare än försiktighet gör.
- **Överraskningen ska gå att upprepa.** En engångseffekt som är förbrukad
  efter första besöket förlorar mot en mekanik man vill utforska igen.

## Den tomma platsen — material, inte krav

Ekosystemets sanning gäller även här: **det finns inget nav.** Syntes var ett
händelsenav fram till 2026-08-20, då bussen revs; de fem levande apparna är jämnstarka
och ingen av dem definierar de andra. Ett kaos där tre länkar bevisligen dras mot en
fjärde beskriver alltså ett ekosystem som inte längre finns.

Det som däremot är fritt material är **tomrummet**. En sjätte plats som står kvar utan
något bakom sig är en gåva till ett mönsterbrott: ett hål i kompositionen, en plats där
mekaniken inte griper, ett namn som inte svarar. I den klassiska klassen ska den
skillnaden vara stram och mekanisk; i kaos får den vara vad du vill — så länge den
**syns utan att skrivas ut**, och så länge platsen inte går att klicka på.

## Innan du lämnar in

1. **Verifiera live:** kör dev-servern, slå på kaos-togglen, och ta skärmdumpar
   av vilotillståndet + interaktionstillstånden (forcera `:hover` vid behov).
2. **Klicka alla fem länkarna på riktigt.** Kaosbidrag bygger egna `<a>` —
   kontrollera i konsolen:

   ```js
   [...document.querySelectorAll('a[href]')].map((a) => [a.dataset.name || a.dataset.app, a.getAttribute('href')])
   ```

   **Fem** rader ut, alla mot `*.syntes.dev` — Syntes ska inte vara med. Kontrollera
   att inget dekorlager äter träffytan (`pointer-events: none` på dekor) och att
   Tab + Enter når och följer alla fem.
3. **Toggla kaos av och på fem gånger.** Sidan ska stå exakt orörd i det
   klassiska läget efteråt — regressionskolla minst en klassisk stil.
4. **Kör `npm run check:copy`** (ingår i `prebuild`; utan grönt går bidraget
   inte att deploya) och verifiera `prefers-reduced-motion`-läget.
5. **Uppdatera docs** enligt CLAUDE.md: `CHANGELOG.md`, `STATUS.md`,
   `ROADMAP.md`, `README.md` vid behov. Konceptet förklaras där och i
   kodkommentarer — inte på skärmen.
6. **Arkivera bidraget:** en representativ skärmdump i `variations/<stil-id>/`.
   Stilen i produktion ÄR bidraget.

## Inlämning

Bidraget anses inlämnat när det är live på portal.syntes.dev, bär
`chaos: true` och dyker upp i rotationen när kaos-togglen slås på.

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

Må vildaste agent vinna.

OBSERVERA!
Det kan vara en annan agent, eller flera, som jobbar med deras bidrag inom samma kodbas.
Detta kan leda till att filer committas, eller övrig påverkan på repot. Ignorera detta, och
bygg ditt eget bidrag oberoende av vad som pågår inom repot. Du behöver inte oroa dig för
att validera filintegriteten eller dylikt för andra filer än just de som du arbetar med för
ditt bidrag. Du ska alltså inte bli side-tracked med repo-status eller andra agenters
arbete utan fokusera på att skapa ett så mönsterbrytande bidrag du bara kan!
