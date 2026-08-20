// =============================================================================
// Stil "Lodet" — KAOSKLASS, helscen. Scrollhjulet flyttar aldrig sidan.
//
// Mönsterbrottet: att scroll gör det scroll gör — flyttar en yta över
// innehåll som redan finns, i dokumentets ordning. Här finns inget att
// scrolla förbi. Hjulet vinschar i stället ut ett lod (ett sänke i ett rep)
// genom en mörk vattenpelare, och det är LODETS NÄRHET — inte skrollpositionen
// i något dokumentflöde — som avgör vad som lyser upp. De tre underapparna är
// fosforescerande beten fästa på fasta djup i mörkret; Syntes är havsbottnen,
// bandet som alltid glöder svagt eftersom grunden aldrig vilar i totalt
// mörker, och den enda punkt lodet till slut kan sjunka mot.
//
// Datat är riktigt: djupordningen (grunt → djupt) följer stigande radantal
// ur stats.json, och metertalet som räknas upp vid ett bett är en omskrivning
// av samma tal (⌊1.6·√rader⌋) — samma grepp som älvens bredd eller
// tunnelbanans restid.
//
// Tillståndsloopen:
//   innan      — vattnet andas: skimmer nära ytan, bubblor stiger, ankarlinor
//                ner till botten glöder svagt även utan interaktion
//   närmandet  — en störning i vattnet följer pekaren, och lodet driver mjukt
//                mot det bete man är på väg mot innan man ens hovrar det
//   hover      — full glöd, namn + djup räknas upp, en spänd lina ritas
//                mellan lodet och betet; fokus ger EXAKT samma glöd som hover
//   lämnandet  — glöden faller inte till noll: ett bett som väckts en gång
//                lämnar ett kvarstående skimmer resten av sessionen
//   klicket    — lodet rycker mot ytan i en snabb ljusstöt (rent visuellt på
//                canvasen, länken själv rörs aldrig), ringar sprids från
//                nedslaget, navigationen kapas aldrig (ingen preventDefault)
//
// prefers-reduced-motion: inget hjul/touch kopplas in och ingen rAF-loop
// körs — allt star permanent fullt upplyst i en stillbild, linan hänger rakt
// ner mot botten. Konceptet (djup, beten, botten) står kvar utan rörelse.
//
// Cleanup river allt: scenen, canvasen, alla lyssnare (wheel/touch/pointer/
// fokus/resize/synlighet) och animationsloopen.
// =============================================================================

import './lodet.css'
import { apps } from '../apps.js'
import stats from '../data/stats.json'
import { countUp } from '../shared.js'

const appById = Object.fromEntries(apps.map((a) => [a.id, a]))
const linesOf = (id) => stats.projects[id]?.lines || 1000
const metersOf = (id) => Math.max(12, Math.round(1.6 * Math.sqrt(linesOf(id))))
const clamp01 = (v) => Math.max(0, Math.min(1, v))

const HUES = { signal: '#C792FF', ethos: '#6FE7FF', hexis: '#FFB84D' }
const DEPTHS = [0.26, 0.50, 0.74]
const HX = [0.30, 0.68, 0.46]
// Grunt → djupt efter STIGANDE radantal — riktig data styr ordningen, inte färgen.
const LURE_IDS = ['signal', 'ethos', 'hexis'].sort((a, b) => linesOf(a) - linesOf(b))
const LURES = LURE_IDS.map((id, i) => ({ id, depth: DEPTHS[i], hx: HX[i], hue: HUES[id] }))

const REACH = 0.16
const CAUGHT_FLOOR = 0.22
const BED_FLOOR = 0.14

export function lodetEnhancer() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []

  /* ------------------------------- Scenen ------------------------------- */
  const scene = document.createElement('div')
  scene.className = 'lod-scene'
  const syntes = appById.syntes || { url: '#', name: 'Syntes' }
  scene.innerHTML = `
    <canvas class="lod-water" aria-hidden="true"></canvas>
    ${LURES.map((l) => {
      const app = appById[l.id] || { url: '#', name: l.id }
      return `
      <a class="lod-lure" href="${app.url}" data-app="${l.id}" style="--hue:${l.hue}" aria-label="Öppna ${app.name}">
        <span class="lod-lure__ring"></span>
        <span class="lod-lure__label">
          <span class="lod-lure__name">${app.name}</span>
          <span class="lod-lure__depth count" data-to="${metersOf(l.id)}" data-suffix=" m">0 m</span>
        </span>
      </a>`
    }).join('')}
    <a class="lod-bed" href="${syntes.url}" data-app="syntes" aria-label="Öppna Syntes — havsbottnen">
      <span class="lod-bed__name">Syntes</span>
    </a>
    <div class="lod-vignette" aria-hidden="true"></div>
    <div class="lod-grain" aria-hidden="true"></div>`
  document.body.appendChild(scene)
  cleanups.push(() => scene.remove())

  const canvas = scene.querySelector('.lod-water')
  const ctx = canvas.getContext('2d')
  const lureEls = [...scene.querySelectorAll('.lod-lure')]
  const lures = LURES.map((l, i) => ({
    ...l, el: lureEls[i], glow: 0, forced: false, caught: false, px: 0, py: 0,
  }))
  const bedEl = scene.querySelector('.lod-bed')
  const bed = { depth: 1, hue: '#FFE9B0', el: bedEl, glow: 0, forced: false, caught: false, px: 0, py: 0 }
  const allNodes = [...lures, bed]

  /* ------------------------------ Tillstånd ------------------------------ */
  let W = 0, H = 0, DPR = 1, vmin = 0, shaftTop = 0, shaftH = 0
  let wheelDepth = 0.06
  let displayDepth = wheelDepth
  let displayX = 0.5
  let hoverNode = null
  let bubbles = []
  let rings = []
  const yank = { active: false, t: 0 }
  const ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, active: false }

  /* ------------------------------- Layout ------------------------------- */
  const layout = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1)
    W = innerWidth; H = innerHeight; vmin = Math.min(W, H) / 100
    canvas.width = W * DPR; canvas.height = H * DPR
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    const topH = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 80
    shaftTop = topH + 24
    shaftH = Math.max(120, H - shaftTop - 24)
    const size = Math.round(Math.max(84, Math.min(140, vmin * 13)))
    for (const l of lures) {
      l.px = l.hx * W
      l.py = shaftTop + l.depth * shaftH
      l.el.style.setProperty('--lod-size', size + 'px')
      l.el.style.transform = `translate3d(${(l.px - size / 2).toFixed(1)}px, ${(l.py - size / 2).toFixed(1)}px, 0)`
    }
    const br = bedEl.getBoundingClientRect()
    bed.px = br.left + br.width / 2
    bed.py = br.top
  }

  const initBubbles = () => {
    bubbles = []
    if (reduce) return
    const n = Math.min(70, Math.round((W * H) / 22000))
    for (let i = 0; i < n; i++) {
      bubbles.push({
        x: Math.random() * W, y: shaftTop + Math.random() * (shaftH * 1.2),
        r: 1 + Math.random() * 2.2, v: 6 + Math.random() * 14,
        a: 0.15 + Math.random() * 0.35, p: Math.random() * Math.PI * 2,
      })
    }
  }

  /* ------------------------------ Händelser ------------------------------ */
  const on = (el, ev, fn, opts) => { el.addEventListener(ev, fn, opts); cleanups.push(() => el.removeEventListener(ev, fn, opts)) }

  const wakeNode = (node) => (() => {
    node.forced = true
    hoverNode = node
    if (!node.caught) {
      node.caught = true
      const stat = node.el.querySelector('.lod-lure__depth')
      if (stat) countUp(stat)
    }
  })
  const sleepNode = (node) => (() => {
    node.forced = false
    if (hoverNode === node) hoverNode = null
  })
  for (const l of lures) {
    on(l.el, 'pointerenter', wakeNode(l)); on(l.el, 'focus', wakeNode(l))
    on(l.el, 'pointerleave', sleepNode(l)); on(l.el, 'blur', sleepNode(l))
  }
  on(bedEl, 'pointerenter', wakeNode(bed)); on(bedEl, 'focus', wakeNode(bed))
  on(bedEl, 'pointerleave', sleepNode(bed)); on(bedEl, 'blur', sleepNode(bed))

  // Klicket: ljusringar + en kort, ren visuell ryckning av lodet mot ytan.
  // Rör aldrig länkens egen transform — navigationen ska aldrig kunna kapas.
  const erupt = (node) => (e) => {
    let x = e.clientX, y = e.clientY
    if (!e.detail || (x === 0 && y === 0)) {
      const r = node.el.getBoundingClientRect()
      x = r.left + r.width / 2; y = r.top + r.height / 2
    }
    if (!reduce) { rings.push({ x, y, r: 10, a: 0.85, hue: node.hue }); yank.active = true; yank.t = 0 }
    scene.classList.remove('lod-yank')
    void scene.offsetWidth
    scene.classList.add('lod-yank')
  }
  for (const node of allNodes) {
    on(node.el, 'click', erupt(node))
    on(node.el, 'auxclick', (e) => { if (e.button === 1) erupt(node)(e) })
  }

  on(scene, 'pointermove', (e) => { ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.active = true }, { passive: true })
  on(scene, 'pointerleave', () => { ptr.active = false })

  if (!reduce) {
    on(scene, 'wheel', (e) => {
      e.preventDefault()
      wheelDepth = clamp01(wheelDepth + e.deltaY * 0.00035)
    }, { passive: false })
    let touchY = null
    on(scene, 'touchstart', (e) => { touchY = e.touches[0]?.clientY ?? null }, { passive: true })
    on(scene, 'touchmove', (e) => {
      if (touchY == null) return
      const y = e.touches[0].clientY
      wheelDepth = clamp01(wheelDepth + (touchY - y) * 0.0018)
      touchY = y
      e.preventDefault()
    }, { passive: false })
    on(scene, 'touchend', () => { touchY = null })
  }

  on(window, 'resize', () => { layout(); initBubbles(); if (reduce) renderStatic() })

  /* ------------------------------- Målningen ------------------------------- */
  const paint = (t, dt) => {
    ctx.clearRect(0, 0, W, H)

    for (const b of bubbles) {
      b.y -= b.v * dt
      if (b.y < shaftTop - 20) { b.y = H + 10; b.x = Math.random() * W }
      ctx.globalAlpha = b.a * (0.55 + 0.35 * Math.sin(t * 2 + b.p))
      ctx.fillStyle = '#BFF7F2'
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1

    // Ankarlinor ner till botten — glöder svagt även i vila.
    ctx.lineWidth = 1.4
    for (const l of lures) {
      ctx.strokeStyle = `rgba(180,235,235,${(0.05 + 0.35 * l.glow).toFixed(3)})`
      ctx.beginPath(); ctx.moveTo(l.px, l.py); ctx.lineTo(bed.px, bed.py); ctx.stroke()
    }

    // Linan + lodet.
    const wx = displayX * W + Math.sin(t * 0.5) * vmin * 0.6
    const wy = shaftTop + displayDepth * shaftH + Math.sin(t * 0.7) * 3
    const grd = ctx.createLinearGradient(W / 2, 0, wx, wy)
    grd.addColorStop(0, 'rgba(200,240,240,0)')
    grd.addColorStop(1, 'rgba(220,250,250,.5)')
    ctx.strokeStyle = grd
    ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(W / 2, -10); ctx.lineTo(wx, wy); ctx.stroke()

    if (hoverNode && !yank.active) {
      ctx.strokeStyle = hoverNode.hue
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 1.8
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(hoverNode.px, hoverNode.py); ctx.stroke()
      ctx.globalAlpha = 1
    }

    const wglow = hoverNode ? 1 : 0.5
    const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, 26)
    g.addColorStop(0, `rgba(230,250,250,${(0.55 * wglow).toFixed(3)})`)
    g.addColorStop(1, 'rgba(230,250,250,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(wx, wy, 26, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#EAFBFB'
    ctx.beginPath(); ctx.arc(wx, wy, 3.4, 0, Math.PI * 2); ctx.fill()

    if (ptr.active) {
      const pg = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 150)
      pg.addColorStop(0, 'rgba(140,230,230,.10)')
      pg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = pg
      ctx.fillRect(ptr.x - 150, ptr.y - 150, 300, 300)
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]
      r.r += 620 * dt
      r.a -= dt * 2.4
      if (r.a <= 0.02) { rings.splice(i, 1); continue }
      ctx.globalAlpha = r.a
      ctx.strokeStyle = r.hue
      ctx.lineWidth = 2.4
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  /* ---------------------------- Stillbildsläge ---------------------------- */
  function renderStatic() {
    ctx.clearRect(0, 0, W, H)
    ctx.lineWidth = 1.4
    for (const l of lures) {
      ctx.strokeStyle = 'rgba(200,240,240,.4)'
      ctx.beginPath(); ctx.moveTo(l.px, l.py); ctx.lineTo(bed.px, bed.py); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(210,245,245,.45)'
    ctx.beginPath(); ctx.moveTo(W / 2, -10); ctx.lineTo(bed.px, bed.py); ctx.stroke()
  }

  /* -------------------------------- Loopen -------------------------------- */
  layout()

  if (reduce) {
    for (const node of allNodes) {
      node.glow = 1; node.caught = true
      node.el.style.setProperty('--glow', '1')
      const stat = node.el.querySelector('.lod-lure__depth')
      if (stat) countUp(stat)
    }
    renderStatic()
  } else {
    initBubbles()
    let running = true
    let raf = 0
    let last = performance.now()
    const loop = (now = performance.now()) => {
      if (!running) return
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const t = now / 1000

      ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 8)
      ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 8)

      let targetDepth
      if (yank.active) {
        yank.t += dt
        targetDepth = 0.02
        if (yank.t > 0.5) yank.active = false
      } else {
        targetDepth = hoverNode ? hoverNode.depth : wheelDepth
      }
      const targetX = (hoverNode && hoverNode.hx != null) ? hoverNode.hx : 0.5
      const depthLerp = yank.active ? Math.min(1, dt * 9) : Math.min(1, dt * 4)
      displayDepth += (targetDepth - displayDepth) * depthLerp
      displayX += (targetX - displayX) * Math.min(1, dt * 4)

      for (const l of lures) {
        const prox = Math.pow(clamp01(1 - Math.abs(displayDepth - l.depth) / REACH), 1.4)
        const target = l.forced ? 1 : Math.max(prox, l.caught ? CAUGHT_FLOOR : 0)
        l.glow += (target - l.glow) * Math.min(1, dt * 5)
        l.el.style.setProperty('--glow', l.glow.toFixed(3))
      }
      {
        const prox = Math.pow(clamp01(1 - Math.abs(displayDepth - 1) / REACH), 1.4)
        const target = bed.forced ? 1 : Math.max(BED_FLOOR, prox, bed.caught ? 0.3 : 0)
        bed.glow += (target - bed.glow) * Math.min(1, dt * 5)
        bedEl.style.setProperty('--glow', bed.glow.toFixed(3))
      }

      paint(t, dt)
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

  return () => { cleanups.forEach((fn) => fn()) }
}

export default {
  id: 'lodet',
  /* Lodet vinschar med dragrörelsen — skelettets "drag nedåt = ny stil" måste
     hålla sig undan här, annars betyder samma gest två saker. */
  egenDrag: true,
  label: 'Lodet',
  chaos: true,      // kaosklass — visas bara bakom kaos-togglen
  fullscene: true,  // normalfallet i kaos: skelettet göms, scenen byggs här
  anim: {},
  enhancer: lodetEnhancer,
}
