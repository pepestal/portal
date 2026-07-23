# Changelog

Alla meningsfulla ändringar i Portal noteras här. Nyast överst. Format enligt
[Keep a Changelog](https://keepachangelog.com/sv/); rader skrivs i imperativ.

## [Ej släppt]

### Tillagt
- Initial dokumentationsstruktur enligt gemensam standard (`README.md`, `CLAUDE.md`, `docs/`).
- Stil-system: tre estetiker (`terminal`, `editorial`, `bank`) med egen palett, typografi
  och animationsuttryck, drivet av `src/styles.js` + `[data-style]` i `src/style.css`.
- Slumpad stilrotation vid varje besök, med switcher och lås (localStorage) i topbaren.
- Stora app-knappar med per-app hover-animationer (graf/progress/reps), app-registret i `src/apps.js`.
- Info-panel per app och systemhälsa som läser byggtidsgenererad projektdata.
- Byggtidsgenerator `scripts/generate-stats.mjs` → `src/data/stats.json` (filer, rader,
  språk, stack per grann-repo); körs via `predev`/`prebuild`.

### Ändrat
- Projektnamn `landing-page` → `portal` i `package.json`; `<title>` → `Portal`.
- `index.html`: `lang="sv"`, `color-scheme`, typsnitt via `<link>`/`preconnect` (inte CSS-`@import`).
- CLAUDE.md: dokumenterat undantag för byggtidsläsning av grann-repona (ej runtime-koppling).

### Fixat
- Info-paneler droppar under knappen (centrerat) i stället för fasta pixel-offset som
  hamnade utanför skärmen på smala vyer.
- Ersatt de self-running animationerna (blinkande prick, darrande telemetri) med rörelse
  som bara svarar på hover; `prefers-reduced-motion` respekteras.

### Borttaget
- Simulerad sci-fi-telemetri (CORE TEMP/CPU/MEMORY) — ersatt av ärlig ekosystem-statistik.
