import './vaxel.css'
import { makeCountEnhancer } from '../shared.js'

export default {
  id: 'vaxel',
  label: 'Växeln',
  anim: {
  syntes: `
  <div class="av" data-for="vaxel" aria-hidden="true">
    <div class="viz viz--patch">
      <span class="board">
        <span class="jack" style="--i:0;--c:#C4574A"><i class="cord"></i></span>
        <span class="jack" style="--i:1;--c:#86A268"><i class="cord"></i></span>
        <span class="jack" style="--i:2;--c:#CB7C43"><i class="cord"></i></span>
      </span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="vaxel" aria-hidden="true">
    <div class="viz viz--morse">
      <span class="tape">
        <i class="m m--d" style="--i:0"></i><i class="m m--p" style="--i:1"></i><i class="m m--d" style="--i:2"></i><i class="g"></i><i class="m m--d" style="--i:3"></i><i class="m m--d" style="--i:4"></i><i class="m m--d" style="--i:5"></i><i class="m m--p" style="--i:6"></i><i class="g"></i><i class="m m--p" style="--i:7"></i><i class="m m--d" style="--i:8"></i><i class="m m--d" style="--i:9"></i><i class="m m--p" style="--i:10"></i>
      </span>
      <span class="read"><b>KÖP</b></span>
    </div>
  </div>`,
  todos: `
  <div class="av" data-for="vaxel" aria-hidden="true">
    <div class="viz viz--exped">
      ${[['ankn. 101 söker', 0], ['ankn. 303 söker', 1], ['rikssamtal i kö', 2]].map(([t, i]) => `
        <span class="q" style="--i:${i}"><i class="lamp"></i><span class="lbl"><span class="who">${t}</span><span class="done">— expedierad</span></span></span>`).join('')}
    </div>
  </div>`,
  stronk: `
  <div class="av" data-for="vaxel" aria-hidden="true">
    <div class="viz viz--vev">
      <span class="rig">
        <span class="gauge">
          <svg viewBox="0 0 60 36" aria-hidden="true">
            <path class="arc" d="M6,30 A24,24 0 0 1 54,30" />
            <path class="arc2" d="M6,30 A24,24 0 0 1 54,30" pathLength="100" />
            <line class="needle" x1="30" y1="30" x2="30" y2="9" />
          </svg>
        </span>
        <span class="crank"><i class="arm"></i></span>
      </span>
      <span class="cap"><b class="count" data-to="24" data-suffix=" vev">0 vev</b></span>
    </div>
  </div>`,
  },
  enhancer: makeCountEnhancer('vaxel'),
}
