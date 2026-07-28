import './style.css'
import { apps } from './apps.js'
import { styles, byId, DEFAULT_STYLE } from './styles.js'
import { nf } from './shared.js'
import stats from './data/stats.json'

/* Skelettet: knapprad per app, info-paneler och systemhälsa. Allt som är
   stilberoende — palett, typografi, hover-animationer, enhancers — bor i
   `src/styles/<id>.{js,css}` och plockas in via registret i `styles.js`.
   Den här filen vet ingenting om enskilda stilar. */

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
/* Animationslagret lämnas TOMT här och fylls av `mountAnim` vid stilbyte. Förr
   renderades alla stilars varianter i varje knapp och CSS visade en av dem —
   med tretton stilar blev det 45 dolda block i DOM:en, och kostnaden växte med
   varje nytt bidrag. Nu ligger bara den aktiva stilens markup inne. */
function appRow(app) {
  return `
    <div class="app-row" data-app="${app.id}">
      <a class="app-btn" href="${app.url}" data-name="${app.id}">
        <span class="app-btn__fx" aria-hidden="true"></span>
        <span class="app-btn__anim"></span>
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
      <button class="style-switch__chaos" data-act="chaos" aria-pressed="false"
              aria-label="Växla kaosläge">Kaos</button>
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
const LS_MODE = 'portal.mode'
const nameEl = document.getElementById('style-name')
const lockBtn = document.querySelector('[data-act="lock"]')
const chaosBtn = document.querySelector('[data-act="chaos"]')

/* Två klasser i rotationen: klassiska stilar och kaosbidrag (`chaos: true` i
   modulen, se docs/PROMPT_CHAOS.md). Poolerna delar register men blandas aldrig —
   kaos-poolen visas bara när togglen i topbaren är på. */
const pools = {
  normal: styles.filter((s) => !s.chaos).map((s) => s.id),
  chaos: styles.filter((s) => s.chaos).map((s) => s.id),
}
const modeOf = (id) => (byId[id]?.chaos ? 'chaos' : 'normal')
if (!pools.chaos.length) {
  chaosBtn.disabled = true
  chaosBtn.title = 'Inga kaosbidrag ännu'
}
const animSlots = [...document.querySelectorAll('.app-row')].map((row) => [
  row.dataset.app, row.querySelector('.app-btn__anim'),
])

/* Byter ut hover-markupen i alla fyra knappar. En stil som saknar variant för en
   app (eller är en helscen) får ett tomt lager — det är giltigt. */
function mountAnim(style) {
  for (const [appId, slot] of animSlots) slot.innerHTML = style.anim?.[appId] || ''
}

let cleanupEnhancer = null

function applyStyle(id) {
  if (!byId[id]) id = DEFAULT_STYLE
  const style = byId[id]
  // Städa FÖRE markupbytet: enhancern kan hålla element som nu försvinner.
  if (cleanupEnhancer) { cleanupEnhancer(); cleanupEnhancer = null }
  document.documentElement.dataset.style = id
  document.documentElement.dataset.mode = modeOf(id)
  nameEl.textContent = style.label
  localStorage.setItem(LS_LAST, id)
  localStorage.setItem(LS_MODE, modeOf(id))
  mountAnim(style)
  cleanupEnhancer = style.enhancer ? style.enhancer() : null
  reflectChaos()
}

function reflectChaos() {
  const on = document.documentElement.dataset.mode === 'chaos'
  chaosBtn.setAttribute('aria-pressed', String(on))
  chaosBtn.classList.toggle('is-on', on)
}

function reflectLock() {
  const locked = localStorage.getItem(LS_LOCK)
  const active = locked && locked === document.documentElement.dataset.style
  lockBtn.setAttribute('aria-pressed', String(!!active))
  lockBtn.textContent = active ? 'Låst' : 'Lås'
  lockBtn.classList.toggle('is-locked', !!active)
}

/* `?style=` och låset pekar på en stil oavsett klass — läget följer stilen.
   Utan dem slumpas ur den pool som var aktiv sist (kaos kräver att poolen finns). */
function pickInitial() {
  const wanted = new URLSearchParams(location.search).get('style')
  if (wanted && byId[wanted]) return wanted
  const locked = localStorage.getItem(LS_LOCK)
  if (locked && byId[locked]) return locked
  const mode = localStorage.getItem(LS_MODE) === 'chaos' && pools.chaos.length ? 'chaos' : 'normal'
  const ids = pools[mode]
  const last = localStorage.getItem(LS_LAST)
  const pool = ids.length > 1 ? ids.filter((id) => id !== last) : ids
  return pool[Math.floor(Math.random() * pool.length)]
}

applyStyle(pickInitial())
reflectLock()

/* Bläddra n steg i den aktiva poolens rotation (wrap:ar åt båda håll). */
function stepStyle(delta) {
  const cur = document.documentElement.dataset.style
  const pool = pools[modeOf(cur)]
  const i = pool.indexOf(cur)
  applyStyle(pool[(i + delta + pool.length) % pool.length])
  reflectLock()
}

document.querySelector('.style-switch').addEventListener('click', (e) => {
  const act = e.target.closest('[data-act]')?.dataset.act
  if (!act) return
  if (act === 'next') stepStyle(1)
  else if (act === 'prev') stepStyle(-1)
  else if (act === 'chaos') {
    const next = modeOf(document.documentElement.dataset.style) === 'chaos' ? 'normal' : 'chaos'
    if (!pools[next].length) return
    const pool = pools[next]
    applyStyle(pool[Math.floor(Math.random() * pool.length)])
    reflectLock()
  }
  else if (act === 'lock') {
    const isLocked = localStorage.getItem(LS_LOCK) === document.documentElement.dataset.style
    if (isLocked) localStorage.removeItem(LS_LOCK)
    else localStorage.setItem(LS_LOCK, document.documentElement.dataset.style)
    reflectLock()
  }
})

/* Piltangenter ←/→ bläddrar stil (som prev/next). Hoppar över om fokus ligger
   i ett textfält, så vanlig markörnavigation inte kapas. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const t = e.target
  if (t.isContentEditable || t.matches?.('input, textarea, select')) return
  e.preventDefault()
  stepStyle(e.key === 'ArrowRight' ? 1 : -1)
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
