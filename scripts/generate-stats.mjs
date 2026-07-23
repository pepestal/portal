#!/usr/bin/env node
/**
 * Build-time statsgenerator.
 *
 * Går igenom grann-repona i LOKALT-roten (../) och räknar filer, rader och
 * teknikstack per projekt, och skriver en statisk `src/data/stats.json` som
 * bundlas in i bygget. Ingen runtime-koppling till apparna sker — datan är
 * "live" i betydelsen *färsk vid varje bygge/deploy*. Se dokumenterat undantag
 * i CLAUDE.md.
 *
 * Robust mot saknade grann-repon: körs bygget på en maskin där en app inte finns
 * (t.ex. produktionsservern) behålls den appens tidigare värden från befintlig
 * stats.json, annars markeras den `available: false`.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, mkdirSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')          // portal/
const LOKALT = join(ROOT, '..')             // LOKALT/
const OUT = join(ROOT, 'src', 'data', 'stats.json')

/** Projekt att mäta. Signal aggregeras från sina två underrepon. */
const PROJECTS = [
  { id: 'signal', name: 'Signal', dirs: ['Signal/backend', 'Signal/signal_frontend'] },
  { id: 'todos',  name: 'Todos',  dirs: ['todos'] },
  { id: 'stronk', name: 'Stronk', dirs: ['stronk'] },
  { id: 'syntes', name: 'Syntes', dirs: ['syntes'] },
]

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'dist-ssr', '.next', 'build', 'out', 'coverage',
  '__pycache__', '.venv', 'venv', 'env', '.vite', '.cache', '.idea', '.vscode',
  '.pytest_cache', '.mypy_cache', '.ruff_cache', '.turbo', '.svelte-kit',
])
const IGNORE_FILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'])

/** ext -> läsbart språknamn. Endast dessa räknas radvis. */
const LANGS = {
  '.py': 'Python', '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript',
  '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript', '.vue': 'Vue',
  '.svelte': 'Svelte', '.css': 'CSS', '.scss': 'SCSS', '.html': 'HTML',
  '.sql': 'SQL', '.sh': 'Shell', '.md': 'Markdown', '.json': 'JSON',
  '.yml': 'YAML', '.yaml': 'YAML', '.toml': 'TOML',
}
const MAX_BYTES = 2 * 1024 * 1024

function walk(dir, acc) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue
      walk(join(dir, e.name), acc)
    } else if (e.isFile()) {
      if (IGNORE_FILES.has(e.name)) continue
      const full = join(dir, e.name)
      acc.files++
      const lang = LANGS[extname(e.name).toLowerCase()]
      if (!lang) continue
      try {
        if (statSync(full).size > MAX_BYTES) continue
        const lines = readFileSync(full, 'utf8').split('\n').length
        acc.lines += lines
        acc.byLang[lang] = (acc.byLang[lang] || 0) + lines
      } catch { /* binär/oläsbar — hoppa radräkning */ }
    }
  }
}

/** Samlar rot-dirs + deras direkta underkataloger (markörfiler bor ofta i backend/, web/, …). */
function stackScanDirs(absDirs) {
  const dirs = new Set(absDirs)
  for (const d of absDirs) {
    let entries
    try { entries = readdirSync(d, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      if (e.isDirectory() && !IGNORE_DIRS.has(e.name)) dirs.add(join(d, e.name))
    }
  }
  return [...dirs]
}

/** Snifar teknikstack ur markörfiler i projektets rot-dirs (och en nivå ner). */
function detectStack(absDirs) {
  const stack = new Set()
  const readIf = (p) => (existsSync(p) ? readFileSync(p, 'utf8').toLowerCase() : '')
  const add = (cond, label) => { if (cond) stack.add(label) }

  for (const d of stackScanDirs(absDirs)) {
    const pkg = readIf(join(d, 'package.json'))
    const reqs = readIf(join(d, 'requirements.txt')) + readIf(join(d, 'requirements-dev.txt')) + readIf(join(d, 'pyproject.toml'))
    const compose = readIf(join(d, 'docker-compose.yml')) + readIf(join(d, 'docker-compose.yaml'))
    const hasDocker = existsSync(join(d, 'Dockerfile')) || compose

    add(pkg.includes('"next"'), 'Next.js')
    add(pkg.includes('"react"') && !pkg.includes('"next"'), 'React')
    add(pkg.includes('"vite"'), 'Vite')
    add(pkg.includes('tailwindcss'), 'Tailwind')
    add(pkg.includes('lightweight-charts'), 'Lightweight Charts')
    add(reqs.includes('fastapi'), 'FastAPI')
    add(reqs.includes('sqlalchemy') || reqs.includes('alembic'), 'SQLAlchemy')
    add(/psycopg|asyncpg|postgres/.test(reqs) || /postgres/.test(compose), 'PostgreSQL')
    add(/redis/.test(reqs) || /redis/.test(compose), 'Redis')
    add(hasDocker, 'Docker')
  }
  return [...stack]
}

function measureProject(p) {
  const absDirs = p.dirs.map((d) => join(LOKALT, d)).filter(existsSync)
  if (absDirs.length === 0) return null // saknas på denna maskin

  const acc = { files: 0, lines: 0, byLang: {} }
  for (const d of absDirs) walk(d, acc)

  const languages = Object.entries(acc.byLang)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, lines]) => ({ name, lines }))

  return {
    name: p.name,
    available: true,
    files: acc.files,
    lines: acc.lines,
    languages,
    stack: detectStack(absDirs),
  }
}

// Läs in ev. befintlig stats för fallback när ett repo saknas lokalt.
let prev = { projects: {} }
try { prev = JSON.parse(readFileSync(OUT, 'utf8')) } catch { /* första körningen */ }

const projects = {}
let ecoFiles = 0, ecoLines = 0, ecoApps = 0

for (const p of PROJECTS) {
  const measured = measureProject(p)
  if (measured) {
    projects[p.id] = measured
    ecoFiles += measured.files
    ecoLines += measured.lines
    ecoApps++
  } else if (prev.projects?.[p.id]?.available) {
    projects[p.id] = { ...prev.projects[p.id], stale: true } // behåll senast kända
    ecoFiles += prev.projects[p.id].files
    ecoLines += prev.projects[p.id].lines
    ecoApps++
  } else {
    projects[p.id] = { name: p.name, available: false }
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  ecosystem: { files: ecoFiles, lines: ecoLines, apps: ecoApps },
  projects,
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

const summary = Object.entries(projects)
  .map(([id, p]) => `${id}: ${p.available ? `${p.files} filer, ${p.lines} rader${p.stale ? ' (stale)' : ''}` : 'saknas'}`)
  .join('\n  ')
console.log(`stats.json genererad — ${ecoApps} appar, ${ecoFiles} filer, ${ecoLines} rader\n  ${summary}`)
