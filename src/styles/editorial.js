import './editorial.css'

export default {
  id: 'editorial',
  label: 'Editorial Light',
  anim: {
  syntes: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--vakans">
      <svg viewBox="0 0 84 56" preserveAspectRatio="xMidYMid meet">
        <rect class="vr" x="6" y="6" width="72" height="44" rx="1" />
        <path class="vl vl1" d="M16,20 H68" /><path class="vl vl2" d="M16,28 H68" />
        <path class="vl vl3" d="M16,36 H52" />
      </svg>
      <span class="fig">404</span>
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
  ethos: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--check">
      <svg class="mk" viewBox="0 0 24 24"><path class="tick" d="M4,12.5 l5,5 L20,5" /></svg>
      <span class="ecl">Uträttat<i class="strike"></i></span>
    </div>
  </div>`,
  scales: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--notrad">
      <svg viewBox="0 0 132 46" preserveAspectRatio="xMidYMid meet">
        ${[0, 1, 2, 3, 4].map((i) => `<path class="sl" style="--i:${i}" d="M4,${11 + i * 6} H128" />`).join('')}
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<ellipse class="nt" style="--i:${i}" cx="${18 + i * 16}" cy="${40 - i * 4}" rx="3.6" ry="2.8" />`).join('')}
      </svg>
      <span class="fig">♩=72</span>
    </div>
  </div>`,
  sersys: `
  <div class="av" data-for="editorial" aria-hidden="true">
    <div class="viz viz--larm">
      <svg viewBox="0 0 120 46" preserveAspectRatio="xMidYMid meet">
        ${Array.from({ length: 14 }, (_, i) => `<path class="tk" style="--i:${i}" d="M${8 + i * 7},10 V26" />`).join('')}
        <circle class="sm" cx="56" cy="38" r="3.4" />
      </svg>
      <span class="fig">14 → 1</span>
    </div>
  </div>`,
  hexis: `
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
