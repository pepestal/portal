#!/usr/bin/env node
/**
 * Textransonering — byggkontroll.
 *
 * Portalens stilar ska VISA sitt koncept, inte skriva ut det. Efter tretton
 * bidrag var den vanligaste kvalitetsbristen densamma: en bildtext under knappen
 * som förklarar att navet är navet ("DUX · HÄRIFRÅN HÄMTAR DE TRE SIN TONFÖLJD"),
 * och hover-texter som argumenterar för stilen i stället för att mäta något
 * ("— MEN TAKTEN ÄR NODENS"). Regeln står i docs/PROMPT_TAVLING.md; det här
 * skriptet ger den tänder.
 *
 * Kontrollerar bara SYNLIG text — `content:`-värden på knappen i style.css och
 * hover-texternas .cap/.read/.fig i main.js/orrery.js. Kodkommentarer får och
 * ska fortsätta förklara konceptet; det är på skärmen det inte hör hemma.
 *
 * Körs via `npm run check:copy` och automatiskt i `prebuild`.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Knappetiketten är ett mätvärde. Längre än så är det en mening. */
const MAX_LABEL = 30
/** Hover-texten får bära en term och en siffra, inget mer. */
const MAX_CAP = 40
/** Fler ord än så är prosa oavsett teckenlängd. */
const MAX_ORD = 5

/**
 * Formuleringar som i praktiken alltid betyder "jag ersatte en bild med en
 * bildtext". Träffar bara synlig text, inte kommentarer.
 */
const FORBJUDNA = [
  [/härifrån/i, 'säger vad bilden ska visa'],
  [/här blir\b/i, 'säger vad bilden ska visa'],
  [/utgår (från|ur)\b/i, 'förklarar relationen till navet'],
  [/hämtar/i, 'förklarar relationen till navet'],
  [/får sin\b/i, 'förklarar relationen till navet'],
  [/\s[—–]\s*(men|aldrig|alltid)\b/i, 'moralkaka efter tankstreck'],
  [/(syns|går) (aldrig|inte)\b/i, 'stilen argumenterar för sig själv'],
  [/avbildbar/i, 'stilen förklarar sitt eget grepp'],
]

const fel = []
const anmark = (fil, text, varfor) => fel.push({ fil, text, varfor })

/** Gemensam granskning av en enskild synlig sträng. */
function granska(fil, text, max, sort) {
  const t = text.trim()
  if (!t) return
  if (t.length > max) anmark(fil, t, `${sort} är ${t.length} tecken (max ${max})`)
  const ord = t.split(/\s+/).filter((w) => /\p{L}{2,}/u.test(w))
  if (ord.length > MAX_ORD) anmark(fil, t, `${sort} är ${ord.length} ord (max ${MAX_ORD})`)
  for (const [re, varfor] of FORBJUDNA) if (re.test(t)) anmark(fil, t, varfor)
}

/* --- Knappetiketter: content: på .app-btn::before/::after i style.css ---
   Bara knappen själv, inte `.app-btn__name::before` (kvittots varurad m.fl.). */
const css = readFileSync(join(ROOT, 'src', 'style.css'), 'utf8')
const REGEL = /\.app-btn(?!__)[^{;]*::(?:before|after)[^{]*\{([^}]*)\}/g
for (const [, block] of css.matchAll(REGEL)) {
  const m = block.match(/content:\s*"((?:[^"\\]|\\.)*)"/)
  if (!m) continue
  // CSS-escapes (\2002 m.fl.) räknas som ett tecken, inte som sin källkod
  const text = m[1].replace(/\\[0-9a-f]{1,6}\s?/gi, ' ')
  granska('src/style.css', text, MAX_LABEL, 'knappetikett')
}

/* --- Hover-texter: .cap/.read/.fig i knappvarianterna --- */
const CAP = /<span class="(?:cap|read|fig|note)"[^>]*>([\s\S]*?)<\/span>/g
for (const fil of ['src/main.js', 'src/orrery.js']) {
  const js = readFileSync(join(ROOT, fil), 'utf8')
  for (const [, inner] of js.matchAll(CAP)) {
    // strippa taggar och mallsträngar — kvar blir det användaren faktiskt läser
    const text = inner.replace(/<[^>]*>/g, '').replace(/\$\{[^}]*\}/g, '').replace(/\s+/g, ' ')
    granska(fil, text, MAX_CAP, 'hover-text')
  }
}

if (fel.length) {
  console.error(`\n  Textransoneringen failar på ${fel.length} ${fel.length === 1 ? 'sträng' : 'strängar'}:\n`)
  for (const { fil, text, varfor } of fel) {
    console.error(`  ${fil}\n    "${text}"\n    → ${varfor}\n`)
  }
  console.error('  Regeln: skriv inte det du kan visa. Se docs/PROMPT_TAVLING.md.\n')
  process.exit(1)
}
console.log('check-copy: alla synliga strängar inom ransonen.')
