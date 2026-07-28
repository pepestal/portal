import './tryckark.css'
import { makeCountEnhancer, nf } from '../shared.js'
import stats from '../data/stats.json'

/* Tryckarkets grammatik. Ett fyrfärgstryck har fyra plåtar, och en av dem heter
   nyckelplåten: K i CMYK står inte för "black" utan för KEY. Det är den plåt som
   bär bilden — konturen, detaljen, all text — medan de tre andra bara bär färg.
   Ta bort en av de tre och arket blir felfärgat; ta bort nyckeln och det blir
   oläsbart.

   Hierarkin ligger i två mätvärden och båda är nyckelns.

   1. RASTERVINKELN. Varje plåt har sin egen vinkel, och alla tre är satta MOT
      nyckelns 45°: C ligger 45−30, M ligger 45+30, Y ligger 45−45. Den gula
      får det trånga läget (bara 15° från cyan) eftersom den är den svagaste
      färgen och ändå inte syns. Ingen av de tre vinklarna betyder något utan
      referensbenet, och referensbenet är nyckelns.
   2. PASSNINGEN. En plåt som ligger snett syns som en färgad dubbelkontur.
      Nyckeln kan per definition inte ligga snett — det är den de andra ställs
      in efter — så de tre vandrar (pappret sträcker sig i pressen) medan
      nyckeln står absolut still. Det är sidans enda rörelse i vila.

   Rastercellen är arkets enda längdenhet: 150 linjer/tum betraktat i lupp ×14
   ger 96 dpi ÷ 150 × 14 ≈ 9 px per cell. Samma tal står i CSS (`--tr-cell`), och
   passningsfelen nedan är bråkdelar av just den cellen — de går att räkna i
   punkter på skärmen. */
const TR_CELL = 9
const TR_LPI = 150
const TR_LUPP = 14

/* Plåtarna: id, bokstav, rastervinkel (grader moturs från vågrätt),
   fullton-densitet och passningsfel i rasterceller. Enda källan — enhancern
   skriver ut dem som CSS-variabler på raden, så rastret i knappen, dubbel-
   konturen och passkorsen på arket räknar alla i samma tal. */
const TR_PLAT = [
  ['syntes', 'K', 45, 1.80, 0, 0],
  ['signal', 'C', 15, 1.40, 0.42, -0.26],
  ['todos', 'Y', 0, 1.00, -0.48, 0.32],
  ['stronk', 'M', 75, 1.45, 0.32, 0.44],
]
const TR_FARG = { K: 'var(--tr-k)', C: 'var(--tr-c)', Y: 'var(--tr-y)', M: 'var(--tr-m)' }
const trKomma = (v, d = 2) => v.toFixed(d).replace('.', ',')
/* Rastervinkeln räknas moturs från vågrätt, SVG:s y-axel pekar nedåt. */
const trRikt = (grad, r) => [+(Math.cos(grad * Math.PI / 180) * r).toFixed(2),
  +(-Math.sin(grad * Math.PI / 180) * r).toFixed(2)]

/* Ett raster: celler i userSpace, vridna till plåtens vinkel, med punktarea =
   tonvärdet. r = cell·√(ton/100/π) är precis den punkt en tryckare mäter, så
   50 %-fältet täcker halva cellen. Vid fullton finns inget raster kvar — då är
   plåten öppen och färgen ligger heltäckande. */
function trRaster(id, farg, vinkel, ton, cell = TR_CELL) {
  const punkt = ton >= 100
    ? `<rect width="${cell}" height="${cell}" style="fill:${farg}" />`
    : `<circle cx="${cell / 2}" cy="${cell / 2}" r="${+(cell * Math.sqrt(ton / 100 / Math.PI)).toFixed(2)}"
         style="fill:${farg}" />`
  return `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"
      patternTransform="rotate(${-vinkel})">${punkt}</pattern>`
}

/* Passkorset: ring, kärna och fyra armar. Samma figur i knappen som på arket —
   det är tryckeriets enda mätdon och det mäter bara en sak: avvikelse från
   nyckeln. */
function trKors(cx, cy, r, extra = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" /><circle cx="${cx}" cy="${cy}" r="${+(r * .42).toFixed(2)}" />
    <line x1="${cx - r * 1.7}" y1="${cy}" x2="${cx + r * 1.7}" y2="${cy}" />
    <line x1="${cx}" y1="${cy - r * 1.7}" x2="${cx}" y2="${cy + r * 1.7}" />${extra}`
}

/* Tryckarket: sidan är ett ark på väg genom en fyrfärgspress. Pappret och dess
   eget 45°-raster ligger i CSS; arkets marginal — skärmärken, passkorsen på
   plåtarnas rader, vinkelmätarna och färgkontrollremsan — mäts fram i DOM:en
   här och rivs vid stilbyte. Skelettets markup rörs inte.

   Arkets koordinatsystem har sitt origo i NAVETS rad: den lodräta passaxeln går
   genom knappkolumnens mitt och den vågräta ligger på nyckelplåtens rad. De tre
   underapparnas passkors sitter bredvid axeln, var och en med sitt eget
   passningsfel, och vandrar — nyckelns står still på korsningen. Hovras navet
   dras alla tre in i pass. */
function tryckarkEnhancer() {
  const cleanups = []
  const ark = document.createElement('div')
  ark.className = 'tr-ark'
  ark.setAttribute('aria-hidden', 'true')
  ark.innerHTML = `
    <svg class="tr-plan" xmlns="http://www.w3.org/2000/svg"></svg>
    <i class="tr-slug">
      <b class="tr-slug__k">4/0 · OFFSET</b>
      <b>${TR_LPI} L/TUM · LUPP ×${TR_LUPP}</b>
      <b>${TR_PLAT.map(([, b, v]) => `${b} ${v}°`).join('  ')}</b>
      <b>UPPLAGA ${nf.format(stats.ecosystem.lines)}</b>
    </i>`
  document.body.prepend(ark)
  cleanups.push(() => ark.remove())

  /* Plåtdata → CSS-variabler på raden. Rastret i knappen, dubbelkonturen på
     namnet och driften läser dem härifrån, så TR_PLAT förblir enda källan. */
  const satta = []
  for (const [id, b, vinkel, , dx, dy] of TR_PLAT) {
    const rad = document.querySelector(`.app-row[data-app="${id}"]`)
    if (!rad) continue
    rad.style.setProperty('--tr-plat', TR_FARG[b])
    rad.style.setProperty('--tr-vrid', `${-vinkel}deg`)
    rad.style.setProperty('--tr-dx', `${(dx * TR_CELL).toFixed(2)}px`)
    rad.style.setProperty('--tr-dy', `${(dy * TR_CELL).toFixed(2)}px`)
    satta.push(rad)
  }
  cleanups.push(() => satta.forEach((rad) => {
    for (const p of ['--tr-plat', '--tr-vrid', '--tr-dx', '--tr-dy']) rad.style.removeProperty(p)
  }))

  const plan = ark.querySelector('.tr-plan')
  const place = () => {
    const rader = TR_PLAT.map(([id]) => document.querySelector(`.app-row[data-app="${id}"]`))
    const btnar = rader.map((r) => r?.querySelector('.app-btn'))
    if (btnar.some((b) => !b)) return
    const g = btnar.map((b) => b.getBoundingClientRect())
    const rad0 = rader[0].getBoundingClientRect()
    const W = innerWidth, H = innerHeight
    const bas = g.map((r) => Math.round(r.top + r.height / 2))
    const M = Math.round(Math.max(14, Math.min(46, W * .028)))
    /* Bild och marginal. Instrumenten bor i marginalen — passkorsen till höger,
       vinkelmätarna till vänster — precis som på ett riktigt ark, där allt som
       mäter ligger utanför det som trycks. Ryms de inte får arket klara sig
       utan dem; dubbelkonturen på knapparna bär då påståendet ensam. */
    const plats = Math.min(rad0.left, W - rad0.right) > 92
    const kx = Math.round(rad0.right + 44)
    const gx = Math.round(rad0.left) - 44

    const defs = TR_PLAT.flatMap(([, b, v]) => [
      trRaster(`tr-f-${b}`, TR_FARG[b], v, 100),
      trRaster(`tr-h-${b}`, TR_FARG[b], v, 50),
    ]).join('')

    /* Skärmärken: arkets fyra hörn, alltid utanför bilden. */
    const skar = [[M, M, 1, 1], [W - M, M, -1, 1], [M, H - M, 1, -1], [W - M, H - M, -1, -1]]
      .map(([x, y, sx, sy]) => `<path class="tr-skar" d="M${x - sx * 16},${y} H${x - sx * 4}
        M${x},${y - sy * 16} V${y - sy * 4}" />`).join('')

    /* Passaxlarna: den lodräta bär plåtarnas passkors, den vågräta ligger på
       nyckelplåtens rad. Korsningen är arkets nollpunkt, och den ligger på
       navets höjd — inte i mitten av sidan. */
    const axlar = !plats ? '' : `
      <line class="tr-axel" x1="${kx}" y1="${bas[0] - 54}" x2="${kx}" y2="${bas[3] + 54}" />
      <line class="tr-axel tr-axel--nav" x1="${M + 22}" y1="${bas[0]}" x2="${W - M - 22}" y2="${bas[0]}" />`

    /* Passkorsen. Nyckelns är stort, helt, och sitter på korsningen. De tre
       andra får ett blekt riktkors PÅ axeln — dit de ska — och sitt eget kors
       bredvid, förskjutet med plåtens passningsfel. Avståndet däremellan är
       hela poängen och behöver ingen siffra. */
    const korsen = !plats ? '' : TR_PLAT.map(([id, b, , , dx, dy], i) => {
      if (!i) return `<g class="tr-kors tr-kors--nav">${trKors(kx, bas[0], 14,
        `<line x1="${kx - 26}" y1="${bas[0] - 26}" x2="${kx - 17}" y2="${bas[0] - 17}" />
         <line x1="${kx + 26}" y1="${bas[0] + 26}" x2="${kx + 17}" y2="${bas[0] + 17}" />`)}</g>`
      /* Riktkorset är streckat och större: det är läget plåten SKA ha. Plåtens
         eget kors sitter inuti det, bredvid mitten — och vandrar. */
      return `<g class="tr-mal">${trKors(kx, bas[i], 12)}</g>
        <g class="tr-kors tr-kors--plat" data-app="${id}"
           style="--dx:${(dx * TR_CELL).toFixed(2)}px;--dy:${(dy * TR_CELL).toFixed(2)}px;stroke:${TR_FARG[b]}">
          ${trKors(kx, bas[i], 8)}</g>`
    }).join('')

    /* Vinkelmätarna i vänstermarginalen. Nyckeln får ett enda ben — den ÄR
       referensen. De tre får två: sitt eget och nyckelns 45°, plus bågen
       däremellan. Tre mätare med samma referensben, en utan. */
    const matare = !plats ? '' : TR_PLAT.map(([id, b, v], i) => {
      const r = 15, [ex, ey] = trRikt(v, r), [rx, ry] = trRikt(45, r)
      const bage = i ? `<path class="tr-bage" d="M${(gx + rx).toFixed(2)},${(bas[i] + ry).toFixed(2)}
        A${r},${r} 0 0 ${v > 45 ? 0 : 1} ${(gx + ex).toFixed(2)},${(bas[i] + ey).toFixed(2)}" />` : ''
      const ref = i ? `<line class="tr-ref" x1="${(gx - rx).toFixed(2)}" y1="${(bas[i] - ry).toFixed(2)}"
        x2="${(gx + rx).toFixed(2)}" y2="${(bas[i] + ry).toFixed(2)}" />` : ''
      return `<g class="tr-matare" data-app="${id}">
        <circle class="tr-matare__ring" cx="${gx}" cy="${bas[i]}" r="${r}" />
        ${ref}${bage}
        <line class="tr-ben" style="stroke:${TR_FARG[b]}"
          x1="${(gx - ex).toFixed(2)}" y1="${(bas[i] - ey).toFixed(2)}"
          x2="${(gx + ex).toFixed(2)}" y2="${(bas[i] + ey).toFixed(2)}" />
        <circle class="tr-punkt" cx="${gx}" cy="${bas[i]}" r="1.6" style="fill:${TR_FARG[b]}" />
        <text class="tr-vlbl" x="${gx}" y="${bas[i] + r + 12}">${b} ${v}°</text>
      </g>`
    }).join('')

    /* Färgkontrollremsan längs arkets bakkant: fullton och 50 % per plåt, och
       ett passkors mellan varje grupp. Fälten är tre rasterceller breda, så
       punkterna går att räkna — det är samma cell som ligger i pappret. */
    const rY = H - M - 30, rH = 16, pB = TR_CELL * 3, sp = 4, kB = 22
    const grupp = TR_PLAT.flatMap(([, b]) => [[b, 'f'], [b, 'h']])
    const gB = grupp.length * (pB + sp) + kB + sp
    const rBredd = W - 2 * (M + 22)
    const antal = Math.max(1, Math.floor(rBredd / gB))
    const remsa = []
    for (let n = 0, x0 = Math.round((W - antal * gB) / 2); n < antal; n++) {
      let px = x0 + n * gB
      for (const [b, sort] of grupp) {
        remsa.push(`<rect x="${px}" y="${rY}" width="${pB}" height="${rH}" fill="url(#tr-${sort}-${b})" />
          <rect class="tr-falt__ram" x="${px}" y="${rY}" width="${pB}" height="${rH}" />`)
        px += pB + sp
      }
      remsa.push(`<g class="tr-kors tr-kors--remsa">${trKors(px + kB / 2, rY + rH / 2, 5)}</g>`)
    }

    plan.setAttribute('viewBox', `0 0 ${W} ${H}`)
    plan.innerHTML = `<defs>${defs}</defs>${skar}${axlar}${korsen}${matare}${remsa.join('')}`
  }
  place()
  addEventListener('resize', place)
  cleanups.push(() => removeEventListener('resize', place))

  cleanups.push(makeCountEnhancer('tryckark')())
  return () => cleanups.forEach((fn) => fn())
}

export default {
  id: 'tryckark',
  label: 'Tryckarket',
  anim: {
  /* tryckark · passningen: de fyra passkorsen, ett per plåt. Tre av dem ligger
     snett; det fjärde — nyckelns — ligger där det ligger, för det är nollan.
     På hover dras de tre in på nyckelns kors och lupen till höger går från
     moiré till rosett: fyra raster i rätt inbördes vinkel ger ett mönster som
     ingen av dem innehåller. Det är hela fyrfärgstrycket i en cirkel. */
  syntes: (() => {
  const cx = 56, cy = 22, lx = 162, ly = 22, lr = 19, cell = 5.6
  /* Plåtarna ritas i tryckordning med nyckeln SIST — den ligger överst på arket,
     och i pass är det dess kors man ser. Multiplikation, inte täckning: fyra
     genomskinliga färgskikt på vitt papper. */
  const ordning = [...TR_PLAT].reverse()
  const off = (dx, dy) => `--dx:${(dx * TR_CELL * .9).toFixed(2)}px;--dy:${(dy * TR_CELL * .9).toFixed(2)}px`
  return `
  <div class="av" data-for="tryckark" aria-hidden="true">
    <div class="viz viz--pass">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <defs>
          ${TR_PLAT.map(([, b, v]) => trRaster(`tk-s-${b}`, TR_FARG[b], v, b === 'K' ? 20 : 38, cell)).join('')}
          <clipPath id="tk-s-lupp"><circle cx="${lx}" cy="${ly}" r="${lr}" /></clipPath>
        </defs>
        ${ordning.map(([, b, , , dx, dy]) => `<g class="kors" style="${off(dx, dy)};stroke:${TR_FARG[b]}">
          ${trKors(cx, cy, b === 'K' ? 12 : 10)}</g>`).join('')}
        <g clip-path="url(#tk-s-lupp)">
          ${ordning.map(([, b, , , dx, dy]) => `<g class="lager" style="${off(dx, dy)}">
            <rect x="${lx - 26}" y="${ly - 26}" width="52" height="52" fill="url(#tk-s-${b})" /></g>`).join('')}
        </g>
        <circle class="luppring" cx="${lx}" cy="${ly}" r="${lr}" />
        <line class="skaft" x1="${lx + 13.4}" y1="${ly + 13.4}" x2="${lx + 21}" y2="${ly + 21}" />
      </svg>
      <span class="cap">I PASS · <b class="count" data-to="4" data-suffix=" PLÅTAR">0 PLÅTAR</b></span>
    </div>
  </div>`
})(),
  /* tryckark · vinkeln: cyan ligger 30° från nyckeln, och de 30 graderna är inte
     en preferens utan gränsen — under dem slår rastren mot varandra och det blir
     moiré. Lupen börjar därför i nyckelns eget läge (45°, där moirén står som
     värst) och vrids ned till 15°; gradskivan till höger mäter vridningen med
     nyckelns 45° som fast ben. */
  signal: (() => {
  /* Fin cell: rosetten vid 30° ska hamna under ögats upplösning och läsas som
     jämn ton, medan den lilla vinkelskillnaden i viloläget slår ut i breda
     moirébälten. Det är hela skälet till att 30° är gränsen. */
  const cell = 3.2, vx = 15, vy = 41, x0 = 5, x1 = 211, yT = 4
  const [kx, ky] = trRikt(45, 42), [ex, ey] = trRikt(15, 124)   // siktlinjernas längder
  const r = 30, [ax, ay] = trRikt(45, r), [bx, by] = trRikt(15, r)
  return `
  <div class="av" data-for="tryckark" aria-hidden="true">
    <div class="viz viz--vinkel">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <defs>
          ${trRaster('tk-c-k', TR_FARG.K, 45, 14, cell)}
          ${trRaster('tk-c-c', TR_FARG.C, 15, 30, cell)}
          <clipPath id="tk-c-falt"><rect x="${x0}" y="${yT}" width="${x1 - x0}" height="${vy - yT}" /></clipPath>
        </defs>
        <g clip-path="url(#tk-c-falt)">
          <rect class="papper" x="${x0}" y="${yT}" width="${x1 - x0}" height="${vy - yT}" />
          <rect x="${x0}" y="${yT}" width="${x1 - x0}" height="${vy - yT}" fill="url(#tk-c-k)" />
          <g class="vrid" style="transform-origin:${vx}px ${vy}px">
            <rect x="-60" y="-60" width="340" height="180" fill="url(#tk-c-c)" />
          </g>
        </g>
        <rect class="ram" x="${x0}" y="${yT}" width="${x1 - x0}" height="${vy - yT}" />
        <line class="ref" x1="${vx}" y1="${vy}" x2="${(vx + kx).toFixed(2)}" y2="${(vy + ky).toFixed(2)}" />
        <text class="klbl" x="${(vx + kx + 4).toFixed(2)}" y="${(vy + ky + 1).toFixed(2)}">45°</text>
        <path class="bage" d="M${(vx + ax).toFixed(2)},${(vy + ay).toFixed(2)}
          A${r},${r} 0 0 1 ${(vx + bx).toFixed(2)},${(vy + by).toFixed(2)}" pathLength="100" />
        <g class="vrid" clip-path="url(#tk-c-falt)" style="transform-origin:${vx}px ${vy}px">
          <line class="ben" x1="${vx}" y1="${vy}" x2="${(vx + ex).toFixed(2)}" y2="${(vy + ey).toFixed(2)}" />
          <text class="elbl" x="${(vx + ex + 4).toFixed(2)}" y="${(vy + ey + 3.5).toFixed(2)}">15°</text>
        </g>
        <circle class="spets" cx="${vx}" cy="${vy}" r="1.6" />
      </svg>
      <span class="cap">RASTER 15° · Δ<b class="count" data-to="30" data-suffix="°">0°</b></span>
    </div>
  </div>`
})(),
  /* tryckark · tonstegen: gult är den svagaste färgen på arket, så dess enda
     mätbara egenskap är hur mycket av cellen punkten täcker. Kilen skrivs ut
     steg för steg — 10, 25, 40, 50, 75, 100 — och vid 50 % sätts måttet: punkten
     trycks större än den är på plåten. Nominellt värde står i nyckelns svarta
     skala under kilen; det uppmätta är gult. */
  todos: (() => {
  /* Kilen skrivs med de nominella tonvärdena — utom 50 %-fältet, som trycks som
     det faktiskt blir: punkten breder ut sig i pappret och täcker 58 %. Fältet
     är alltså mörkare än sin egen siffra, och det syns bredvid grannarna. */
  const toner = [10, 25, 40, 50, 75, 100], MATT = 3, GAIN = 58
  const b = 27, sp = 4, x0 = 17, y0 = 3, h = 25
  return `
  <div class="av" data-for="tryckark" aria-hidden="true">
    <div class="viz viz--ton">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <defs>${toner.map((t, i) => trRaster(`tk-t-${t}`, TR_FARG.Y, 0, i === MATT ? GAIN : t, 5)).join('')}</defs>
        ${toner.map((t, i) => {
          const x = x0 + i * (b + sp), matt = i === MATT
          return `<g class="steg" style="--i:${i}">
            <rect class="ton" x="${x}" y="${y0}" width="${b}" height="${h}" fill="url(#tk-t-${t})" />
            <rect class="ram${matt ? ' ram--matt' : ''}" x="${x}" y="${y0}" width="${b}" height="${h}" />
            <text class="nom${matt ? ' nom--matt' : ''}" x="${x + b / 2}" y="${y0 + h + 8}">${matt ? `${t}→${GAIN}` : t}</text>
          </g>`
        }).join('')}
      </svg>
      <span class="cap">TON 50 % → <b class="count" data-to="${GAIN}" data-suffix=" %">0 %</b></span>
    </div>
  </div>`
})(),
  /* tryckark · fullton: magenta är den enda av de tre som verkligen tar i —
     rastret körs upp till 100 % och färgskiktet mäts med densitometer. Men
     skalan är inte dess egen: nyckelns fullton står inristad vid 1,80 och är
     alltid högst på arket. Nålen går till 1,45 och stannar där. */
  stronk: (() => {
  const D_M = 1.45, D_K = 1.80
  const px = 10, py = 5, pb = 56, ph = 28, x0 = 86, x1 = 204, y = 27
  const dPos = (d) => +(x0 + (x1 - x0) * d / 2).toFixed(2)
  return `
  <div class="av" data-for="tryckark" aria-hidden="true">
    <div class="viz viz--fullton">
      <svg viewBox="0 0 216 46" preserveAspectRatio="xMidYMid meet">
        <defs>
          ${trRaster('tk-m-40', TR_FARG.M, 75, 40, 5)}
          ${trRaster('tk-m-100', TR_FARG.M, 75, 100, 5)}
        </defs>
        <rect class="falt falt--40" x="${px}" y="${py}" width="${pb}" height="${ph}" fill="url(#tk-m-40)" />
        <rect class="falt falt--100" x="${px}" y="${py}" width="${pb}" height="${ph}" fill="url(#tk-m-100)" />
        <rect class="ram" x="${px}" y="${py}" width="${pb}" height="${ph}" />
        <g class="skala">
          <line class="axel" x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" />
          ${[0, .5, 1, 1.5, 2].map((d) => `<line class="tick" x1="${dPos(d)}" y1="${y}" x2="${dPos(d)}" y2="${y + 4}" />`).join('')}
          <text class="dlbl" x="${x0}" y="${y + 11}">0</text>
          <text class="dlbl" x="${x1}" y="${y + 11}">D 2,0</text>
          <g class="knyckel">
            <path d="M${dPos(D_K)},${y - 1.5} l-3,-5.5 h6 z" />
            <text x="${dPos(D_K) + 5}" y="${y - 2.5}">K ${trKomma(D_K)}</text>
          </g>
          <g class="nal">
            <line x1="${dPos(D_M)}" y1="${y}" x2="${dPos(D_M)}" y2="${y - 15}" />
            <text x="${dPos(D_M)}" y="${y - 17.5}">${trKomma(D_M)}</text>
          </g>
        </g>
      </svg>
      <span class="cap">FULLTON <b class="count" data-to="100" data-suffix=" %">0 %</b> · D 1,45</span>
    </div>
  </div>`
})(),
  },
  enhancer: tryckarkEnhancer,
}
