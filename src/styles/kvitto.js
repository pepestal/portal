import './kvitto.css'

/* Kvittot: huvud och fot skrivs ut runt varuraderna (injiceras, städas vid
   stilbyte). Klockan på kvittot går i realtid; streckkoden är deterministiskt
   "slumpad" — ett kvitto ändrar sig inte mellan utskrifter. */
function kvittoEnhancer() {
  const rows = document.querySelector('.rows')

  const head = document.createElement('div')
  head.className = 'kv kv-head'
  head.innerHTML = `
    <span class="kv-shop">Portal &amp; Söner</span>
    <span class="kv-dim">— LÄNKHANDEL SEDAN 1994 —</span>
    <span class="kv-dim">Org.nr 556677-8899 · Kassa 03 · Kassör 07</span>
    <span class="kv-dim kv-dt"></span>
    <span class="kv-rule" aria-hidden="true"></span>
    <span class="kv-cols" aria-hidden="true"><i>ARTIKEL</i><i>À-PRIS</i></span>`

  const foot = document.createElement('div')
  foot.className = 'kv kv-foot'
  foot.innerHTML = `
    <span class="kv-rule" aria-hidden="true"></span>
    <span class="kv-row kv-strong"><i>SUMMA</i><i>0:00</i></span>
    <span class="kv-row kv-dim"><i>Varav moms 25 %</i><i>0:00</i></span>
    <span class="kv-row kv-strong"><i>ATT BETALA</i><i>0:00</i></span>
    <span class="kv-row kv-dim"><i>Betalsätt</i><i>KORT</i></span>
    <span class="kv-rule" aria-hidden="true"></span>
    <span class="kv-barcode" aria-hidden="true"></span>
    <span class="kv-dim">7 350094 219942</span>
    <span class="kv-thanks">TACK FÖR DITT BESÖK<br>VÄLKOMMEN ÅTER</span>
    <span class="kv-dim">Öppet köp 30 dagar mot kvitto.</span>
    <span class="kv-tear" aria-hidden="true">✂ · — · — · RIV HÄR · — · — · ✂</span>`

  const bc = foot.querySelector('.kv-barcode')
  let seed = 19940123
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647
  for (let i = 0; i < 42; i++) {
    const bar = document.createElement('i')
    bar.style.width = 1 + Math.floor(rnd() * 3) + 'px'
    bar.style.marginRight = 1 + Math.floor(rnd() * 3) + 'px'
    if (i === 0 || i === 20 || i === 41) bar.style.height = '112%'
    bc.appendChild(bar)
  }

  rows.prepend(head)
  rows.append(foot)

  const dt = head.querySelector('.kv-dt')
  const tick = () => {
    dt.textContent = new Date().toLocaleString('sv-SE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }
  tick()
  const timer = setInterval(tick, 30000)

  return () => {
    clearInterval(timer)
    head.remove()
    foot.remove()
  }
}

export default {
  id: 'kvitto',
  label: 'Kvittot',
  anim: {
  syntes: `
  <div class="av" data-for="kvitto" aria-hidden="true">
    <div class="viz viz--encircle">
      <svg viewBox="0 0 200 40" preserveAspectRatio="none">
        <ellipse class="ink" cx="100" cy="20" rx="95" ry="15" pathLength="100" />
      </svg>
    </div>
  </div>`,
  },
  enhancer: kvittoEnhancer,
}
