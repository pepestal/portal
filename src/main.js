import './style.css'
import { apps } from './apps.js'
import { styles, DEFAULT_STYLE } from './styles.js'
import stats from './data/stats.json'

const nf = new Intl.NumberFormat('sv-SE')
const el = (html) => {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild
}

/* ---------- Hover-animationer per apptyp (stilarna dresserar dem i CSS) ---------- */
const ANIM = {
  graph: `
    <svg class="anim anim--graph" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <path class="anim--graph__area" d="M0,46 L25,34 L50,40 L75,22 L100,29 L125,12 L150,21 L175,6 L200,15 L200,60 L0,60 Z"/>
      <path class="anim--graph__line" d="M0,46 L25,34 L50,40 L75,22 L100,29 L125,12 L150,21 L175,6 L200,15"/>
    </svg>`,
  progress: `
    <div class="anim anim--progress" aria-hidden="true">
      <span class="anim--progress__c">0/3</span>
      <div class="anim--progress__track"><div class="anim--progress__fill"></div></div>
      <span class="anim--progress__c anim--progress__c--to">3/3</span>
    </div>`,
  reps: `
    <div class="anim anim--reps" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span>
    </div>`,
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
      <a class="app-btn" href="${app.url}">
        <span class="app-btn__name">${app.name}</span>
        <span class="app-btn__anim">${ANIM[app.anim] || ''}</span>
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

/* ============================ Stilrotation ============================ */
const LS_LOCK = 'portal.lockedStyle'
const LS_LAST = 'portal.lastStyle'
const nameEl = document.getElementById('style-name')
const lockBtn = document.querySelector('[data-act="lock"]')
const ids = styles.map((s) => s.id)

function applyStyle(id) {
  if (!ids.includes(id)) id = DEFAULT_STYLE
  document.documentElement.dataset.style = id
  nameEl.textContent = styles.find((s) => s.id === id).label
  localStorage.setItem(LS_LAST, id)
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
  // Slumpa — undvik samma som förra besöket när det går.
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

/* ============================ Stäng vid klick utanför ============================ */
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
