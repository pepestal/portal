import './terminal.css'
import { makeCountEnhancer } from '../shared.js'

const CANDLES = [[42, 'up'], [58, 'down'], [36, 'up'], [64, 'up'], [50, 'down'], [72, 'up'], [56, 'down'], [82, 'up'], [68, 'up']]
const TASKS = ['pull main', 'write tests', 'deploy']

export default {
  id: 'terminal',
  label: 'Terminal Modernism',
  anim: {
  syntes: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--pipe">
      <span class="ln" style="--i:0">signal ─┐</span>
      <span class="ln" style="--i:1">todos  ─┼─▶ <b>syntes</b></span>
      <span class="ln" style="--i:2">stronk ─┘</span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--candles">
      ${CANDLES.map(([h, d], i) => `<span class="candle candle--${d}" style="--h:${h}%;--i:${i}"></span>`).join('')}
    </div>
  </div>`,
  todos: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--tasks">
      ${TASKS.map((t, i) => `
        <span class="task" style="--i:${i}">
          <span class="box"><span class="box-o">[ ]</span><span class="box-x">[x]</span></span>${t}
        </span>`).join('')}
    </div>
  </div>`,
  stronk: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--load">
      <span class="reps">SET 3/3 · <b class="count" data-to="12" data-suffix=" reps">0 reps</b></span>
      <span class="loadbar">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
    </div>
  </div>`,
  },
  enhancer: makeCountEnhancer('terminal'),
}
