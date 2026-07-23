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
    url: '#',
    tagline: 'Navet — tar emot, syntetiserar och pumpar information mellan apparna',
    anim: 'hub',
  },
  {
    id: 'signal',
    name: 'Signal',
    url: '#',
    tagline: 'Finansdata & köp-/säljsignaler',
    anim: 'graph',
  },
  {
    id: 'todos',
    name: 'Todos',
    url: '#',
    tagline: 'Uppgifter & dagliga listor',
    anim: 'progress',
  },
  {
    id: 'stronk',
    name: 'Stronk',
    url: '#',
    tagline: 'Gympass-tracker',
    anim: 'reps',
  },
]
