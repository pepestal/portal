// Stilregistret. Varje stil är rent CSS-driven: `main.js` sätter
// `data-style="<id>"` på <html>, och `src/style.css` bär palett, typografi och
// animationsuttryck under `[data-style="<id>"]`. Att lägga till en ny stil =
// en rad här + ett token/animations-block i style.css. Skelettet rörs aldrig.
export const styles = [
  { id: 'terminal',  label: 'Terminal Modernism' },
  { id: 'editorial', label: 'Editorial Light' },
  { id: 'bank',      label: 'Private Bank' },
]

export const DEFAULT_STYLE = 'terminal'
