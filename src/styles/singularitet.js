import './singularitet.css'
import { prefersReduced } from '../shared.js'

/* Stjärnstoft som sugs in i porten (singularitet). Slumpas per sidladdning. */
const dust = () => `<span class="dust" aria-hidden="true">${Array.from({ length: 12 }, () =>
  `<i style="--ang:${(Math.random() * 360) | 0}deg;--dist:${(70 + Math.random() * 50) | 0}px;--dur:${(1.2 + Math.random() * 1.1).toFixed(2)}s;--del:${(Math.random() * 2).toFixed(2)}s"></i>`).join('')}</span>`

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
  liveNumber('hexis', () => { repsEl.textContent = prefersReduced ? 12 : ++reps }, 1000)

  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'singularitet',
  label: 'Singularitet',
  anim: {
  syntes: `
  <div class="av" data-for="singularitet" aria-hidden="true">
    <div class="viz viz--nexus">
      <span class="field">
        <i class="mote" style="--a:10deg;--c:#4ADE9C;--d:0s"></i>
        <i class="mote" style="--a:130deg;--c:#F5C56B;--d:.5s"></i>
        <i class="mote" style="--a:250deg;--c:#F97B76;--d:1s"></i>
        <span class="core"></span>
      </span>
    </div>
    ${dust()}
  </div>`,
  signal: `
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
  ethos: `
  <div class="av" data-for="singularitet" aria-hidden="true">
    <div class="viz viz--selfcheck">
      ${[['pull main', '.05'], ['write tests', '.4'], ['deploy', '.75']].map(([t, d]) => `
        <span class="task" style="--t:${d}s"><span class="box"></span><span class="txt">${t}</span></span>`).join('')}
    </div>
    ${dust()}
  </div>`,
  hexis: `
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
  },
  enhancer: singularitetEnhancer,
}
