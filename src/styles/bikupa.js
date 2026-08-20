import './bikupa.css'
import { makeCountEnhancer, nf } from '../shared.js'
import stats from '../data/stats.json'
import { apps } from '../apps.js'

/* Kupans grammatik (bikupa). På en lodrät vaxkaka betyder "rakt upp" = mot
   solen; en flygvinkel α mot lodlinjen ÄR alltså en kompassriktning. Referensen
   är solen — en yttre punkt, inte en av cellerna — så varje cell kan bära sin
   egen bäring utan att någon annan cell ger den. Samma bäringar används i
   knappens hover, i hörnetiketterna och i sidans flygvektorer; kartan och
   cellen måste säga samma sak. */
const BK_BARING = { signal: 40, ethos: 155, hexis: 268, scales: 92, sersys: 315 }
const bkDir = (deg) => [Math.sin(deg * Math.PI / 180), -Math.cos(deg * Math.PI / 180)]
/* Dansens varv: rak svansrun A→B, återvändande slinga åt höger, samma run igen,
   slinga åt vänster. Ett slutet varv — därför kan biet löpa det i all oändlighet. */
const BK_DANS = 'M100.3,35.2 L115.7,16.8 C136,9 154,20 148,30 C142,40 115,43 100.3,35.2 '
  + 'L115.7,16.8 C93,7 68,13 70,26 C72,37 89,39 100.3,35.2 Z'
/* Bin som lämnar kakan i var sin bäring. */
const BK_FOLJARE = [['signal', 190, 13], ['ethos', 186, 31], ['hexis', 24, 21]].map(([app, x, y]) => {
  const [dx, dy] = bkDir(BK_BARING[app])
  const r = (v) => v.toFixed(1)
  return `<g class="foljare" data-app="${app}">
    <ellipse cx="${x}" cy="${y}" rx="3" ry="2.2" />
    <line x1="${r(x + dx * 4.5)}" y1="${r(y + dy * 4.5)}" x2="${r(x + dx * 13)}" y2="${r(y + dy * 13)}" />
  </g>`
}).join('')
/* Solmärket överst: referensriktningen som hela dansen mäts mot. */
const BK_SOL = Array.from({ length: 8 }, (_, i) => {
  const a = (i * 45) * Math.PI / 180
  const r = (v) => v.toFixed(1)
  return `<line x1="${r(108 + 3.6 * Math.cos(a))}" y1="${r(5 + 3.6 * Math.sin(a))}"
                x2="${r(108 + 5.6 * Math.cos(a))}" y2="${r(5 + 5.6 * Math.sin(a))}" />`
}).join('')
/* Sexkantig cell, spetsen uppåt — så sitter de i en lodrät kaka: två lodräta
   väggar att bära lasten med, spets upp och ned. */
const BK_ROT3 = Math.sqrt(3)
const bkCell = (cx, cy, R) => {
  const w = R * BK_ROT3 / 2
  const p = [[cx, cy - R], [cx + w, cy - R / 2], [cx + w, cy + R / 2], [cx, cy + R], [cx - w, cy + R / 2], [cx - w, cy - R / 2]]
  return p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

/* Bikupan: sidan är en vaxkaka som hänger i sin ram. Kakan (cellrutnätet),
   yngelvärmen, solmärket och flygvektorerna injiceras här och rivs vid stilbyte
   — skelettets markup rörs inte.

   Solmärket sitter överst på kakan och är referensen allt mäts mot. Varje
   levande cell skickar ut sin egen flygvektor i sin bäring — bäringen kommer
   ur solen, inte ur en annan cell. Syntes cell är byggd men aldrig fylld: den
   har ingen bäring, och därför ritas ingen vektor ur den. */
const BK_RUTT = [
  ['signal', 1, 300], // bäring 40° — nektar
  ['ethos', -1, 300], // bäring 155° — yngel
  ['hexis', 1, 520], // bäring 268° — pollen
  ['scales', -1, 420], // bäring 92° — hartsdrag
  ['sersys', 1, 380], // bäring 315° — vakt
]
const BK_KM = { signal: '1,4 km', ethos: '0,3 km', hexis: '2,2 km', scales: '0,9 km', sersys: '1,7 km' }
/* Kakans cellrutnät som ett kaklingsbart mönster: sju sexkanter räcker — de som
   skjuter utanför rutan möts av grannrutans motsvarigheter och sluts till kaka. */
function bkPattern(R = 26) {
  const w = R * BK_ROT3
  const hex = (cx, cy) => {
    const h = w / 2
    return `M${(cx).toFixed(2)},${(cy - R).toFixed(2)} L${(cx + h).toFixed(2)},${(cy - R / 2).toFixed(2)} `
      + `L${(cx + h).toFixed(2)},${(cy + R / 2).toFixed(2)} L${(cx).toFixed(2)},${(cy + R).toFixed(2)} `
      + `L${(cx - h).toFixed(2)},${(cy + R / 2).toFixed(2)} L${(cx - h).toFixed(2)},${(cy - R / 2).toFixed(2)} Z`
  }
  const d = [[0, 0], [w, 0], [w / 2, R * 1.5], [-w / 2, R * 1.5], [w * 1.5, R * 1.5], [0, R * 3], [w, R * 3]]
    .map(([x, y]) => hex(x, y)).join(' ')
  return { w, h: R * 3, d }
}
function bikupaEnhancer() {
  const cleanups = []
  const pat = bkPattern()
  const hive = document.createElement('div')
  hive.className = 'bk-hive'
  hive.setAttribute('aria-hidden', 'true')
  hive.innerHTML = `
    <i class="bk-list">
      <b>KUPA 4 · RAM 1/1</b>
      <b>${stats.ecosystem.apps} CELLER I BRUK · ${nf.format(stats.ecosystem.lines)} RADER FODER</b>
      <b class="bk-grad">35,0 °C</b>
    </i>
    <svg class="bk-kaka" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bk-celler" width="${pat.w.toFixed(2)}" height="${pat.h.toFixed(2)}" patternUnits="userSpaceOnUse">
          <path d="${pat.d}" />
        </pattern>
        <pattern id="bk-fyllda" width="${pat.w.toFixed(2)}" height="${pat.h.toFixed(2)}" patternUnits="userSpaceOnUse">
          <path class="fylld" d="${pat.d}" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bk-celler)" />
      <rect class="bk-foder" width="100%" height="100%" fill="url(#bk-fyllda)" />
    </svg>
    <i class="bk-varme"></i>
    <i class="bk-sol"><b>☀</b><span>SOLEN · 0°</span><u></u></i>
    <svg class="bk-flyg" xmlns="http://www.w3.org/2000/svg"></svg>`
  document.body.prepend(hive)
  cleanups.push(() => hive.remove())

  /* Bäringarna dras från dansgolvets cellvägg ut till var sin cell. Bågen är
     flygvägen, inte ett organisationsschema — därför buktar den ut åt sidan. */
  const flyg = hive.querySelector('.bk-flyg')
  const btn = (id) => document.querySelector(`.app-row[data-app="${id}"] .app-btn`)
  const place = () => {
    /* Värmen sitter mitt i kakan, inte i en cell — yngeltemperaturen är kupans,
       inte någon enskild apps. */
    const alla = [...document.querySelectorAll('.app-row .app-btn')].map((e) => e.getBoundingClientRect())
    if (!alla.length) return
    hive.style.setProperty('--hx', `${Math.round(alla.reduce((s, r) => s + r.left + r.width / 2, 0) / alla.length)}px`)
    hive.style.setProperty('--hy', `${Math.round(alla.reduce((s, r) => s + r.top + r.height / 2, 0) / alla.length)}px`)
    flyg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`)
    flyg.innerHTML = BK_RUTT.map(([app, side, bulge]) => {
      const t = btn(app)?.getBoundingClientRect()
      if (!t) return ''
      /* Vektorn startar i cellens egen vägg och går ut i dess bäring. */
      const sx = side > 0 ? t.right : t.left
      const hy = t.top + t.height / 2
      const [dx, dy] = bkDir(BK_BARING[app])
      const ex = sx + dx * 120 * (side > 0 ? 1 : 1)
      const ey = hy + dy * 120
      /* Bågen buktar vinkelrätt mot flygriktningen — det är en flygväg, inte
         ett organisationsschema, så den ska inte peka rakt. */
      const b = bulge / 6 * side
      const cx = (sx + ex) / 2 - dy * b
      const cy = (hy + ey) / 2 + dx * b
      const mx = (sx + 2 * cx + ex) / 4
      const my = (hy + 2 * cy + ey) / 4
      return `<g class="bk-r" data-app="${app}">
        <path class="ln" d="M${sx.toFixed(1)},${hy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" pathLength="100" />
        <path class="sp" d="M${ex.toFixed(1)},${ey.toFixed(1)} l${side > 0 ? 8 : -8},-4.5 v9 z" />
        <text x="${mx.toFixed(1)}" y="${my.toFixed(1)}">α ${BK_BARING[app]}° · ${BK_KM[app]}</text>
      </g>`
    }).join('')
  }
  place()
  addEventListener('resize', place)
  cleanups.push(() => removeEventListener('resize', place))

  cleanups.push(makeCountEnhancer('bikupa')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'bikupa',
  label: 'Bikupan',
  anim: {
  /* Den obesatta cellen: byggd i vax, aldrig fylld. Ingen dans, ingen bäring,
     inget bi. Bara sexkanten och solen som referens den aldrig mättes mot. */
  syntes: `
  <div class="av" data-for="bikupa" aria-hidden="true">
    <div class="viz viz--obesatt">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <g class="ref">
          <line class="lod" x1="108" y1="10" x2="108" y2="43" />
          <g class="sol"><circle cx="108" cy="5" r="2.2" />${BK_SOL}</g>
        </g>
        <polygon class="tomcell" points="${bkCell(108, 27, 13)}" />
      </svg>
      <span class="cap">TOM CELL</span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="bikupa" aria-hidden="true">
    <div class="viz viz--nektar">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <defs><clipPath id="bk-falt"><circle cx="26" cy="22" r="15" /></clipPath></defs>
        <g clip-path="url(#bk-falt)">
          <rect class="skugga" x="11" y="7" width="30" height="30" />
          <line class="grans" x1="9" y1="7" x2="43" y2="7" />
        </g>
        <circle class="falt" cx="26" cy="22" r="15" />
        <g class="skala">
          <line class="axel" x1="60" y1="30" x2="208" y2="30" />
          ${[10, 20, 30, 40, 50].map((v) => {
            const x = 60 + (v - 10) * 3.7
            return `<line class="tick" x1="${x}" y1="26" x2="${x}" y2="30" /><text class="num" x="${x}" y="40">${v}</text>`
          }).join('')}
          <line class="troskel" x1="134" y1="16" x2="134" y2="33" />
          <text class="tlbl" x="134" y="12">TRÖSKEL</text>
          <g class="pekare"><path d="M0,-2 l3.6,-5.4 h-7.2 z" /></g>
        </g>
      </svg>
      <span class="cap">SOCKERHALT <b class="count" data-to="46" data-suffix=" %">0 %</b></span>
    </div>
  </div>`,
  ethos: `
  <div class="av" data-for="bikupa" aria-hidden="true">
    <div class="viz viz--forsegling">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <defs>
          ${[66, 108, 150].map((cx, i) => `
            <clipPath id="bk-lock-${i}"><rect class="sv" x="${cx - 16}" y="4" width="32" height="38" /></clipPath>`).join('')}
        </defs>
        ${[[66, 'PULL'], [108, 'TEST'], [150, 'DEPL']].map(([cx, t], i) => `
          <g class="cell" style="--i:${i}">
            <polygon class="vagg" points="${bkCell(cx, 21, 16)}" />
            <polygon class="foda" points="${bkCell(cx, 21, 16)}" />
            <g clip-path="url(#bk-lock-${i})">
              <polygon class="lock" points="${bkCell(cx, 21, 14.2)}" />
            </g>
            <text class="lbl" x="${cx}" y="44">${t}</text>
          </g>`).join('')}
      </svg>
      <span class="cap"><b class="count" data-to="3" data-suffix=" CELLER TÄCKTA">0 CELLER TÄCKTA</b></span>
    </div>
  </div>`,
  hexis: `
  <div class="av" data-for="bikupa" aria-hidden="true">
    <div class="viz viz--pollenlast">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <g class="bi">
          <g class="vingar">
            <ellipse class="vinge" transform="rotate(-19 104 13)" cx="104" cy="13" rx="15" ry="4.6" />
            <ellipse class="vinge" transform="rotate(-6 104 14)" cx="104" cy="14" rx="12" ry="3.8" />
          </g>
          <g class="ben">
            <path d="M104,27 l-4,7" /><path d="M110,27 l3,7" />
            <path class="korg" d="M100,26 C93,30 88,32 84,34" />
          </g>
          <ellipse class="bak" cx="90" cy="23" rx="14" ry="9" />
          <g class="rand"><path d="M84,15.6 v14.8" /><path d="M91,14.2 v17.6" /><path d="M98,16.4 v13.2" /></g>
          <circle class="mellan" cx="107" cy="21" r="7.6" />
          <circle class="huvud" cx="118" cy="20" r="5" />
          <path class="anten" d="M121,16.4 C124,13 126,11 128,10" />
          <ellipse class="klump" cx="82" cy="35" rx="6.6" ry="5.2" />
        </g>
        <g class="vag">
          <path class="pil" d="M82,41 v3 M82,45.4 l-2.4,-3.6 h4.8 z" />
        </g>
        <text class="hz" x="212" y="14">230 Hz</text>
      </svg>
      <span class="cap">LAST <b class="count" data-to="30" data-suffix=" mg">0 mg</b></span>
    </div>
  </div>`,
  /* scales · hartsdraget: propolis dras i trådar mellan cellväggarna och
     stelnar. Sex drag, ett per övning. */
  scales: `
  <div class="av" data-for="bikupa" aria-hidden="true">
    <div class="viz viz--harts">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        ${[0, 1, 2, 3, 4, 5].map((i) => `<path class="trad" style="--i:${i}" d="M${46 + i * 25},8 Q${52 + i * 25},${24 + (i % 2 ? 5 : -3)} ${46 + i * 25},40" pathLength="100" />`).join('')}
      </svg>
      <span class="cap">α 92° · <b class="count" data-to="6" data-suffix=" DRAG">0 DRAG</b></span>
    </div>
  </div>`,
  /* ser/sys · vaktbiet vid flustret: fjorton anflygningar, en enda släpps in. */
  sersys: `
  <div class="av" data-for="bikupa" aria-hidden="true">
    <div class="viz viz--vakt">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <line class="fluster" x1="26" y1="34" x2="190" y2="34" />
        ${Array.from({ length: 14 }, (_, i) => `<ellipse class="anflyg${i === 6 ? ' anflyg--in' : ''}" style="--i:${i}" cx="${32 + i * 11.5}" cy="16" rx="2.6" ry="1.9" />`).join('')}
        <ellipse class="vaktbi" cx="${32 + 6 * 11.5}" cy="34" rx="3.4" ry="2.4" />
      </svg>
      <span class="cap">α 315° · <b class="count" data-to="1" data-suffix=" AV 14">0 AV 14</b></span>
    </div>
  </div>`,
  },
  enhancer: bikupaEnhancer,
}
