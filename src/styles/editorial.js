import './editorial.css'

export default {
  id: 'editorial',
  label: 'Editorial Light',
  anim: {
  syntes: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--venn">
      <svg viewBox="0 0 84 56" preserveAspectRatio="xMidYMid meet">
        <circle class="vc vc1" cx="32" cy="22" r="15" />
        <circle class="vc vc2" cx="52" cy="22" r="15" />
        <circle class="vc vc3" cx="42" cy="37" r="15" />
        <circle class="vd" cx="42" cy="27" r="2.6" />
      </svg>
      <span class="fig">= syntes</span>
    </div>
  </div>`,
  signal: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--line">
      <svg viewBox="0 0 200 56" preserveAspectRatio="xMidYMid meet">
        <path class="ln" d="M2,44 C28,42 40,22 62,26 S110,10 132,20 170,6 198,13" />
        <circle class="pt" cx="198" cy="13" r="3" />
      </svg>
      <span class="fig">+2,4 %</span>
    </div>
  </div>`,
  todos: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--check">
      <svg class="mk" viewBox="0 0 24 24"><path class="tick" d="M4,12.5 l5,5 L20,5" /></svg>
      <span class="ecl">Uträttat<i class="strike"></i></span>
    </div>
  </div>`,
  stronk: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--tally">
      <svg viewBox="0 0 76 44">
        <path class="t t1" d="M12,7 V33" /><path class="t t2" d="M22,7 V33" />
        <path class="t t3" d="M32,7 V33" /><path class="t t4" d="M42,7 V33" />
        <path class="t tc" d="M7,31 L48,9" />
        <text class="tnum" x="58" y="27">5</text>
      </svg>
    </div>
  </div>`,
  },
}
