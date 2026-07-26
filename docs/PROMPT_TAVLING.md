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
himlainstrumentets lysande centrum, till telefonistens växelbord och till
inslaget som binder de tre varptrådarna till tyg; gör något eget: en wrap kring
de andra, källan de springer ur, dirigenten, blodomloppet. Detta är tävlingens
konceptuella kärna.

## Tävlingens kärna: konceptet

Studera de befintliga stilarna via `?style=<id>` (`terminal`, `editorial`,
`bank`, `singularitet`, `kvitto`, `orrery`, `vaxel`, `jacquard`) — inte för inspiration utan för att
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
