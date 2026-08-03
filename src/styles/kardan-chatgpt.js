import './kardan-chatgpt.css'
import { makeCountEnhancer } from '../shared.js'

/* Kardanen: Syntes är huvudaxeln. De tre underapparna kan ha olika utväxling,
   men deras kuggar griper i samma, stilla referensaxel. I vila syns den genom
   hela stapeln som en genomgående axel; navets lager är ensamt dubbelt och
   dess kilspår är nolläget som de tre markeringarna räknas från. */
const viz = (inner) => `
  <div class="av" data-for="kardan-chatgpt" aria-hidden="true">
    <div class="viz">${inner}</div>
  </div>`

export default {
  id: 'kardan-chatgpt',
  label: 'Kardanen · chatgpt',
  anim: {
    syntes: viz(`
      <div class="viz--regulator">
        <svg viewBox="0 0 216 52" preserveAspectRatio="xMidYMid meet">
          <path class="shaft" d="M108 4V48" />
          <circle class="hub" cx="108" cy="27" r="8" />
          <g class="arms"><path d="M104 23L68 8M112 23L148 8" /><circle cx="65" cy="7" r="7" /><circle cx="151" cy="7" r="7" /></g>
          <path class="belt b1" d="M16 45C49 20 68 38 100 29" /><path class="belt b2" d="M200 45C167 20 148 38 116 29" />
          <path class="belt b3" d="M108 49C108 39 108 37 108 35" />
        </svg>
        <span class="cap">REGULATOR · <b class="count" data-to="3" data-suffix=" DRIFTER">0 DRIFTER</b></span>
      </div>`),
    signal: viz(`
      <div class="viz--escapement">
        <svg viewBox="0 0 216 52" preserveAspectRatio="xMidYMid meet">
          <circle class="wheel" cx="108" cy="27" r="17" />
          ${Array.from({ length: 12 }, (_, i) => `<line class="tooth" style="--i:${i}" x1="108" y1="8" x2="108" y2="4" />`).join('')}
          <path class="pallet" d="M66 15L97 28L66 39" /><circle class="pivot" cx="66" cy="27" r="3" />
          <path class="trace" d="M133 27H199" />
        </svg>
        <span class="cap">12 TÄNDER · <b class="count" data-to="6" data-suffix=" HZ">0 HZ</b></span>
      </div>`),
    todos: viz(`
      <div class="viz--geneva">
        <svg viewBox="0 0 216 52" preserveAspectRatio="xMidYMid meet">
          <circle class="drive" cx="72" cy="27" r="12" /><circle class="pin" cx="72" cy="15" r="2.8" />
          <circle class="star" cx="142" cy="27" r="19" />
          ${[0, 90, 180, 270].map((d) => `<path class="slot" style="--d:${d}" d="M142 10V22" />`).join('')}
          <path class="guide" d="M84 27H123" />
        </svg>
        <span class="cap">INDEX <b class="count" data-to="4" data-prefix="0/" >0/4</b></span>
      </div>`),
    stronk: viz(`
      <div class="viz--winch">
        <svg viewBox="0 0 216 52" preserveAspectRatio="xMidYMid meet">
          <circle class="drum" cx="76" cy="27" r="17" /><circle class="core" cx="76" cy="27" r="5" />
          <path class="rope" d="M93 27H162V10" /><path class="hook" d="M154 10q8 0 8 8q0 8-8 8q-6 0-6-5" />
          <rect class="load" x="143" y="29" width="38" height="15" rx="2" />
          <path class="marks" d="M68 19L84 35M68 35L84 19" />
        </svg>
        <span class="cap">VRIDMOMENT · <b class="count" data-to="480" data-suffix=" NM">0 NM</b></span>
      </div>`),
  },
  enhancer: makeCountEnhancer('kardan-chatgpt'),
}
