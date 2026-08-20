import './jacquard.css'
import { makeCountEnhancer } from '../shared.js'

/* Jacquardväven: sidan är uppspänd i en vävstol. Tre färgade varptrådar löper
   lodrätt bakom hela knappkolumnen (syns i gliporna mellan panelerna) — de tre
   underapparna, parallella och utan kontakt. Navet får det enda som går på
   tvären: ett inslag tvärs över hela sidan med en skyttel som far igenom
   Syntes-panelen. Allt injiceras här och rivs vid stilbyte. */
function jacquardEnhancer() {
  const cleanups = []

  // Varpen: tre trådar i krapp, vejde och reseda — en per underapp.
  const loom = document.createElement('div')
  loom.className = 'jq-loom'
  loom.setAttribute('aria-hidden', 'true')
  loom.innerHTML = `<i class="jq-column">${[
    ['22%', '#A03A28', '.59s'],
    ['50%', '#2C4A7E', '.75s'],
    ['78%', '#7C6A1C', '.91s'],
  ].map(([x, c, d]) => `<i class="th" style="--x:${x};--c:${c};--d:${d}"></i>`).join('')}</i>`
  document.body.prepend(loom)
  cleanups.push(() => loom.remove())

  // Inslaget: navets tvärlinje genom hela sidan + skytteln som binder trådarna.
  const hub = document.querySelector('.app-row[data-app="syntes"]')
  if (hub) {
    const weft = document.createElement('span')
    weft.className = 'jq-weft'
    weft.setAttribute('aria-hidden', 'true')
    weft.innerHTML = '<i class="line"></i><i class="shuttle"></i>'
    hub.appendChild(weft)
    cleanups.push(() => weft.remove())
  }

  cleanups.push(makeCountEnhancer('jacquard')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'jacquard',
  label: 'Jacquardväven',
  anim: {
  syntes: `
  <div class="av" data-for="jacquard" aria-hidden="true">
    <div class="viz viz--vav">
      <span class="loom">
        <i class="tyg"></i>
        <i class="warp" style="--x:18%;--c:#A03A28;--i:0"></i>
        <i class="warp" style="--x:50%;--c:#2C4A7E;--i:1"></i>
        <i class="warp" style="--x:82%;--c:#7C6A1C;--i:2"></i>
        <i class="skyttel"></i>
      </span>
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
  },
  enhancer: jacquardEnhancer,
}
