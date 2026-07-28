// Appregistret för showroomet. Att lägga till en app = en rad här + en post i
// stats.json (via scripts/generate-stats.mjs). `anim` väljer vilken hover-
// animation som renderas i knappen; varje stil dresserar den på sitt sätt.
export const apps = [
  {
    // Navet: den övergripande dashboarden som tar emot info från underapparna,
    // syntetiserar och pumpar vidare (t.ex. säljsignal → todo-uppgift).
    // Stilarna får gärna ge Syntes en särställning — den är hjärtat.
    id: 'syntes',
    name: 'Syntes',
    url: 'https://syntes.dev',
    tagline: 'Navet — tar emot, syntetiserar och pumpar information mellan apparna',
    anim: 'hub',
  },
  {
    id: 'signal',
    name: 'Signal',
    url: 'https://signal.syntes.dev',
    tagline: 'Finansdata & köp-/säljsignaler',
    anim: 'graph',
  },
  {
    // Appen heter Todos i portalen men bor på ethos.syntes.dev — id:t styr
    // stilarnas selektorer och stats-nyckeln, så det lämnas orört.
    id: 'todos',
    name: 'Todos',
    url: 'https://ethos.syntes.dev',
    tagline: 'Uppgifter & dagliga listor',
    anim: 'progress',
  },
  {
    id: 'stronk',
    name: 'Stronk',
    url: 'https://stronk.syntes.dev',
    tagline: 'Gympass-tracker',
    anim: 'reps',
  },
]
