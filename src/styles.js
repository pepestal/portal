// Stilregistret. En stil = en modul i `src/styles/` + en rad här.
//
// Varje modul default-exporterar `{ id, label, anim, enhancer? }`:
//   id        — matchar `data-style` på <html> och filnamnen (.js + .css)
//   label     — namnet i stilväxlaren
//   anim      — hover-markup per app: { syntes, signal, todos, stronk }.
//               Bara den aktiva stilens markup renderas; main.js byter ut den
//               vid stilbyte, så en ny stil kostar ingenting i DOM:en.
//   enhancer  — valfri. Körs efter att markupen satts, returnerar en cleanup
//               som körs vid nästa stilbyte. Behöver stilen bara uppräkning
//               räcker `makeCountEnhancer('<id>')` ur `src/shared.js`.
//   fullscene — bara `orrery`: stilen ersätter skelettet i stället för att
//               klä om det. Förankrat undantag, se CLAUDE.md och STATUS.md.
//   chaos     — valfri. Markerar bidraget som KAOSKLASS (docs/PROMPT_CHAOS.md):
//               stilen ingår inte i den vanliga rotationen utan visas bara när
//               kaos-togglen i topbaren är på. Kontraktet i övrigt är detsamma.
//               I kaosklassen är helscen (fullscene: true) normalfallet, inget
//               undantag. Klassiska bidrag sätter ALDRIG denna flagga.
//
// Modulen importerar själv sin CSS (`import './<id>.css'`), så registret är det
// enda stället som behöver röras när ett nytt bidrag läggs till.
import terminal from './styles/terminal.js'
import editorial from './styles/editorial.js'
import bank from './styles/bank.js'
import singularitet from './styles/singularitet.js'
import kvitto from './styles/kvitto.js'
import orrery from './styles/orrery.js'
import vaxel from './styles/vaxel.js'
import jacquard from './styles/jacquard.js'
import sprangskiss from './styles/sprangskiss.js'
import synop from './styles/synop.js'
import bikupa from './styles/bikupa.js'
import fuga from './styles/fuga.js'
import sinus from './styles/sinus.js'
import tryckark from './styles/tryckark.js'
import alv from './styles/alv.js'
import tunnelbana from './styles/tunnelbana.js'

export const styles = [
  terminal, editorial, bank, singularitet, kvitto, orrery, vaxel,
  jacquard, sprangskiss, synop, bikupa, fuga, sinus, tryckark, alv, tunnelbana,
]

export const byId = Object.fromEntries(styles.map((s) => [s.id, s]))
export const DEFAULT_STYLE = 'terminal'
