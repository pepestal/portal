// =============================================================================
// Stil "Orrery" — full scen som ERSÄTTER skelettet.
//
// Till skillnad från de övriga stilarna (som bara klär om det delade skelettet)
// tar Orrery över hela vyn: `[data-style="orrery"]` döljer knappkolumnen och
// systemhälsan via CSS, och den här enhancern bygger en egen scen — Portal som
// ett himlainstrument. De tre världarna ÄR app-länkarna — och navet i mitten
// är den fjärde: Syntes, hjärtat som pumpar information mellan världarna.
//
// Byggs vid stilbyte och rivs av cleanup (samma livscykel som singularitet/
// kvitto). Skiljer sig medvetet från `singularitet` genom radiell komposition
// (nav + koncentriska banor + reticle + siktlinjer), dämpad stjärnatlas-palett
// och Fraunces-serif — inte neonvirvlar i en kolumn.
//
// Alla klasser är prefixade `orr-` så inget krockar med skelettets/övriga
// stilars klasser (t.ex. singularitets `.dust`/`.stars`/`.void`).
// =============================================================================

import { apps } from './apps.js'

const nf = new Intl.NumberFormat('sv-SE')
const CX = 500, CY = 500, R_OUT = 440
const appById = Object.fromEntries(apps.map((a) => [a.id, a]))

// Per app: bana (vinkel från kl 12 medurs, radie i % av orrery-ytan), material-
// färg (dämpad atlas-ton), koordinat-etikett, väsen som spelas vid uppvakning
// och ett värde som räknas upp.
const WORLDS = [
  {
    id: 'signal', angle: 225, r: 38, hue: '#6FD8E3', coord: 'R .38 · θ 225°', tag: 'portfölj · +2,4 %',
    value: { to: 42318, prefix: '$', suffix: '' },
    essence: `
      <svg class="orr-spark" viewBox="0 0 100 32" preserveAspectRatio="none">
        <line class="orr-spark__grid" x1="0" y1="16" x2="100" y2="16" />
        <path class="orr-spark__fill" d="M2,24 C16,22 24,10 38,14 S66,4 80,10 96,3 98,6 L98,32 L2,32 Z" />
        <path class="orr-spark__ln" d="M2,24 C16,22 24,10 38,14 S66,4 80,10 96,3 98,6" />
        <circle class="orr-spark__pt" cx="98" cy="6" r="2.4" />
      </svg>`,
  },
  {
    id: 'todos', angle: 45, r: 25, hue: '#D9B36A', coord: 'R .25 · θ 045°', tag: 'uppgifter · idag',
    value: { to: 3, prefix: '', suffix: '/3 klart' },
    essence: `
      <span class="orr-checklist">
        ${['pull main', 'write tests', 'deploy'].map((t, i) => `
          <span class="orr-row" style="--i:${i}"><span class="orr-bx">[<b>x</b>]</span>${t}</span>`).join('')}
      </span>`,
  },
  {
    id: 'stronk', angle: 150, r: 32, hue: '#DE8A76', coord: 'R .32 · θ 150°', tag: 'set 3/3 · 12 reps',
    value: { to: 60, prefix: '', suffix: ' kg' },
    essence: `
      <span class="orr-barbell">
        <span class="orr-plate" style="--i:2;height:14px"></span>
        <span class="orr-plate" style="--i:1;height:20px"></span>
        <span class="orr-plate" style="--i:0;height:26px"></span>
        <span class="orr-bar"></span>
        <span class="orr-plate" style="--i:0;height:26px"></span>
        <span class="orr-plate" style="--i:1;height:20px"></span>
        <span class="orr-plate" style="--i:2;height:14px"></span>
      </span>`,
  },
]

function worldMarkup(w) {
  const rad = (w.angle - 90) * Math.PI / 180
  const x = (50 + w.r * Math.cos(rad)).toFixed(2)
  const y = (50 + w.r * Math.sin(rad)).toFixed(2)
  const app = appById[w.id] || { name: w.id, url: '#' }
  const v = w.value
  return `
    <a class="orr-world" href="${app.url}" data-app="${w.id}" data-hue="${w.hue}"
       style="--hue:${w.hue};--x:${x}%;--y:${y}%" aria-label="Öppna ${app.name}">
      <span class="orr-world__inner">
        <span class="orr-ring-spin" aria-hidden="true"></span>
        <span class="orr-wave" aria-hidden="true"></span>
        <span class="orr-orb" aria-hidden="true"></span>
        <span class="orr-essence" aria-hidden="true">
          ${w.essence}
          <span class="orr-value" data-to="${v.to}" data-prefix="${v.prefix}" data-suffix="${v.suffix}">${v.prefix}0${v.suffix}</span>
          <span class="orr-tag">${w.tag}</span>
        </span>
        <span class="orr-label">
          <span class="orr-name">${app.name}</span>
          <span class="orr-coord">${w.coord}</span>
        </span>
      </span>
    </a>`
}

export function orreryEnhancer() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = matchMedia('(pointer: fine)').matches
  const cleanups = []

  /* -------------------------------- Bygg scenen -------------------------------- */
  let ticks = ''
  for (let a = 0; a < 360; a += 15) {
    const rad = (a - 90) * Math.PI / 180
    const long = a % 45 === 0
    const r1 = R_OUT - (long ? 12 : 6)
    ticks += `<line class="orr-tick" x1="${(CX + r1 * Math.cos(rad)).toFixed(1)}" y1="${(CY + r1 * Math.sin(rad)).toFixed(1)}" x2="${(CX + R_OUT * Math.cos(rad)).toFixed(1)}" y2="${(CY + R_OUT * Math.sin(rad)).toFixed(1)}" opacity="${long ? 0.7 : 0.35}" />`
  }

  const scene = document.createElement('div')
  scene.className = 'orr-scene'
  scene.innerHTML = `
    <canvas class="orr-sky" aria-hidden="true"></canvas>
    <div class="orr-ghost" aria-hidden="true">PORTAL</div>
    <div class="orr-stage">
      <div class="orr-orrery">
        <svg class="orr-chart" viewBox="0 0 1000 1000" aria-hidden="true">
          <line class="orr-cross" x1="500" y1="60" x2="500" y2="940" />
          <line class="orr-cross" x1="60" y1="500" x2="940" y2="500" />
          <circle class="orr-ring orr-ring--faint" cx="500" cy="500" r="150" />
          <circle class="orr-ring" cx="500" cy="500" r="250" />
          <circle class="orr-ring" cx="500" cy="500" r="320" />
          <circle class="orr-ring" cx="500" cy="500" r="380" />
          <circle class="orr-ring orr-ring--faint" cx="500" cy="500" r="440" />
          ${WORLDS.map((w) => `<line class="orr-radial" id="orr-radial-${w.id}" x1="500" y1="500" x2="500" y2="500" stroke="${w.hue}" />`).join('')}
          <g class="orr-ticks">${ticks}</g>
        </svg>
        <a class="orr-core" href="${(appById.syntes || { url: '#' }).url}" data-app="syntes"
           aria-label="Öppna Syntes — navet">
          <span class="orr-core__label">Syntes</span>
        </a>
        ${WORLDS.map(worldMarkup).join('')}
      </div>
    </div>
    <div class="orr-status" aria-hidden="true"><span class="orr-status__dot"></span> SYSTEM NOMINELLT</div>`
  document.body.appendChild(scene)
  cleanups.push(() => scene.remove())

  const orrery = scene.querySelector('.orr-orrery')

  // Rita radiella siktlinjer från navet ut till varje värld (tänds vid hover).
  WORLDS.forEach((w) => {
    const rad = (w.angle - 90) * Math.PI / 180
    const R = w.r * 10 // % → viewBox-enheter
    const line = scene.querySelector('#orr-radial-' + w.id)
    if (line) {
      line.setAttribute('x2', (CX + R * Math.cos(rad)).toFixed(1))
      line.setAttribute('y2', (CY + R * Math.sin(rad)).toFixed(1))
    }
  })

  // Navet (Syntes) vaknar: siktlinjerna tänds OCH de tre världarna matar in stoft i
  // hjärtat längs banorna — Syntes tar emot, syntetiserar och pumpar vidare.
  const core = scene.querySelector('.orr-core')
  const radials = WORLDS.map((w) => scene.querySelector('#orr-radial-' + w.id)).filter(Boolean)
  const worldOrbs = [...scene.querySelectorAll('.orr-world')].map((w) => ({ orb: w.querySelector('.orr-orb'), hue: w.dataset.hue }))
  let coreActive = false
  const coreCenter = { x: 0, y: 0 }
  const coreWake = () => {
    radials.forEach((l) => { l.style.opacity = '.6' })
    scene.classList.add('orr-nav-awake')
    coreActive = true
  }
  const coreSleep = () => {
    radials.forEach((l) => { l.style.opacity = '0' })
    scene.classList.remove('orr-nav-awake')
    coreActive = false
  }
  core.addEventListener('pointerenter', coreWake)
  core.addEventListener('focus', coreWake)
  core.addEventListener('pointerleave', coreSleep)
  core.addEventListener('blur', coreSleep)
  cleanups.push(() => {
    core.removeEventListener('pointerenter', coreWake)
    core.removeEventListener('focus', coreWake)
    core.removeEventListener('pointerleave', coreSleep)
    core.removeEventListener('blur', coreSleep)
  })

  // Kretsande stoft per bana: en box lika stor som banans diameter, prick i topp.
  if (!reduce) {
    ;[[50, 40], [64, 60], [76, 30]].forEach(([diaPct, dur]) => {
      const d = document.createElement('span')
      d.className = 'orr-dust'
      d.style.width = d.style.height = diaPct + '%'
      d.animate(
        [{ transform: 'translate(-50%, -50%) rotate(0deg)' }, { transform: 'translate(-50%, -50%) rotate(360deg)' }],
        { duration: dur * 1000, iterations: Infinity, easing: 'linear' },
      )
      orrery.appendChild(d)
    })
  }

  /* ----------------------- Värde-uppräkning vid uppvakning ---------------------- */
  const countUp = (el) => {
    const to = parseFloat(el.dataset.to)
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || ''
    if (reduce) { el.textContent = pre + nf.format(to) + suf; return }
    cancelAnimationFrame(el._raf)
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 1000)
      el.textContent = pre + nf.format(Math.round(to * (1 - Math.pow(1 - t, 3)))) + suf
      if (t < 1) el._raf = requestAnimationFrame(step)
    }
    el._raf = requestAnimationFrame(step)
  }
  const resetCount = (el) => {
    cancelAnimationFrame(el._raf)
    el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '')
  }

  /* -------- Uppvakning: räknare + siktlinje + partikelmål + 3D-lutning --------- */
  let activeTarget = null // { el, x, y, hue }
  scene.querySelectorAll('.orr-world').forEach((w) => {
    const val = w.querySelector('.orr-value')
    const inner = w.querySelector('.orr-world__inner')
    const orb = w.querySelector('.orr-orb')
    const line = scene.querySelector('#orr-radial-' + w.dataset.app)

    const wake = () => {
      if (val) countUp(val)
      if (line) line.style.opacity = '.6'
      const r = orb.getBoundingClientRect()
      activeTarget = { el: w, x: r.left + r.width / 2, y: r.top + r.height / 2, hue: w.dataset.hue }
    }
    const sleep = () => {
      if (val) resetCount(val)
      if (line) line.style.opacity = '0'
      if (activeTarget && activeTarget.el === w) activeTarget = null
      inner.style.setProperty('--rx', '0deg')
      inner.style.setProperty('--ry', '0deg')
    }
    w.addEventListener('pointerenter', wake)
    w.addEventListener('focus', wake)
    w.addEventListener('pointerleave', sleep)
    w.addEventListener('blur', sleep)
    cleanups.push(() => {
      w.removeEventListener('pointerenter', wake)
      w.removeEventListener('focus', wake)
      w.removeEventListener('pointerleave', sleep)
      w.removeEventListener('blur', sleep)
    })

    if (!reduce && fine) {
      const move = (e) => {
        const r = w.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height
        inner.style.setProperty('--ry', (dx * 14).toFixed(2) + 'deg')
        inner.style.setProperty('--rx', (-dy * 14).toFixed(2) + 'deg')
        if (activeTarget && activeTarget.el === w) {
          const o = orb.getBoundingClientRect()
          activeTarget.x = o.left + o.width / 2
          activeTarget.y = o.top + o.height / 2
        }
      }
      w.addEventListener('pointermove', move)
      cleanups.push(() => w.removeEventListener('pointermove', move))
    }
  })

  /* --------------------- Stjärnhimmel + parallax + partiklar -------------------- */
  const canvas = scene.querySelector('.orr-sky')
  const ctx = canvas.getContext('2d')
  const stageEl = scene.querySelector('.orr-stage')
  const ghostEl = scene.querySelector('.orr-ghost')
  let W = 0, H = 0, DPR = 1
  const layers = []
  let streams = []

  const buildStars = () => {
    layers.length = 0
    ;[
      { n: Math.round(W * H / 9000), depth: 0.10, size: [0.4, 1.0], alpha: [0.20, 0.5] },
      { n: Math.round(W * H / 16000), depth: 0.26, size: [0.7, 1.7], alpha: [0.35, 0.8] },
    ].forEach((d) => {
      const stars = []
      for (let i = 0; i < d.n; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: d.size[0] + Math.random() * (d.size[1] - d.size[0]),
          a: d.alpha[0] + Math.random() * (d.alpha[1] - d.alpha[0]),
          tw: Math.random() * Math.PI * 2, ts: 0.6 + Math.random() * 1.4,
        })
      }
      layers.push({ depth: d.depth, stars })
    })
  }
  const resize = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1)
    W = innerWidth
    H = innerHeight
    canvas.width = W * DPR; canvas.height = H * DPR
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    buildStars()
  }

  const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
  const onPointer = (e) => { ptr.tx = e.clientX / innerWidth; ptr.ty = e.clientY / innerHeight }
  addEventListener('pointermove', onPointer, { passive: true })
  addEventListener('resize', resize)
  cleanups.push(() => removeEventListener('pointermove', onPointer))
  cleanups.push(() => removeEventListener('resize', resize))

  const spawnStream = () => {
    if (!activeTarget || reduce) return
    const ang = Math.random() * Math.PI * 2
    const dist = 90 + Math.random() * 120
    streams.push({
      x: activeTarget.x + Math.cos(ang) * dist, y: activeTarget.y + Math.sin(ang) * dist,
      tx: activeTarget.x, ty: activeTarget.y, life: 1, hue: activeTarget.hue,
      v: 0.02 + Math.random() * 0.03,
    })
    if (streams.length > 140) streams.shift()
  }

  // Navet vaket: de tre världarna matar in stoft i hjärtat, längs banorna.
  const spawnFeed = () => {
    if (reduce || !coreActive || !worldOrbs.length) return
    const wo = worldOrbs[(Math.random() * worldOrbs.length) | 0]
    if (!wo.orb) return
    const r = wo.orb.getBoundingClientRect()
    streams.push({
      x: r.left + r.width / 2 + (Math.random() * 14 - 7),
      y: r.top + r.height / 2 + (Math.random() * 14 - 7),
      tx: coreCenter.x, ty: coreCenter.y, life: 1, hue: wo.hue,
      v: 0.015 + Math.random() * 0.02,
    })
    if (streams.length > 200) streams.shift()
  }

  let running = true
  let last = performance.now()
  const loop = (now = performance.now()) => {
    if (!running) return
    requestAnimationFrame(loop)
    const dt = Math.min(50, now - last); last = now
    const f = dt / 16.7

    ptr.x += (ptr.tx - ptr.x) * 0.06
    ptr.y += (ptr.ty - ptr.y) * 0.06
    const ox = ptr.x - 0.5, oy = ptr.y - 0.5

    if (!reduce) {
      stageEl.style.transform = `translate(${(-ox * 26).toFixed(1)}px, ${(-oy * 20).toFixed(1)}px)`
      ghostEl.style.transform = `translate(${(-ox * 12).toFixed(1)}px, ${(-oy * 10).toFixed(1)}px)`
    }

    ctx.clearRect(0, 0, W, H)
    const tsec = now / 1000
    for (const layer of layers) {
      const px = -ox * W * layer.depth, py = -oy * H * layer.depth
      for (const s of layer.stars) {
        const tw = reduce ? 1 : 0.7 + 0.3 * Math.sin(tsec * s.ts + s.tw)
        ctx.globalAlpha = s.a * tw
        ctx.beginPath()
        ctx.arc(s.x + px, s.y + py, s.r, 0, Math.PI * 2)
        ctx.fillStyle = '#dfe6f2'
        ctx.fill()
      }
    }

    if (activeTarget) { spawnStream(); spawnStream() }
    if (coreActive) {
      const cr = core.getBoundingClientRect()
      coreCenter.x = cr.left + cr.width / 2
      coreCenter.y = cr.top + cr.height / 2
      spawnFeed(); spawnFeed(); spawnFeed()
    }
    ctx.globalCompositeOperation = 'lighter'
    for (let i = streams.length - 1; i >= 0; i--) {
      const p = streams[i]
      p.x += (p.tx - p.x) * p.v * f * 4
      p.y += (p.ty - p.y) * p.v * f * 4
      p.life -= 0.012 * f
      if (p.life <= 0 || Math.hypot(p.tx - p.x, p.ty - p.y) < 6) { streams.splice(i, 1); continue }
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life)) * 0.8
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fillStyle = p.hue
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }

  const onVisibility = () => { running = !document.hidden; if (running) { last = performance.now(); loop() } }
  document.addEventListener('visibilitychange', onVisibility)
  cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility))
  cleanups.push(() => { running = false })

  resize()
  loop()

  // Cleanup körs vid stilbyte: stoppar loopen, tar bort lyssnare och river scenen.
  return () => cleanups.forEach((fn) => fn())
}
