import './tunnelbana.css'
import { makeCountEnhancer } from '../shared.js'

/* Tunnelbanan: sidan är en linjenätskarta i Becks schematiska tradition —
   45°/90°-geometri, primärfärger på papper. Tre linjer: grön (Signal), röd
   (Todos), blå (Stronk). Navets särställning är ren topologi: SYNTES ÄR NÄTETS
   ENDA BYTESPUNKT. De tre linjerna korsar varandra ute på kartan utan station,
   och den enda plats där man kan byta mellan dem är navets perrong — kapseln
   som spänner över alla tre spårparen. En underapp kan inte nå en annan utan
   att passera navet; det är inte en dekoration utan nätets byggnadsregel.

   Mekaniken i vilotillståndet: varje underapp bär sin restid till bytespunkten
   (`◉ N MIN`, 1 station = 1 minut), och mellanstationerna ritas ut på linjen
   så att talet går att räkna på kartan: N-1 mellanstationer + ankomst = N. */

/* Restid till bytespunkten per linje. Hörnetiketterna i tunnelbana.css
   (`◉ 4 MIN` m.fl.) bär samma tal — ändras de ena måste de andra med,
   annars ljuger kartan om sina egna mellanstationer. */
const TB_MIN = { signal: 4, todos: 6, stronk: 3 }
const TB_APPAR = ['signal', 'todos', 'stronk']
const SVG_NS = 'http://www.w3.org/2000/svg'

/* En linje är en bygel: in från kartkanten längs navets rad, 90°-krök med
   radie, ner till sin egen rad och ut mot samma kant igen. Grön och blå kröker
   till höger om knappkolumnen, röd till vänster — så korsas linjerna ute på
   kartan (utan station) men löper parallellt bara genom navet. */
const led = (xStart, y0, bx, y1, xEnd, sida, R) => sida > 0
  ? `M${xStart},${y0} H${bx - R} A${R},${R} 0 0 1 ${bx},${y0 + R} V${y1 - R} A${R},${R} 0 0 1 ${bx - R},${y1} H${xEnd}`
  : `M${xStart},${y0} H${bx + R} A${R},${R} 0 0 0 ${bx},${y0 + R} V${y1 - R} A${R},${R} 0 0 0 ${bx + R},${y1} H${xEnd}`

/* Nätet injiceras bakom skelettet och rivs vid stilbyte. Knapparna är
   genomskinliga, så linjerna löper bokstavligen genom stationerna — därför
   måste geometrin mätas i DOM:en varje gång layouten kan ha flyttat en rad. */
function tunnelbanaEnhancer() {
  const cleanups = []
  const net = document.createElement('div')
  net.className = 'tb-net'
  net.setAttribute('aria-hidden', 'true')
  net.innerHTML = `<svg class="tb-karta" xmlns="${SVG_NS}"></svg>`
  document.body.prepend(net)
  cleanups.push(() => net.remove())
  const svg = net.querySelector('.tb-karta')

  const btn = (id) => document.querySelector(`.app-row[data-app="${id}"] .app-btn`)
  const mid = (r) => r.top + r.height / 2

  const place = () => {
    const hub = btn('syntes')
    if (!hub) return
    const h = hub.getBoundingClientRect()
    const W = innerWidth
    const H = innerHeight
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const yh = mid(h)
    const R = 14
    /* krökarna kläms in mot kartkanten på smal skärm i stället för att knuffa
       ut sidan — nätet ligger i en fixed svg och kan aldrig ge scroll */
    const xR2 = Math.min(h.right + 104, W - 16)
    const xR1 = Math.min(h.right + 58, xR2 - 24)
    const xL1 = Math.max(h.left - 58, 14)
    const rutt = {
      signal: { o: -11, sida: 1, bx: xR1 },
      todos: { o: 0, sida: -1, bx: xL1 },
      stronk: { o: 11, sida: 1, bx: xR2 },
    }
    svg.innerHTML = TB_APPAR.map((app) => {
      const t = btn(app)?.getBoundingClientRect()
      if (!t) return ''
      const { o, sida, bx } = rutt[app]
      const y0 = yh + o
      const y1 = mid(t)
      const kant = sida > 0 ? -4 : W + 4
      const navK = sida > 0 ? h.right + 4 : h.left - 4
      const appK = sida > 0 ? t.right + 4 : t.left - 4
      /* tb-bas är hela linjen; tb-dra är sträckan nav → station som tåget kör —
         riktningen börjar i navet, så tågets dashoffset-lopp slutar där: allt
         på linjen anländer till bytespunkten. Mellanstationerna sätts jämnt på
         den lodräta sträckan mellan krökarna, där inget skymmer dem — talet i
         hörnetiketten ska gå att räkna på kartan. */
      const stn = Array.from({ length: TB_MIN[app] - 1 }, (_, k) => {
        const yv = y0 + R + ((y1 - y0 - 2 * R) * (k + 1)) / TB_MIN[app]
        return `<circle cx="${bx}" cy="${yv.toFixed(1)}" r="3.4" />`
      }).join('')
      return `<g class="tb-line" data-app="${app}">
        <path class="tb-bas" d="${led(kant, y0, bx, y1, kant, sida, R)}" />
        <path class="tb-tag" d="${led(navK, y0, bx, y1, appK, sida, R)}" pathLength="100" />
        <g class="tb-stn">${stn}</g>
      </g>`
    }).join('')
  }
  place()
  let raf = 0
  const onMove = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place) }
  addEventListener('resize', onMove)
  addEventListener('scroll', onMove, { passive: true })
  cleanups.push(() => {
    removeEventListener('resize', onMove)
    removeEventListener('scroll', onMove)
    cancelAnimationFrame(raf)
  })

  cleanups.push(makeCountEnhancer('tunnelbana')())
  return () => cleanups.forEach((fn) => fn())
}

const viz = (app, inre) => `
  <div class="av" data-for="tunnelbana" aria-hidden="true">
    ${inre}
  </div>`

export default {
  id: 'tunnelbana',
  label: 'Tunnelbanan',
  anim: {
    /* navet · bytespunkten i förstoring: sex spår (kartans tre streck är spårPAR),
       kapseln över alla sex, tre tåg som löper in samtidigt — och två resenärer
       som byter in mot mittenlinjen. Spårnumren 1–6 är hörnetikettens tal. */
    syntes: viz('syntes', `
      <div class="viz viz--bytet">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          ${[['gron', 8], ['gron', 13], ['rod', 20], ['rod', 25], ['bla', 32], ['bla', 37]]
            .map(([f, y], i) => `<text class="spnr" x="2" y="${y + 1.8}">${i + 1}</text>
              <line class="spar spar--${f}" x1="10" y1="${y}" x2="216" y2="${y}" />`).join('')}
          <rect class="hall" x="98" y="3" width="20" height="40" rx="10" />
          <rect class="tag tag--gron" x="-26" y="10" width="16" height="6" rx="2.5" />
          <rect class="tag tag--rod" x="226" y="17" width="16" height="6" rx="2.5" />
          <rect class="tag tag--bla" x="-26" y="34" width="16" height="6" rx="2.5" />
          <circle class="byte byte--a" cx="108" cy="13" r="2.1" />
          <circle class="byte byte--b" cx="108" cy="32" r="2.1" />
        </svg>
        <span class="cap">BYTE <b class="count" data-to="45" data-suffix=" S">0 S</b></span>
      </div>`),
    /* signal · blocksignalerna: tåget accelererar genom blocken och varje
       försignal slår om bakom det — den fjärde står fortfarande i kör. */
    signal: viz('signal', `
      <div class="viz viz--forsignal">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          <line class="rals" x1="6" y1="36" x2="210" y2="36" />
          ${[52, 102, 152, 198].map((x, i) => `
            <g class="sig${i === 3 ? ' sig--fri' : ''}" style="--i:${i}" transform="translate(${x},0)">
              <line x1="0" y1="36" x2="0" y2="22" />
              <circle class="gron" cx="0" cy="18" r="3.2" />
              <circle class="rod" cx="0" cy="18" r="3.2" />
            </g>`).join('')}
          <g class="tag">
            <rect x="4" y="26" width="26" height="8" rx="3" />
            <rect class="fon" x="23" y="28" width="5" height="4" rx="1" />
          </g>
        </svg>
        <span class="cap"><b class="count" data-to="80" data-suffix=" KM/H">0 KM/H</b></span>
      </div>`),
    /* todos · vagnskartan: linjediagrammet ovanför dörren. Resan börjar i
       bytespunkten (kapselsymbolen), markören stegar sex hållplatser och de
       passerade fylls i — kvar står de öppna. Sex steg = hörnetikettens 6 MIN. */
    todos: viz('todos', `
      <div class="viz viz--vagnskarta">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          <line class="ln" x1="14" y1="24" x2="202" y2="24" />
          <rect class="hpl" x="10.5" y="17" width="7" height="14" rx="3.5" />
          ${Array.from({ length: 8 }, (_, i) => `
            <circle class="stn${i < 6 ? ' pass' : ''}" style="--i:${i + 1}" cx="${14 + (i + 1) * 23.5}" cy="24" r="3.4" />`).join('')}
          <circle class="mark" cx="14" cy="24" r="6" />
        </svg>
        <span class="cap"><b class="count" data-to="6" data-prefix="◉ +" data-suffix=" MIN">◉ +0 MIN</b></span>
      </div>`),
    /* stronk · bergrummet: sektionen genom den blå linjens djupstation.
       Rulltrappan dras ner genom berget, salen sprängs ur, och djupmåttet
       växer till −30 m — tyngden mätt i meter berg ovanför perrongen. */
    stronk: viz('stronk', `
      <div class="viz viz--bergrum">
        <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
          <line class="mark0" x1="8" y1="7" x2="208" y2="7" />
          <g class="berg">
            ${Array.from({ length: 14 }, (_, i) => `<line x1="${18 + i * 14}" y1="8.5" x2="${11 + i * 14}" y2="15.5" />`).join('')}
          </g>
          <path class="rull" d="M34,7 L126,41" pathLength="100" />
          <g class="steg">
            ${[0.18, 0.32, 0.46, 0.6, 0.74].map((t, i) => {
              const x = 34 + 92 * t
              const y = 7 + 34 * t + 1.5
              return `<line style="--i:${i}" x1="${(x - 4).toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`
            }).join('')}
          </g>
          <path class="grotta" d="M132,45 C133,24 143,17 158,17 C173,17 183,24 184,45" pathLength="100" />
          <line class="plf" x1="140" y1="45" x2="176" y2="45" />
          <g class="front">
            <rect x="150" y="33" width="16" height="12" rx="2" />
            <rect class="ruta" x="153" y="36" width="10" height="4" rx="1" />
          </g>
          <g class="djup">
            <line class="lod" x1="198" y1="7" x2="198" y2="43" />
            <path class="pil" d="M198,43 l-2.6,-4.4 h5.2 z" />
          </g>
        </svg>
        <span class="cap"><b class="count" data-to="30" data-prefix="−" data-suffix=" M">−0 M</b></span>
      </div>`),
  },
  enhancer: tunnelbanaEnhancer,
}
