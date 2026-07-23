import './style.css'
import { apps } from './apps.js'
import { styles, DEFAULT_STYLE } from './styles.js'
import stats from './data/stats.json'

const nf = new Intl.NumberFormat('sv-SE')

/* =========================================================================
   Hover-animationer — helt unika per (app × stil).
   Varje app renderar tre varianter (terminal/editorial/bank); CSS visar bara
   den aktiva stilens. Formen skiljer sig, inte bara färgen.
   ========================================================================= */

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
}

/* --- Todos --- */
const TASKS = ['pull main', 'write tests', 'deploy']
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
}

/* --- Stronk --- */
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
}

const ANIM = { signal: SIGNAL, todos: TODOS, stronk: STRONK }
const animVariants = (app) => {
  const set = ANIM[app.id]
  return set ? `${set.terminal}${set.editorial}${set.bank}` : ''
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
const enhancers = { terminal: makeCountEnhancer('terminal'), bank: makeCountEnhancer('bank') }
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
  const locked = localStorage.getItem(LS_LOCK)
  if (locked && ids.includes(locked)) return locked
  const last = localStorage.getItem(LS_LAST)
  const pool = ids.length > 1 ? ids.filter((id) => id !== last) : ids
  return pool[Math.floor(Math.random() * pool.length)]
}

applyStyle(pickInitial())
reflectLock()

document.querySelector('.style-switch').addEventListener('click', (e) => {
  const act = e.target.closest('[data-act]')?.dataset.act
  if (!act) return
  const cur = ids.indexOf(document.documentElement.dataset.style)
  if (act === 'next') applyStyle(ids[(cur + 1) % ids.length])
  else if (act === 'prev') applyStyle(ids[(cur - 1 + ids.length) % ids.length])
  else if (act === 'lock') {
    const isLocked = localStorage.getItem(LS_LOCK) === document.documentElement.dataset.style
    if (isLocked) localStorage.removeItem(LS_LOCK)
    else localStorage.setItem(LS_LOCK, document.documentElement.dataset.style)
  }
  reflectLock()
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
