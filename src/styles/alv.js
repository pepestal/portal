import './alv.css'
import { makeCountEnhancer, nf } from '../shared.js'
import stats from '../data/stats.json'

/* Älvens grammatik (alv). Sidan är en driftbild över ett vattendrag: Syntes är
   källan (KM 0), de tre underapparna är biflöden, och allt vatten som syns
   nedströms har gått genom navets fåra. Flödestalen är INTE påhittade — de är
   radantalen ur stats.json, samma tal som systemhälsan visar. Varje gren ritas
   med bredden k × Q (samma k för alla fyra), och eftersom vattnen inte blandas
   vid ett sammanflöde utan ligger kvar som band, är huvudfårans bredd summan
   av delarna — konservering som geometri, kontrollerbar med ögat:
   4 470 → +52 462 → +1 861 → +7 315 → 66 108. */
const AQ = {
  syntes: stats.projects.syntes?.lines || 0,
  signal: stats.projects.signal?.lines || 0,
  todos: stats.projects.todos?.lines || 0,
  stronk: stats.projects.stronk?.lines || 0,
}
/* uppströms → nedströms: i vilken ordning grenarna kommer in i fåran.
   Banden i älven ligger i samma ordning, källvattnet innerst. */
const ORDNING = ['syntes', 'signal', 'todos', 'stronk']
const TOT = ORDNING.reduce((s, id) => s + AQ[id], 0)

/* Längsprofilen (navets hover): flödet mot kilometertalet, med ett steg uppåt
   vid varje sammanflöde. Kilometertalen är kartfiktion (som bäringarna i
   bikupa); flödesstegen är stats.json och räknas fram här, inte hårdkodas. */
const KM = { syntes: 0, signal: 14, todos: 23, stronk: 31 }
const KM_MYN = 38
const LX = (km) => (12 + km * 5.05).toFixed(1)
const LY = (q) => (40 - (q / 72000) * 33).toFixed(1)
function langsprofil() {
  let cum = AQ.syntes
  const steg = []
  const pts = [`12,${LY(cum)}`]
  for (const id of ORDNING.slice(1)) {
    const fore = cum
    cum += AQ[id]
    pts.push(`${LX(KM[id])},${LY(fore)}`, `${LX(KM[id])},${LY(cum)}`)
    steg.push(`<line class="stig" data-app="${id}" x1="${LX(KM[id])}" y1="${LY(fore)}" x2="${LX(KM[id])}" y2="${LY(cum)}" />
      <circle class="punkt" cx="${LX(KM[id])}" cy="${LY(cum)}" r="1.8" />`)
  }
  pts.push(`${LX(KM_MYN)},${LY(cum)}`)
  const ticks = ORDNING.map((id) =>
    `<line class="ax" x1="${LX(KM[id])}" y1="40" x2="${LX(KM[id])}" y2="42.5" />
     <text class="km" x="${LX(KM[id])}" y="48">${KM[id]}</text>`).join('')
  return `
    <svg viewBox="0 0 216 50" preserveAspectRatio="xMidYMid meet">
      <line class="ax" x1="12" y1="40" x2="204" y2="40" />
      ${ticks}
      <polyline class="profil" points="${pts.join(' ')}" pathLength="100" />
      ${steg.join('')}
    </svg>`
}

const viz = (klass, inre) => `
  <div class="av" data-for="alv" aria-hidden="true">
    <div class="viz viz--${klass}">${inre}</div>
  </div>`

/* Kartlagret: grenarna, källpunkten och pegelplåtarna ritas i DOM-mått ur
   knapparnas rektanglar och om vid resize/scroll — så att varje gren faktiskt
   börjar under sin knapp och fåran faktiskt växer där grenen kommer in. Ryms
   inte fåran i vänstermarginalen (smal skärm) döljs lagret helt; knappens
   vattenkant och lägesetiketterna bär då konceptet ensamma. */
function alvEnhancer() {
  const cleanups = []
  const lager = document.createElement('div')
  lager.className = 'alv-lager'
  lager.setAttribute('aria-hidden', 'true')
  const avlast = new Date(stats.generatedAt).toLocaleDateString('sv-SE')
  lager.innerHTML = `
    <svg class="alv-karta" xmlns="http://www.w3.org/2000/svg"></svg>
    <i class="alv-fot">${ORDNING.length} PEGLAR · AVLÄST ${avlast}</i>`
  document.body.prepend(lager)
  cleanups.push(() => lager.remove())

  const svg = lager.querySelector('.alv-karta')
  const btn = (id) => document.querySelector(`.app-row[data-app="${id}"] .app-btn`)
  const place = () => {
    const rekt = {}
    for (const id of ORDNING) {
      const b = btn(id)
      if (!b) return
      rekt[id] = b.getBoundingClientRect()
    }
    const marg = rekt.syntes.left
    lager.classList.toggle('is-dold', marg < 82)
    if (marg < 82) return
    /* fårans slutbredd styrs av marginalen; k är samma för alla grenar */
    const W = Math.min(118, Math.max(36, marg * 0.5))
    const k = W / TOT
    const w = Object.fromEntries(ORDNING.map((id) => [id, Math.max(2, AQ[id] * k)]))
    const Wsum = ORDNING.reduce((s, id) => s + w[id], 0)
    const xT = Math.max(10, (marg - Wsum) * 0.45)
    const H = innerHeight
    /* bandens mittlinjer: nya grenar lägger sig alltid utanpå, mot stranden
       de kom ifrån — därför korsar ingen gren någon annans vatten */
    const mitt = {}
    const kant = {} // fårans högerkant nedströms varje sammanflöde
    let off = 0
    for (const id of ORDNING) {
      mitt[id] = xT + off + w[id] / 2
      off += w[id]
      kant[id] = xT + off
    }
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${H}`)

    const r1 = (v) => v.toFixed(1)
    const springY = rekt.syntes.top + rekt.syntes.height / 2
    const kallD = `M${r1(mitt.syntes)},${r1(springY)} L${r1(mitt.syntes)},${H + 40}`
    const grenar = [`
      <g class="alv-gren" data-app="syntes">
        <path class="vatten" d="${kallD}" stroke-width="${r1(w.syntes)}" />
        <path class="strom" d="${kallD}" />
        <g class="alv-kallpunkt">
          <circle class="ring" cx="${r1(mitt.syntes)}" cy="${r1(springY)}" r="6.6" />
          <circle cx="${r1(mitt.syntes)}" cy="${r1(springY)}" r="3.2" />
        </g>
        <text x="${r1(kant.syntes + 8)}" y="${r1(springY + 3)}">${nf.format(AQ.syntes)}</text>
      </g>`]
    const peglar = []
    let cum = AQ.syntes
    for (const id of ORDNING.slice(1)) {
      const b = rekt[id]
      const bx = b.left + 10
      const by = b.top + b.height / 2
      const confY = b.bottom + 6
      const dx = bx - mitt[id]
      const d = `M${r1(bx)},${r1(by)} C${r1(bx - dx * 0.5)},${r1(by)} ${r1(mitt[id])},${r1(by)} ${r1(mitt[id])},${r1(confY)} L${r1(mitt[id])},${H + 40}`
      grenar.push(`
        <g class="alv-gren" data-app="${id}">
          <path class="vatten" d="${d}" stroke-width="${r1(w[id])}" />
          <path class="strom" d="${d}" />
          <text class="inc" x="${r1(mitt[id] + w[id] / 2 + 8)}" y="${r1(confY - 8)}">+${nf.format(AQ[id])}</text>
        </g>`)
      cum += AQ[id]
      const ty = confY + 14
      peglar.push(`
        <line x1="${r1(kant[id] + 3)}" y1="${r1(ty)}" x2="${r1(kant[id] + 9)}" y2="${r1(ty)}" />
        <text class="${id === 'stronk' ? 'mynning' : ''}" x="${r1(kant[id] + 13)}" y="${r1(ty + 3.5)}">${nf.format(cum)}</text>`)
    }
    svg.innerHTML = grenar.join('') + `<g class="alv-pegel">${peglar.join('')}</g>`
  }
  place()
  addEventListener('resize', place)
  addEventListener('scroll', place, { passive: true })
  cleanups.push(() => { removeEventListener('resize', place); removeEventListener('scroll', place) })

  cleanups.push(makeCountEnhancer('alv')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'alv',
  label: 'Älven',
  anim: {
    syntes: viz('langsprofil', `
      ${langsprofil()}
      <span class="cap">MYNNING · Q <b class="count" data-to="${TOT}">0</b></span>`),
    signal: viz('hydrograf', `
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <line class="ax" x1="10" y1="40" x2="206" y2="40" />
        <line class="hq" x1="66" y1="10" x2="206" y2="10" />
        <text class="hqlbl" x="62" y="12.5">HQ</text>
        <path class="kurva" pathLength="100" d="M10,37 C36,36 60,33 72,25 C79,19 83,11 87,10
          C91,11 97,23 114,28 C142,34 176,35.5 206,35.5" />
        <circle class="topp" cx="87" cy="10" r="2.2" />
      </svg>
      <span class="cap">VÅRFLOD · Q <b class="count" data-to="${AQ.signal}">0</b></span>`),
    todos: viz('flottning', `
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <line class="yta" x1="8" y1="12" x2="208" y2="12" />
        <line class="yta" x1="8" y1="36" x2="208" y2="36" />
        <g class="grind">
          <line x1="50" y1="6" x2="50" y2="42" />
          <line x1="56" y1="6" x2="56" y2="42" />
          <line class="balk" x1="44" y1="6" x2="62" y2="6" />
        </g>
        ${[[14, 22, 0], [22, 18, 1], [30, 26, 2], [18.5, 20, 3], [26.5, 23, 4]].map(([y, len, i]) =>
          `<rect class="stock" style="--i:${i}" x="230" y="${y}" width="${len}" height="4.6" rx="2.2" />`).join('')}
      </svg>
      <span class="cap">RÄKNEVERK · <b class="count" data-to="${AQ.todos}" data-suffix=" ST">0 ST</b></span>`),
    stronk: viz('turbin', `
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <path class="tub" d="M8,4 L28,15 L36,20" />
        <path class="utlopp" d="M51,27 L208,27" />
        <path class="utstrom" d="M51,27 L208,27" />
        <g class="hjul">
          <circle class="rim" cx="40" cy="24" r="11" />
          <g class="rot">
            ${[0, 90, 180, 270].map((a) =>
              `<rect class="blad" x="38.8" y="14.5" width="2.4" height="8.6" rx="1.2" transform="rotate(${a} 40 24)" />`).join('')}
          </g>
          <circle class="nav" cx="40" cy="24" r="2.4" />
        </g>
        <text class="varv" x="206" y="16">167 V/MIN</text>
      </svg>
      <span class="cap">FALL 171 M · Q <b class="count" data-to="${AQ.stronk}">0</b></span>`),
  },
  enhancer: alvEnhancer,
}
