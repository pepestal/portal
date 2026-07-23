// Appregistret för showroomet. Att lägga till en app = en rad här + en post i
// stats.json (via scripts/generate-stats.mjs). `anim` väljer vilken hover-
// animation som renderas i knappen; varje stil dresserar den på sitt sätt.
export const apps = [
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
