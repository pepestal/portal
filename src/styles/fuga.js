import './fuga.css'
import { makeCountEnhancer, nf } from '../shared.js'
import stats from '../data/stats.json'
import { apps } from '../apps.js'

/* Fugans grammatik (fuga). Ett fugasubjekt är inte en melodi bland andra: allt
   annat i satsen ÄR subjektet, omskrivet. Därför står bara EN tonföljd i koden
   — FG_SUBJ — och de tre underapparnas notbilder räknas fram ur den med var sin
   operation. Tas subjektet bort finns det inget kvar att räkna på.
   p = diatoniska steg över nedersta notlinjen (jämna tal = linjer, udda =
   mellanrum), d = notvärdet i åttondelar. Altklav, g-moll, 4/4. */
const FG_SUBJ = [[1, 4], [5, 2], [4, 2], [3, 2], [2, 2], [1, 1], [3, 1], [2, 2]]
/* Svaret (comes) ligger en kvint upp — men TONALT: subjektets kvintton besvaras
   med tonikan i stället för rak transponering, annars drar svaret ut ur
   tonarten. Det är den enda ton i hela satsen som inte lyder formeln, och just
   därför ringas den in i knappen. */
const FG_TONAL = 1
const FG_COMES = FG_SUBJ.map(([p, d], i) => [p + (i === FG_TONAL ? 3 : 4), d])
const FG_INV = FG_SUBJ.map(([p, d]) => [6 - p, d])  // speglad kring b (p = 3)
const FG_AUG = FG_SUBJ.map(([p, d]) => [p, d * 2])  // dubbla notvärden
const FG_SP = 6                                     // notlinjeavstånd i knappen
const fgY = (p, bas, sp = FG_SP) => bas - p * sp / 2

/* Ritar en notrad. `ur` är tonföljden noterna kommer UR: varje not får då sitt
   --dx/--dy — vägen från källan till sin egen plats — så CSS kan animera själva
   operationen i stället för att bara visa resultatet. `--t` är notens läge i
   takten (åttondelar), och skrivfördröjningen räknas ur den: bladet skrivs i
   tempo, vilket gör augmentationen dubbelt så långsam att skriva. */
function fgNoter(noter, o = {}) {
  const { x0 = 49, k = 9, bas = 34, sp = FG_SP, ur = null, k0 = k, cls = '' } = o
  const r = (v) => v.toFixed(1)
  let x = x0, xu = x0, t = 0
  const n = noter.map(([p, d], i) => {
    const pt = { x, y: fgY(p, bas, sp), p, d, t, up: p < 4 }
    if (ur) { pt.dx = xu - x; pt.dy = fgY(ur[i][0], bas, sp) - pt.y; xu += ur[i][1] * k0 }
    x += d * k; t += d
    return pt
  })
  // balkade åttondelar: gruppen måste dela skaftriktning, annars bryts balken
  const grupper = []
  for (let i = 0; i < n.length; i++) {
    if (n[i].d !== 1) continue
    const g = [i]
    while (n[i + 1] && n[i + 1].d === 1) g.push(++i)
    if (g.length > 1) grupper.push(g)
  }
  grupper.forEach((g) => {
    const up = g.reduce((s, i) => s + n[i].p, 0) / g.length < 4
    g.forEach((i) => { n[i].up = up })
  })
  const u = sp / FG_SP
  const hx = (pt) => pt.x + (pt.up ? 3.9 : -3.9) * u
  const ty = (pt) => pt.y + (pt.up ? -1 : 1) * sp * 3.3   // skaftet: 3,5 notavstånd
  const balkar = grupper.map((g) => {
    const a = n[g[0]], b = n[g[g.length - 1]]
    return `<line class="balk" style="--t:${a.t}" x1="${r(hx(a))}" y1="${r(ty(a))}" x2="${r(hx(b))}" y2="${r(ty(b))}" />`
  }).join('')
  const huvuden = n.map((pt, i) => `
    <g class="not${pt.d >= 4 ? ' not--oppen' : ''}" style="--i:${i};--t:${pt.t}${ur ? `;--dx:${r(pt.dx)}px;--dy:${r(pt.dy)}px` : ''}">
      <ellipse cx="${r(pt.x)}" cy="${r(pt.y)}" rx="${r(sp * .72)}" ry="${r(sp * .52)}"
               transform="rotate(-18 ${r(pt.x)} ${r(pt.y)})" />
      ${pt.d >= 8 ? '' /* helnoten bär inget skaft */
        : `<line class="skaft" x1="${r(hx(pt))}" y1="${r(pt.y)}" x2="${r(hx(pt))}" y2="${r(ty(pt))}" />`}
    </g>`).join('')
  return { svg: `<g class="noter ${cls}">${balkar}${huvuden}</g>`, bredd: x - x0, slut: x, n }
}

/* Altklaven: den symmetriska klaven, öppen partiturs egen. Två stolpar och två
   halvmånar som möts på mittlinjen — där ligger c′, och där ligger också
   inversionens spegelaxel. Ritad i geometri, inte i ett notteckensnitt. */
function fgKlav(x, bas, sp) {
  const u = sp / FG_SP, m = fgY(4, bas, sp)
  const X = (v) => (x + v * u).toFixed(2), Y = (v) => (m + v * u).toFixed(2)
  return `<g class="klav">
    <rect x="${X(0)}" y="${Y(-12)}" width="${(2.6 * u).toFixed(2)}" height="${(24 * u).toFixed(2)}" />
    <rect x="${X(4.2)}" y="${Y(-12)}" width="${(1.1 * u).toFixed(2)}" height="${(24 * u).toFixed(2)}" />
    <path d="M${X(6)},${Y(-11.5)} C${X(13.5)},${Y(-11.5)} ${X(14)},${Y(-4.6)} ${X(8.4)},${Y(-.7)}
             C${X(11.8)},${Y(-5)} ${X(11)},${Y(-9)} ${X(6)},${Y(-9)} Z" />
    <path d="M${X(6)},${Y(11.5)} C${X(13.5)},${Y(11.5)} ${X(14)},${Y(4.6)} ${X(8.4)},${Y(.7)}
             C${X(11.8)},${Y(5)} ${X(11)},${Y(9)} ${X(6)},${Y(9)} Z" />
  </g>`
}
const fgB = (x, p, bas, sp) => {
  const y = fgY(p, bas, sp), u = sp / FG_SP
  const X = (v) => (x + v * u).toFixed(2), Y = (v) => (y + v * u).toFixed(2)
  return `<path class="fortecken" d="M${X(0)},${Y(-9)} V${Y(3)} C${X(4.6)},${Y(1.2)} ${X(5)},${Y(-3.4)} ${X(0)},${Y(-1)}" />`
}
/* Ett system: fem linjer, klav, tonart (två b — g-moll) och taktart. Noterna
   börjar 43 enheter in, efter förtecknen. */
function fgSystem(x0, x1, bas, sp = FG_SP) {
  const u = sp / FG_SP, kx = x0 + 3 * u
  const linjer = [0, 2, 4, 6, 8].map((p) => {
    const y = fgY(p, bas, sp).toFixed(1)
    return `<line class="linje" x1="${x0.toFixed(1)}" y1="${y}" x2="${x1.toFixed(1)}" y2="${y}" />`
  }).join('')
  return `<g class="system">${linjer}${fgKlav(kx, bas, sp)}
    ${fgB(kx + 17 * u, 3, bas, sp)}${fgB(kx + 23 * u, 6, bas, sp)}
    <text class="taktart" x="${(kx + 30 * u).toFixed(1)}" y="${fgY(4, bas, sp).toFixed(1)}"
          style="font-size:${(sp * 2.6).toFixed(1)}px">C</text></g>`
}

/* Fugan: sidan är ett arbetsblad ur en fuga, skriven i öppen partitur. Notplanen
   (fyra system), klammern, systemtaktstrecken, flerstaktspauserna och namnrutan
   injiceras här och rivs vid stilbyte — skelettets markup rörs inte.

   Bladet läses från vänster. DÄR står subjektet, en enda gång, på navets system.
   De tre andras system är tomma — de har ingen egen musik att sätta dit, bara en
   flerstaktspaus vars siffra ÄR deras väntan på navet: 2, 4 och 6 takter. Till
   höger står härledningarna, oskrivna tills någon pekar på dem, och navets
   stretto där alla fyra ljuder samtidigt. Pekar man på en underapp tänds alltid
   subjektet med den — en härledning kan inte visas utan sin källa.
   Geometrin mäts i DOM:en: varje system ligger på sin rads mittlinje. */
const FG_STAMMOR = [
  ['syntes', 0, 1, 'DUX'],           // ställer temat i takt 1
  ['signal', 2, 3, 'COMES'],         // tiger två takter, faller in i t. 3
  ['todos', 4, 5, 'INVERSIO'],
  ['stronk', 6, 7, 'AUGMENTATIO'],
]
const FG_MM = 72
const FG_TAKT = (60 / FG_MM) * 4                    // en 4/4-takt i sekunder
const fgSek = (takter) => (takter * FG_TAKT).toFixed(1).replace('.', ',')
/* Flerstaktspausen: den tjocka balken med sina serifer, och siffran ovanför som
   säger hur många takter rösten tiger. Här är siffran inte dekor — den är
   avståndet till navets insats, räknat i takter. */
function fgPaus(x, bas, sp, n) {
  const y = fgY(4, bas, sp), h = sp * .62, w = sp * 2.8
  const r = (v) => v.toFixed(1)
  return `<g class="fg-paus">
    <rect x="${r(x)}" y="${r(y - h / 2)}" width="${r(w)}" height="${r(h)}" />
    <line x1="${r(x)}" y1="${r(y - sp)}" x2="${r(x)}" y2="${r(y + sp)}" />
    <line x1="${r(x + w)}" y1="${r(y - sp)}" x2="${r(x + w)}" y2="${r(y + sp)}" />
    <text x="${r(x + w / 2)}" y="${r(fgY(8, bas, sp) - sp * .8)}" style="font-size:${r(sp * 1.7)}px">${n}</text>
  </g>`
}
function fugaEnhancer() {
  const cleanups = []
  const ark = document.createElement('div')
  ark.className = 'fg-ark'
  ark.setAttribute('aria-hidden', 'true')
  ark.innerHTML = `
    <i class="fg-huvud">
      <b class="fg-titel">FUGA À 4 RÖSTER · g-MOLL</b>
      <b>ÖPPEN PARTITUR · BLAD 1 · M.M. ${FG_MM}</b>
    </i>
    <svg class="fg-plan" xmlns="http://www.w3.org/2000/svg"></svg>
    <i class="fg-fot">
      <b>EN TAKT = ${fgSek(1)} s</b>
      <b>${stats.ecosystem.apps} STÄMMOR · ${nf.format(stats.ecosystem.lines)} TAKTER I VERKET</b>
    </i>`
  document.body.prepend(ark)
  cleanups.push(() => ark.remove())

  const plan = ark.querySelector('.fg-plan')
  const place = () => {
    const rutor = FG_STAMMOR.map(([id]) => document.querySelector(`.app-row[data-app="${id}"]`))
    if (rutor.some((b) => !b)) return
    const g = rutor.map((b) => b.getBoundingClientRect())
    const W = innerWidth, H = innerHeight
    const sp = W < 1100 ? 6.5 : W < 1300 ? 7.5 : 9   // notlinjeavstånd på bladet
    const M = Math.max(22, Math.min(84, W * .055))   // marginal
    const vL = Math.min(...g.map((r) => r.left)) - 20
    const vR = Math.max(...g.map((r) => r.right)) + 20
    const x0 = M + 43 * (sp / FG_SP) + 8             // första noten, efter förtecknen
    const xr = vR + 8
    const k = sp * .9                                // bredd per åttondel
    // Noterna skrivs bara ut när marginalerna rymmer hela subjektet (16
    // åttondelar) och den bredaste härledningen (augmentationens 32). Annars
    // står bladet kvar med tomma system — ett partitur under utskrift, inte en
    // trasig sida.
    const visa = vL - x0 > 16 * k + 8 && W - M - xr > 17.6 * k + 8
    const basar = g.map((r) => r.top + r.height / 2 + 2 * sp)
    const topp = fgY(8, basar[0], sp), botten = fgY(0, basar[3], sp)
    const r = (v) => v.toFixed(1)

    const system = FG_STAMMOR.map(([id], i) => `<g data-app="${id}">${fgSystem(M, W - M, basar[i], sp)}</g>`).join('')
    // Klammern binder de fyra systemen till ETT — de spelas tillsammans eller inte alls.
    const h = botten - topp, bx = M - sp * 1.2
    const klammer = `<path class="fg-klammer" d="M${r(bx + sp * .9)},${r(topp)}
      C${r(bx - sp * .3)},${r(topp + h * .13)} ${r(bx + sp * .7)},${r(topp + h * .4)} ${r(bx - sp * .1)},${r(topp + h * .5)}
      C${r(bx + sp * .7)},${r(topp + h * .6)} ${r(bx - sp * .3)},${r(botten - h * .13)} ${r(bx + sp * .9)},${r(botten)}" />
      <line class="fg-systemstreck" x1="${r(M)}" y1="${r(topp)}" x2="${r(M)}" y2="${r(botten)}" />
      <line class="fg-systemstreck fg-slut" x1="${r(W - M)}" y1="${r(topp)}" x2="${r(W - M)}" y2="${r(botten)}" />
      <line class="fg-systemstreck" x1="${r(W - M - sp * .6)}" y1="${r(topp)}" x2="${r(W - M - sp * .6)}" y2="${r(botten)}" />`

    // Vänstra sidan: navets subjekt i bläck — och de tres tystnad, mätt i takter.
    const vanster = visa ? FG_STAMMOR.map(([id, paus, takt], i) => {
      const bas = basar[i]
      if (!paus) {
        const s = fgNoter(FG_SUBJ, { x0, k, bas, sp })
        return `<g class="fg-dux">
          <text class="fg-takt" x="${r(x0 - 4)}" y="${r(fgY(8, bas, sp) - sp * .8)}">1</text>
          ${s.svg}
          <path class="fg-klaff" d="M${r(x0 - 6)},${r(fgY(0, bas, sp) + sp * 1.5)} v${r(sp * .5)} H${r(s.slut)} v${r(-sp * .5)}" />
          <text class="fg-etikett" x="${r((x0 + s.slut) / 2)}" y="${r(fgY(0, bas, sp) + sp * 2.9)}">T. 1–2</text>
        </g>`
      }
      // Flerstaktspausens egen siffra säger redan hur många takter rösten tiger.
      return `<g class="fg-tystnad" data-app="${id}">${fgPaus(x0 + 12, bas, sp, paus)}</g>`
    }).join('') : ''

    // Högra sidan: härledningarna. Oskrivna tills någon pekar på navet eller på dem.
    // Strettot: insatserna tränger ihop sig till fyra åttondelars avstånd —
    // rösterna hinner inte vänta på varandra längre, och navet håller alla fyra.
    const stretto = [
      ['signal', FG_COMES.slice(0, 4), 6],
      ['todos', FG_INV.slice(0, 4), 12],
      ['stronk', FG_AUG.slice(0, 2), 18],
    ]
    const hoger = visa ? FG_STAMMOR.map(([id, paus, takt, namn], i) => {
      const bas = basar[i]
      const lbl = `<text class="fg-lbl" x="${r(xr)}" y="${r(fgY(8, bas, sp) - sp * .8)}">${
        paus ? `T. ${takt} · +${fgSek(paus)} s · ${namn}` : 'T. 9 · STRETTO'}</text>`
      if (!paus) {
        const kv = k * .62
        return `<g class="fg-harledning" data-app="syntes">${lbl}
          ${stretto.map(([app, noter, dt]) => `<g class="fg-insats" data-app="${app}" style="--d:${dt}">
            ${fgNoter(noter, { x0: xr + dt * kv, k: kv, bas, sp }).svg}</g>`).join('')}
          <g class="fg-dux-eko">${fgNoter(FG_SUBJ, { x0: xr, k: kv, bas, sp }).svg}</g>
        </g>`
      }
      const noter = { signal: FG_COMES, todos: FG_INV, stronk: FG_AUG }[id]
      const kk = id === 'stronk' ? k * .55 : k
      return `<g class="fg-harledning" data-app="${id}">${lbl}${fgNoter(noter, { x0: xr, k: kk, bas, sp }).svg}</g>`
    }).join('') : ''

    plan.innerHTML = `<g class="fg-planer">${system}</g>${klammer}
      <g class="fg-skrift">${vanster}${hoger}</g>`
  }
  place()
  addEventListener('resize', place)
  cleanups.push(() => removeEventListener('resize', place))

  cleanups.push(makeCountEnhancer('fuga')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'fuga',
  label: 'Fugan',
  anim: {
  /* fuga · strettot: subjektet skrivs i bläck, och innan det hunnit tystna
     faller de tre andra in ovanpå det — svaret, inversionen, augmentationen,
     var och en i sin egen apps färg. Fyra insatser som ljuder samtidigt är
     definitionen av en syntes, och det är den enda knapp där alla fyra ryms. */
  syntes: `
  <div class="av" data-for="fuga" aria-hidden="true">
    <div class="viz viz--stretto">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        ${fgSystem(6, 212, 34)}
        <g class="insats" data-app="signal">${fgNoter(FG_COMES.slice(0, 4), { x0: 86, k: 5 }).svg}</g>
        <g class="insats" data-app="todos">${fgNoter(FG_INV.slice(0, 4), { x0: 116, k: 5 }).svg}</g>
        <g class="insats" data-app="stronk">${fgNoter(FG_AUG.slice(0, 2), { x0: 146, k: 5 }).svg}</g>
        <g class="dux">${fgNoter(FG_SUBJ, { x0: 56, k: 5 }).svg}</g>
      </svg>
      <span class="cap">STRETTO · <b class="count" data-to="4" data-suffix=" INSATSER">0 INSATSER</b></span>
    </div>
  </div>`,
  /* fuga · comes: subjektet ligger kvar i blyerts under, och ur det stiger
     svaret en kvint upp. Bara en enda ton bryter formeln — kvinttonen besvaras
     med tonikan — och den ringas in: även avvikelsen är mätt från navet. */
  signal: `
  <div class="av" data-for="fuga" aria-hidden="true">
    <div class="viz viz--comes">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        ${fgSystem(6, 212, 34)}
        <g class="ur">${fgNoter(FG_SUBJ, { x0: 56, k: 9 }).svg}</g>
        <g class="svar">${fgNoter(FG_COMES, { x0: 56, k: 9, ur: FG_SUBJ }).svg}</g>
        <circle class="tonal" cx="${56 + 4 * 9}" cy="${fgY(FG_COMES[FG_TONAL][0], 34)}" r="7.6" pathLength="100" />
        <text class="tlbl" x="${56 + 4 * 9}" y="43">TONALT SVAR</text>
      </svg>
      <span class="cap">COMES · T. 3</span>
    </div>
  </div>`,
  /* fuga · inversio: samma tonföljd, vänd upp och ner kring mittlinjens b.
     Varje not faller till sin spegelbild — uppgången blir nedgång, kadensen
     blir sitt eget svar. Axeln är ritad, för utan den är speglingen inte
     mätbar: inversionen har ingen egen tonföljd, bara subjektets och en axel. */
  todos: `
  <div class="av" data-for="fuga" aria-hidden="true">
    <div class="viz viz--inversio">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        ${fgSystem(6, 212, 34)}
        <line class="axel" x1="50" y1="${fgY(3, 34)}" x2="206" y2="${fgY(3, 34)}" pathLength="100" />
        <text class="albl" x="52" y="8">SPEGELAXEL b</text>
        <g class="ur">${fgNoter(FG_SUBJ, { x0: 56, k: 9 }).svg}</g>
        <g class="svar">${fgNoter(FG_INV, { x0: 56, k: 9, ur: FG_SUBJ }).svg}</g>
      </svg>
      <span class="cap">INVERSIO · T. 5</span>
    </div>
  </div>`,
  /* fuga · augmentatio: inte en not tillkommer — varje notvärde fördubblas, och
     samma subjekt tar plötsligt fyra takter i stället för två. Noterna glider
     isär, huvudena öppnar sig (halv- och helnoter), och två taktstreck till
     måste dras för att rymma det. Tyngdlyftarens variant av samma tema. */
  stronk: `
  <div class="av" data-for="fuga" aria-hidden="true">
    <div class="viz viz--augmentatio">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        ${fgSystem(6, 212, 34)}
        ${[1, 2, 3, 4].map((i) => `
          <line class="taktstreck" style="--t:${i * 8}" x1="${(56 + i * 38.4).toFixed(1)}" y1="10"
                x2="${(56 + i * 38.4).toFixed(1)}" y2="34" />`).join('')}
        <g class="ur">${fgNoter(FG_SUBJ, { x0: 56, k: 4.8 }).svg}</g>
        <g class="svar">${fgNoter(FG_AUG, { x0: 56, k: 4.8, ur: FG_SUBJ }).svg}</g>
        <path class="spann" d="M56,38 v4 H209.6 v-4" />
      </svg>
      <span class="cap">AUGMENTATIO · <b class="count" data-to="4" data-suffix=" TAKTER">0 TAKTER</b></span>
    </div>
  </div>`,
  },
  enhancer: fugaEnhancer,
}
