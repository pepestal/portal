// Det lilla en stilmodul får dela med de andra: sifferformat, rörelse-etik och
// den gemensamma uppräknaren. Allt annat ska bo i stilens egen fil — se
// docs/PROMPT_TAVLING.md.

export const nf = new Intl.NumberFormat('sv-SE')
export const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Räknar upp ett tal när knappen hovras/fokuseras. Elementet bär målet i
   `data-to` och valfri `data-prefix`/`data-suffix`. */
export function countUp(elem) {
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
export function resetCount(elem) {
  cancelAnimationFrame(elem._raf)
  elem.textContent = (elem.dataset.prefix || '') + '0' + (elem.dataset.suffix || '')
}

/* Enhancer som bara kopplar hover/fokus → uppräkning. Stilar som inte behöver
   något annat sätter `enhancer: makeCountEnhancer('<id>')` och är klara; stilar
   med egen enhancer anropar den och lägger resultatet i sin cleanup-lista.
   Sedan bara den aktiva stilens markup renderas hittar den ändå rätt element. */
export function makeCountEnhancer(styleId) {
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
