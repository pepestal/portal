// Stilregistret. Varje stil är rent CSS-driven: `main.js` sätter
// `data-style="<id>"` på <html>, och `src/style.css` bär palett, typografi och
// animationsuttryck under `[data-style="<id>"]`. Att lägga till en ny stil =
// en rad här + ett token/animations-block i style.css.
//
// Skelettet står still för alla stilar UTOM `orrery`: den är en helscen som
// medvetet ersätter skelettet (döljer knappkolumn + systemhälsa via CSS och
// bygger en egen scen i `src/orrery.js`). Undantaget är förankrat — se
// docs/STATUS.md och CHANGELOG.md.
export const styles = [
  { id: 'terminal',     label: 'Terminal Modernism' },
  { id: 'editorial',    label: 'Editorial Light' },
  { id: 'bank',         label: 'Private Bank' },
  { id: 'singularitet', label: 'Singularitet' },
  { id: 'kvitto',       label: 'Kvittot' },
  { id: 'orrery',       label: 'Orrery' },
  { id: 'vaxel',        label: 'Växeln' },
  { id: 'jacquard',     label: 'Jacquardväven' },
]

export const DEFAULT_STYLE = 'terminal'
