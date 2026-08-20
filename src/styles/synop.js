import './synop.css'
import { makeCountEnhancer, nf } from '../shared.js'
import stats from '../data/stats.json'
import { apps } from '../apps.js'

/* Frontsymboler (synop). Kartans grammatik: kallfront bär trianglar, varmfront
   halvcirklar, ocklusionen varannan — alltid på linjens ena sida. Symbolerna
   läggs vinkelrätt mot linjen så en front kan dras i vilken riktning som helst
   och ändå se rätt ut. */
function frontSyms(x1, y1, x2, y2, kind, n, w = 2.7, h = 4.4) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
  const ux = dx / len, uy = dy / len
  const nx = uy, ny = -ux // symbolsidan; med detta val bukar halvcirkeln åt sweep 1
  const r = (v) => v.toFixed(1)
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.85) / (n + 0.55)
    const px = x1 + dx * t, py = y1 + dy * t
    const [ax, ay] = [px - ux * w, py - uy * w]
    const [bx, by] = [px + ux * w, py + uy * w]
    return (kind === 'kall' || (kind === 'ock' && i % 2 === 0))
      ? `<path class="sym sym--kall" style="--i:${i}" d="M${r(ax)},${r(ay)} L${r(px + nx * h)},${r(py + ny * h)} L${r(bx)},${r(by)} Z" />`
      : `<path class="sym sym--varm" style="--i:${i}" d="M${r(ax)},${r(ay)} A${w},${w} 0 0 1 ${r(bx)},${r(by)}" />`
  }).join('')
}

/* Vindpilen (synop): fjädrar på skaftets ena sida — halvfjäder 5 knop, hel 10,
   vimpel 50. Summan här är 95 knop; över 64 heter det orkan. */
const BARB = (() => {
  const x1 = 22, y1 = 38, x2 = 124, y2 = 7
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
  const ux = dx / len, uy = dy / len
  const nx = uy, ny = -ux
  const r = (v) => v.toFixed(1)
  return [['half', .34], ['full', .48], ['full', .60], ['full', .72], ['vimpel', .84]]
    .map(([kind, t], i) => {
      const px = x1 + dx * t, py = y1 + dy * t
      if (kind === 'vimpel') {
        return `<path class="fj fj--vimpel" style="--i:${i}" d="M${r(px)},${r(py)} L${r(px + nx * 16)},${r(py + ny * 16)} L${r(px + ux * 14)},${r(py + uy * 14)} Z" />`
      }
      const L = kind === 'full' ? 16 : 8.5
      return `<line class="fj" style="--i:${i}" x1="${r(px)}" y1="${r(py)}"
                    x2="${r(px + nx * L - ux * L * .42)}" y2="${r(py + ny * L - uy * L * .42)}" />`
    }).join('')
})()

/* Synoptiken: sidan är en ytkarta. Kartunderlaget (kust, graticule-kryss) och
   analysen (isobarer, fronter, stationer, namnruta) injiceras här och rivs vid
   stilbyte — skelettets markup rörs inte.

   Analysen är centrerad på SYNTES-raden och inget annat: isobarerna är slutna
   kurvor kring den, de tre fronterna utgår ur den, och observationerna dras in
   mot den när navet hovras. Därför mäts navets läge i DOM:en och skrivs till
   --lx/--ly; allt annat är polärt uttryckt kring den punkten. */
const SY_COAST = `M1600,58 C1502,84 1454,120 1420,158 C1384,198 1398,236 1362,268
  C1324,302 1340,346 1302,378 C1260,414 1274,458 1234,492 C1192,528 1206,574 1164,608
  C1120,644 1132,692 1090,726 C1046,762 1056,812 1012,848 C970,882 980,934 942,966
  L930,1000 L1600,1000 Z`
const SY_LAND2 = `M0,872 C62,860 120,878 170,858 C216,840 250,866 298,878 C336,888 354,926 342,1000 L0,1000 Z`
const SY_GRAT = (() => {
  let d = ''
  for (let x = 96; x < 1600; x += 188) for (let y = 74; y < 1000; y += 154) d += `M${x - 5},${y}h10M${x},${y - 5}v10`
  return d
})()
/* De tre fronterna, uttryckta från navet: typ, riktning, längd, antal symboler. */
const SY_FRONTS = [
  ['ock', 'hexis', 234, 330, 4],
  ['varm', 'ethos', 24, 470, 5],
  ['kall', 'signal', 146, 560, 6],
]
/* Stationsobservationer: polärt kring navet, så strålarna in mot L blir raka. */
const SY_OBS = [
  ['1008', 170, 500], ['1006', 16, 505], ['1002', 124, 690],
  ['1000', 54, 660], ['1010', 300, 470],
]
function syFrontSvg(kind, len, n) {
  const y = 15
  return `<svg viewBox="0 0 ${len} 30" width="${len}" height="30" aria-hidden="true">
    <line class="ln" x1="0" y1="${y}" x2="${len}" y2="${y}" pathLength="100" />
    ${frontSyms(0, y, len, y, kind, n, 6.4, 10)}
  </svg>`
}
function synopEnhancer() {
  const cleanups = []
  const chart = document.createElement('div')
  chart.className = 'sy-chart'
  chart.setAttribute('aria-hidden', 'true')

  const key = (kind) => `<i class="k"><svg viewBox="0 0 34 12">
    <line class="ln" x1="0" y1="9" x2="34" y2="9" />${frontSyms(0, 9, 34, 9, kind, 2, 3.4, 5.4)}</svg></i>`

  chart.innerHTML = `
    <svg class="sy-map" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <path class="sy-land" d="${SY_COAST}" />
      <path class="sy-land" d="${SY_LAND2}" />
      <path class="sy-grat" d="${SY_GRAT}" />
    </svg>
    <div class="sy-system">
      ${[988, 992, 996, 1000, 1004].map((hpa, i) => `
        <i class="sy-iso" style="--i:${i};--r:${300 + i * 168}px;--tilt:${-5 - i * 3.5}deg"><b>${hpa}</b></i>`).join('')}
      ${SY_FRONTS.map(([kind, app, ang, len, n]) => `
        <i class="sy-front sy-front--${kind}" data-app="${app}" style="--ang:${ang}deg;--len:${len}px">
          ${syFrontSvg(kind, len, n)}
        </i>`).join('')}
      ${SY_OBS.map(([p, a, d]) => `
        <i class="sy-ray" style="--a:${a}deg;--d:${d}px"></i>
        <i class="sy-obs" style="--a:${a}deg;--d:${d}px">
          <svg viewBox="0 0 38 26"><circle cx="11" cy="17" r="5.4" /><line x1="11" y1="17" x2="31" y2="7" />
            <line x1="27" y1="9" x2="24.5" y2="1.5" /></svg><b>${p}</b>
        </i>`).join('')}
    </div>
    <i class="sy-eye"><b>L</b><span>984</span></i>
    <div class="sy-block">
      <div class="sy-head">
        <span class="sy-head__t">SYNOPTISK ANALYS · YTKARTA</span>
        <span class="sy-head__m">GILTIG <span class="sy-utc">—</span> UTC · ISOBARER VAR 4 hPa</span>
      </div>
      <div class="sy-legend">
        ${SY_FRONTS.map(([kind, app]) => `
          <span class="sy-leg" data-app="${app}">${key(kind)}
            <i>${{ kall: 'KALLFRONT', varm: 'VARMFRONT', ock: 'OCKLUSION' }[kind]}</i>
            <i>${app.toUpperCase()}</i><u>→ L</u></span>`).join('')}
        <span class="sy-leg sy-leg--nav" data-app="syntes"><i class="k k--l">L</i>
          <i>CENTRUM 984 hPa</i><i>SYNTES</i><u>NAV</u></span>
      </div>
      <div class="sy-foot">
        <span>${stats.ecosystem.apps} STATIONER · ${nf.format(stats.ecosystem.lines)} RADER OBSERVATION</span>
      </div>
    </div>`
  document.body.prepend(chart)
  cleanups.push(() => chart.remove())

  // Analysens centrum = navets rad. Mäts om när layouten kan ha flyttat den.
  const hub = document.querySelector('.app-row[data-app="syntes"]')
  const place = () => {
    const r = hub.getBoundingClientRect()
    chart.style.setProperty('--lx', `${Math.round(r.left + r.width / 2)}px`)
    chart.style.setProperty('--ly', `${Math.round(r.top + r.height / 2)}px`)
  }
  place()
  addEventListener('resize', place)
  cleanups.push(() => removeEventListener('resize', place))

  // Kartan är alltid giltig vid en tidpunkt — den skrivs ut i namnrutan.
  const utc = chart.querySelector('.sy-utc')
  const tick = () => {
    const d = new Date()
    utc.textContent = `${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  }
  tick()
  const timer = setInterval(tick, 30000)
  cleanups.push(() => clearInterval(timer))

  cleanups.push(makeCountEnhancer('synop')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'synop',
  label: 'Synoptiken',
  anim: {
  syntes: `
  <div class="av" data-for="synop" aria-hidden="true">
    <div class="viz viz--lagtryck">
      <svg viewBox="0 0 216 48" preserveAspectRatio="xMidYMid meet">
        <g class="sys">
          ${[[54, 22], [39, 15.5], [25, 9.5]].map(([rx, ry], i) => `
            <ellipse class="iso" style="--i:${i}" cx="108" cy="24" rx="${rx}" ry="${ry}"
                     pathLength="100" transform="rotate(-9 108 24)" />`).join('')}
          <g class="fr fr--ock"><line x1="108" y1="24" x2="46" y2="6" pathLength="100" />${frontSyms(108, 24, 46, 6, 'ock', 3)}</g>
          <g class="fr fr--kall"><line x1="108" y1="24" x2="30" y2="42" pathLength="100" />${frontSyms(108, 24, 30, 42, 'kall', 4)}</g>
          <g class="fr fr--varm"><line x1="108" y1="24" x2="192" y2="34" pathLength="100" />${frontSyms(108, 24, 192, 34, 'varm', 3)}</g>
        </g>
        <text class="eye" x="108" y="24">L</text>
      </svg>
      <span class="cap">L 984 hPa · <b class="count" data-to="3" data-suffix=" FRONTER">0 FRONTER</b></span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="synop" aria-hidden="true">
    <div class="viz viz--frontpassage">
      <span class="scene">
        <i class="kalluft"></i>
        <i class="stn"></i>
        <span class="front">
          <svg viewBox="0 0 16 44" preserveAspectRatio="none">
            <line x1="8" y1="0" x2="8" y2="44" />
            ${[7, 22, 37].map((y) => `<path d="M8,${y - 5} L15,${y} L8,${y + 5} Z" />`).join('')}
          </svg>
        </span>
        <span class="obs obs--fore">SV 6 m/s · +14° · 1014 hPa ↗</span>
        <span class="obs obs--efter">NV 17 m/s · +6° · 1002 hPa ↘ <b>SÄLJ</b></span>
      </span>
    </div>
  </div>`,
  ethos: `
  <div class="av" data-for="synop" aria-hidden="true">
    <div class="viz viz--oktas">
      <span class="sky">
        ${[0, 1, 2].map((i) => `
          <span class="okta" style="--i:${i}">
            <svg viewBox="0 0 28 28" aria-hidden="true">
              <circle class="ring" cx="14" cy="14" r="10.5" />
              <circle class="f8" cx="14" cy="14" r="10.5" />
              <path class="f4" d="M14,3.5 A10.5,10.5 0 0 1 14,24.5 Z" />
              <line class="f4 bar" x1="14" y1="3.5" x2="14" y2="24.5" />
            </svg>
            <i class="n"><b class="n8">8</b><b class="n4">4</b><b class="n0">0</b></i>
          </span>`).join('')}
      </span>
      <span class="cap">UPPKLARNANDE · <b class="count" data-to="3" data-suffix="/3">0/3</b></span>
    </div>
  </div>`,
  hexis: `
  <div class="av" data-for="synop" aria-hidden="true">
    <div class="viz viz--vindpil">
      <svg viewBox="0 0 152 46" preserveAspectRatio="xMidYMid meet">
        <circle class="stn" cx="22" cy="38" r="4.6" />
        <line class="shaft" x1="22" y1="38" x2="124" y2="7" pathLength="100" />
        ${BARB}
        <text class="kt" x="132" y="12">95 kt</text>
      </svg>
      <span class="cap"><b class="count" data-to="12" data-suffix=" BEAUFORT">0 BEAUFORT</b></span>
    </div>
  </div>`,
  },
  enhancer: synopEnhancer,
}
