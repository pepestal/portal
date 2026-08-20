import './bank.css'
import { makeCountEnhancer } from '../shared.js'

export default {
  id: 'bank',
  label: 'Private Bank',
  anim: {
  syntes: `
  <div class="av" data-for="bank" aria-hidden="true">
    <div class="viz viz--alloc">
      <div class="bar">
        <span class="seg" style="--i:0;--w:38%"></span>
        <span class="seg" style="--i:1;--w:34%"></span>
        <span class="seg" style="--i:2;--w:28%"></span>
      </div>
      <span class="val count" data-to="100" data-suffix=" % samlat">0 % samlat</span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="bank" aria-hidden="true">
    <div class="viz viz--area">
      <div class="area-clip">
        <svg viewBox="0 0 200 56" preserveAspectRatio="none">
          <defs><linearGradient id="grad-signal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="var(--app-accent)" stop-opacity=".30" />
            <stop offset="1" stop-color="var(--app-accent)" stop-opacity="0" />
          </linearGradient></defs>
          <path class="area" d="M0,44 C28,42 40,22 62,26 S110,10 132,20 170,6 200,13 L200,56 L0,56 Z" fill="url(#grad-signal)" />
          <path class="curve" d="M0,44 C28,42 40,22 62,26 S110,10 132,20 170,6 200,13" />
        </svg>
      </div>
      <span class="val count" data-to="42318" data-prefix="$">$0</span>
    </div>
  </div>`,
  ethos: `
  <div class="av" data-for="bank" aria-hidden="true">
    <div class="viz viz--ring">
      <svg viewBox="0 0 44 44">
        <circle class="rt" cx="22" cy="22" r="18" />
        <circle class="rp" cx="22" cy="22" r="18" />
        <path class="rc" d="M14,22.5 l5,5 L30,15" />
      </svg>
    </div>
  </div>`,
  hexis: `
  <div class="av" data-for="bank" aria-hidden="true">
    <div class="viz viz--plates">
      <div class="rack">
        <span class="rod"></span>
        <span class="plate" style="--i:2;--h:58%"></span>
        <span class="plate" style="--i:1;--h:82%"></span>
        <span class="plate" style="--i:0;--h:100%"></span>
        <span class="plate" style="--i:0;--h:100%"></span>
        <span class="plate" style="--i:1;--h:82%"></span>
        <span class="plate" style="--i:2;--h:58%"></span>
      </div>
      <span class="val count" data-to="60" data-suffix=" kg">0 kg</span>
    </div>
  </div>`,
  },
  enhancer: makeCountEnhancer('bank'),
}
