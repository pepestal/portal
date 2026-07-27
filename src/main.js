import './style.css'
import { apps } from './apps.js'
import { styles, DEFAULT_STYLE } from './styles.js'
import { orreryEnhancer } from './orrery.js'
import stats from './data/stats.json'

const nf = new Intl.NumberFormat('sv-SE')

/* =========================================================================
   Hover-animationer — helt unika per (app × stil).
   Varje app renderar en variant per skelett-stil; CSS visar bara den aktiva
   stilens (`.av[data-for]`). Formen skiljer sig, inte bara färgen.
   ========================================================================= */

/* Stjärnstoft som sugs in i porten (singularitet). Slumpas per sidladdning. */
const dust = () => `<span class="dust" aria-hidden="true">${Array.from({ length: 12 }, () =>
  `<i style="--ang:${(Math.random() * 360) | 0}deg;--dist:${(70 + Math.random() * 50) | 0}px;--dur:${(1.2 + Math.random() * 1.1).toFixed(2)}s;--del:${(Math.random() * 2).toFixed(2)}s"></i>`).join('')}</span>`

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

/* Kupans grammatik (bikupa). På en lodrät vaxkaka betyder "rakt upp" = mot
   solen; dansens vinkel α mot lodlinjen ÄR alltså en kompassriktning. Samma tre
   bäringar används i knappens dans, i cellernas hörnetiketter och i sidans
   flygvektorer — kartan och dansen måste säga samma sak. */
const BK_BARING = { signal: 40, todos: 155, stronk: 268 }
const bkDir = (deg) => [Math.sin(deg * Math.PI / 180), -Math.cos(deg * Math.PI / 180)]
/* Dansens varv: rak svansrun A→B, återvändande slinga åt höger, samma run igen,
   slinga åt vänster. Ett slutet varv — därför kan biet löpa det i all oändlighet. */
const BK_DANS = 'M100.3,35.2 L115.7,16.8 C136,9 154,20 148,30 C142,40 115,43 100.3,35.2 '
  + 'L115.7,16.8 C93,7 68,13 70,26 C72,37 89,39 100.3,35.2 Z'
/* Åskådarna: tre bin som läser dansen och lämnar den i var sin bäring. */
const BK_FOLJARE = [['signal', 190, 13], ['todos', 186, 31], ['stronk', 24, 21]].map(([app, x, y]) => {
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

/* --- Syntes (navet: tre flöden in, ett ut) --- */
const SYNTES = {
  terminal: `
    <div class="av" data-for="terminal" aria-hidden="true">
      <div class="viz viz--pipe">
        <span class="ln" style="--i:0">signal ─┐</span>
        <span class="ln" style="--i:1">todos  ─┼─▶ <b>syntes</b></span>
        <span class="ln" style="--i:2">stronk ─┘</span>
      </div>
    </div>`,
  editorial: `
    <div class="av" data-for="editorial" aria-hidden="true">
      <div class="viz viz--venn">
        <svg viewBox="0 0 84 56" preserveAspectRatio="xMidYMid meet">
          <circle class="vc vc1" cx="32" cy="22" r="15" />
          <circle class="vc vc2" cx="52" cy="22" r="15" />
          <circle class="vc vc3" cx="42" cy="37" r="15" />
          <circle class="vd" cx="42" cy="27" r="2.6" />
        </svg>
        <span class="fig">= syntes</span>
      </div>
    </div>`,
  bank: `
    <div class="av" data-for="bank" aria-hidden="true">
      <div class="viz viz--alloc">
        <div class="bar">
          <span class="seg" style="--i:0;--w:38%"></span>
          <span class="seg" style="--i:1;--w:34%"></span>
          <span class="seg" style="--i:2;--w:28%"></span>
        </div>
        <span class="val count" data-to="100" data-suffix=" % samlat">0 % samlat</span>
      </div>
    </div>`,
  singularitet: `
    <div class="av" data-for="singularitet" aria-hidden="true">
      <div class="viz viz--nexus">
        <span class="field">
          <i class="mote" style="--a:10deg;--c:#4ADE9C;--d:0s"></i>
          <i class="mote" style="--a:130deg;--c:#F5C56B;--d:.5s"></i>
          <i class="mote" style="--a:250deg;--c:#F97B76;--d:1s"></i>
          <span class="core"></span>
        </span>
        <span class="cap">tre världar · en puls</span>
      </div>
      ${dust()}
    </div>`,
  kvitto: `
    <div class="av" data-for="kvitto" aria-hidden="true">
      <div class="viz viz--encircle">
        <svg viewBox="0 0 200 40" preserveAspectRatio="none">
          <ellipse class="ink" cx="100" cy="20" rx="95" ry="15" pathLength="100" />
        </svg>
        <span class="note">navet!</span>
      </div>
    </div>`,
  vaxel: `
    <div class="av" data-for="vaxel" aria-hidden="true">
      <div class="viz viz--patch">
        <span class="board">
          <span class="jack" style="--i:0;--c:#C4574A"><i class="cord"></i></span>
          <span class="jack" style="--i:1;--c:#86A268"><i class="cord"></i></span>
          <span class="jack" style="--i:2;--c:#CB7C43"><i class="cord"></i></span>
        </span>
        <span class="cap">tre linjer · en telefonist</span>
      </div>
    </div>`,
  jacquard: `
    <div class="av" data-for="jacquard" aria-hidden="true">
      <div class="viz viz--vav">
        <span class="loom">
          <i class="tyg"></i>
          <i class="warp" style="--x:18%;--c:#A03A28;--i:0"></i>
          <i class="warp" style="--x:50%;--c:#2C4A7E;--i:1"></i>
          <i class="warp" style="--x:82%;--c:#7C6A1C;--i:2"></i>
          <i class="skyttel"></i>
        </span>
        <span class="cap">inslaget binder de tre</span>
      </div>
    </div>`,
  sprangskiss: `
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
        <span class="cap">POS. 1 · HUVUDENHET — 3 DELAR MONTERADE</span>
      </div>
    </div>`,
  synop: `
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
        <span class="cap">L 984 hPa · <b class="count" data-to="3" data-suffix=" FRONTER · ETT SYSTEM">0 FRONTER · ETT SYSTEM</b></span>
      </div>
    </div>`,
  bikupa: `
    <div class="av" data-for="bikupa" aria-hidden="true">
      <div class="viz viz--svansdans">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          <g class="ref">
            <line class="lod" x1="108" y1="10" x2="108" y2="43" />
            <g class="sol"><circle cx="108" cy="5" r="2.2" />${BK_SOL}</g>
            <path class="bage" d="M108,15 A11,11 0 0 1 115.1,17.6" />
          </g>
          <path class="rutt" d="${BK_DANS}" pathLength="100" />
          <line class="svans" x1="100.3" y1="35.2" x2="115.7" y2="16.8" />
          <path class="bi" d="${BK_DANS}" pathLength="100" />
          ${BK_FOLJARE}
        </svg>
        <span class="cap">SVANSDANS α 40° · <b class="count" data-to="3" data-suffix=" ANVISNINGAR UT">0 ANVISNINGAR UT</b></span>
      </div>
    </div>`,
  /* fuga · strettot: subjektet skrivs i bläck, och innan det hunnit tystna
     faller de tre andra in ovanpå det — svaret, inversionen, augmentationen,
     var och en i sin egen apps färg. Fyra insatser som ljuder samtidigt är
     definitionen av en syntes, och det är den enda knapp där alla fyra ryms. */
  fuga: `
    <div class="av" data-for="fuga" aria-hidden="true">
      <div class="viz viz--stretto">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          ${fgSystem(6, 212, 34)}
          <g class="insats" data-app="signal">${fgNoter(FG_COMES.slice(0, 4), { x0: 86, k: 5 }).svg}</g>
          <g class="insats" data-app="todos">${fgNoter(FG_INV.slice(0, 4), { x0: 116, k: 5 }).svg}</g>
          <g class="insats" data-app="stronk">${fgNoter(FG_AUG.slice(0, 2), { x0: 146, k: 5 }).svg}</g>
          <g class="dux">${fgNoter(FG_SUBJ, { x0: 56, k: 5 }).svg}</g>
        </svg>
        <span class="cap">STRETTO · <b class="count" data-to="4" data-suffix=" INSATSER — ETT SUBJEKT">0 INSATSER — ETT SUBJEKT</b></span>
      </div>
    </div>`,
}

/* --- Signal --- */
const CANDLES = [[42, 'up'], [58, 'down'], [36, 'up'], [64, 'up'], [50, 'down'], [72, 'up'], [56, 'down'], [82, 'up'], [68, 'up']]
const SIGNAL = {
  terminal: `
    <div class="av" data-for="terminal" aria-hidden="true">
      <div class="viz viz--candles">
        ${CANDLES.map(([h, d], i) => `<span class="candle candle--${d}" style="--h:${h}%;--i:${i}"></span>`).join('')}
      </div>
    </div>`,
  editorial: `
    <div class="av" data-for="editorial" aria-hidden="true">
      <div class="viz viz--line">
        <svg viewBox="0 0 200 56" preserveAspectRatio="xMidYMid meet">
          <path class="ln" d="M2,44 C28,42 40,22 62,26 S110,10 132,20 170,6 198,13" />
          <circle class="pt" cx="198" cy="13" r="3" />
        </svg>
        <span class="fig">+2,4 %</span>
      </div>
    </div>`,
  bank: `
    <div class="av" data-for="bank" aria-hidden="true">
      <div class="viz viz--area">
        <div class="area-clip">
          <svg viewBox="0 0 200 56" preserveAspectRatio="none">
            <defs><linearGradient id="grad-signal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="var(--app-accent)" stop-opacity=".30" />
              <stop offset="1" stop-color="var(--app-accent)" stop-opacity="0" />
            </linearGradient></defs>
            <path class="area" d="M0,44 C28,42 40,22 62,26 S110,10 132,20 170,6 200,13 L200,56 L0,56 Z" fill="url(#grad-signal)" />
            <path class="curve" d="M0,44 C28,42 40,22 62,26 S110,10 132,20 170,6 200,13" />
          </svg>
        </div>
        <span class="val count" data-to="42318" data-prefix="$">$0</span>
      </div>
    </div>`,
  singularitet: `
    <div class="av" data-for="singularitet" aria-hidden="true">
      <div class="viz viz--pulse">
        <svg viewBox="0 0 120 64" preserveAspectRatio="none">
          <path class="ghost" d="M0 40 L12 36 20 46 32 22 42 30 54 12 66 28 78 20 90 34 102 16 112 26 120 22" pathLength="100" />
          <path class="beam"  d="M0 40 L12 36 20 46 32 22 42 30 54 12 66 28 78 20 90 34 102 16 112 26 120 22" pathLength="100" />
        </svg>
        <span class="tick"><b class="tick-v">512,34</b> <i class="tick-d">▲ +0,0 %</i></span>
      </div>
      ${dust()}
    </div>`,
  vaxel: `
    <div class="av" data-for="vaxel" aria-hidden="true">
      <div class="viz viz--morse">
        <span class="tape">
          <i class="m m--d" style="--i:0"></i><i class="m m--p" style="--i:1"></i><i class="m m--d" style="--i:2"></i><i class="g"></i><i class="m m--d" style="--i:3"></i><i class="m m--d" style="--i:4"></i><i class="m m--d" style="--i:5"></i><i class="m m--p" style="--i:6"></i><i class="g"></i><i class="m m--p" style="--i:7"></i><i class="m m--d" style="--i:8"></i><i class="m m--d" style="--i:9"></i><i class="m m--p" style="--i:10"></i>
        </span>
        <span class="read">telegram: <b>KÖP</b> — vidare till växeln</span>
      </div>
    </div>`,
  jacquard: `
    <div class="av" data-for="jacquard" aria-hidden="true">
      <div class="viz viz--strang">
        <span class="string">
          <svg viewBox="0 0 200 34" preserveAspectRatio="none">
            <path class="rest" d="M0,17 H200" />
            <path class="wave" d="M0,17 Q100,-24 200,17" />
          </svg>
        </span>
        <span class="read">spänning <b class="count" data-to="512" data-suffix=" cN">0 cN</b> · varpen darrar</span>
      </div>
    </div>`,
  sprangskiss: `
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
        <span class="cap">MÄTVÄRDE 42,41 · ÖVER ÖVRE GRÄNS <b>→ SÄLJ</b></span>
      </div>
    </div>`,
  synop: `
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
  bikupa: `
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
        <span class="cap">SOCKERHALT <b class="count" data-to="46" data-suffix=" %">0 %</b> · RIK KÄLLA — <b>KÖP</b></span>
      </div>
    </div>`,
  /* fuga · comes: subjektet ligger kvar i blyerts under, och ur det stiger
     svaret en kvint upp. Bara en enda ton bryter formeln — kvinttonen besvaras
     med tonikan — och den ringas in: även avvikelsen är mätt från navet. */
  fuga: `
    <div class="av" data-for="fuga" aria-hidden="true">
      <div class="viz viz--comes">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          ${fgSystem(6, 212, 34)}
          <g class="ur">${fgNoter(FG_SUBJ, { x0: 56, k: 9 }).svg}</g>
          <g class="svar">${fgNoter(FG_COMES, { x0: 56, k: 9, ur: FG_SUBJ }).svg}</g>
          <circle class="tonal" cx="${56 + 4 * 9}" cy="${fgY(FG_COMES[FG_TONAL][0], 34)}" r="7.6" pathLength="100" />
          <text class="tlbl" x="${56 + 4 * 9}" y="43">TONALT SVAR</text>
        </svg>
        <span class="cap">COMES · SVARET EN KVINT UPP — INSATS T. 3</span>
      </div>
    </div>`,
}

/* --- Todos --- */
const TASKS = ['pull main', 'write tests', 'deploy']
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
const TODOS = {
  terminal: `
    <div class="av" data-for="terminal" aria-hidden="true">
      <div class="viz viz--tasks">
        ${TASKS.map((t, i) => `
          <span class="task" style="--i:${i}">
            <span class="box"><span class="box-o">[ ]</span><span class="box-x">[x]</span></span>${t}
          </span>`).join('')}
      </div>
    </div>`,
  editorial: `
    <div class="av" data-for="editorial" aria-hidden="true">
      <div class="viz viz--check">
        <svg class="mk" viewBox="0 0 24 24"><path class="tick" d="M4,12.5 l5,5 L20,5" /></svg>
        <span class="ecl">Uträttat<i class="strike"></i></span>
      </div>
    </div>`,
  bank: `
    <div class="av" data-for="bank" aria-hidden="true">
      <div class="viz viz--ring">
        <svg viewBox="0 0 44 44">
          <circle class="rt" cx="22" cy="22" r="18" />
          <circle class="rp" cx="22" cy="22" r="18" />
          <path class="rc" d="M14,22.5 l5,5 L30,15" />
        </svg>
      </div>
    </div>`,
  singularitet: `
    <div class="av" data-for="singularitet" aria-hidden="true">
      <div class="viz viz--selfcheck">
        ${[['öppna portalen', '.05'], ['hälsa på grannarna', '.4'], ['vinn designtävlingen', '.75']].map(([t, d]) => `
          <span class="task" style="--t:${d}s"><span class="box"></span><span class="txt">${t}</span></span>`).join('')}
      </div>
      ${dust()}
    </div>`,
  vaxel: `
    <div class="av" data-for="vaxel" aria-hidden="true">
      <div class="viz viz--exped">
        ${[['ankn. 101 söker', 0], ['ankn. 303 söker', 1], ['rikssamtal i kö', 2]].map(([t, i]) => `
          <span class="q" style="--i:${i}"><i class="lamp"></i><span class="lbl"><span class="who">${t}</span><span class="done">— expedierad</span></span></span>`).join('')}
      </div>
    </div>`,
  jacquard: `
    <div class="av" data-for="jacquard" aria-hidden="true">
      <div class="viz viz--halkort">
        <span class="card">
          ${[['22%', '30%'], ['46%', '68%'], ['74%', '30%']].map(([x, y], i) => `
            <i class="hole" style="--x:${x};--y:${y};--i:${i}"></i>`).join('')}
        </span>
        <span class="cap">tre hål · dagens mönster stansat</span>
      </div>
    </div>`,
  sprangskiss: `
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
        <span class="cap">SPÄRR <b class="count" data-to="3" data-suffix="/3">0/3</b> · EJ ÅTERGÅNG</span>
      </div>
    </div>`,
  synop: `
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
        <span class="cap">UPPKLARNANDE · <b class="count" data-to="3" data-suffix="/3 AVKLARADE">0/3 AVKLARADE</b></span>
      </div>
    </div>`,
  bikupa: `
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
        <span class="cap"><b class="count" data-to="3" data-suffix=" CELLER TÄCKTA">0 CELLER TÄCKTA</b> · FÖRRÅDET SLUTET</span>
      </div>
    </div>`,
  /* fuga · inversio: samma tonföljd, vänd upp och ner kring mittlinjens b.
     Varje not faller till sin spegelbild — uppgången blir nedgång, kadensen
     blir sitt eget svar. Axeln är ritad, för utan den är speglingen inte
     mätbar: inversionen har ingen egen tonföljd, bara subjektets och en axel. */
  fuga: `
    <div class="av" data-for="fuga" aria-hidden="true">
      <div class="viz viz--inversio">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          ${fgSystem(6, 212, 34)}
          <line class="axel" x1="50" y1="${fgY(3, 34)}" x2="206" y2="${fgY(3, 34)}" pathLength="100" />
          <text class="albl" x="52" y="8">SPEGELAXEL b</text>
          <g class="ur">${fgNoter(FG_SUBJ, { x0: 56, k: 9 }).svg}</g>
          <g class="svar">${fgNoter(FG_INV, { x0: 56, k: 9, ur: FG_SUBJ }).svg}</g>
        </svg>
        <span class="cap">INVERSIO · SUBJEKTET SPEGLAT — INSATS T. 5</span>
      </div>
    </div>`,
}

/* --- Stronk --- */
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
const STRONK = {
  terminal: `
    <div class="av" data-for="terminal" aria-hidden="true">
      <div class="viz viz--load">
        <span class="reps">SET 3/3 · <b class="count" data-to="12" data-suffix=" reps">0 reps</b></span>
        <span class="loadbar">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
      </div>
    </div>`,
  editorial: `
    <div class="av" data-for="editorial" aria-hidden="true">
      <div class="viz viz--tally">
        <svg viewBox="0 0 76 44">
          <path class="t t1" d="M12,7 V33" /><path class="t t2" d="M22,7 V33" />
          <path class="t t3" d="M32,7 V33" /><path class="t t4" d="M42,7 V33" />
          <path class="t tc" d="M7,31 L48,9" />
          <text class="tnum" x="58" y="27">5</text>
        </svg>
      </div>
    </div>`,
  bank: `
    <div class="av" data-for="bank" aria-hidden="true">
      <div class="viz viz--plates">
        <div class="rack">
          <span class="rod"></span>
          <span class="plate" style="--i:2;--h:58%"></span>
          <span class="plate" style="--i:1;--h:82%"></span>
          <span class="plate" style="--i:0;--h:100%"></span>
          <span class="plate" style="--i:0;--h:100%"></span>
          <span class="plate" style="--i:1;--h:82%"></span>
          <span class="plate" style="--i:2;--h:58%"></span>
        </div>
        <span class="val count" data-to="60" data-suffix=" kg">0 kg</span>
      </div>
    </div>`,
  singularitet: `
    <div class="av" data-for="singularitet" aria-hidden="true">
      <div class="viz viz--lift">
        <span class="bar">
          <span class="plate plate--small"></span><span class="plate plate--big"></span>
          <span class="rod"></span>
          <span class="plate plate--big"></span><span class="plate plate--small"></span>
        </span>
        <span class="reps">reps <b class="reps-n">0</b></span>
      </div>
      ${dust()}
    </div>`,
  vaxel: `
    <div class="av" data-for="vaxel" aria-hidden="true">
      <div class="viz viz--vev">
        <span class="rig">
          <span class="gauge">
            <svg viewBox="0 0 60 36" aria-hidden="true">
              <path class="arc" d="M6,30 A24,24 0 0 1 54,30" />
              <path class="arc2" d="M6,30 A24,24 0 0 1 54,30" pathLength="100" />
              <line class="needle" x1="30" y1="30" x2="30" y2="9" />
            </svg>
          </span>
          <span class="crank"><i class="arm"></i></span>
        </span>
        <span class="cap"><b class="count" data-to="24" data-suffix=" vev">0 vev</b> · ringer upp styrkan</span>
      </div>
    </div>`,
  jacquard: `
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
        <span class="cap"><b class="count" data-to="12" data-suffix=" skott">0 skott</b> · repsväv</span>
      </div>
    </div>`,
  sprangskiss: `
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
  synop: `
    <div class="av" data-for="synop" aria-hidden="true">
      <div class="viz viz--vindpil">
        <svg viewBox="0 0 152 46" preserveAspectRatio="xMidYMid meet">
          <circle class="stn" cx="22" cy="38" r="4.6" />
          <line class="shaft" x1="22" y1="38" x2="124" y2="7" pathLength="100" />
          ${BARB}
          <text class="kt" x="132" y="12">95 kt</text>
        </svg>
        <span class="cap">VINDSTYRKA <b class="count" data-to="12" data-suffix=" BEAUFORT">0 BEAUFORT</b> · ORKAN</span>
      </div>
    </div>`,
  bikupa: `
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
            <text class="mg" x="212" y="41">1/3 AV KROPPSVIKTEN</text>
          </g>
          <text class="hz" x="212" y="14">VINGSLAG 230 Hz</text>
        </svg>
        <span class="cap">LAST <b class="count" data-to="30" data-suffix=" mg">0 mg</b> · TUR 3/3 · HEM TILL KAKAN</span>
      </div>
    </div>`,
  /* fuga · augmentatio: inte en not tillkommer — varje notvärde fördubblas, och
     samma subjekt tar plötsligt fyra takter i stället för två. Noterna glider
     isär, huvudena öppnar sig (halv- och helnoter), och två taktstreck till
     måste dras för att rymma det. Tyngdlyftarens variant av samma tema. */
  fuga: `
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
        <span class="cap">AUGMENTATIO · SAMMA TONER PÅ <b class="count" data-to="4" data-suffix=" TAKTER">0 TAKTER</b></span>
      </div>
    </div>`,
}

const ANIM = { syntes: SYNTES, signal: SIGNAL, todos: TODOS, stronk: STRONK }
const animVariants = (app) => {
  const set = ANIM[app.id]
  return set ? Object.values(set).join('') : ''
}

/* ---------- Info-panel: byggd av den statiska stats-datan ---------- */
function infoPanel(app) {
  const p = stats.projects[app.id]
  if (!p || !p.available) {
    return `<div class="info-panel" id="info-${app.id}" role="region" aria-label="Om ${app.name}">
      <p class="info-tagline">${app.tagline}</p>
      <p class="info-foot">Ingen projektdata tillgänglig.</p>
    </div>`
  }
  const maxLang = Math.max(...p.languages.map((l) => l.lines), 1)
  const langs = p.languages.map((l) => `
    <div class="lang">
      <span class="lang__name">${l.name}</span>
      <span class="lang__bar"><span style="width:${Math.round((l.lines / maxLang) * 100)}%"></span></span>
      <span class="lang__n">${nf.format(l.lines)}</span>
    </div>`).join('')
  const stack = p.stack.map((s) => `<li>${s}</li>`).join('')
  return `
    <div class="info-panel" id="info-${app.id}" role="region" aria-label="Om ${app.name}">
      <p class="info-tagline">${app.tagline}</p>
      <dl class="info-metrics">
        <div><dt>Filer</dt><dd>${nf.format(p.files)}</dd></div>
        <div><dt>Rader</dt><dd>${nf.format(p.lines)}</dd></div>
      </dl>
      <div class="info-langs">${langs}</div>
      <ul class="info-stack">${stack}</ul>
    </div>`
}

/* ---------- Systemhälsa: ekosystemets samlade siffror ur stats ---------- */
function systemHealth() {
  const e = stats.ecosystem
  const built = new Date(stats.generatedAt).toLocaleDateString('sv-SE')
  const entries = Object.entries(stats.projects).filter(([, p]) => p.available)
  const maxLines = Math.max(...entries.map(([, p]) => p.lines), 1)
  const rows = entries.map(([id, p]) => `
    <div class="sys-row" data-app="${id}">
      <span class="sys-row__name">${p.name}</span>
      <span class="sys-row__bar"><span style="width:${Math.round((p.lines / maxLines) * 100)}%"></span></span>
      <span class="sys-row__n">${nf.format(p.lines)}</span>
    </div>`).join('')
  return `
    <div class="system">
      <div class="system__panel" id="system-panel" role="region" aria-label="Systemhälsa">
        <div class="system__head">
          <span class="system__title">Ekosystem</span>
          <span class="system__meta">${e.apps} appar · ${nf.format(e.files)} filer</span>
        </div>
        <div class="system__rows">${rows}</div>
        <div class="system__foot">
          <span><span class="live"></span> ${nf.format(e.lines)} rader kod</span>
          <span>byggd ${built}</span>
        </div>
      </div>
      <button class="system__toggle" id="system-toggle" aria-label="Visa systemhälsa" aria-expanded="false">
        <span class="live"></span>
      </button>
    </div>`
}

/* ---------- Skelett ---------- */
function appRow(app) {
  return `
    <div class="app-row" data-app="${app.id}">
      <a class="app-btn" href="${app.url}" data-name="${app.id}">
        <span class="app-btn__fx" aria-hidden="true"></span>
        <span class="app-btn__anim">${animVariants(app)}</span>
        <span class="app-btn__name">${app.name}</span>
      </a>
      <button class="info-toggle" data-target="info-${app.id}"
              aria-label="Mer om ${app.name}" aria-expanded="false">i</button>
      ${infoPanel(app)}
    </div>`
}

document.querySelector('#app').innerHTML = `
  <header class="topbar">
    <span class="wordmark">Portal</span>
    <div class="style-switch">
      <button class="style-switch__btn" data-act="prev" aria-label="Föregående stil">‹</button>
      <span class="style-switch__name" id="style-name">—</span>
      <button class="style-switch__btn" data-act="next" aria-label="Nästa stil">›</button>
      <button class="style-switch__lock" data-act="lock" aria-pressed="false"
              aria-label="Lås stilen">Lås</button>
    </div>
  </header>

  <main class="rows">
    ${apps.map(appRow).join('')}
  </main>

  ${systemHealth()}
`

/* ============================ Räknare (delad) ============================ */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
function countUp(elem) {
  const to = +elem.dataset.to
  const pre = elem.dataset.prefix || ''
  const suf = elem.dataset.suffix || ''
  if (prefersReduced) { elem.textContent = pre + nf.format(to) + suf; return }
  cancelAnimationFrame(elem._raf)
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / 900)
    const eased = 1 - Math.pow(1 - t, 3)
    elem.textContent = pre + nf.format(Math.round(to * eased)) + suf
    if (t < 1) elem._raf = requestAnimationFrame(step)
  }
  elem._raf = requestAnimationFrame(step)
}
function resetCount(elem) {
  cancelAnimationFrame(elem._raf)
  elem.textContent = (elem.dataset.prefix || '') + '0' + (elem.dataset.suffix || '')
}

/* ============================ Stilrotation + enhancers ============================ */
const LS_LOCK = 'portal.lockedStyle'
const LS_LAST = 'portal.lastStyle'
const nameEl = document.getElementById('style-name')
const lockBtn = document.querySelector('[data-act="lock"]')
const ids = styles.map((s) => s.id)

/* Enhancer per stil: kopplar hover→räknare för den aktiva variantens .count. */
function makeCountEnhancer(styleId) {
  return () => {
    const handlers = [...document.querySelectorAll('.app-btn')].map((btn) => {
      const counts = [...btn.querySelectorAll(`.av[data-for="${styleId}"] .count`)]
      if (!counts.length) return null
      const enter = () => counts.forEach(countUp)
      const leave = () => counts.forEach(resetCount)
      btn.addEventListener('mouseenter', enter)
      btn.addEventListener('focus', enter)
      btn.addEventListener('mouseleave', leave)
      btn.addEventListener('blur', leave)
      return { btn, enter, leave }
    }).filter(Boolean)
    return () => handlers.forEach(({ btn, enter, leave }) => {
      btn.removeEventListener('mouseenter', enter)
      btn.removeEventListener('focus', enter)
      btn.removeEventListener('mouseleave', leave)
      btn.removeEventListener('blur', leave)
    })
  }
}
/* Singularitet: stjärnfält + parallax + 3D-tilt + levande siffror vid hover.
   Allt injiceras/binds här och plockas bort av cleanup vid stilbyte. */
function singularitetEnhancer() {
  const cleanups = []

  // Stjärnfält i tre djuplager + vandringsljus, bakom allt (z: -1)
  const voidEl = document.createElement('div')
  voidEl.className = 'void'
  voidEl.setAttribute('aria-hidden', 'true')
  voidEl.innerHTML = `
    <i class="stars" data-depth="1"></i>
    <i class="stars" data-depth="2"></i>
    <i class="stars" data-depth="3"></i>
    <i class="lantern"></i>`
  const tints = ['rgba(155,217,192,', 'rgba(240,217,168,', 'rgba(240,168,168,']
  voidEl.querySelectorAll('.stars').forEach((layer, li) => {
    const n = [90, 60, 34][li]
    const shadows = []
    for (let i = 0; i < n; i++) {
      const base = Math.random() < 0.85 ? 'rgba(232,230,242,' : tints[(Math.random() * 3) | 0]
      const r = li === 2 && Math.random() < 0.3 ? 1 : 0
      shadows.push(`${(Math.random() * 104 - 2).toFixed(1)}vw ${(Math.random() * 104 - 2).toFixed(1)}vh 0 ${r}px ${base}${(0.25 + Math.random() * 0.6).toFixed(2)})`)
    }
    layer.style.boxShadow = shadows.join(',')
  })
  document.body.prepend(voidEl)
  cleanups.push(() => voidEl.remove())

  if (!prefersReduced) {
    // Parallax + ljus som följer pekaren
    const lantern = voidEl.querySelector('.lantern')
    const onMove = (e) => {
      voidEl.style.setProperty('--px', ((e.clientX / innerWidth - 0.5) * -22).toFixed(1) + 'px')
      voidEl.style.setProperty('--py', ((e.clientY / innerHeight - 0.5) * -14).toFixed(1) + 'px')
      lantern.style.transform = `translate3d(${e.clientX - innerWidth * 0.25}px, ${e.clientY - innerWidth * 0.25}px, 0)`
    }
    addEventListener('pointermove', onMove)
    cleanups.push(() => removeEventListener('pointermove', onMove))

    // Porten vrider sig mot pekaren
    document.querySelectorAll('.app-btn').forEach((btn) => {
      const move = (e) => {
        const r = btn.getBoundingClientRect()
        btn.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(2) + 'deg')
        btn.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -10).toFixed(2) + 'deg')
      }
      const leave = () => {
        btn.style.setProperty('--rx', '0deg')
        btn.style.setProperty('--ry', '0deg')
      }
      btn.addEventListener('pointermove', move)
      btn.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        btn.removeEventListener('pointermove', move)
        btn.removeEventListener('pointerleave', leave)
        btn.style.removeProperty('--rx')
        btn.style.removeProperty('--ry')
      })
    })
  }

  // Levande siffror så länge dörren är öppen; totalen nollställs aldrig
  const liveNumber = (appId, onTick, ms) => {
    const btn = document.querySelector(`.app-row[data-app="${appId}"] .app-btn`)
    if (!btn) return
    if (prefersReduced) { onTick(); return }
    let timer = null
    const start = () => { if (!timer) timer = setInterval(onTick, ms) }
    const stop = () => { clearInterval(timer); timer = null }
    btn.addEventListener('mouseenter', start)
    btn.addEventListener('focus', start)
    btn.addEventListener('mouseleave', stop)
    btn.addEventListener('blur', stop)
    cleanups.push(() => {
      stop()
      btn.removeEventListener('mouseenter', start)
      btn.removeEventListener('focus', start)
      btn.removeEventListener('mouseleave', stop)
      btn.removeEventListener('blur', stop)
    })
  }

  const fmt = (v) => v.toFixed(2).replace('.', ',')
  const tickV = document.querySelector('.av[data-for="singularitet"] .tick-v')
  const tickD = document.querySelector('.av[data-for="singularitet"] .tick-d')
  const base = 512.34
  let price = base
  liveNumber('signal', () => {
    price = Math.max(1, price + (Math.random() - 0.48) * 1.4)
    const pct = ((price - base) / base) * 100
    tickV.textContent = fmt(price)
    tickD.textContent = `${pct >= 0 ? '▲ +' : '▼ '}${fmt(pct)} %`
  }, 260)

  const repsEl = document.querySelector('.av[data-for="singularitet"] .reps-n')
  let reps = 0
  liveNumber('stronk', () => { repsEl.textContent = prefersReduced ? 12 : ++reps }, 1000)

  return () => cleanups.forEach((fn) => fn())
}

/* Kvittot: huvud och fot skrivs ut runt varuraderna (injiceras, städas vid
   stilbyte). Klockan på kvittot går i realtid; streckkoden är deterministiskt
   "slumpad" — ett kvitto ändrar sig inte mellan utskrifter. */
function kvittoEnhancer() {
  const rows = document.querySelector('.rows')

  const head = document.createElement('div')
  head.className = 'kv kv-head'
  head.innerHTML = `
    <span class="kv-shop">Portal &amp; Söner</span>
    <span class="kv-dim">— LÄNKHANDEL SEDAN 1994 —</span>
    <span class="kv-dim">Org.nr 556677-8899 · Kassa 03 · Kassör: FABLE-5</span>
    <span class="kv-dim kv-dt"></span>
    <span class="kv-rule" aria-hidden="true"></span>
    <span class="kv-cols" aria-hidden="true"><i>ARTIKEL</i><i>À-PRIS</i></span>`

  const foot = document.createElement('div')
  foot.className = 'kv kv-foot'
  foot.innerHTML = `
    <span class="kv-rule" aria-hidden="true"></span>
    <span class="kv-row kv-strong"><i>SUMMA</i><i>0:00</i></span>
    <span class="kv-row kv-dim"><i>Varav moms 25% på kreativitet</i><i>0:00</i></span>
    <span class="kv-row kv-dim"><i>Rabatt: "UTANFÖR BOXEN"</i><i>−100%</i></span>
    <span class="kv-row kv-strong"><i>ATT BETALA</i><i>0:00</i></span>
    <span class="kv-row kv-dim"><i>Betalsätt</i><i>HOVER</i></span>
    <span class="kv-row kv-dim"><i>Du har sparat idag</i><i>en backend</i></span>
    <span class="kv-rule" aria-hidden="true"></span>
    <span class="kv-barcode" aria-hidden="true"></span>
    <span class="kv-dim">7 350094 219942</span>
    <span class="kv-thanks">TACK FÖR DITT BESÖK<br>VÄLKOMMEN ÅTER</span>
    <span class="kv-dim">Bytesrätt gäller ej hyperlänkar.</span>
    <span class="kv-tear" aria-hidden="true">✂ · — · — · RIV HÄR · — · — · ✂</span>`

  const bc = foot.querySelector('.kv-barcode')
  let seed = 19940123
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647
  for (let i = 0; i < 42; i++) {
    const bar = document.createElement('i')
    bar.style.width = 1 + Math.floor(rnd() * 3) + 'px'
    bar.style.marginRight = 1 + Math.floor(rnd() * 3) + 'px'
    if (i === 0 || i === 20 || i === 41) bar.style.height = '112%'
    bc.appendChild(bar)
  }

  rows.prepend(head)
  rows.append(foot)

  const dt = head.querySelector('.kv-dt')
  const tick = () => {
    dt.textContent = new Date().toLocaleString('sv-SE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }
  tick()
  const timer = setInterval(tick, 30000)

  return () => {
    clearInterval(timer)
    head.remove()
    foot.remove()
  }
}

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
  ['ock', 'stronk', 234, 330, 4],
  ['varm', 'todos', 24, 470, 5],
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
        <span class="sy-note">SYNOPTISK, GR. <em>synoptikós</em> — ”SEDD TILLSAMMANS”</span>
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

/* Bikupan: sidan är en vaxkaka som hänger i sin ram. Kakan (cellrutnätet),
   yngelvärmen, solmärket och flygvektorerna injiceras här och rivs vid stilbyte
   — skelettets markup rörs inte.

   Allt utgår ur DANSGOLVET, och dansgolvet är Syntes-raden: värmen har sitt
   centrum där, sollinjen faller ner i den, och de tre flygvektorerna startar i
   dess cellvägg och slutar i var sin underapp. Därför mäts navets läge i DOM:en
   varje gång layouten kan ha flyttat den. En bäring utan dansgolv är ingen
   bäring — den ritas bokstavligen inte. */
const BK_RUTT = [
  ['signal', 1, 300], // bäring 40° — nektar
  ['todos', -1, 300], // bäring 155° — bygge
  ['stronk', 1, 520], // bäring 268° — drag
]
const BK_KM = { signal: '1,4 km', todos: '0,3 km', stronk: '2,2 km' }
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
    const hub = btn('syntes')
    if (!hub) return
    const h = hub.getBoundingClientRect()
    const hy = h.top + h.height / 2
    hive.style.setProperty('--hx', `${Math.round(h.left + h.width / 2)}px`)
    hive.style.setProperty('--hy', `${Math.round(hy)}px`)
    flyg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`)
    flyg.innerHTML = BK_RUTT.map(([app, side, bulge]) => {
      const t = btn(app)?.getBoundingClientRect()
      if (!t) return ''
      const sx = side > 0 ? h.right : h.left
      const ex = side > 0 ? t.right + 13 : t.left - 13
      const ey = t.top + t.height / 2
      const cx = side > 0 ? Math.max(sx, ex) + bulge : Math.min(sx, ex) - bulge
      const cy = (hy + ey) / 2
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
  ['syntes', 0, 1, 'DUX · SUBJEKTET'],       // ställer temat i takt 1
  ['signal', 2, 3, 'COMES · KVINTEN UPP'],   // tiger två takter, faller in i t. 3
  ['todos', 4, 5, 'INVERSIO · SPEGLAD'],
  ['stronk', 6, 7, 'AUGMENTATIO · 2:1'],
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
      <b>SUBJEKTET STÄLLS EN GÅNG — BESVARAS TRE</b>
      <b>EN TAKT = ${fgSek(1)} s · VARJE INSATS MÄTT FRÅN TAKT 1</b>
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
          <text class="fg-etikett" x="${r((x0 + s.slut) / 2)}" y="${r(fgY(0, bas, sp) + sp * 2.9)}">SUBJEKTET · T. 1–2</text>
        </g>`
      }
      return `<g class="fg-tystnad" data-app="${id}">${fgPaus(x0 + 12, bas, sp, paus)}
        <text class="fg-etikett" x="${r(x0 + 12 + sp * 1.4)}" y="${r(fgY(0, bas, sp) + sp * 2.2)}">TIGER ${paus} TAKTER</text></g>`
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
        paus ? `T. ${takt} · +${fgSek(paus)} s · ${namn}` : 'T. 9 · STRETTO · ALLA FYRA PÅ EN GÅNG'}</text>`
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

const enhancers = {
  terminal: makeCountEnhancer('terminal'),
  bank: makeCountEnhancer('bank'),
  vaxel: makeCountEnhancer('vaxel'),
  singularitet: singularitetEnhancer,
  kvitto: kvittoEnhancer,
  orrery: orreryEnhancer,
  jacquard: jacquardEnhancer,
  sprangskiss: sprangskissEnhancer,
  synop: synopEnhancer,
  bikupa: bikupaEnhancer,
  fuga: fugaEnhancer,
}
let cleanupEnhancer = null
function runEnhancer(id) {
  if (cleanupEnhancer) { cleanupEnhancer(); cleanupEnhancer = null }
  if (enhancers[id]) cleanupEnhancer = enhancers[id]()
}

function applyStyle(id) {
  if (!ids.includes(id)) id = DEFAULT_STYLE
  document.documentElement.dataset.style = id
  nameEl.textContent = styles.find((s) => s.id === id).label
  localStorage.setItem(LS_LAST, id)
  runEnhancer(id)
}

function reflectLock() {
  const locked = localStorage.getItem(LS_LOCK)
  const active = locked && locked === document.documentElement.dataset.style
  lockBtn.setAttribute('aria-pressed', String(!!active))
  lockBtn.textContent = active ? 'Låst' : 'Lås'
  lockBtn.classList.toggle('is-locked', !!active)
}

function pickInitial() {
  const wanted = new URLSearchParams(location.search).get('style')
  if (wanted && ids.includes(wanted)) return wanted
  const locked = localStorage.getItem(LS_LOCK)
  if (locked && ids.includes(locked)) return locked
  const last = localStorage.getItem(LS_LAST)
  const pool = ids.length > 1 ? ids.filter((id) => id !== last) : ids
  return pool[Math.floor(Math.random() * pool.length)]
}

applyStyle(pickInitial())
reflectLock()

/* Bläddra n steg i stilrotationen (wrap:ar åt båda håll). */
function stepStyle(delta) {
  const cur = ids.indexOf(document.documentElement.dataset.style)
  applyStyle(ids[(cur + delta + ids.length) % ids.length])
  reflectLock()
}

document.querySelector('.style-switch').addEventListener('click', (e) => {
  const act = e.target.closest('[data-act]')?.dataset.act
  if (!act) return
  if (act === 'next') stepStyle(1)
  else if (act === 'prev') stepStyle(-1)
  else if (act === 'lock') {
    const isLocked = localStorage.getItem(LS_LOCK) === document.documentElement.dataset.style
    if (isLocked) localStorage.removeItem(LS_LOCK)
    else localStorage.setItem(LS_LOCK, document.documentElement.dataset.style)
    reflectLock()
  }
})

/* Piltangenter ←/→ bläddrar stil (som prev/next). Hoppar över om fokus ligger
   i ett textfält, så vanlig markörnavigation inte kapas. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const t = e.target
  if (t.isContentEditable || t.matches?.('input, textarea, select')) return
  e.preventDefault()
  stepStyle(e.key === 'ArrowRight' ? 1 : -1)
})

/* ============================ Info-paneler ============================ */
const closeAllInfo = () => {
  document.querySelectorAll('.info-panel.is-open').forEach((p) => p.classList.remove('is-open'))
  document.querySelectorAll('.info-toggle[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'))
}
document.querySelectorAll('.info-toggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const panel = document.getElementById(btn.dataset.target)
    const willOpen = !panel.classList.contains('is-open')
    closeAllInfo()
    if (willOpen) {
      panel.classList.add('is-open')
      btn.setAttribute('aria-expanded', 'true')
    }
  })
})

/* ============================ Systemhälsa ============================ */
const sysToggle = document.getElementById('system-toggle')
const sysPanel = document.getElementById('system-panel')
sysToggle.addEventListener('click', (e) => {
  e.stopPropagation()
  const open = sysPanel.classList.toggle('is-open')
  sysToggle.setAttribute('aria-expanded', String(open))
})

/* ============================ Stäng vid klick utanför / Esc ============================ */
document.addEventListener('click', (e) => {
  if (!e.target.closest('.info-toggle') && !e.target.closest('.info-panel')) closeAllInfo()
  if (!e.target.closest('.system')) {
    sysPanel.classList.remove('is-open')
    sysToggle.setAttribute('aria-expanded', 'false')
  }
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllInfo()
    sysPanel.classList.remove('is-open')
    sysToggle.setAttribute('aria-expanded', 'false')
  }
})
