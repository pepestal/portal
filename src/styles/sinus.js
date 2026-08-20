import './sinus.css'
import { makeCountEnhancer, nf } from '../shared.js'
import stats from '../data/stats.json'
import { apps } from '../apps.js'

/* EKG-remsans grammatik (sinus). Remsan har bara två inställningar, och de står
   i huvudet: pappershastigheten (mm/s) och förstärkningen (mm/mV). Varje kurva
   ritas i sina EGNA enheter — millisekunder och millivolt — och får sina
   millimeter ur just de två talen. En kurva har alltså inga egna mått; den har
   papperets.

   Hierarkin är retledningens, och den går bara åt ett håll. Sinusknutan fyrar av
   vid t = 0. Förmaket hör det först (P-vågen, +0,04 s), AV-noden håller impulsen
   (PQ-sträckan, +0,12 s) och kammaren får den sist (QRS, +0,20 s). Noden själv
   har ingen kurva — dess signal är för svag för att nå huden — så den enda bild
   vi någonsin får av navet ÄR de tre andra. */
const SN_MMS = 50    // mm/s: dubbel pappershastighet, annars går fördröjningarna inte att mäta
const SN_MMMV = 5    // mm/mV: halv förstärkning, annars går kammarens R ur kanalen
const SN_BPM = 72
const SN_RR = 60 / SN_BPM                        // 0,833 s mellan två slag
/* Kanal, vävnad, insats (ms efter nodens avfyrning) och egenrytm (slag/min utan
   nod). Egenrytmerna är de tre talen som bevisar hierarkin: lämnade åt sig
   själva slår de 60, 45 och 32 — att alla tre ändå läser 72 är nodens verk. */
const SN_KANAL = [
  ['syntes', 'SA-NOD', 0, 72],
  ['signal', 'FÖRMAK', 40, 60],
  ['ethos', 'AV-NOD', 120, 45],
  ['hexis', 'KAMMARE', 200, 32],
]
const snSek = (ms) => (ms / 1000).toFixed(2).replace('.', ',')
/* Millimeterpapper med k enheter per mm: x kommer ur pappershastigheten, y ur
   förstärkningen. Byt ett av talen och hela kurvan byter mått — det är precis
   vad remsans huvud lovar. */
function snSkala(k, mmMv = SN_MMMV) {
  const r = (v) => +v.toFixed(2)
  return {
    x: (ms) => r(ms / 1000 * SN_MMS * k),
    y: (mv) => r(-mv * mmMv * k),
    mm: (mm) => r(mm * k),
  }
}
/* Slagets delar, var och en i sin ägares hand. P är förmakets, PQ-sträckan är
   AV-nodens hålltid (en rak linje — dess arbete syns som ett UPPEHÅLL, inte som
   en form), QRS och T är kammarens. Noden får ingen del alls. Origo är alltid
   nodens avfyrning: allt på remsan mäts därifrån. */
function snDelar(s) {
  const { x, y } = s
  return {
    p: `M${x(40)},0 Q${x(80)},${y(.5)} ${x(120)},0`,
    pq: `M${x(120)},0 H${x(200)}`,
    qrs: `M${x(200)},0 L${x(212)},${y(-.15)} L${x(224)},${y(2.4)} L${x(244)},${y(-.5)} L${x(265)},0 L${x(300)},0`,
    t: `M${x(400)},0 C${x(455)},${y(.55)} ${x(505)},${y(.6)} ${x(580)},0`,
  }
}
/* Kalibreringspulsen: 1 mV som en fyrkantvåg. Utan den är varje utslag på
   remsan ett streck utan storlek — den är måttstocken själv, och maskinen
   skriver den likadant på alla fyra kanaler. */
const snKal = (s) => `M0,0 H${s.mm(2)} V${s.y(1)} H${s.mm(7)} V0 H${s.mm(9)}`

/* Sinusrytmen: sidan är en EKG-remsa. Millimeterpappret ligger i CSS, men själva
   registreringen — fyra kanalers baslinjer, maskinens kalibreringspuls,
   taktstrecken och kurvorna — mäts fram i DOM:en här och rivs vid stilbyte.
   Skelettets markup rörs inte.

   Allt på remsan har sin nollpunkt i NAVETS rad. Taktstrecken ritas ur nodens
   frekvens och skär alla fyra kanalerna, och varje underapps kurva placeras
   `fördröjning × pappershastighet` till höger om strecket. Fördröjningen är
   därför inte en siffra i en text — den är ett antal millimeterrutor man kan
   räkna på pappret. Navets egen kanal är tom: sinusknutans signal är för svag
   för att nå huden, så det enda man någonsin ser av den är de tre andra.

   Det enda som rör sig i vila är gnistan som vandrar taktstreck för taktstreck
   längs navets kanal, ett taktstreck i taget — noden fyrar av vare sig någon
   tittar eller ej. */
function sinusEnhancer() {
  const cleanups = []
  const remsa = document.createElement('div')
  remsa.className = 'sn-remsa'
  remsa.setAttribute('aria-hidden', 'true')
  remsa.innerHTML = `
    <i class="sn-huvud">
      <b class="sn-titel">EKG · ${apps.length} KANALER · AVL II</b>
      <b>${SN_MMS} mm/s · ${SN_MMMV} mm/mV · 0,05–150 Hz</b>
      <b class="sn-lampa">SINUS ${SN_BPM}/min</b>
      <b class="sn-tid">SLAG 0</b>
    </i>
    <svg class="sn-plan" xmlns="http://www.w3.org/2000/svg"></svg>
    <i class="sn-fot">
      <b>RYTM: SINUS · REGELBUNDEN · ${apps.length} KANALER KOPPLADE</b>
      <b>TAKT UR PAPPRET: 600 ÷ 8,3 STORRUTOR = ${SN_BPM}/min</b>
      <b>PR 0,16 s · QRS 0,09 s · QT 0,38 s · ${nf.format(stats.ecosystem.lines)} RADER REGISTRERADE</b>
    </i>`
  document.body.prepend(remsa)
  cleanups.push(() => remsa.remove())

  /* Slagräknaren i huvudet: maskinens enda löpande siffra, och den räknar i
     nodens takt — inte i sekunder. */
  const tid = remsa.querySelector('.sn-tid')
  let slag = 0
  const tick = () => {
    slag++
    tid.textContent = `SLAG ${nf.format(slag)} · t + ${(slag * SN_RR).toFixed(1).replace('.', ',')} s`
  }
  tick()
  const timer = setInterval(tick, SN_RR * 1000)
  cleanups.push(() => clearInterval(timer))

  const plan = remsa.querySelector('.sn-plan')
  const place = () => {
    const rader = SN_KANAL.map(([id]) => document.querySelector(`.app-row[data-app="${id}"]`))
    if (rader.some((r) => !r)) return
    const g = rader.map((r) => r.getBoundingClientRect())
    const W = innerWidth, H = innerHeight
    const k = W < 760 ? 4 : W < 1100 ? 5 : 6          // px per mm på skärmens papper
    const s = snSkala(k)
    const d = snDelar(s)
    /* Baslinjer och remsans start snäpps till millimeterrutan, så att
       måttsättningen går att räkna i rutor med ögat. Taktavståndet snäpps
       däremot INTE: 0,83 s är 8,3 storrutor och landar med flit mellan
       linjerna — det är just därför man räknar rutor för att få fram pulsen. */
    const snap = (v) => Math.round(v / k) * k
    const M = snap(Math.max(14, Math.min(88, W * .055)))
    const x0 = snap(M + s.mm(20))                     // remsan börjar när kanaletiketten är klar
    const rr = s.x(SN_RR * 1000)
    const hoger = W - M
    const bas = g.map((r) => snap(r.top + r.height / 2))
    const takter = []
    for (let x = x0; x < hoger; x += rr) takter.push(+x.toFixed(1))
    const topp = bas[0] - s.mm(10), botten = bas[3] + s.mm(10)
    const r = (v) => +v.toFixed(1)

    /* Taktstrecken: nodens frekvens, dragen tvärs igenom alla fyra kanalerna.
       Ingen kanal har ett eget streck — det finns bara ett tidssystem på remsan. */
    const strecken = takter.map((x, j) => `
      <line class="sn-takt" style="--j:${j}" x1="${x}" y1="${topp}" x2="${x}" y2="${botten}" />`).join('')
    const rrMatt = takter.length > 1 ? `
      <g class="sn-rrmatt">
        <path d="M${takter[0]},${topp - s.mm(1.5)} v-${s.mm(1.5)} H${takter[1]} v${s.mm(1.5)}" />
        <text x="${r((takter[0] + takter[1]) / 2)}" y="${topp - s.mm(4)}">R–R 0,83 s = 41,7 mm</text>
      </g>` : ''

    /* En kanal: etikett, maskinens kalibreringspuls, baslinje och — för de tre
       underapparna — deras andel av slaget, utsatt vid varje taktstreck. */
    const kanaler = SN_KANAL.map(([id, namn, ms, egen], i) => {
      const y = bas[i], nav = !ms
      const form = nav
        ? `<g class="sn-nod"><circle cx="0" cy="0" r="${s.mm(.9)}" /><circle class="karna" cx="0" cy="0" r="${s.mm(.3)}" /></g>`
        : id === 'signal'
          ? `<path class="sn-spar" style="--t:40;--d:80" d="${d.p}" pathLength="100" />`
          : id === 'ethos'
            ? `<path class="sn-spar sn-spar--hall" style="--t:120;--d:80" d="${d.pq}" pathLength="100" />
               <line class="sn-port" x1="${s.x(120)}" y1="${-s.mm(1.6)}" x2="${s.x(120)}" y2="${s.mm(1.6)}" />
               <line class="sn-port" x1="${s.x(200)}" y1="${-s.mm(1.6)}" x2="${s.x(200)}" y2="${s.mm(1.6)}" />`
            : `<path class="sn-spar" style="--t:200;--d:100" d="${d.qrs}" pathLength="100" />
               <path class="sn-spar" style="--t:400;--d:180" d="${d.t}" pathLength="100" />`
      const slagen = takter.map((x, j) => `
        <g class="sn-slag" style="--j:${j}" transform="translate(${x} ${y})">${form}</g>`).join('')
      /* Fördröjningen måttsätts en gång, vid remsans första slag: från
         taktstrecket till kurvans början, i millimeter man kan räkna. */
      const matt = nav || !takter.length ? '' : `
        <g class="sn-matt" transform="translate(${takter[0]} ${y})">
          <path class="klaff" d="M0,${s.mm(3.4)} v${s.mm(1.4)} H${s.x(ms)} v-${s.mm(1.4)}" />
          <text x="${s.x(ms) / 2}" y="${s.mm(7)}">+${snSek(ms)} s = ${s.x(ms) / k} mm</text>
        </g>`
      return `<g class="sn-kanal" data-app="${id}">
        <line class="sn-bas" x1="${M}" y1="${y}" x2="${W}" y2="${y}" />
        <path class="sn-kal" transform="translate(${M} ${y})" d="${snKal(s)}" pathLength="100" />
        <text class="sn-lbl" x="${M}" y="${y - s.mm(9.6)}">KAN ${i + 1} · ${namn}</text>
        <text class="sn-egen" x="${M}" y="${y - s.mm(6.8)}">${nav
          ? `${egen}/min`
          : `EGEN ${egen}/min → ${SN_BPM}/min`}</text>
        ${slagen}${matt}
      </g>`
    }).join('')

    /* Retledningen: samma impuls, sedd nedför sidan. Linjen lutar därför att
       varje kanal får den senare än den föregående — lutningen ÄR fördröjningen,
       och den ritas bara när man pekar på navet, för det är då den finns. */
    const retled = takter.map((x, j) => `
      <g class="sn-vag" style="--j:${j}">
        <polyline points="${SN_KANAL.map(([, , ms], i) => `${r(x + s.x(ms))},${bas[i]}`).join(' ')}" pathLength="100" />
        ${SN_KANAL.map(([, , ms], i) => `<circle cx="${r(x + s.x(ms))}" cy="${bas[i]}" r="${s.mm(.5)}" />`).join('')}
      </g>`).join('')
    const retledLbl = takter.length ? `
      <text class="sn-vaglbl" x="${r(takter[0] + s.x(200) + 6)}" y="${bas[3] + s.mm(3.4)}">RETLEDNING · 0 → 0,20 s</text>` : ''

    plan.setAttribute('viewBox', `0 0 ${W} ${H}`)
    plan.style.setProperty('--sn-varv', `${(takter.length * SN_RR).toFixed(2)}s`)
    plan.innerHTML = `${strecken}${rrMatt}${kanaler}<g class="sn-retled">${retled}${retledLbl}</g>`
  }
  place()
  addEventListener('resize', place)
  cleanups.push(() => removeEventListener('resize', place))

  cleanups.push(makeCountEnhancer('sinus')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'sinus',
  /* Remsan bygger på att alla kanaler delar EN tidsaxel: `+0,04 s` ÄR två
     millimeterrutor åt höger på samma papper. Två spalter ger två papper och
     gör påståendet falskt. Se docs/LAYOUT.md. */
  enspalt: true,
  label: 'Sinusrytmen',
  anim: {
  /* sinus · slaget: den enda kanal där hela hjärtslaget står samlat, och det är
     ritat i de tre andras pennor — P i förmakets, PQ-sträckan i AV-nodens, QRS
     och T i kammarens. Noden ger ingen linje av sig själv; den ger takten, och
     takten syns bara som avståndet mellan två röda streck. Två slag ritas, i
     verklig tid: det andra faller in 0,83 s efter det första. */
  syntes: (() => {
  const s = snSkala(2.5), d = snDelar(s), rr = s.x(SN_RR * 1000), x0 = 24
  const takt = (i) => {
    const x = (x0 + i * rr).toFixed(1)
    return `<g class="takt" style="--i:${i}">
      <line x1="${x}" y1="7" x2="${x}" y2="42" />
      <circle cx="${x}" cy="34" r="2.1" />
    </g>`
  }
  const slag = (i) => `<g class="slag" style="--i:${i}" transform="translate(${(x0 + i * rr).toFixed(1)} 34)">
      <path class="del" data-app="signal" style="--t:40;--d:80"   d="${d.p}" pathLength="100" />
      <path class="del" data-app="ethos"  style="--t:120;--d:80"  d="${d.pq}" pathLength="100" />
      <path class="del" data-app="hexis" style="--t:200;--d:100" d="${d.qrs}" pathLength="100" />
      <path class="del" data-app="hexis" style="--t:400;--d:180" d="${d.t}" pathLength="100" />
    </g>`
  return `
  <div class="av" data-for="sinus" aria-hidden="true">
    <div class="viz viz--knuta">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <line class="bas" x1="6" y1="34" x2="210" y2="34" />
        ${[0, 1].map(takt).join('')}
        ${[0, 1].map(slag).join('')}
        <g class="rr">
          <path d="M${x0},44 H${(x0 + rr).toFixed(1)}" pathLength="100" />
          <text x="${(x0 + rr / 2).toFixed(1)}" y="42">R–R 0,83 s</text>
        </g>
        <text class="sa" x="${x0}" y="5.4">SA ⊙</text>
        <text class="gain" x="210" y="44">VERKLIG TID · ${SN_BPM}/min</text>
      </svg>
      <span class="cap">R–R 0,83 s · <b class="count" data-to="3" data-suffix=" PENNOR">0 PENNOR</b></span>
    </div>
  </div>`
})(),
  /* sinus · P-vågen: förmaket är det första som hör noden, och utslaget är så
     litet att kanalen måste köras på dubbel förstärkning för att det ska synas
     alls. Det som mäts är inte vågen utan AVSTÅNDET till det röda strecket:
     två millimeterrutor, 0,04 s. Kommer vågen utan streck före sig är det inte
     en P-våg — då är det förmaket som slagit själv. */
  signal: (() => {
  const s = snSkala(9, 10), d = snDelar(s), x0 = 96
  return `
  <div class="av" data-for="sinus" aria-hidden="true">
    <div class="viz viz--pvag">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <line class="bas" x1="6" y1="34" x2="210" y2="34" />
        ${[0, 1].map((i) => `<rect class="ruta" style="--i:${i}" x="${x0 + i * s.mm(1)}" y="34" width="${s.mm(1)}" height="${s.mm(1)}" />`).join('')}
        <g class="takt"><line x1="${x0}" y1="7" x2="${x0}" y2="43" /><circle cx="${x0}" cy="34" r="2.1" /></g>
        <g class="spar" transform="translate(${x0} 34)">
          <path class="del" style="--t:40;--d:80" d="${d.p}" pathLength="100" />
          <path class="del del--vila" style="--t:120;--d:100" d="${d.pq}" pathLength="100" />
        </g>
        <g class="matt">
          <path class="klaff" d="M${x0},26 v-4 H${x0 + s.x(40)} v4" />
          <text class="hoger" x="${x0 - 6}" y="29">+0,04 s = 2 RUTOR</text>
        </g>
        <text class="sa" x="${x0}" y="5.4">SA ⊙</text>
        <text class="gain" x="210" y="44">UTSNITT ×6 · 10 mm/mV</text>
        <line class="penna" x1="0" y1="4" x2="0" y2="44" />
      </svg>
      <span class="cap">P-VÅG · +<b class="count" data-to="40" data-suffix=" ms">0 ms</b></span>
    </div>
  </div>`
})(),
  /* sinus · hålltiden: AV-noden är den enda struktur vars arbete inte har någon
     form. Den tar emot förmakets våg, HÅLLER den i 0,08 s — fyra rutor rakt
     streck, kammarens fyllnadstid — och släpper den vidare. På remsan syns det
     som ingenting alls, och ändå är det en kö: impulsen står still och rutorna
     räknas av. Utan noden kommer aldrig något in i den. */
  ethos: (() => {
  const s = snSkala(9), d = snDelar(s), x0 = 24
  const port = x0 + s.x(120), slapp = x0 + s.x(200)
  return `
  <div class="av" data-for="sinus" aria-hidden="true">
    <div class="viz viz--halltid">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <line class="bas" x1="6" y1="34" x2="210" y2="34" />
        ${[0, 1, 2, 3].map((i) => `<rect class="ruta" style="--i:${i}" x="${port + i * s.mm(1)}" y="34" width="${s.mm(1)}" height="${s.mm(1)}" />`).join('')}
        <g class="takt"><line x1="${x0}" y1="7" x2="${x0}" y2="43" /><circle cx="${x0}" cy="34" r="2.1" /></g>
        <path class="in" transform="translate(${x0} 34)" d="${d.p}" pathLength="100" />
        <path class="hall" d="M${port},34 H${slapp}" pathLength="100" />
        <line class="port" x1="${port}" y1="26" x2="${port}" y2="42" />
        <line class="port" x1="${slapp}" y1="26" x2="${slapp}" y2="42" />
        <g class="matt">
          <path class="klaff" d="M${port},26 v-4 H${slapp} v4" />
          <text x="${(port + slapp) / 2}" y="19.5">HÅLLER 0,08 s</text>
        </g>
        <g class="ut">
          <path class="pil" d="M${slapp + 4},34 H${slapp + 40}" pathLength="100" />
          <path class="spets" d="M${slapp + 44},34 l-6,-3.2 v6.4 z" />
          <text x="${slapp + 48}" y="30">KAMMAREN</text>
        </g>
        <circle class="impuls" cx="0" cy="34" r="2.8" style="--a:${x0};--b:${port};--c:${slapp + 46}" />
        <text class="sa" x="${x0}" y="5.4">SA ⊙</text>
        <text class="gain" x="210" y="44">TIDSLUPP ×6</text>
      </svg>
      <span class="cap">AV-NOD · <b class="count" data-to="80" data-suffix=" ms">0 ms</b></span>
    </div>
  </div>`
})(),
  /* sinus · kraftslaget: kammaren är den enda som verkligen tar i — QRS är
     tjugofyra gånger förmakets utslag — men amplituden är ingenting förrän den
     ställs mot kalibreringspulsen, och tidpunkten är inte dess egen: den ligger
     0,20 s efter ett streck som ritats av någon annan. Egen kraft, lånad takt. */
  hexis: (() => {
  const s = snSkala(2.5), d = snDelar(s), x0 = 64, kal = 14
  const topp = 34 + s.y(2.4), enMv = 34 + s.y(1), mat = 150
  return `
  <div class="av" data-for="sinus" aria-hidden="true">
    <div class="viz viz--qrs">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <line class="bas" x1="6" y1="34" x2="210" y2="34" />
        <path class="kal" transform="translate(${kal} 34)" d="${snKal(s)}" pathLength="100" />
        <text class="kallbl" x="${kal + s.mm(4.5)}" y="43">KAL 1 mV</text>
        <g class="takt"><line x1="${x0}" y1="7" x2="${x0}" y2="43" /><circle cx="${x0}" cy="34" r="2.1" /></g>
        <g class="spar" transform="translate(${x0} 34)">
          <path class="del" style="--t:200;--d:100" d="${d.qrs}" pathLength="100" />
          <path class="del del--t" style="--t:400;--d:180" d="${d.t}" pathLength="100" />
        </g>
        <g class="matt">
          <path class="niva" d="M${kal + s.mm(9)},${enMv} H${mat}" />
          <path class="niva" d="M${x0 + s.x(224)},${topp} H${mat}" />
          <path class="pil" d="M${mat},${topp} V34" />
          <path class="spets" d="M${mat},${topp} l-2.6,5 h5.2 z M${mat},34 l-2.6,-5 h5.2 z" />
          <text class="mv" x="${mat + 5}" y="${(topp + 34) / 2 - 1}">12 mm</text>
          <text class="mv mv--sub" x="${mat + 5}" y="${(topp + 34) / 2 + 6}">= 2,4 mV</text>
        </g>
        <text class="sa" x="${x0}" y="5.4">SA ⊙</text>
        <text class="gain" x="210" y="44">5 mm/mV · TIDSLUPP ×3</text>
      </svg>
      <span class="cap">R <b class="count" data-to="12" data-suffix=" mm">0 mm</b> · 2,4 mV</span>
    </div>
  </div>`
})(),
  },
  enhancer: sinusEnhancer,
}
