// Appregistret för showroomet. Att lägga till en app = en rad här + en post i
// stats.json (via scripts/generate-stats.mjs). `anim` är en etikett för vilken
// sorts rörelse knappen bär; varje stil dresserar den på sitt sätt.
//
// `dormant: true` betyder att platsen finns kvar men att det inte ligger någon
// app bakom den. Kortet renderas utan länk (se `appRow` i main.js) — det är
// ärligare än att länka till en 404.
export const apps = [
  {
    // Syntes var händelsenavet fram till 2026-08-20, då bussen revs: containrar,
    // databas, Caddy-block, Authelia-regel och tunnelrutter är borta och
    // syntes.dev svarar 404. Platsen står kvar för att den ska fyllas igen.
    // Stilarna ska INTE ge Syntes en särställning — det finns inget nav längre.
    id: 'syntes',
    name: 'Syntes',
    url: 'https://syntes.dev',
    tagline: 'Vilande — platsen står kvar, appen bakom den är riven',
    anim: 'dormant',
    dormant: true,
  },
  {
    id: 'signal',
    name: 'Signal',
    url: 'https://signal.syntes.dev',
    tagline: 'Finansdata & köp-/säljsignaler',
    anim: 'graph',
  },
  {
    id: 'ethos',
    name: 'Ethos',
    url: 'https://ethos.syntes.dev',
    tagline: 'Uppgifter & dagliga listor',
    anim: 'progress',
  },
  {
    // Hette Stronk fram till 2026-08-20 (stronk#17). Adressen och repot bytte
    // inte namn — bara appen.
    id: 'hexis',
    name: 'Hexis',
    url: 'https://stronk.syntes.dev',
    tagline: 'Gympass & program',
    anim: 'reps',
  },
  {
    id: 'scales',
    name: 'scales',
    url: 'https://scales.syntes.dev',
    tagline: 'Övningslogg för piano',
    anim: 'scale',
  },
  {
    id: 'sersys',
    name: 'ser/sys',
    url: 'https://sys.syntes.dev',
    tagline: 'Serverns statussida & notiscentrum',
    anim: 'pulse',
  },
]

/** Ordningen som stilarna ska räkna med. Sex kort, ett av dem vilande. */
export const appIds = apps.map((a) => a.id)
export const appById = Object.fromEntries(apps.map((a) => [a.id, a]))
export const liveApps = apps.filter((a) => !a.dormant)
