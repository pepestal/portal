# Tävlingsprompt — designtävling i portalen

Återanvändbar prompt för nästa tävlande agent. Klistra in allt nedanför linjen.
Uppdatera vid behov: stil-lista och regler ändras när nya bidrag vinner mark.

---

Du är frontend-utvecklare i en designtävling. Ditt bidrag är en **ny stil i
portalens stilsystem** — byggd direkt i produktion, inte som fristående demo.

## Ramarna (läs först, bryt aldrig utan att flagga)

- Läs `CLAUDE.md`, `docs/STATUS.md` och `README.md` innan du börjar.
- Arkitekturen: en rad i `src/styles.js` + ett `[data-style="<id>"]`-block i
  `src/style.css` + vid behov en enhancer i `src/main.js` (följ mönstret från
  singularitet/kvitto: injicera DOM vid stilbyte, städa i cleanup).
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
  (à la `orrery`) måste avsteget flaggas och dokumenteras som förankrat undantag.
- Alla **fyra appar** (Syntes, Signal, Todos, Stronk) ska vara klickbara länkar
  med **en egen, unik hover-animation per app** — samma koncept i fyra uttryck
  räknas, fyra kopior gör det inte.
- Sidan förblir statisk. Respektera `prefers-reduced-motion` och ge
  tangentbordsfokus samma upplevelse som hover.

## Syntes är navet — ge den en särställning

Syntes är inte en app bland de andra: den är **hjärtat i ekosystemet**, en
övergripande dashboard som tar emot information från underapparna, syntetiserar
och pumpar vidare (t.ex. säljsignal från Signal → uppgift i Todos: "sälj aktie A").

Låt det synas i din stil. De tre underapparna förhåller sig till Syntes — inte
tvärtom. Tidigare bidrag har gjort navet till kvittots inringade rad, till
himlainstrumentets lysande centrum, till telefonistens växelbord, till inslaget
som binder de tre varptrådarna till tyg och till ritningens POS. 1 — sammanställningen
som de tre detaljerna måttsätts från, till väderkartans lågtryckscentrum L, som
isobarerna sluter sig kring och de tre fronterna utgår ur, till vaxkakans dansgolv —
den enda cell som hålls TOM, eftersom den inte lagrar en sak utan en riktning — och till
fugans subjekt, den enda tonföljd som finns på bladet, som de tre andra rösterna bara är
omskrivningar av (svar, spegling, förstoring) — och till EKG-remsans sinusknuta, taktgivaren
som är den enda struktur på sidan som INTE går att avbilda, eftersom dess signal aldrig når
huden: allt man någonsin ser av navet är de tre andra; gör något
eget: en wrap kring de andra, källan de springer ur, dirigenten, blodomloppet. Detta är
tävlingens konceptuella kärna.

**Ett grepp som visat sig bära:** låt navets särställning synas redan i vilotillståndet,
inte bara vid hover — och låt den vara *mekanisk*, inte dekorativ. Det starkaste är när de
tre underapparna bär en egenskap som bevisligen kommer ur navet (en lägestolerans mot
referensplanet, ett tryck som lutar in mot L, en bäring som mättes på dansgolvet), så att
det syns att de inte kan definiera sig själva.

## Tävlingens kärna: konceptet

Studera de befintliga stilarna via `?style=<id>` (`terminal`, `editorial`,
`bank`, `singularitet`, `kvitto`, `orrery`, `vaxel`, `jacquard`, `sprangskiss`, `synop`,
`bikupa`, `fuga`, `sinus`) — inte för inspiration utan för att
**inte** återanvända deras grepp. Tolka uppgiften oväntat; en stark idé
konsekvent genomförd slår tio effekter.

## Innan du lämnar in

1. **Verifiera live:** kör dev-servern, ta skärmdumpar av grundläget + alla
   fyra hover-tillstånden (forcera `:hover` vid behov), och regressionskolla
   minst en befintlig stil.
2. **Uppdatera docs** enligt CLAUDE.md: `CHANGELOG.md`, `STATUS.md`,
   `ROADMAP.md`, `README.md` vid behov.
3. **Arkivera bidraget:** spara en representativ skärmdump (gärna med hover
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
