// =============================================================================
// Stil "Pangea" — KAOSKLASS, helscen. Sidan har ingen bakgrund.
//
// Mönsterbrottet: en sida består av länkar OVANPÅ en död yta. Här finns ingen
// död yta — varje pixel i viewporten navigerar. Det som ser ut som bakgrund är
// smält berg, och smältan ÄR Syntes: ett enda fullskärms-<a> underst i scenen.
// De tre underapparna är basaltplattor som flyter på navet; deras drift drivs
// av konvektionsströmmarna i smältan (samma flödesfält knuffar både plattor
// och gnistor), så navets särställning är fysik och topologi, inte dekor:
// mellan två plattor korsar man alltid navet.
//
// Datat är riktigt: plattornas area skalar med `rader` ur stats.json (samma
// siffror som systemhälsan), och siffran räknas upp när plattan väcks.
//
// Tillståndsloopen:
//   innan      — plattorna kryper, smältan konvekterar, sömmarna pulserar
//   närmandet  — en glöd följer markören UNDER skorpan (canvasen ligger under
//                plattorna, så glöden försvinner in under dem), och sömmar
//                nära markören ljusnar lokalt
//   hover      — plattan pinnas (slutar driva → lätt att träffa), hettas
//                underifrån, namnet glöder och raderna räknas upp; hovras
//                smältan tänds SYNTES och alla sömmar lyfter
//   lämnandet  — hettan svalnar långsamt (JS-lerpad --heat), ett ärr av glöd
//   klicket    — eruptionsring + vitglött uppflammande, navigationen kapas
//                aldrig (ingen preventDefault)
//
// prefers-reduced-motion: ingen rAF-loop — scenen renderas som stillbild
// (frusen konvektion, glödande sömmar) och hover/fokus växlar tillstånd
// direkt. Konceptet står ändå: ingen bakgrund, plattor på smälta.
//
// Cleanup river allt: scenen, canvasen, lyssnare (scene-lokala dör med noden;
// window/document tas bort explicit) och animationsloopen.
// =============================================================================

import './pangea.css'
import { apps } from '../apps.js'
import stats from '../data/stats.json'
import { nf, countUp } from '../shared.js'

const appById = Object.fromEntries(apps.map((a) => [a.id, a]))
const linesOf = (id) => stats.projects[id]?.lines || 1000

// Per platta: glödton, hemposition (fraktioner av viewporten) och blob-frö.
const PLATES = [
  { id: 'signal', hue: '#FFC978', hx: 0.19, hy: 0.62, seed: 7 },
  { id: 'ethos', hue: '#FF9E64', hx: 0.62, hy: 0.24, seed: 3 },
  { id: 'hexis', hue: '#FF6B4A', hx: 0.78, hy: 0.66, seed: 11 },
]

// Konvektionsceller: position (fraktioner), omloppsradie/-fart, riktning, räckvidd.
const CELLS = [
  { bx: 0.50, by: 0.54, orb: 0.10, w: 0.050, ph: 0.0, dir: 1, R: 0.46, hot: 0.58 },
  { bx: 0.22, by: 0.34, orb: 0.07, w: 0.038, ph: 2.1, dir: -1, R: 0.34, hot: 0.40 },
  { bx: 0.80, by: 0.30, orb: 0.08, w: 0.031, ph: 4.0, dir: 1, R: 0.34, hot: 0.36 },
  { bx: 0.60, by: 0.80, orb: 0.09, w: 0.043, ph: 1.2, dir: -1, R: 0.38, hot: 0.44 },
]

const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/* Kontinentkontur: oregelbunden polygon på enhetscirkeln (±jitter). Samma
   punkter blir clip-path (i % av boxen) och sömmens Path2D på canvasen. */
function blob(seed, n = 13) {
  const rnd = mulberry32(seed)
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * ((Math.PI * 2) / n) * 0.55
    const rr = 0.74 + rnd() * 0.24
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr])
  }
  return pts
}
const clipOf = (pts) => `polygon(${pts.map(([x, y]) => `${(50 + x * 50).toFixed(2)}% ${(50 + y * 50).toFixed(2)}%`).join(',')})`

export function pangeaEnhancer() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []
  let disposed = false

  /* ------------------------------- Scenen ------------------------------- */
  const scene = document.createElement('div')
  scene.className = 'pan-scene'
  const syntes = appById.syntes || { url: '#', name: 'Syntes' }
  scene.innerHTML = `
    <a class="pan-sea" href="${syntes.url}" data-app="syntes" aria-label="Öppna Syntes — navet"></a>
    <canvas class="pan-melt" aria-hidden="true"></canvas>
    ${PLATES.map((p) => {
      const app = appById[p.id] || { url: '#', name: p.id }
      return `
      <a class="pan-plate" href="${app.url}" data-app="${p.id}"
         style="--hue:${p.hue};--clip:${clipOf(blob(p.seed))}" aria-label="Öppna ${app.name}">
        <span class="pan-plate__rock">
          <span class="pan-plate__label">
            <span class="pan-plate__name">${app.name}</span>
            <span class="pan-plate__stat count" data-to="${linesOf(p.id)}" data-suffix=" rader">0 rader</span>
          </span>
        </span>
      </a>`
    }).join('')}
    <div class="pan-vignette" aria-hidden="true"></div>
    <div class="pan-grain" aria-hidden="true"></div>`
  document.body.appendChild(scene)
  cleanups.push(() => scene.remove())

  const sea = scene.querySelector('.pan-sea')
  const canvas = scene.querySelector('.pan-melt')
  const ctx = canvas.getContext('2d')
  const bg = document.createElement('canvas')          // smältan i kvartsupplösning
  const bctx = bg.getContext('2d')
  const otext = document.createElement('canvas')       // SYNTES, förrenderad
  const octx = otext.getContext('2d')

  /* ------------------------------ Tillstånd ------------------------------ */
  let W = 0, H = 0, DPR = 1, vmin = 0
  const plates = PLATES.map((p, i) => ({
    ...p,
    el: scene.querySelectorAll('.pan-plate')[i],
    pts: blob(p.seed),
    x: 0, y: 0, r: 0, vx: 0, vy: 0, ang0: (mulberry32(p.seed * 31)() - 0.5) * 0.3,
    phase: mulberry32(p.seed * 17)() * Math.PI * 2,
    heat: 0, hot: false,
  }))
  plates.forEach((p) => { p.statEl = p.el.querySelector('.pan-plate__stat') })
  let seaHeat = 0, seaHot = false, seaCountT = 0
  const ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, active: false }
  let embers = []
  let rings = []
  let textW = 0, textH = 0

  const flow = (x, y, t, out) => {
    out.x = 0; out.y = 0
    for (const c of CELLS) {
      const cx = (c.bx + Math.cos(t * c.w + c.ph) * c.orb) * W
      const cy = (c.by + Math.sin(t * c.w + c.ph) * c.orb) * H
      const dx = x - cx, dy = y - cy
      const d = Math.hypot(dx, dy) + 1
      const sig = c.R * vmin * 100 * 0.8
      const fall = Math.exp(-(d * d) / (2 * sig * sig))
      out.x += ((-dy / d) * c.dir + (dx / d) * 0.22) * fall
      out.y += ((dx / d) * c.dir + (dy / d) * 0.22) * fall
    }
    return out
  }
  const fv = { x: 0, y: 0 }

  /* ---------------------------- SYNTES-texten ---------------------------- */
  const renderOtext = () => {
    let fs = Math.min(W * 0.13, vmin * 15)
    octx.setTransform(1, 0, 0, 1, 0, 0)
    octx.font = `500 ${fs}px Fraunces, Georgia, serif`
    try { octx.letterSpacing = `${(fs * 0.12).toFixed(1)}px` } catch { /* äldre motor */ }
    const maxW = Math.min(W * 0.56, vmin * 62)
    const m = octx.measureText('SYNTES')
    if (m.width > maxW) fs *= maxW / m.width
    octx.font = `500 ${fs}px Fraunces, Georgia, serif`
    textW = octx.measureText('SYNTES').width
    textH = fs * 1.2
    otext.width = Math.ceil((textW + fs * 0.3) * DPR)
    otext.height = Math.ceil(textH * 1.3 * DPR)
    octx.setTransform(DPR, 0, 0, DPR, 0, 0)
    octx.font = `500 ${fs}px Fraunces, Georgia, serif`
    try { octx.letterSpacing = `${(fs * 0.12).toFixed(1)}px` } catch { /* äldre motor */ }
    octx.textBaseline = 'middle'
    const g = octx.createLinearGradient(0, 0, 0, textH * 1.2)
    g.addColorStop(0, '#FFE7BD')
    g.addColorStop(0.55, '#FF8A3C')
    g.addColorStop(1, '#B03A0E')
    octx.fillStyle = g
    octx.fillText('SYNTES', fs * 0.15, (textH * 1.3) / 2)
  }

  /* ------------------------------- Layout ------------------------------- */
  const layout = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1)
    W = innerWidth; H = innerHeight; vmin = Math.min(W, H) / 100
    canvas.width = W * DPR; canvas.height = H * DPR
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    bg.width = Math.max(2, W >> 2); bg.height = Math.max(2, H >> 2)
    renderOtext()
    const topH = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 80
    for (const p of plates) {
      p.r = Math.max(64, Math.min(0.26 * vmin * 100, Math.cbrt(linesOf(p.id)) * 0.58 * vmin))
      p.homeX = p.hx * W; p.homeY = Math.max(topH + p.r + 16, p.hy * H)
      if (!p.x) { p.x = p.homeX; p.y = p.homeY }
      const side = Math.round(p.r * 2)
      p.el.style.width = p.el.style.height = side + 'px'
      p.el.querySelector('.pan-plate__name').style.fontSize = Math.round(Math.max(17, p.r * 0.30)) + 'px'
      p.statEl.style.fontSize = Math.min(13, Math.max(8.5, p.r * 0.075)).toFixed(1) + 'px'
    }
    if (reduce) { plates.forEach((p) => { p.x = p.homeX; p.y = p.homeY }); placePlates(0) }
  }

  const placePlates = (t) => {
    for (const p of plates) {
      const ang = p.ang0 + (reduce ? 0 : Math.sin(t * 0.11 + p.phase) * 0.05)
      p.angNow = ang
      p.el.style.transform = `translate3d(${(p.x - p.r).toFixed(1)}px, ${(p.y - p.r).toFixed(1)}px, 0) rotate(${ang.toFixed(4)}rad)`
    }
  }

  /* ------------------------------- Fysiken ------------------------------- */
  const physics = (t, dt) => {
    for (const p of plates) {
      flow(p.x, p.y, t, fv)
      let tvx = fv.x * 7 + (p.homeX - p.x) * 0.05
      let tvy = fv.y * 7 + (p.homeY - p.y) * 0.05
      if (p.hot) { tvx = 0; tvy = 0 }
      p.vx += (tvx - p.vx) * Math.min(1, dt * 1.2)
      p.vy += (tvy - p.vy) * Math.min(1, dt * 1.2)
      p.x += p.vx * dt
      p.y += p.vy * dt
    }
    // plattor skjuter isär varandra — kontinenter kolliderar inte i smyg
    for (let i = 0; i < plates.length; i++) for (let j = i + 1; j < plates.length; j++) {
      const a = plates[i], b = plates[j]
      const dx = b.x - a.x, dy = b.y - a.y
      const d = Math.hypot(dx, dy) || 1
      const min = a.r + b.r + 30
      if (d < min) {
        const push = (min - d) * 0.5
        a.x -= (dx / d) * push * 0.5; a.y -= (dy / d) * push * 0.5
        b.x += (dx / d) * push * 0.5; b.y += (dy / d) * push * 0.5
      }
    }
    for (const p of plates) {
      p.x = Math.max(p.r * 0.7, Math.min(W - p.r * 0.7, p.x))
      p.y = Math.max(p.r * 0.8, Math.min(H - p.r * 0.6, p.y))
    }
    placePlates(t)
  }

  /* ------------------------------ Värmelerp ------------------------------ */
  const heats = (dt) => {
    const k = Math.min(1, dt * 6), cool = Math.pow(0.35, dt)
    for (const p of plates) {
      p.heat = p.hot ? p.heat + (1 - p.heat) * k : p.heat * cool
      if (p.heat < 0.004) p.heat = 0
      p.el.style.setProperty('--heat', p.heat.toFixed(3))
      p.el.style.setProperty('--ha', (0.14 + 0.38 * p.heat + 0.08 * seaHeat).toFixed(3))
      p.el.style.setProperty('--hb', (0.5 * p.heat).toFixed(3))
    }
    seaHeat = seaHot ? seaHeat + (1 - seaHeat) * k : seaHeat * cool
    if (seaHeat < 0.004) seaHeat = 0
    seaCountT = seaHot ? Math.min(1, seaCountT + dt / 0.9) : 0
  }
  const setHeatsInstant = () => {
    for (const p of plates) {
      p.heat = p.hot ? 1 : 0
      p.el.style.setProperty('--heat', p.heat)
      p.el.style.setProperty('--ha', 0.14 + 0.38 * p.heat + 0.08 * seaHeat)
      p.el.style.setProperty('--hb', 0.5 * p.heat)
    }
    seaHeat = seaHot ? 1 : 0
    seaCountT = seaHot ? 1 : 0
  }

  /* ------------------------------ Målningen ------------------------------ */
  const platePath = (p) => {
    const path = new Path2D()
    const cos = Math.cos(p.angNow || 0), sin = Math.sin(p.angNow || 0)
    p.pts.forEach(([ux, uy], i) => {
      const x = p.x + (ux * cos - uy * sin) * p.r
      const y = p.y + (ux * sin + uy * cos) * p.r
      i ? path.lineTo(x, y) : path.moveTo(x, y)
    })
    path.closePath()
    return path
  }

  const paintBg = (t) => {
    const q = 0.25
    bctx.setTransform(1, 0, 0, 1, 0, 0)
    bctx.globalCompositeOperation = 'source-over'
    bctx.fillStyle = '#130705'
    bctx.fillRect(0, 0, bg.width, bg.height)
    bctx.globalCompositeOperation = 'lighter'
    for (const c of CELLS) {
      const cx = ((c.bx + Math.cos(t * c.w + c.ph) * c.orb) * W) * q
      const cy = ((c.by + Math.sin(t * c.w + c.ph) * c.orb) * H) * q
      const R = c.R * vmin * 100 * q * 1.25
      const g = bctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      g.addColorStop(0, `rgba(150,38,10,${c.hot})`)
      g.addColorStop(0.55, `rgba(70,14,5,${c.hot * 0.5})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      bctx.fillStyle = g
      bctx.fillRect(0, 0, bg.width, bg.height)
    }
    // mörka skorpflak som sakta vandrar över smältan
    bctx.globalCompositeOperation = 'source-over'
    for (let i = 0; i < 3; i++) {
      const cx = ((0.2 + 0.3 * i + Math.sin(t * 0.02 + i * 2.4) * 0.08) * W) * q
      const cy = ((0.32 + ((i * 37) % 47) / 100 + Math.cos(t * 0.017 + i) * 0.06) * H) * q
      const R = (0.30 + i * 0.05) * Math.max(W, H) * q
      const g = bctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      g.addColorStop(0, 'rgba(7,3,3,.55)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      bctx.fillStyle = g
      bctx.fillRect(0, 0, bg.width, bg.height)
    }
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(bg, 0, 0, W, H)
  }

  const paintText = (t) => {
    const dx = (W - textW) / 2
    const dy = H * 0.52 - textH * 0.62
    const oh = otext.height / DPR
    ctx.globalAlpha = 0.34 + 0.5 * seaHeat
    if (reduce) {
      ctx.drawImage(otext, dx, dy, otext.width / DPR, oh)
    } else {
      const amp = 1.1 + 3.2 * seaHeat
      const step = 6
      for (let y = 0; y < oh; y += step) {
        const off = Math.sin(y * 0.05 + t * 1.9) * amp
        ctx.drawImage(otext, 0, y * DPR, otext.width, step * DPR, dx + off, dy + y, otext.width / DPR, step)
      }
    }
    if (seaHeat > 0.02) {
      const ease = 1 - Math.pow(1 - seaCountT, 3)
      ctx.globalAlpha = seaHeat * 0.9
      ctx.font = `500 ${Math.max(10, vmin * 1.5)}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = '#E8B98A'
      ctx.fillText(`${nf.format(Math.round(linesOf('syntes') * ease))} rader`, W / 2, dy + textH * 1.32)
      ctx.textAlign = 'start'
    }
    ctx.globalAlpha = 1
  }

  const paintSeams = (t) => {
    ctx.globalCompositeOperation = 'lighter'
    for (const p of plates) {
      const path = platePath(p)
      const pulse = 0.5 + 0.5 * Math.sin(reduce ? p.phase : t * 0.45 + p.phase)
      // lagrade streck i stället för shadowBlur — samma glöd, bråkdelen av kostnaden
      const base = 0.12 + 0.20 * pulse + 0.10 * seaHeat
      ctx.strokeStyle = `rgba(255,80,20,${(base * 0.35).toFixed(3)})`
      ctx.lineWidth = 16
      ctx.stroke(path)
      ctx.strokeStyle = `rgba(255,95,25,${(base * 0.7).toFixed(3)})`
      ctx.lineWidth = 7
      ctx.stroke(path)
      ctx.strokeStyle = `rgba(255,120,40,${base.toFixed(3)})`
      ctx.lineWidth = 2.5
      ctx.stroke(path)
      if (p.heat > 0.01) {
        ctx.strokeStyle = `rgba(255,150,60,${(0.3 * p.heat).toFixed(3)})`
        ctx.lineWidth = 9
        ctx.stroke(path)
        ctx.strokeStyle = `rgba(255,205,130,${(0.8 * p.heat).toFixed(3)})`
        ctx.lineWidth = 2.5
        ctx.stroke(path)
      }
      // lokalt rimljus där markören står nära en söm
      if (!reduce && ptr.active) {
        ctx.save()
        const clip = new Path2D()
        clip.arc(ptr.x, ptr.y, 210, 0, Math.PI * 2)
        ctx.clip(clip)
        ctx.strokeStyle = 'rgba(255,170,80,.45)'
        ctx.lineWidth = 2
        ctx.stroke(path)
        ctx.restore()
      }
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  const paintCursor = () => {
    if (reduce || !ptr.active) return
    const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 190)
    g.addColorStop(0, `rgba(255,120,40,${0.20 + 0.16 * seaHeat})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = g
    ctx.fillRect(ptr.x - 190, ptr.y - 190, 380, 380)
    ctx.globalCompositeOperation = 'source-over'
  }

  /* ------------------------------- Gnistor ------------------------------- */
  const spawnEmber = (e) => {
    if (Math.random() < 0.45) {
      const p = plates[(Math.random() * plates.length) | 0]
      const [ux, uy] = p.pts[(Math.random() * p.pts.length) | 0]
      const d = Math.hypot(ux, uy) || 1
      e.x = p.x + (ux / d) * (p.r * 1.06)
      e.y = p.y + (uy / d) * (p.r * 1.06)
    } else {
      e.x = Math.random() * W; e.y = Math.random() * H
    }
    e.life = 0.5 + Math.random() * 0.5
    e.tw = Math.random() * Math.PI * 2
    e.s = 0.8 + Math.random() * 1.3
  }
  const initEmbers = () => {
    embers = []
    if (reduce) return
    const n = Math.min(90, Math.round((W * H) / 16000))
    for (let i = 0; i < n; i++) { const e = {}; spawnEmber(e); e.life = Math.random(); embers.push(e) }
  }

  const paintEmbers = (t, dt) => {
    if (reduce) return
    const hotPlate = plates.find((p) => p.hot)
    ctx.globalCompositeOperation = 'lighter'
    for (const e of embers) {
      flow(e.x, e.y, t, fv)
      let vx = fv.x * 26, vy = fv.y * 26 - 4
      if (hotPlate) {
        const dx = hotPlate.x - e.x, dy = hotPlate.y - e.y
        const d = Math.hypot(dx, dy) + 1
        const pull = Math.max(0, 1 - d / 520) * 70
        vx += (dx / d) * pull; vy += (dy / d) * pull
      } else if (seaHot && ptr.active) {
        const dx = ptr.x - e.x, dy = ptr.y - e.y
        const d = Math.hypot(dx, dy) + 1
        const pull = Math.max(0, 1 - d / 340) * 30
        vx += (dx / d) * pull; vy += (dy / d) * pull
      }
      e.x += vx * dt; e.y += vy * dt
      e.life -= dt * 0.06
      if (e.life <= 0 || e.x < -20 || e.x > W + 20 || e.y < -20 || e.y > H + 20) spawnEmber(e)
      const a = Math.min(1, e.life * 2.2) * (0.30 + 0.28 * Math.sin(t * 2.4 + e.tw) ** 2)
      ctx.globalAlpha = a
      ctx.fillStyle = '#FFB061'
      ctx.beginPath()
      ctx.arc(e.x, e.y, e.s, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  const paintRings = (dt) => {
    if (!rings.length) return
    ctx.globalCompositeOperation = 'lighter'
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]
      r.r += 850 * dt
      r.a -= dt * 2.4
      if (r.a <= 0.02) { rings.splice(i, 1); continue }
      ctx.globalAlpha = r.a
      ctx.strokeStyle = '#FFE2B0'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  /* ---------------------------- Stillbildsläge ---------------------------- */
  const renderStatic = () => {
    setHeatsInstant()
    ctx.clearRect(0, 0, W, H)
    paintBg(0)
    paintText(0)
    paintSeams(0)
  }

  /* ------------------------------ Händelser ------------------------------ */
  const on = (el, ev, fn, opts) => { el.addEventListener(ev, fn, opts); cleanups.push(() => el.removeEventListener(ev, fn, opts)) }

  on(scene, 'pointermove', (e) => { ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.active = true }, { passive: true })
  on(scene, 'pointerleave', () => { ptr.active = false })

  const seaWake = () => { seaHot = true; if (reduce) renderStatic() }
  const seaSleep = () => { seaHot = false; if (reduce) renderStatic() }
  on(sea, 'pointerenter', seaWake)
  on(sea, 'focus', seaWake)
  on(sea, 'pointerleave', seaSleep)
  on(sea, 'blur', seaSleep)

  for (const p of plates) {
    const wake = () => { p.hot = true; countUp(p.statEl); if (reduce) renderStatic() }
    const sleep = () => { p.hot = false; if (reduce) renderStatic() }
    on(p.el, 'pointerenter', wake)
    on(p.el, 'focus', wake)
    on(p.el, 'pointerleave', sleep)
    on(p.el, 'blur', sleep)
  }

  // Klicket: eruption där man klev i — Enter (detail 0) får länkens mitt.
  const erupt = (el) => (e) => {
    let x = e.clientX, y = e.clientY
    if (!e.detail || (x === 0 && y === 0)) {
      const r = el.getBoundingClientRect()
      x = r.left + r.width / 2; y = r.top + r.height / 2
    }
    if (!reduce) rings.push({ x, y, r: 12, a: 0.9 })
    scene.classList.remove('pan-erupt')
    void scene.offsetWidth
    scene.classList.add('pan-erupt')
  }
  for (const el of [sea, ...plates.map((p) => p.el)]) {
    on(el, 'click', erupt(el))
    on(el, 'auxclick', (e) => { if (e.button === 1) erupt(el)(e) })
  }

  on(window, 'resize', () => { layout(); initEmbers(); if (reduce) renderStatic() })

  /* -------------------------------- Loopen -------------------------------- */
  layout()
  initEmbers()
  document.fonts?.ready.then(() => { if (disposed) return; renderOtext(); if (reduce) renderStatic() })

  if (reduce) {
    renderStatic()
  } else {
    let running = true
    let raf = 0
    let last = performance.now()
    const loop = (now = performance.now()) => {
      if (!running) return
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const t = now / 1000
      ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 7)
      ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 7)
      physics(t, dt)
      heats(dt)
      ctx.clearRect(0, 0, W, H)
      paintBg(t)
      paintCursor()
      paintText(t)
      paintSeams(t)
      paintEmbers(t, dt)
      paintRings(dt)
    }
    const onVis = () => {
      running = !document.hidden
      if (running) { last = performance.now(); loop() }
      else cancelAnimationFrame(raf)
    }
    on(document, 'visibilitychange', onVis)
    cleanups.push(() => { running = false; cancelAnimationFrame(raf) })
    loop()
  }

  return () => { disposed = true; cleanups.forEach((fn) => fn()) }
}

export default {
  id: 'pangea',
  label: 'Pangea',
  chaos: true,      // kaosklass — visas bara bakom kaos-togglen
  fullscene: true,  // normalfallet i kaos: skelettet göms, scenen byggs här
  anim: {},
  enhancer: pangeaEnhancer,
}
