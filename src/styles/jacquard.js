import './jacquard.css'
import { makeCountEnhancer } from '../shared.js'
import { apps } from '../apps.js'

/* Jacquardväven: sidan är uppspänd i en vävstol. En färgad varptråd per app
   löper lodrätt bakom hela knappkolumnen (syns i gliporna mellan panelerna) —
   parallella och jämnstarka. Inslaget hör till väven, inte till någon app: ett
   skott far tvärs över hela sidan när vilken tråd som helst hovras. Syntes
   tråd är avklippt och stannar halvvägs. Allt injiceras här och rivs vid
   stilbyte. */
const VARPFARG = {
  syntes: '#8A7C60', signal: '#A03A28', ethos: '#2C4A7E',
  hexis: '#7C6A1C', scales: '#7E2C50', sersys: '#2C6E5E',
}

function jacquardEnhancer() {
  const cleanups = []

  // Varpen: en tråd per app, jämnt fördelade över kolumnens bredd.
  const loom = document.createElement('div')
  loom.className = 'jq-loom'
  loom.setAttribute('aria-hidden', 'true')
  const tradar = apps.map((a, i) => {
    const x = `${((i + 0.5) / apps.length * 100).toFixed(1)}%`
    const d = `${(0.45 + i * 0.13).toFixed(2)}s`
    return `<i class="th${a.dormant ? ' th--av' : ''}" style="--x:${x};--c:${VARPFARG[a.id]};--d:${d}"></i>`
  }).join('')
  loom.innerHTML = `<i class="jq-column">${tradar}
    <span class="jq-weft"><i class="line"></i><i class="shuttle"></i></span>
  </i>`
  document.body.prepend(loom)
  cleanups.push(() => loom.remove())

  cleanups.push(makeCountEnhancer('jacquard')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'jacquard',
  label: 'Jacquardväven',
  anim: {
  syntes: `
  <div class="av" data-for="jacquard" aria-hidden="true">
    <div class="viz viz--avklippt">
      <span class="loom">
        <i class="stump"></i>
        <i class="andar">${[0, 1, 2, 3, 4, 5].map((i) => `<i style="--i:${i}"></i>`).join('')}</i>
      </span>
      <span class="cap">VARPSTOPP</span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="jacquard" aria-hidden="true">
    <div class="viz viz--strang">
      <span class="string">
        <svg viewBox="0 0 200 34" preserveAspectRatio="none">
          <path class="rest" d="M0,17 H200" />
          <path class="wave" d="M0,17 Q100,-24 200,17" />
        </svg>
      </span>
      <span class="read">spänning <b class="count" data-to="512" data-suffix=" cN">0 cN</b></span>
    </div>
  </div>`,
  ethos: `
  <div class="av" data-for="jacquard" aria-hidden="true">
    <div class="viz viz--halkort">
      <span class="card">
        ${[['22%', '30%'], ['46%', '68%'], ['74%', '30%']].map(([x, y], i) => `
          <i class="hole" style="--x:${x};--y:${y};--i:${i}"></i>`).join('')}
      </span>
      <span class="cap">3 hål</span>
    </div>
  </div>`,
  hexis: `
  <div class="av" data-for="jacquard" aria-hidden="true">
    <div class="viz viz--trampa">
      <span class="rig">
        <i class="skaft">
          <i class="solv" style="--x:22%"></i>
          <i class="solv" style="--x:50%"></i>
          <i class="solv" style="--x:78%"></i>
        </i>
        <i class="trampa"></i>
      </span>
      <span class="cap"><b class="count" data-to="12" data-suffix=" skott">0 skott</b></span>
    </div>
  </div>`,
  scales: `
  <div class="av" data-for="jacquard" aria-hidden="true">
    <div class="viz viz--kypert">
      <span class="rutnat">
        ${Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, k) =>
          `<i class="ruta${(k - r + 8) % 4 < 3 ? ' ruta--bind' : ''}" style="--i:${r * 8 + k}"></i>`).join('')).join('')}
      </span>
      <span class="cap">3/1 KYPERT</span>
    </div>
  </div>`,
  sersys: `
  <div class="av" data-for="jacquard" aria-hidden="true">
    <div class="viz viz--granskning">
      <span class="bana">
        <i class="tyg"></i>
        <i class="knut"></i>
      </span>
      <span class="cap"><b class="count" data-to="1" data-suffix=" fel · 14 m">0 fel · 14 m</b></span>
    </div>
  </div>`,
  },
  enhancer: jacquardEnhancer,
}
