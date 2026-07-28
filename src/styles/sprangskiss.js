import './sprangskiss.css'
import { makeCountEnhancer, nf } from '../shared.js'
import stats from '../data/stats.json'
import { apps } from '../apps.js'

/* Spärrhjulet (sprängskiss): sågtandad kontur — radiell skärflank in till
   bottendiametern, sedan rampen ut till nästa tand. En tand = en uppgift. */
const RATCHET = (() => {
  const cx = 40, cy = 23, ro = 17, ri = 14, n = 12
  const p = (r, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }
  let d = `M${p(ro, 0)}`
  for (let i = 0; i < n; i++) d += `L${p(ri, i)}L${p(ro, i + 1)}`
  return d + 'Z'
})()

/* Sprängskissen: sidan är ett ritningsblad. Ritningsram, zonlister, stycklista
   och namnruta injiceras här och rivs vid stilbyte — skelettets markup rörs
   inte. Stycklistan är hierarkin i klartext: POS. 1 är sammanställningen, de
   tre andra är detaljer som ingår i den. Den läser appregistret + byggtids-
   statistiken, så bladet beskriver det verkliga ekosystemet. */
const SK_PART = { syntes: 'HUVUDENHET', signal: 'SIGNALGIVARE', todos: 'SPÄRRVERK', stronk: 'FJÄDERPAKET' }
function sprangskissEnhancer() {
  const cleanups = []
  const sheet = document.createElement('div')
  sheet.className = 'sk-sheet'
  sheet.setAttribute('aria-hidden', 'true')

  const zone = (cls, items) => `<i class="sk-zone sk-zone--${cls}">${items.map((c) => `<b>${c}</b>`).join('')}</i>`
  // Stycklistan läses nedifrån och upp: rubriken sitter underst, pos. 1 närmast.
  const rows = apps.map((a, i) => ({ pos: i + 1, a })).reverse().map(({ pos, a }) => `
    <span class="sk-row" data-pos="${pos}">
      <i>${pos}</i><i>${a.name.toUpperCase()} · ${SK_PART[a.id]}</i><i>1</i><i class="sk-mon">MONT.</i>
    </span>`).join('')

  sheet.innerHTML = `
    <i class="sk-frame"></i>
    ${zone('top', ['1', '2', '3', '4', '5', '6'])}
    ${zone('bottom', ['1', '2', '3', '4', '5', '6'])}
    ${zone('left', ['A', 'B', 'C', 'D'])}
    ${zone('right', ['A', 'B', 'C', 'D'])}
    <div class="sk-block">
      <div class="sk-list">
        ${rows}
        <span class="sk-row sk-row--head"><i>POS</i><i>BENÄMNING</i><i>ANT</i><i>ANM.</i></span>
      </div>
      <div class="sk-title">
        <span class="sk-title__name">SYNTES-EKOSYSTEMET</span>
        <span class="sk-title__sub">SAMMANSTÄLLNINGSRITNING</span>
        <span class="sk-title__meta">MATERIAL ${nf.format(stats.ecosystem.lines)} RADER · ${stats.ecosystem.apps} DELAR</span>
        <span class="sk-title__meta">SKALA 1:1 · RITAD PS · ${new Date(stats.generatedAt).toLocaleDateString('sv-SE')}</span>
        <span class="sk-title__meta">RITN.NR P-0004 · REV C · BLAD 1(1)</span>
      </div>
    </div>`
  document.body.prepend(sheet)
  cleanups.push(() => sheet.remove())

  cleanups.push(makeCountEnhancer('sprangskiss')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'sprangskiss',
  label: 'Sprängskissen',
  anim: {
  syntes: `
  <div class="av" data-for="sprangskiss" aria-hidden="true">
    <div class="viz viz--montage">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <path class="axis" d="M2,23 H214" />
        <defs>
          <clipPath id="sk-cut">
            <path clip-rule="evenodd" d="M92,7 H124 V39 H92 Z M108,17.5 a5.5,5.5 0 1,0 .01,0 Z" />
          </clipPath>
        </defs>
        <g class="unit">
          <g class="hatch" clip-path="url(#sk-cut)">
            ${Array.from({ length: 12 }, (_, i) => `<line x1="${60 + i * 6}" y1="41" x2="${92 + i * 6}" y2="9" />`).join('')}
          </g>
          <rect class="cut" x="92" y="7" width="32" height="32" />
          <circle class="bore" cx="108" cy="23" r="5.5" />
        </g>
        ${[[2, 14, 18, 46], [3, 48, 14, 30], [4, 178, 18, -54]].map(([n, x, w, dx]) => `
          <g class="part" style="--dx:${dx}">
            <rect x="${x}" y="13" width="${w}" height="20" />
            <line class="ctr" x1="${x}" y1="23" x2="${x + w}" y2="23" />
            <g class="bal">
              <line x1="${x + w / 2}" y1="8" x2="${x + w / 2}" y2="12" />
              <circle cx="${x + w / 2}" cy="5" r="4.6" />
              <text x="${x + w / 2}" y="5.2">${n}</text>
            </g>
          </g>`).join('')}
        <g class="dim">
          <line class="ext" x1="60" y1="34" x2="60" y2="44" />
          <line class="ext" x1="142" y1="34" x2="142" y2="44" />
          <path class="dl" d="M60,42 H142" pathLength="100" />
          <path class="arrow" d="M60,42 l6,-2.2 v4.4 z M142,42 l-6,-2.2 v4.4 z" />
        </g>
      </svg>
      <span class="cap">3 DELAR</span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="sprangskiss" aria-hidden="true">
    <div class="viz viz--tolerans">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <text class="lbl" x="2" y="16">+0,3</text>
        <text class="lbl lbl--nom" x="2" y="28">Ø42</text>
        <text class="lbl" x="2" y="40">−0,3</text>
        <line class="lim" x1="22" y1="14" x2="214" y2="14" />
        <line class="lim" x1="22" y1="38" x2="214" y2="38" />
        <line class="nom" x1="22" y1="26" x2="214" y2="26" />
        ${[32, 29, 31, 26, 28, 23, 21, 16, 8].map((y, i) => `
          <g class="pt${i === 8 ? ' pt--out' : ''}" style="--i:${i}" transform="translate(${34 + i * 22},${y})">
            <path d="M-3.4,-3.4 L3.4,3.4 M-3.4,3.4 L3.4,-3.4" />
          </g>`).join('')}
        <circle class="flag" cx="210" cy="8" r="6.6" pathLength="100" />
      </svg>
      <span class="cap">42,41 · <b>ÖVER GRÄNS</b></span>
    </div>
  </div>`,
  todos: `
  <div class="av" data-for="sprangskiss" aria-hidden="true">
    <div class="viz viz--sparr">
      <svg viewBox="0 0 96 46" preserveAspectRatio="xMidYMid meet">
        <g class="wheel">
          <path class="teeth" d="${RATCHET}" />
          <circle class="hub" cx="40" cy="23" r="4" />
        </g>
        <path class="ctr" d="M40,2 V44 M19,23 H61" />
        <g class="pawl">
          <line class="arm" x1="80" y1="6" x2="49" y2="14" />
          <circle class="pin" cx="80" cy="6" r="2.4" />
        </g>
        <path class="arc" d="M40,23 m0,-22 a22,22 0 0 0 -11,2.95" pathLength="100" />
        <text class="lbl" x="66" y="35">30°</text>
      </svg>
      <span class="cap">SPÄRR <b class="count" data-to="3" data-suffix="/3">0/3</b></span>
    </div>
  </div>`,
  stronk: `
  <div class="av" data-for="sprangskiss" aria-hidden="true">
    <div class="viz viz--last">
      <svg viewBox="0 0 140 46" preserveAspectRatio="xMidYMid meet">
        <g class="press">
          <path class="arrow" d="M70,1 V8 M70,12 l-3.2,-4.4 h6.4 z" />
          <text class="lbl" x="77" y="8">F</text>
          <rect class="plate" x="48" y="13" width="44" height="5" />
        </g>
        <path class="coil" d="M70,18 L52,22 L88,26 L52,30 L88,34 L52,38 L70,42" />
        <line class="ground" x1="24" y1="42" x2="116" y2="42" />
        <path class="fix" d="${Array.from({ length: 10 }, (_, i) => `M${26 + i * 9},45.6 l3.6,-3.6`).join(' ')}" />
        <g class="dim">
          <line class="ext" x1="94" y1="15.5" x2="110" y2="15.5" />
          <line class="ext" x1="118" y1="42" x2="110" y2="42" />
          <path class="dl" d="M105,15.5 V42" pathLength="100" />
          <path class="arrowhead" d="M105,15.5 l-2.2,6 h4.4 z M105,42 l-2.2,-6 h4.4 z" />
          <text class="lbl" x="112" y="31">h</text>
        </g>
      </svg>
      <span class="cap">PROV 3/3 · F = <b class="count" data-to="1200" data-suffix=" N">0 N</b></span>
    </div>
  </div>`,
  },
  enhancer: sprangskissEnhancer,
}
