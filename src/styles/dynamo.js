// =============================================================================
// Stil "Dynamon" — KAOSKLASS, helscen. Ingenting på den här sidan är gratis.
//
// Regeln som bryts: en webbsida lyser av sig själv. Den lyser lika starkt
// oavsett om du är där eller inte, den kostar ingenting att titta på, och den
// kan inte gå sönder. Här går strömmen genom sidan i stället för runt den:
//
//   1. SIDAN HAR INGEN EGEN KRAFT. Din rörelse ÄR generatorn. Svänghjulet
//      snurrar på pekarens hastighet (tangentnedslag vevar också), och slutar
//      du röra dig faller spänningen — sidan brinner ner till glöd på 5–10 s,
//      snabbare ju mer ljus som brinner.
//   2. LJUS KOSTAR. Varje länk är en glödtråd med en märkström ur stats.json
//      (rader/1000 A). Att lysa upp en app drar ström ur samma skena som de
//      andra hänger på, så när den tunga tänds SJUNKER spänningen för resten.
//      Det syns direkt: hovra den tunga appen och HELA sidan mörknar medan
//      generatorn går tyngre — spänningsfall och belastad axel, inte dekor.
//   3. SIDAN KAN GÅ SÖNDER. Huvudsäkringen är den största standardstorleken
//      (IEC 60898) under ekosystemets anslutna last — just nu 63 A mot ~67 A
//      ansluten. Aritmetiken är hämtad, inte hittad på, och valet av säkring
//      gör påståendet sant för alltid: sidan KAN inte visa allt samtidigt.
//      Dessutom drar en kall glödtråd överström när den får spänning (inrush),
//      och stöten skalar med hur fort du kom: slängs pekaren på den tyngsta
//      lampan löser säkringen ut och allt slocknar. Går du långsamt går det bra.
//
// Syntes är navet, och det är mekaniskt sant här: Syntes ÄR skenan. De tre
// underapparna är laster som hänger i den, all deras ström går genom den, och
// skenans segment lyser efter hur mycket ström just det segmentet bär — starkast
// vid inmatningen, ett steg mörkare efter varje avgrening, svart efter den sista.
// Navets egen tråd kan aldrig brinna svagare än den ljusaste underappen.
//
// Tillståndsloopen:
//   innan      — svänghjulet rullar ut, spänningen faller, glödtrådarna sjunker
//                genom orange mot mörkrött: sidan brinner ner när ingen tittar
//   närmandet  — glödtråden känner pekaren på ~260 px och börjar värmas innan
//                den hovras; amperemetern rör sig redan
//   hover      — full glöd, skenan sjunker i spänning, nålen går mot det röda
//                fältet; fokus ger exakt samma sak som pekaren
//   lämnandet  — värme har tröghet: tråden svalnar långsamt (efterglöd), och
//                elmätaren nere till höger fortsätter räkna kWh — den nollas
//                aldrig, utan ligger kvar i localStorage mellan besöken
//   klicket    — inrush: en ljusstöt och en ljusbåge över skenan i
//                millisekunderna innan navigationen tar över (ingen
//                preventDefault — vanligt klick, ctrl/cmd-klick och mittenklick
//                går alla hem)
//
// prefers-reduced-motion: ingen rAF-loop, ingen generator, ingen säkring och
// ingen brytare. Nätet står på fast spänning i en stillbild och lamporna lyser
// stadigt; hover/fokus växlar diskret till full glöd via CSS. Konceptet (last,
// märkström, skena, säkring) står kvar utan en enda rörelse.
//
// Cleanup river allt: scenen, canvasen, alla lyssnare (pointer/tangent/fokus/
// resize/synlighet) och animationsloopen. Elmätaren skrivs ner vid rivning.
// =============================================================================

import './dynamo.css'
import { apps } from '../apps.js'
import stats from '../data/stats.json'

const appById = Object.fromEntries(apps.map((a) => [a.id, a]))

/* Märkström ur riktig data: 1 A per 1000 rader kod. */
const ratedOf = (id) => (stats.projects[id]?.lines || 1000) / 1000
/* Den anslutna lasten är ekosystemets summa. Säkringen väljs som den största
   standardstorleken (IEC 60898) UNDER den summan — så påståendet "allt kan
   inte lysa samtidigt" är sant per konstruktion och blir aldrig inaktuellt när
   stats.json växer. Mätarens fullskala är nästa storlek uppåt. */
const IEC = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160]
const CONNECTED = ['syntes', 'signal', 'ethos', 'hexis'].reduce((s, id) => s + ratedOf(id), 0)
const FUSE = IEC.filter((a) => a < CONNECTED).pop() || IEC[0]
const AMP_MAX = IEC[IEC.indexOf(FUSE) + 1] || FUSE * 1.25

/* Ordningen längs skenan följer stigande märkström — den tyngsta lasten sitter
   längst från inmatningen, så skenans mörkaste segment är det den matar. */
const LOAD_IDS = ['signal', 'ethos', 'hexis'].sort((a, b) => ratedOf(a) - ratedOf(b))
const LOAD_X = [0.24, 0.53, 0.82]

const nf1 = new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf3 = new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const lerp = (a, b, t) => a + (b - a) * t

/* Glödtrådens färg är ren temperatur, inte identitet: mörk volfram → mörkrött →
   orange → gult → nästan vitt. Ingen app har en egen färg i den här stilen. */
const TUNGSTEN = [
  [0.00, 62, 46, 38], [0.10, 96, 26, 8], [0.26, 168, 54, 6],
  [0.44, 226, 98, 14], [0.62, 255, 142, 42], [0.80, 255, 196, 116], [1.00, 255, 245, 216],
]
function tungsten(h) {
  const v = clamp01(h)
  for (let i = 1; i < TUNGSTEN.length; i++) {
    const [p1, r1, g1, b1] = TUNGSTEN[i]
    if (v > p1 && i < TUNGSTEN.length - 1) continue
    const [p0, r0, g0, b0] = TUNGSTEN[i - 1]
    const t = (v - p0) / (p1 - p0 || 1)
    return `rgb(${Math.round(lerp(r0, r1, t))},${Math.round(lerp(g0, g1, t))},${Math.round(lerp(b0, b1, t))})`
  }
  return 'rgb(62,46,38)'
}
/* Koppar i skenan: samma sorts ramp, men metall som värms av strömmen. Kall
   koppar är nästan svart — det är brownouten som ska synas, inte metallen. */
function copper(b) {
  const t = clamp01(b)
  return `rgb(${Math.round(lerp(34, 255, t))},${Math.round(lerp(21, 178, t))},${Math.round(lerp(14, 92, t))})`
}

const KWH_KEY = 'portal.dynamo.kwh'
const VOLT = 230              // nätspänning — gör amperetimmarna till kWh
const REACH = 260             // hur långt en glödtråd känner pekaren (px)
const TRIP_HOLD = 2.2         // sekunder innan brytaren slår till igen
const IDLE_LOAD = 0.16        // tomgångslast per underapp
const IDLE_HUB = 0.40         // navet går aldrig ner till noll — skenan är matad

export function dynamoEnhancer() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []

  /* ------------------------------- Scenen ------------------------------- */
  const hubApp = appById.syntes || { url: '#', name: 'Syntes' }
  const scene = document.createElement('div')
  scene.className = 'dyn-scene' + (reduce ? ' is-static' : '')
  scene.innerHTML = `
    <canvas class="dyn-canvas" aria-hidden="true"></canvas>
    <a class="dyn-bus" href="${hubApp.url}" data-app="syntes">
      <span class="dyn-bus__plate">
        <span class="dyn-plate__name">${hubApp.name}</span>
        <span class="dyn-plate__rate">${nf1.format(ratedOf('syntes'))} A</span>
      </span>
    </a>
    ${LOAD_IDS.map((id) => {
      const app = appById[id] || { url: '#', name: id }
      return `
      <a class="dyn-lamp" href="${app.url}" data-app="${id}">
        <span class="dyn-lamp__glass" aria-hidden="true">
          <svg class="dyn-lamp__fil" viewBox="-34 -20 68 40" aria-hidden="true">
            <path d="M-30 12 L-30 0 L-24 -10 L-18 10 L-12 -10 L-6 10 L0 -10 L6 10 L12 -10 L18 10 L24 -10 L30 0 L30 12"/>
          </svg>
        </span>
        <span class="dyn-lamp__plate">
          <span class="dyn-plate__name">${app.name}</span>
          <span class="dyn-plate__rate">${nf1.format(ratedOf(id))} A</span>
        </span>
      </a>`
    }).join('')}
    <div class="dyn-gauge" aria-hidden="true">
      <span class="dyn-gauge__amp">0,0</span><span class="dyn-gauge__unit">A</span>
      <span class="dyn-gauge__fuse">${FUSE} A</span>
    </div>
    <div class="dyn-meter" aria-hidden="true">
      <span class="dyn-meter__val">0,000</span><span class="dyn-meter__unit">kWh</span>
    </div>
    ${reduce ? '' : `<button class="dyn-breaker" type="button" aria-label="Slå huvudbrytaren"><span class="dyn-breaker__lever"></span></button>`}
    <div class="dyn-vignette" aria-hidden="true"></div>`
  document.body.appendChild(scene)
  cleanups.push(() => scene.remove())

  const canvas = scene.querySelector('.dyn-canvas')
  const ctx = canvas.getContext('2d')
  const busEl = scene.querySelector('.dyn-bus')
  const lampEls = [...scene.querySelectorAll('.dyn-lamp')]
  const gaugeEl = scene.querySelector('.dyn-gauge')
  const ampEl = scene.querySelector('.dyn-gauge__amp')
  const meterEl = scene.querySelector('.dyn-meter')
  const meterValEl = scene.querySelector('.dyn-meter__val')
  const breakerEl = scene.querySelector('.dyn-breaker')

  /* Noderna. `base` är tomgångslasten, `phase` gör att trådarnas svaga
     nätbrum inte ligger i takt (≈2,8 Hz — långt under blixtgränsen). */
  const loads = LOAD_IDS.map((id, i) => ({
    id, rated: ratedOf(id), el: lampEls[i], fx: LOAD_X[i], base: IDLE_LOAD,
    heat: 0, surge: 0, demand: 0, current: 0, hover: false, phase: i * 2.1,
    x: 0, y: 0, r: 40,
  }))
  const hub = {
    id: 'syntes', rated: ratedOf('syntes'), el: busEl, base: IDLE_HUB,
    heat: 0, surge: 0, demand: 0, current: 0, hover: false, phase: 4.6,
    x: 0, y: 0, r: 20,
  }
  const nodes = [hub, ...loads]

  /* ------------------------------ Tillstånd ------------------------------ */
  let W = 0, H = 0, DPR = 1, vmin = 0
  let barX0 = 0, barX1 = 0, barY = 0, barH = 14, lampY = 0, lampR = 50
  let fly = { x: 0, y: 0, r: 60 }
  let gauge = { x: 0, y: 0, r: 60 }
  let charge = reduce ? 1 : 0.55
  let sag = 1
  let wheelAngle = 0
  let over = 0, tripped = false, tripT = 0, lastAmps = 0
  let arcs = []
  let kwh = 0
  try { kwh = parseFloat(localStorage.getItem(KWH_KEY)) || 0 } catch { kwh = 0 }
  const ptr = { x: -1e4, y: -1e4, on: false, px: 0, py: 0, pt: 0, speed: 0 }

  /* ------------------------------- Layout ------------------------------- */
  const layout = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1)
    W = innerWidth; H = innerHeight; vmin = Math.min(W, H) / 100
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR)
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

    const top = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 72
    const h = Math.max(320, H - top)
    barX0 = Math.round(W * 0.10); barX1 = Math.round(W * 0.93)
    barH = Math.round(Math.max(10, Math.min(20, vmin * 1.5)))
    barY = Math.round(top + h * 0.47)
    lampY = Math.round(top + h * 0.76)
    lampR = Math.round(Math.max(38, Math.min(74, vmin * 7)))
    fly = { x: Math.round(barX0 + Math.max(56, vmin * 8)), y: Math.round(top + h * 0.19), r: Math.round(Math.max(34, Math.min(78, vmin * 7.5))) }
    gauge = { x: Math.round(barX1 - Math.max(66, vmin * 9)), y: Math.round(top + h * 0.22), r: Math.round(Math.max(44, Math.min(96, vmin * 9))) }

    const span = barX1 - barX0
    for (const n of loads) {
      n.x = Math.round(barX0 + n.fx * span)
      n.y = lampY
      n.r = lampR
      n.el.style.setProperty('--dyn-size', lampR * 2 + 'px')
      n.el.style.transform = `translate3d(${n.x - lampR}px, ${n.y - lampR}px, 0)`
    }
    hub.x = barX0 + span * 0.5; hub.y = barY; hub.r = barH
    busEl.style.transform = `translate3d(${barX0}px, ${Math.round(barY - barH * 1.6)}px, 0)`
    busEl.style.width = span + 'px'
    busEl.style.height = Math.round(barH * 3.2) + 'px'

    gaugeEl.style.transform = `translate3d(calc(${gauge.x}px - 50%), ${Math.round(gauge.y + gauge.r * 0.38)}px, 0)`
    meterEl.style.transform = `translate3d(calc(${barX1}px - 100%), ${Math.round(H - 40)}px, 0)`
    if (breakerEl) breakerEl.style.transform = `translate3d(${barX0}px, ${Math.round(H - 58)}px, 0)`
  }

  /* --------------------------- Avstånd till skenan --------------------------- */
  const hubDist = (x, y) => {
    const cx = Math.max(barX0, Math.min(barX1, x))
    return Math.hypot(x - cx, y - barY)
  }
  const proximity = (n) => {
    if (!ptr.on) return 0
    const d = n === hub ? hubDist(ptr.x, ptr.y) : Math.hypot(ptr.x - n.x, ptr.y - n.y) - n.r
    return Math.pow(clamp01(1 - Math.max(0, d) / REACH), 1.7) * 0.8
  }

  /* ------------------------------ Händelser ------------------------------ */
  const on = (el, ev, fn, opts) => {
    el.addEventListener(ev, fn, opts)
    cleanups.push(() => el.removeEventListener(ev, fn, opts))
  }

  for (const n of nodes) {
    on(n.el, 'pointerenter', () => { n.hover = true })
    on(n.el, 'pointerleave', () => { n.hover = false })
    on(n.el, 'focus', () => { n.hover = true; charge = Math.min(1, charge + 0.4) })
    on(n.el, 'blur', () => { n.hover = false })
    // Klicket: inrush + ljusbåge. Länken rörs aldrig — ingen preventDefault,
    // så vanligt klick, ctrl/cmd-klick och mittenklick beter sig som vanligt.
    const strike = () => {
      if (reduce || tripped) return
      n.surge = Math.max(n.surge, 1.6)
      arcs.push({ x: n === hub ? Math.max(barX0, Math.min(barX1, ptr.x)) : n.x, t: 0 })
      scene.classList.remove('is-strike'); void scene.offsetWidth; scene.classList.add('is-strike')
    }
    on(n.el, 'click', strike)
    on(n.el, 'auxclick', (e) => { if (e.button === 1) strike() })
  }

  /* Pekaren är generatorn: hastigheten laddar svänghjulet. Lyssnaren sitter på
     window så rörelse över topbaren också vevar. */
  if (!reduce) {
    on(window, 'pointermove', (e) => {
      const now = performance.now()
      const dt = Math.max(8, now - ptr.pt) / 1000
      if (ptr.on) ptr.speed = Math.max(ptr.speed, Math.hypot(e.clientX - ptr.px, e.clientY - ptr.py) / dt)
      ptr.px = e.clientX; ptr.py = e.clientY; ptr.pt = now
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true
    }, { passive: true })
    on(document, 'pointerleave', () => { ptr.on = false })
    // Tangentbordet vevar också — den som tabbar sig runt håller sidan tänd.
    on(window, 'keydown', () => { charge = Math.min(1, charge + 0.3) })
    on(breakerEl, 'click', () => {
      if (tripped) { tripT = TRIP_HOLD } else { trip() }
    })
  }
  on(window, 'resize', () => { layout(); if (reduce) renderStatic() })

  const trip = () => {
    tripped = true; tripT = 0; over = 0; charge = 0
    for (const n of nodes) n.surge = 0     // brytaren är öppen: ingen ström alls
    scene.classList.add('is-tripped')
    for (let i = 0; i < 3; i++) arcs.push({ x: barX0 + Math.random() * (barX1 - barX0), t: 0 })
  }

  /* ------------------------------- Målningen ------------------------------- */
  function drawBus() {
    // Segmentens ljus = strömmen just det segmentet bär. Skenan är ljusast vid
    // inmatningen och tappar ett steg vid varje avgrening — sant, inte dekor.
    const xs = loads.map((n) => n.x)
    const bounds = [barX0, ...xs, barX1]
    for (let i = 0; i < bounds.length - 1; i++) {
      let carried = 0
      for (let j = i; j < loads.length; j++) carried += loads[j].current
      const b = clamp01(carried / FUSE)
      ctx.fillStyle = copper(0.04 + b * 0.92)
      ctx.fillRect(bounds[i], barY - barH / 2, bounds[i + 1] - bounds[i] + 1, barH)
      ctx.fillStyle = `rgba(255,235,200,${(0.03 + b * 0.55).toFixed(3)})`
      ctx.fillRect(bounds[i], barY - barH / 2, bounds[i + 1] - bounds[i] + 1, Math.max(1, barH * 0.18))
    }
    // Avgreningar ner till lamporna.
    for (const n of loads) {
      const b = clamp01(n.current / Math.max(1, n.rated))
      ctx.strokeStyle = copper(0.03 + b * 0.8)
      ctx.lineWidth = Math.max(2, barH * 0.28)
      ctx.beginPath(); ctx.moveTo(n.x, barY); ctx.lineTo(n.x, n.y - n.r * 0.92); ctx.stroke()
    }
    // Matningen från generatorn in i skenans vänstra ände.
    ctx.strokeStyle = copper(0.03 + clamp01(charge) * 0.42)
    ctx.lineWidth = Math.max(2, barH * 0.3)
    ctx.beginPath(); ctx.moveTo(fly.x, fly.y + fly.r * 0.55); ctx.lineTo(fly.x, barY - barH / 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(fly.x - 6, fly.y + fly.r * 0.55); ctx.lineTo(fly.x - 6, barY - barH / 2); ctx.stroke()
  }

  function drawFlywheel(spin) {
    const { x, y, r } = fly
    const b = clamp01(charge)
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin)
    ctx.strokeStyle = copper(0.03 + b * 0.6)
    ctx.lineWidth = Math.max(3, r * 0.13)
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke()
    ctx.lineWidth = Math.max(1.5, r * 0.05)
    ctx.globalAlpha = 0.5 + b * 0.4
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.16, Math.sin(a) * r * 0.16)
      ctx.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = copper(0.04 + b * 0.66)
    ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  function drawGauge(amps) {
    const { x, y, r } = gauge
    const a0 = Math.PI * 1.16, a1 = Math.PI * 1.84
    ctx.lineWidth = Math.max(2, r * 0.045)
    ctx.strokeStyle = 'rgba(190,140,90,.28)'
    ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.stroke()
    // Röda fältet börjar vid säkringens märkström.
    const af = a0 + (FUSE / AMP_MAX) * (a1 - a0)
    ctx.strokeStyle = 'rgba(226,66,38,.75)'
    ctx.beginPath(); ctx.arc(x, y, r, af, a1); ctx.stroke()
    ctx.lineWidth = Math.max(1, r * 0.02)
    ctx.strokeStyle = 'rgba(190,150,110,.4)'
    for (let i = 0; i <= 8; i++) {
      const a = a0 + (i / 8) * (a1 - a0)
      const rr = i % 2 === 0 ? 0.86 : 0.92
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(a) * r * rr, y + Math.sin(a) * r * rr)
      ctx.lineTo(x + Math.cos(a) * r * 0.99, y + Math.sin(a) * r * 0.99)
      ctx.stroke()
    }
    const t = clamp01(amps / AMP_MAX)
    const an = a0 + t * (a1 - a0)
    ctx.strokeStyle = amps > FUSE ? '#FF6A3C' : '#FFD9A8'
    ctx.lineWidth = Math.max(1.6, r * 0.035)
    ctx.beginPath(); ctx.moveTo(x - Math.cos(an) * r * 0.12, y - Math.sin(an) * r * 0.12)
    ctx.lineTo(x + Math.cos(an) * r * 0.82, y + Math.sin(an) * r * 0.82); ctx.stroke()
    ctx.fillStyle = '#C9A277'
    ctx.beginPath(); ctx.arc(x, y, Math.max(3, r * 0.06), 0, Math.PI * 2); ctx.fill()
  }

  function drawSpill() {
    ctx.globalCompositeOperation = 'lighter'
    for (const n of nodes) {
      const h = clamp01(n.heat)
      if (h < 0.02) continue
      const cx = n === hub ? (barX0 + barX1) / 2 : n.x
      const cy = n === hub ? barY : n.y
      const rad = (n === hub ? (barX1 - barX0) * 0.7 : n.r * 6.4) * (0.5 + h * 0.6)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
      const c = tungsten(h)
      g.addColorStop(0, c.replace('rgb', 'rgba').replace(')', `,${(0.26 * h).toFixed(3)})`))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2)
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  function drawArcs(dt) {
    for (let i = arcs.length - 1; i >= 0; i--) {
      const a = arcs[i]
      a.t += dt
      if (a.t > 0.22) { arcs.splice(i, 1); continue }
      ctx.globalAlpha = 1 - a.t / 0.22
      ctx.strokeStyle = '#FFF0D2'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      let x = a.x, y = barY
      ctx.moveTo(x, y)
      for (let k = 0; k < 7; k++) {
        x += (Math.random() - 0.5) * 46
        y -= 8 + Math.random() * 14
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }

  /* ---------------------------- Stillbildsläge ---------------------------- */
  function renderStatic() {
    ctx.clearRect(0, 0, W, H)
    hub.heat = 1; hub.current = hub.rated
    for (const n of loads) { n.heat = 0.72; n.current = n.rated * 0.72 }
    charge = 1
    drawSpill()
    drawBus()
    drawFlywheel(0)
    drawGauge(nodes.reduce((s, n) => s + n.current, 0))
    ampEl.textContent = nf1.format(nodes.reduce((s, n) => s + n.current, 0))
    meterValEl.textContent = nf3.format(kwh)
  }

  /* -------------------------------- Loopen -------------------------------- */
  layout()

  if (reduce) {
    renderStatic()
    return () => { cleanups.forEach((fn) => fn()) }
  }

  let running = true, raf = 0, last = performance.now(), textAt = 0, saveAt = 0
  const saveKwh = () => { try { localStorage.setItem(KWH_KEY, kwh.toFixed(4)) } catch { /* privat läge */ } }

  const loop = (now = performance.now()) => {
    if (!running) return
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now
    const t = now / 1000

    // Generatorn: pekarens hastighet laddar, tomgång tömmer. Två skalor på
    // samma hastighet — en mjuk som VEVAR (vanlig rörelse räcker) och en hård
    // som SLÅR (bara ett riktigt ryck ger inrush nog att lösa säkringen).
    ptr.speed *= Math.exp(-dt / 0.12)
    const speedNorm = clamp01(ptr.speed / 700)
    const slamNorm = clamp01(ptr.speed / 1600)

    if (tripped) {
      tripT += dt
      charge = 0
      if (tripT >= TRIP_HOLD) { tripped = false; charge = 0.45; scene.classList.remove('is-tripped') }
    } else {
      // Lasten tas ur svänghjulet: ju mer ljus som brinner, desto fortare
      // rinner spänningen ut när du står still. Det är så ljuset KOSTAR.
      const load = clamp01(lastAmps / FUSE)
      charge = Math.max(0.30, Math.min(1, charge + speedNorm * dt * 3.0 - dt * 0.07 * (1 + load)))
      // En belastad generator går tyngre — hjulet bromsas synligt av lasten.
      wheelAngle += charge * (1 - 0.55 * load) * 7.5 * dt
    }

    // Efterfrågan. Navets tråd kan aldrig brinna svagare än den ljusaste lasten:
    // all deras ström går genom skenan.
    let maxChild = 0
    for (const n of loads) {
      n.demand = n.hover ? 1 : Math.max(n.base, proximity(n))
      maxChild = Math.max(maxChild, n.demand)
    }
    hub.demand = hub.hover ? 1 : Math.max(hub.base, proximity(hub), maxChild)

    // Värme, inrush och ström.
    let amps = 0
    for (const n of nodes) {
      const target = tripped ? 0 : n.demand * charge * sag
      // En kall glödtråd drar överström när den får spänning — och stöten
      // skalar med hur fort du kom. Den tyngsta lasten tål inte ett ryck.
      if (!tripped && target > 0.5 && n.heat < 0.35 && n.surge < 0.25) {
        n.surge = (1 - n.heat) * (0.05 + Math.pow(slamNorm, 1.6) * 2.6)
      }
      const rate = target > n.heat ? 4.2 : (tripped ? 9 : 1.15)
      n.heat += (target - n.heat) * Math.min(1, dt * rate)
      n.surge *= Math.exp(-dt / 0.18)
      n.current = n.rated * (n.heat + n.surge)
      amps += n.current
    }
    // Spänningsfall: ju mer skenan bär, desto svagare lyser ALLT som hänger i
    // den. Det är så "du kan inte få allt tänt samtidigt" syns utan att sägas.
    sag += ((1 - 0.26 * clamp01(amps / FUSE)) - sag) * Math.min(1, dt * 6)
    lastAmps = amps

    // Säkringen: 63 A. Ansluten last är 66,6 A — allt kan aldrig lysa samtidigt.
    if (!tripped) {
      over = amps > FUSE ? over + dt : Math.max(0, over - dt * 3)
      if (over > 0.12) trip()
    }

    kwh += (amps * VOLT * dt) / 3.6e6

    // Glödtrådarna: färg + värme som CSS-variabler (ett svagt nätbrum på 2,8 Hz).
    for (const n of nodes) {
      const flick = 1 + 0.03 * Math.sin(t * 17.6 + n.phase) * n.heat
      const h = clamp01(n.heat * flick)
      n.el.style.setProperty('--heat', h.toFixed(3))
      n.el.style.setProperty('--lit', tungsten(h))
    }

    ctx.clearRect(0, 0, W, H)
    drawSpill()
    drawBus()
    drawFlywheel(wheelAngle)
    drawGauge(amps)
    drawArcs(dt)

    if (now - textAt > 90) {
      textAt = now
      ampEl.textContent = nf1.format(amps)
      meterValEl.textContent = nf3.format(kwh)
    }
    if (now - saveAt > 4000) { saveAt = now; saveKwh() }
  }

  const onVis = () => {
    running = !document.hidden
    if (running) { last = performance.now(); loop() } else { cancelAnimationFrame(raf); saveKwh() }
  }
  on(document, 'visibilitychange', onVis)
  cleanups.push(() => { running = false; cancelAnimationFrame(raf); saveKwh() })
  loop()

  return () => { cleanups.forEach((fn) => fn()) }
}

export default {
  id: 'dynamo',
  label: 'Dynamon',
  chaos: true,      // kaosklass — visas bara bakom kaos-togglen
  fullscene: true,  // normalfallet i kaos: skelettet göms, scenen byggs här
  anim: {},
  enhancer: dynamoEnhancer,
}
