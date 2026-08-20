import './terminal.css'
import { makeCountEnhancer } from '../shared.js'

const CANDLES = [[42, 'up'], [58, 'down'], [36, 'up'], [64, 'up'], [50, 'down'], [72, 'up'], [56, 'down'], [82, 'up'], [68, 'up']]
const TASKS = ['pull main', 'write tests', 'deploy']
const SCALE = ['c', 'd', 'e', 'f', 'g', 'a', 'h', 'c']
const UNITS = [['api', 'ok'], ['db', 'ok'], ['disk', '61%']]

export default {
  id: 'terminal',
  label: 'Terminal Modernism',
  anim: {
  syntes: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--curl">
      <span class="ln" style="--i:0">$ curl -sI syntes.dev</span>
      <span class="ln" style="--i:1">HTTP/2 <b>404</b></span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--candles">
      ${CANDLES.map(([h, d], i) => `<span class="candle candle--${d}" style="--h:${h}%;--i:${i}"></span>`).join('')}
    </div>
  </div>`,
  ethos: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--tasks">
      ${TASKS.map((t, i) => `
        <span class="task" style="--i:${i}">
          <span class="box"><span class="box-o">[ ]</span><span class="box-x">[x]</span></span>${t}
        </span>`).join('')}
    </div>
  </div>`,
  hexis: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--load">
      <span class="reps">SET 3/3 · <b class="count" data-to="12" data-suffix=" reps">0 reps</b></span>
      <span class="loadbar">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
    </div>
  </div>`,
  scales: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--scale">
      <span class="degrees">${SCALE.map((n, i) => `<i style="--i:${i}">${n}</i>`).join('')}</span>
      <span class="tempo">♩=<b class="count" data-to="72">0</b></span>
    </div>
  </div>`,
  sersys: `
  <div class="av" data-for="terminal" aria-hidden="true">
    <div class="viz viz--health">
      ${UNITS.map(([u, v], i) => `
        <span class="unit" style="--i:${i}"><i class="dot"></i>${u}<b>${v}</b></span>`).join('')}
    </div>
  </div>`,
  },
  enhancer: makeCountEnhancer('terminal'),
}
