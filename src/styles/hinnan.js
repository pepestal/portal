// =============================================================================
// Stil "Hinnan" — KAOSKLASS, helscen. Sidan har en baksida.
//
// Regeln som bryts: EN WEBBSIDA ÄR EN YTA. Den har en framsida och ingenting
// annat — ingen tjocklek, inget bakom, inget under. Allt som finns ligger PÅ
// den, och ytan i sig är död materia.
//
// Här är sidan en spänd hinna, och ingenting ligger på den. Allt du ser är
// något som trycker på den inifrån:
//
//   1. LÄNKARNA LIGGER INTE PÅ SIDAN — de trycks igenom den. En länk är en
//      svällning i materialet, och bokstäverna i namnet är relief pressad ut
//      bakifrån. Det finns ingen ruta, ingen knapp, ingen text: det finns
//      höjd, och ljus som faller snett över den. Vid vila är bokstäverna
//      nästan utplånade — det är trycket som skärper dem.
//   2. DU ÄR PÅ ANDRA SIDAN. Pekaren trycker åt motsatt håll: den buktar IN
//      hinnan, och rynkorna löper vidare som riktiga vågor (vågekvationen på
//      ett höjdfält, inte en effekt). Två händer på var sin sida av samma duk.
//   3. MATERIALET ÄR ÄNDLIGT. Dras en av de tre underapparna ut helt planas de
//      andra två ut — det finns bara så mycket hinna. Det är därför sidan
//      aldrig kan visa allt på en gång.
//   4. MATERIALET TAR STRYK. Där dina händer har varit ligger hinnan kvar en
//      aning slak, och slakheten sparas mellan besöken (localStorage). Femte
//      gången du kommer tillbaka har duken formen av dina egna vanor.
//
// Syntes är navet, och det är materiellt sant: navet ÄR den stora svällningen
// som hela hinnan vilar över, och de tre trycker igenom PÅ den. Navets tryck är
// det som lyfter dem alls, så det kan aldrig ligga lägre än den högsta av de
// tre — och de tre konkurrerar om materialet, aldrig navet.
//
// Och: när du står stilla en stund märker det som är bakom att du slutat röra
// dig. Kommer du för nära drar det sig undan.
//
// Tillståndsloopen:
//   innan      — hinnan andas; efter en stunds stillhet händer något bakom den
//   närmandet  — trycket följer pekaren: reliefen skärps innan du är framme
//   hover      — full relief, de andra två planas ut; fokus ger exakt samma sak
//   lämnandet  — vågorna klingar av, slakheten ligger kvar (och sparas)
//   klicket    — trycket går till bristningsgränsen, chockvåg över hela duken,
//                därefter navigation (ingen preventDefault — vanligt klick,
//                ctrl/cmd-klick och mittenklick går alla hem)
//
// prefers-reduced-motion: ingen rAF-loop, ingen våg, ingenting bakom som rör
// sig. Höjdfältet löses statiskt (utslätat måltillstånd) med all relief framme;
// hover/fokus räknar om stillbilden en gång i stället för att animera dit.
//
// Cleanup river allt: scenen, canvasen, alla lyssnare (pekare/tangent/fokus/
// resize/synlighet/fonts) och rAF-loopen. Slakheten skrivs ner vid rivning.
// =============================================================================

import './hinnan.css'
import { apps } from '../apps.js'
import stats from '../data/stats.json'

const appById = Object.fromEntries(apps.map((a) => [a.id, a]))
const CHILD_IDS = ['signal', 'ethos', 'hexis']

/* Storleken är riktig data: radien skalar med rader^¼ ur stats.json,
   normerad mot de tres geometriska medelvärde så skalan aldrig blir
   inaktuell när repona växer. */
const linesOf = (id) => stats.projects[id]?.lines || 1000
const GEO = Math.exp(CHILD_IDS.reduce((s, id) => s + Math.log(linesOf(id)), 0) / CHILD_IDS.length)
const sizeOf = (id) => Math.max(0.62, Math.min(1.7, Math.pow(linesOf(id) / GEO, 0.25)))

/* --- Materialets konstanter (per simuleringssteg, 2 steg per bildruta) --- */
const SUB = 2            // substeg per frame — vågfarten sitter här
const C2 = 0.48          // vågfart² (CFL-taket för schemat är 0.5)
const KSPR = 0.018       // hur hårt hinnan dras mot måltillståndet
const DAMP = 0.955       // materialdämpning per substeg
const HEIGHT_PX = 128    // hur högt en enhet höjd "är" när normalerna räknas
const REACH = 210        // hur långt en svällning känner pekaren (px)
const DENT_R = 42        // pekarens tryckyta (px)
const CREEP_W = 44, CREEP_H = 26
const CREEP_KEY = 'portal.hinnan.creep'

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a, b, t) => a + (b - a) * t

/* Separabel boxblur — används för att mjuka upp rastrerade masker (bokstäver,
   handen) så de trycker igenom som gummi och inte som stansad plåt. */
function blur(src, w, h, passes = 2) {
  const a = src, b = new Float32Array(w * h)
  for (let p = 0; p < passes; p++) {
    for (let j = 0; j < h; j++) {
      const r = j * w
      for (let i = 0; i < w; i++) {
        const l = i > 0 ? a[r + i - 1] : a[r + i]
        const rr = i < w - 1 ? a[r + i + 1] : a[r + i]
        b[r + i] = (l + a[r + i] + rr) / 3
      }
    }
    for (let j = 0; j < h; j++) {
      const r = j * w
      for (let i = 0; i < w; i++) {
        const u = j > 0 ? b[r - w + i] : b[r + i]
        const d = j < h - 1 ? b[r + w + i] : b[r + i]
        a[r + i] = (u + b[r + i] + d) / 3
      }
    }
  }
  return a
}

export function hinnanEnhancer() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []
  const on = (el, ev, fn, opts) => {
    el.addEventListener(ev, fn, opts)
    cleanups.push(() => el.removeEventListener(ev, fn, opts))
  }

  /* ------------------------------- Scenen ------------------------------- */
  const hubApp = appById.syntes || { url: '#', name: 'Syntes' }
  const scene = document.createElement('div')
  scene.className = 'hin-scene' + (reduce ? ' is-static' : '')
  scene.innerHTML = `
    <canvas class="hin-canvas" aria-hidden="true"></canvas>
    <a class="hin-node hin-node--hub" href="${hubApp.url}" data-app="syntes"><span class="hin-name">${hubApp.name}</span></a>
    ${CHILD_IDS.map((id) => {
      const app = appById[id] || { url: '#', name: id }
      return `<a class="hin-node" href="${app.url}" data-app="${id}"><span class="hin-name">${app.name}</span></a>`
    }).join('')}
    <div class="hin-vig" aria-hidden="true"></div>`
  document.body.appendChild(scene)
  cleanups.push(() => scene.remove())

  const canvas = scene.querySelector('.hin-canvas')
  const ctx = canvas.getContext('2d')
  const off = document.createElement('canvas')
  const offctx = off.getContext('2d')
  /* Egen rastreringsyta för masker (bokstäver, handen) — läses med
     getImageData, därav willReadFrequently. */
  const mctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const HAS_TRACKING = 'letterSpacing' in mctx

  const nodeEls = [...scene.querySelectorAll('.hin-node')]
  const hub = {
    id: 'syntes', name: hubApp.name, el: nodeEls[0], hubb: true,
    x: 0, y: 0, rx: 1, ry: 1, base: 0.32, press: 0.32, hover: false, mask: null, font: 0, track: 0,
  }
  const kids = CHILD_IDS.map((id, i) => ({
    id, name: (appById[id] || { name: id }).name, el: nodeEls[i + 1], hubb: false,
    x: 0, y: 0, rx: 1, ry: 1, base: 0.26, press: 0.26, hover: false, mask: null, font: 0, track: 0,
    k: sizeOf(id),
  }))
  const nodes = [hub, ...kids]

  /* ------------------------------ Tillstånd ------------------------------ */
  let W = 0, H = 0, CELL = 4, gw = 0, gh = 0
  let h = new Float32Array(1), v = new Float32Array(1)
  let target = new Float32Array(1), creepField = new Float32Array(1), grain = new Float32Array(1)
  let img = null, pix = null
  let breath = 0, idle = 0, topY = 72
  const ptr = { x: -1e5, y: -1e5, on: false, px: 0, py: 0, speed: 0, dent: 0 }
  const hand = { on: false, t: 0, x: 0, y: 0, amp: 0, flee: false, cool: 12, mask: null, mw: 0, mh: 0 }

  /* Slakheten: en grov karta över var dina händer har varit, som överlever
     besöket. Den växer långsamt under pekaren och sjunker ännu långsammare —
     det som blir kvar är vanan, inte varje enskild rörelse. */
  const creep = new Float32Array(CREEP_W * CREEP_H)
  try {
    const raw = JSON.parse(localStorage.getItem(CREEP_KEY) || 'null')
    if (Array.isArray(raw) && raw.length === creep.length) {
      for (let i = 0; i < creep.length; i++) creep[i] = Math.max(0, Math.min(1, (raw[i] || 0) / 255))
    }
  } catch { /* privat läge eller trasigt värde — hinnan är då oanvänd */ }
  const saveCreep = () => {
    try { localStorage.setItem(CREEP_KEY, JSON.stringify([...creep].map((x) => Math.round(x * 255)))) } catch { /* privat läge */ }
  }

  /* ------------------------- Rastrering av masker ------------------------- */
  function setFont(c, fp, track) {
    c.font = `800 ${fp}px Inter, "Segoe UI", system-ui, sans-serif`
    if (HAS_TRACKING) c.letterSpacing = track + 'px'
  }
  /* Största teckengrad vars namn ryms inom `maxW`. */
  function fitFont(text, maxW, cap) {
    let fp = Math.min(cap, 200)
    for (let i = 0; i < 26; i++) {
      setFont(mctx, fp, fp * 0.16)
      if (mctx.measureText(text).width <= maxW || fp <= 9) break
      fp = Math.max(9, fp * 0.92)
    }
    return fp
  }
  /* Bokstäverna som höjd: alfakanalen ur en rastrering, uppmjukad så de
     trycker igenom materialet i stället för att ligga ovanpå det. */
  function rasterText(bw, bh, text, fp) {
    mctx.canvas.width = bw; mctx.canvas.height = bh
    mctx.clearRect(0, 0, bw, bh)
    setFont(mctx, fp, fp * 0.16)
    mctx.textAlign = 'center'; mctx.textBaseline = 'middle'
    mctx.fillStyle = '#fff'
    /* letterSpacing lägger till efterföljande mellanrum även sist — halva
       tracking tillbaka håller ordet optiskt centrerat. */
    mctx.fillText(text, bw / 2 + (HAS_TRACKING ? fp * 0.08 : 0), bh / 2)
    const d = mctx.getImageData(0, 0, bw, bh).data
    const out = new Float32Array(bw * bh)
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + 3] / 255
    return blur(out, bw, bh, 1)
  }

  /* Handen bakom duken. Ritas en gång i rutnätsupplösning och blitt:as sedan
     med varierande amplitud — den rastreras aldrig om under gången. */
  function buildHand(px) {
    /* Fingrarna måste vara SPRETADE. En hand med samlade fingrar blir en fläck
       när den pressas genom flera millimeter gummi — det är mellanrummen som
       säger hand, och de måste överleva både upplösningen och uppmjukningen. */
    const UW = 120, UH = 150
    const s = px / UH
    const bw = Math.max(8, Math.round((UW * s) / CELL)), bh = Math.max(8, Math.round((UH * s) / CELL))
    mctx.canvas.width = bw; mctx.canvas.height = bh
    mctx.clearRect(0, 0, bw, bh)
    mctx.save()
    mctx.scale(bw / UW, bh / UH)
    mctx.fillStyle = '#fff'; mctx.strokeStyle = '#fff'
    mctx.lineCap = 'round'; mctx.lineJoin = 'round'
    // handflata + handled
    mctx.beginPath(); mctx.ellipse(60, 100, 30, 31, 0, 0, Math.PI * 2); mctx.fill()
    mctx.beginPath(); mctx.ellipse(60, 126, 17, 22, 0, 0, Math.PI * 2); mctx.fill()
    // pekfinger, långfinger, ringfinger, lillfinger — spretade och olika långa
    const fing = [[44, 80, 26, 20, 13], [58, 76, 56, 10, 14], [72, 78, 84, 18, 13], [84, 88, 105, 44, 11]]
    for (const [x0, y0, x1, y1, w] of fing) {
      mctx.lineWidth = w
      mctx.beginPath(); mctx.moveTo(x0, y0); mctx.lineTo(x1, y1); mctx.stroke()
    }
    // tummen, ut åt sidan
    mctx.lineWidth = 16
    mctx.beginPath(); mctx.moveTo(38, 106); mctx.lineTo(8, 76); mctx.stroke()
    mctx.restore()
    const d = mctx.getImageData(0, 0, bw, bh).data
    const out = new Float32Array(bw * bh)
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + 3] / 255
    hand.mask = blur(out, bw, bh, 1); hand.mw = bw; hand.mh = bh
  }

  /* Svällningen + bokstäverna som en lokal mask kring nodens mittpunkt. */
  function buildMask(n) {
    const fpCap = (n.hubb ? n.ry * 0.62 : n.ry * 0.52) / CELL
    /* Reliefen får spilla ut på slät hinna runt svällningen, men aldrig in i
       grannens fack — på smal skärm är det luckan som sätter graden. */
    const maxW = Math.min(n.hubb ? n.rx * 1.16 : n.rx * 1.42, n.slot || 1e5) / CELL
    const text = n.name.toUpperCase()
    const fp = fitFont(text, maxW, fpCap)
    setFont(mctx, fp, fp * 0.16)
    const tw = mctx.measureText(text).width
    const bw = Math.round(Math.max((2 * n.rx) / CELL, tw + 10) + 10)
    const bh = Math.round(Math.max((2 * n.ry) / CELL, fp * 1.7) + 10)
    /* Platå med definierad skuldra — inte en mjuk kulle. Det är skillnaden
       mellan "något ligger under duken" och "duken har en buckla". */
    const PLAT = n.hubb ? 0.30 : 0.62
    const dome = new Float32Array(bw * bh)
    for (let j = 0; j < bh; j++) {
      const dy = ((j + 0.5 - bh / 2) * CELL) / n.ry
      for (let i = 0; i < bw; i++) {
        const dx = ((i + 0.5 - bw / 2) * CELL) / n.rx
        const d = Math.hypot(dx, dy)
        dome[j * bw + i] = d >= 1 ? 0 : d <= PLAT ? 1 : 0.5 * (1 + Math.cos(Math.PI * ((d - PLAT) / (1 - PLAT))))
      }
    }
    n.font = fp; n.track = fp * 0.16
    n.mask = {
      bw, bh, dome, text: rasterText(bw, bh, text, fp),
      x0: Math.round(n.x / CELL - bw / 2), y0: Math.round(n.y / CELL - bh / 2),
    }
  }

  /* -------------------------------- Layout -------------------------------- */
  function layout() {
    W = Math.max(320, innerWidth); H = Math.max(320, innerHeight)
    CELL = W > 1250 ? 5 : 4
    gw = Math.max(16, Math.floor(W / CELL)); gh = Math.max(16, Math.floor(H / CELL))
    canvas.width = W; canvas.height = H
    off.width = gw; off.height = gh
    img = offctx.createImageData(gw, gh); pix = img.data
    for (let i = 3; i < pix.length; i += 4) pix[i] = 255

    const n = gw * gh
    h = new Float32Array(n); v = new Float32Array(n)
    target = new Float32Array(n); creepField = new Float32Array(n)
    grain = new Float32Array(n)
    for (let i = 0; i < n; i++) grain[i] = (Math.random() - 0.5) * 7

    const top = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 72
    topY = top
    const band = Math.max(300, H - top)

    /* På bred skärm ligger de tre i rad på navets svällning. På smal skärm
       ryms tre namn inte bredvid varandra utan att bli oläsliga, så raden
       ställs på högkant i stället — samma ordning, samma relation till navet. */
    const stack = W < 620
    hub.x = W / 2
    hub.y = top + band * (stack ? 0.22 : 0.36)
    hub.rx = Math.min(W * (stack ? 0.42 : 0.34), 620)
    hub.ry = Math.min(band * (stack ? 0.16 : 0.27), 262)

    // Radien är riktig data (rader^¼); golvet håller träffytan tumvänlig.
    const R0 = stack ? Math.min(W * 0.13, band * 0.075) : Math.min(W * 0.072, band * 0.125, 118)
    for (const k of kids) { k.rx = k.ry = Math.max(stack ? 36 : 44, R0 * k.k) }
    const sum = kids.reduce((s, k) => s + k.ry * 2, 0)

    if (stack) {
      const y0 = hub.y + hub.ry + 18
      const gap = Math.max(8, (H - 12 - y0 - sum) / (kids.length + 1))
      let cy = y0 + gap
      for (const k of kids) { k.x = W / 2; k.y = cy + k.ry; k.slot = W * 0.88; cy += k.ry * 2 + gap }
    } else {
      const maxR = kids.reduce((m, k) => Math.max(m, k.ry), 0)
      const kidY = Math.min(H - maxR - 16, hub.y + hub.ry * 0.9 + maxR * 0.5)
      const gap = Math.max(10, (W * 0.9 - sum) / (kids.length + 1))
      let cx = W * 0.05 + gap
      for (const k of kids) { k.x = cx + k.rx; k.y = kidY; k.slot = k.rx * 2 + gap * 0.9; cx += k.rx * 2 + gap }
    }

    for (const nd of nodes) {
      buildMask(nd)
      nd.el.style.width = nd.rx * 2 + 'px'
      nd.el.style.height = nd.ry * 2 + 'px'
      nd.el.style.transform = `translate3d(${Math.round(nd.x - nd.rx)}px, ${Math.round(nd.y - nd.ry)}px, 0)`
    }
    buildHand(Math.min(H * 0.50, 460))

    // Slakheten uppsamplad till rutnätet — räknas om sällan, den rör sig knappt.
    rebuildCreep()
  }

  function rebuildCreep() {
    for (let j = 0; j < gh; j++) {
      const fy = (j / gh) * (CREEP_H - 1)
      const j0 = Math.floor(fy), ty = fy - j0, j1 = Math.min(CREEP_H - 1, j0 + 1)
      for (let i = 0; i < gw; i++) {
        const fx = (i / gw) * (CREEP_W - 1)
        const i0 = Math.floor(fx), tx = fx - i0, i1 = Math.min(CREEP_W - 1, i0 + 1)
        const a = lerp(creep[j0 * CREEP_W + i0], creep[j0 * CREEP_W + i1], tx)
        const b = lerp(creep[j1 * CREEP_W + i0], creep[j1 * CREEP_W + i1], tx)
        creepField[j * gw + i] = -0.13 * lerp(a, b, ty)
      }
    }
  }

  /* --------------------------- Måltillståndet --------------------------- */
  function addMask(m, amp, tamp) {
    const { bw, bh, dome, text, x0, y0 } = m
    for (let j = 0; j < bh; j++) {
      const gy = y0 + j
      if (gy < 1 || gy >= gh - 1) continue
      const row = gy * gw, mrow = j * bw
      for (let i = 0; i < bw; i++) {
        const gx = x0 + i
        if (gx < 1 || gx >= gw - 1) continue
        target[row + gx] += dome[mrow + i] * amp + text[mrow + i] * tamp
      }
    }
  }

  function buildTarget() {
    target.set(creepField)
    for (const n of nodes) {
      const p = n.press
      const amp = (n.hubb ? 0.50 : 0.86) * p * (n.hubb ? 1 + breath * 0.06 : 1)
      addMask(n.mask, amp, 0.18 + 0.42 * Math.pow(p, 1.5))
    }
    if (hand.amp > 0.002 && hand.mask) {
      const x0 = Math.round(hand.x / CELL - hand.mw / 2), y0 = Math.round(hand.y / CELL - hand.mh / 2)
      const m = hand.mask
      for (let j = 0; j < hand.mh; j++) {
        const gy = y0 + j
        if (gy < 1 || gy >= gh - 1) continue
        const row = gy * gw, mrow = j * hand.mw
        for (let i = 0; i < hand.mw; i++) {
          const gx = x0 + i
          if (gx < 1 || gx >= gw - 1) continue
          target[row + gx] += m[mrow + i] * hand.amp * 0.78
        }
      }
    }
    if (ptr.dent > 0.002) {
      // Din hand, från andra hållet: en buktning inåt, inte utåt.
      const r = DENT_R / CELL
      const cx = ptr.x / CELL, cy = ptr.y / CELL
      const i0 = Math.max(1, Math.floor(cx - r)), i1 = Math.min(gw - 2, Math.ceil(cx + r))
      const j0 = Math.max(1, Math.floor(cy - r)), j1 = Math.min(gh - 2, Math.ceil(cy + r))
      for (let j = j0; j <= j1; j++) {
        const row = j * gw, dy = (j + 0.5 - cy) / r
        for (let i = i0; i <= i1; i++) {
          const dx = (i + 0.5 - cx) / r
          const d = Math.hypot(dx, dy)
          if (d >= 1) continue
          target[row + i] -= 0.5 * (1 + Math.cos(Math.PI * d)) * 0.74 * ptr.dent
        }
      }
    }
  }

  /* ------------------------------ Simulering ------------------------------ */
  function simStep() {
    for (let j = 1; j < gh - 1; j++) {
      const row = j * gw
      for (let i = 1; i < gw - 1; i++) {
        const k = row + i, hc = h[k]
        const lap = h[k - 1] + h[k + 1] + h[k - gw] + h[k + gw] - 4 * hc
        v[k] = (v[k] + lap * C2 + (target[k] - hc) * KSPR) * DAMP
      }
    }
    for (let j = 1; j < gh - 1; j++) {
      const row = j * gw
      for (let i = 1; i < gw - 1; i++) h[row + i] += v[row + i]
    }
  }

  /* En chockvåg: en ring av hastighet ut från punkten. Används vid klick och
     vid fokus, så tangentbordet får samma fysiska svar som pekaren. */
  function ring(x, y, force) {
    const cx = x / CELL, cy = y / CELL, r = 26, w = 7
    const i0 = Math.max(1, Math.floor(cx - r - w)), i1 = Math.min(gw - 2, Math.ceil(cx + r + w))
    const j0 = Math.max(1, Math.floor(cy - r - w)), j1 = Math.min(gh - 2, Math.ceil(cy + r + w))
    for (let j = j0; j <= j1; j++) {
      const row = j * gw
      for (let i = i0; i <= i1; i++) {
        const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy)
        const t = 1 - Math.abs(d - r) / w
        if (t > 0) v[row + i] += t * force
      }
    }
  }

  /* ------------------------------- Skuggning ------------------------------- */
  /* Släpljus uppifrån vänster. Färgen är vax: kall skugga, varm dager och en
     underhudston som lyser igenom där materialet är som mest utspänt. */
  const LX = -0.597, LY = -0.640, LZ = 0.483
  const hx = LX, hy = LY, hz = LZ + 1
  const hl = Math.hypot(hx, hy, hz)
  const HX = hx / hl, HY = hy / hl, HZ = hz / hl
  /* Skugga → dager. Vax är kallt i skuggan och varmt i dagern; spannet mellan
     dem är det som gör att en svällning läses som en kropp och inte en fläck. */
  const SR = 46, SG = 40, SB = 50
  const DR = 252, DG = 241, DB = 229

  function render() {
    const NS = HEIGHT_PX / (2 * CELL)
    for (let j = 1; j < gh - 1; j++) {
      const row = j * gw
      for (let i = 1; i < gw - 1; i++) {
        const k = row + i
        const nx = (h[k - 1] - h[k + 1]) * NS
        const ny = (h[k - gw] - h[k + gw]) * NS
        const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1)
        let diff = (nx * LX + ny * LY + LZ) * inv
        if (diff < 0) diff = 0
        let sp = (nx * HX + ny * HY + HZ) * inv
        // sp^32 med upprepad kvadrering — Math.pow är för dyr per bildpunkt
        if (sp <= 0) sp = 0
        else { sp *= sp; sp *= sp; sp *= sp; sp *= sp; sp *= sp; sp *= 46 }

        let l = 0.10 + 0.92 * diff; if (l > 1) l = 1
        const hh = h[k] > 0 ? (h[k] > 1.3 ? 1.3 : h[k]) : 0
        const sub = hh * hh * 0.34           // ljus genom utspänt material
        const g = grain[k]
        const o = k << 2
        pix[o] = SR + (DR - SR) * l + 128 * sub + sp + g
        pix[o + 1] = SG + (DG - SG) * l + 46 * sub + sp * 0.97 + g
        pix[o + 2] = SB + (DB - SB) * l + 38 * sub + sp * 0.94 + g
      }
    }
    offctx.putImageData(img, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'medium'
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(off, 0, 0, gw, gh, 0, 0, W, H)
    drawSharpText()
  }

  /* Höjdfältet är grovt med flit — hinnan är tjock. Men vid fullt tryck läggs
     samma bokstäver på i skärmupplösning som ren relief (mörk kant nedåt,
     ljus kant uppåt), så namnet går att läsa när något verkligen trycker på. */
  function drawSharpText() {
    for (const n of nodes) {
      const a = clamp01((n.press - 0.14) / 0.72)
      if (a < 0.02) continue
      const fp = n.font * CELL
      ctx.save()
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      setFont(ctx, fp, n.track * CELL)
      const t = n.name.toUpperCase()
      const dx = n.x + (HAS_TRACKING ? fp * 0.08 : 0)
      ctx.globalAlpha = a * 0.30
      ctx.fillStyle = '#2A1C16'
      ctx.fillText(t, dx + fp * 0.028, n.y + fp * 0.032)
      ctx.globalAlpha = a * 0.34
      ctx.fillStyle = '#FFF6EC'
      ctx.fillText(t, dx - fp * 0.026, n.y - fp * 0.03)
      ctx.restore()
    }
  }

  /* ------------------------------ Händelser ------------------------------ */
  for (const n of nodes) {
    on(n.el, 'pointerenter', () => { n.hover = true })
    on(n.el, 'pointerleave', () => { n.hover = false })
    on(n.el, 'focus', () => {
      n.hover = true
      if (!reduce) { ring(n.x, n.y, 0.05); idle = 0 } else scheduleStatic()
    })
    on(n.el, 'blur', () => { n.hover = false; if (reduce) scheduleStatic() })
    // Klicket: bristningsgränsen. Länken rörs aldrig — ingen preventDefault,
    // så vanligt klick, ctrl/cmd-klick och mittenklick beter sig som vanligt.
    const strike = () => {
      if (reduce) return
      n.press = Math.min(1.45, n.press + 0.55)
      ring(n.x, n.y, 0.16)
      scene.classList.remove('is-strike'); void scene.offsetWidth; scene.classList.add('is-strike')
    }
    on(n.el, 'click', strike)
    on(n.el, 'auxclick', (e) => { if (e.button === 1) strike() })
  }

  if (!reduce) {
    on(window, 'pointermove', (e) => {
      const dx = e.clientX - ptr.px, dy = e.clientY - ptr.py
      ptr.speed = Math.min(2400, Math.hypot(dx, dy) * 60)
      ptr.px = e.clientX; ptr.py = e.clientY
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true
      if (ptr.speed > 40) idle = 0
    }, { passive: true })
    on(document, 'pointerleave', () => { ptr.on = false })
    on(window, 'keydown', () => { idle = 0 })
  }
  on(window, 'resize', () => { layout(); if (reduce) solveStatic() })
  if (document.fonts?.ready) {
    let alive = true
    cleanups.push(() => { alive = false })
    // Webbteckensnittet kan landa efter att masken rastrerats — mät om då.
    document.fonts.ready.then(() => { if (alive) { layout(); if (reduce) solveStatic() } })
  }

  /* ------------------------------ Stillbilden ------------------------------ */
  /* Med reduced motion finns ingen våg. Måltillståndet slätas ut några gånger
     i stället — det ger samma mjuka material utan en enda rörelse. */
  function solveStatic() {
    // Samma ändliga material som i rörelse, bara löst i ett steg: hovras en av
    // de tre planas de andra två ut, och navet ligger aldrig lägre än den högsta.
    let maxKid = 0
    for (const k of kids) { k.press = k.hover ? 1 : k.base + 0.22; maxKid = Math.max(maxKid, k.hover ? 1 : 0) }
    for (const k of kids) if (!k.hover) k.press *= 1 - 0.5 * maxKid
    hub.press = Math.max(hub.hover ? 1 : hub.base + 0.22, 0.42 + 0.5 * maxKid)
    buildTarget()
    h = blur(Float32Array.from(target), gw, gh, 3)
    for (let i = 0; i < gw; i++) { h[i] = 0; h[(gh - 1) * gw + i] = 0 }
    for (let j = 0; j < gh; j++) { h[j * gw] = 0; h[j * gw + gw - 1] = 0 }
    render()
  }
  let staticRaf = 0
  const scheduleStatic = () => {
    cancelAnimationFrame(staticRaf)
    staticRaf = requestAnimationFrame(solveStatic)
  }

  layout()
  if (reduce) {
    solveStatic()
    cleanups.push(() => cancelAnimationFrame(staticRaf))
    return () => cleanups.forEach((fn) => fn())
  }

  /* -------------------------------- Loopen -------------------------------- */
  let running = true, raf = 0, last = performance.now(), creepAt = 0, saveAt = 0

  const loop = (now = performance.now()) => {
    if (!running) return
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now
    const t = now / 1000

    ptr.speed *= Math.exp(-dt / 0.09)
    idle += dt
    breath = Math.sin(t * 0.62)

    /* Ditt tryck: full buktning när pekaren är på duken, som släpper mjukt när
       den lämnar. Slakheten samlas där du håller till. */
    const wantDent = ptr.on ? 1 : 0
    ptr.dent += (wantDent - ptr.dent) * Math.min(1, dt * (wantDent ? 9 : 2.6))
    if (ptr.on && ptr.dent > 0.3) {
      const ci = Math.min(CREEP_W - 1, Math.max(0, Math.floor((ptr.x / W) * CREEP_W)))
      const cj = Math.min(CREEP_H - 1, Math.max(0, Math.floor((ptr.y / H) * CREEP_H)))
      const k = cj * CREEP_W + ci
      creep[k] = Math.min(1, creep[k] + dt * 0.09)
    }

    /* Efterfrågan. De tre konkurrerar om ändligt material: den som dras ut
       planar ut de andra två. Navet konkurrerar aldrig — dess tryck är det som
       lyfter dem, så det kan inte ligga lägre än den högsta av dem. */
    let maxKid = 0
    for (const k of kids) {
      k.raw = k.hover ? 1 : Math.max(k.base, proximity(k))
      maxKid = Math.max(maxKid, k.raw)
    }
    for (const k of kids) {
      let other = 0
      for (const o of kids) if (o !== k) other = Math.max(other, o.raw - o.base)
      k.want = k.raw * (1 - 0.66 * other) * (1 - 0.34 * hand.amp)
    }
    hub.want = Math.max(hub.hover ? 1 : Math.max(hub.base, proximity(hub)), 0.42 + 0.5 * maxKid) * (1 - 0.3 * hand.amp)

    for (const n of nodes) {
      const w = n.want
      // Trycket byggs snabbt och släpper långsamt — materialet har tröghet.
      n.press += (w - n.press) * Math.min(1, dt * (w > n.press ? 7 : 2.2))
    }

    updateHand(dt)

    buildTarget()
    for (let s = 0; s < SUB; s++) simStep()
    render()

    if (now - creepAt > 1400) {
      creepAt = now
      for (let i = 0; i < creep.length; i++) creep[i] = Math.max(0, creep[i] - 0.005)
      rebuildCreep()
    }
    if (now - saveAt > 5000) { saveAt = now; saveCreep() }
  }

  function proximity(n) {
    if (!ptr.on) return 0
    const d = Math.hypot((ptr.x - n.x) / n.rx, (ptr.y - n.y) / n.ry)
    if (d <= 1) return 0.72
    const px = (d - 1) * Math.min(n.rx, n.ry)
    return Math.pow(clamp01(1 - px / REACH), 1.6) * 0.66
  }

  /* Handen bakom duken. Den kommer bara när du varit stilla en stund — och den
     drar sig undan om du går emot den. */
  const RISE = 1.6, HOLD = 1.2, FALL = 2.0
  function updateHand(dt) {
    if (!hand.on) {
      hand.cool = Math.max(0, hand.cool - dt)
      hand.amp = Math.max(0, hand.amp - dt * 0.9)
      if (hand.cool === 0 && idle > 5.5) {
        /* Den kommer i närheten av dig, men aldrig så nära att den genast måste
           dra sig undan igen: nära en kant klämmer clampen ihop kandidaterna,
           så flera riktningar prövas och den som hamnar längst bort vinner. */
        const bx = ptr.on ? ptr.x : W * 0.5
        const by = ptr.on ? ptr.y : H * 0.5
        // hela handen ska rymmas under topbaren — en avklippt hand är en fläck
        const mx = hand.mw * CELL * 0.5 + 8, my = hand.mh * CELL * 0.5 + 8
        const rr = Math.min(W, H) * (0.22 + Math.random() * 0.12)
        const a0 = Math.random() * Math.PI * 2
        let bx2 = bx, by2 = by, bestD = -1
        for (let i = 0; i < 7; i++) {
          const a = a0 + (i / 7) * Math.PI * 2
          const x = Math.min(W - mx, Math.max(mx, bx + Math.cos(a) * rr))
          const y = Math.min(H - my, Math.max(topY + my, by + Math.sin(a) * rr))
          // ... och aldrig ovanpå en av de tre, där formerna skulle slåss
          let clear = 1e4
          for (const k of kids) clear = Math.min(clear, Math.hypot(x - k.x, y - k.y) - k.rx * 1.5)
          const d = (ptr.on ? Math.min(Math.hypot(x - bx, y - by), 300) : 300) + 1.2 * Math.min(clear, 240)
          if (d > bestD) { bestD = d; bx2 = x; by2 = y }
        }
        hand.x = bx2; hand.y = by2
        hand.on = true; hand.t = 0; hand.flee = false
      }
      return
    }
    hand.t += dt
    // Kommer du för nära drar den sig undan — snabbt.
    if (!hand.flee && ptr.on && Math.hypot(ptr.x - hand.x, ptr.y - hand.y) < hand.mw * CELL * 0.52) hand.flee = true
    if (hand.flee) {
      hand.amp = Math.max(0, hand.amp - dt * 2.4)
      if (hand.amp <= 0) { hand.on = false; hand.cool = 26 + Math.random() * 18 }
      return
    }
    if (hand.t < RISE) {
      const u = hand.t / RISE
      hand.amp = u * u * (3 - 2 * u)
    } else if (hand.t < RISE + HOLD) {
      hand.amp = 1
    } else if (hand.t < RISE + HOLD + FALL) {
      const u = (hand.t - RISE - HOLD) / FALL
      hand.amp = 1 - u * u * (3 - 2 * u)
    } else {
      hand.amp = 0; hand.on = false; hand.cool = 26 + Math.random() * 18
    }
  }

  const onVis = () => {
    running = !document.hidden
    if (running) { last = performance.now(); loop() } else { cancelAnimationFrame(raf); saveCreep() }
  }
  on(document, 'visibilitychange', onVis)
  cleanups.push(() => { running = false; cancelAnimationFrame(raf); cancelAnimationFrame(staticRaf); saveCreep() })
  loop()

  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'hinnan',
  label: 'Hinnan',
  chaos: true,      // kaosklass — visas bara bakom kaos-togglen
  fullscene: true,  // normalfallet i kaos: skelettet göms, scenen byggs här
  anim: {},
  enhancer: hinnanEnhancer,
}
