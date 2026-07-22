# Status — Portal

> 🚧 **Status:** fungerande prototyp — statisk landningssida med Signal- och Todo-knappar; app-länkar ännu inte inkopplade.

Ingången för den som ska **ta vid**: var vi står, vad nästa steg är, och vilka
beslut/förutsättningar som gäller just nu.

## Var vi står

- Vite-projekt (tidigare `landing-page`) som renderar en enda sida via `src/main.js`.
- Två app-kort finns: **SIGNAL** (grafanimation) och **TODO** (progress-animation),
  var med info-panel.
- Hopfällbar system-health-widget med simulerade drift-värden.
- Knapparna (`#signal-btn`, `#todo-btn`) pekar ännu på `#` — ingen riktig navigering.

## Nästa konkreta steg

1. Koppla app-knapparna till apparnas riktiga URL:er.
2. Byt projektnamnet `landing-page` → `portal` i `package.json` och `<title>` i `index.html`.

## Öppna beslut

- Ska system-health visa riktiga värden (kräver en källa/endpoint) eller förbli dekorativ?
- Fler appar på sidan (t.ex. Stronk) när de blir publika?

## Förutsättningar (infra, nycklar, miljö)

- Ingen — statisk frontend, inga hemligheter, ingen `.env`.
