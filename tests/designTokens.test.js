// tests/designTokens.test.js — kontrak token warna (design.md §5.1) dan font (FR-UI-8).
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8')

// Normalisasi supaya beda penulisan yang setara tidak membuat tes gagal:
// huruf besar/kecil, spasi, "0.08" vs ".08", ".10" vs ".1".
const norm = (v) =>
  v.toLowerCase().replace(/\s+/g, '').replace(/([(,])0\./g, '$1.').replace(/(\.\d*?)0+(?=[,)])/g, '$1')

function readBlock(css, selectorRe) {
  const m = css.match(selectorRe)
  const out = {}
  if (!m) return out
  for (const d of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[d[1]] = norm(d[2])
  return out
}

// [token, tema terang (:root), tema gelap (.dark)] — persis tabel design.md §5.1 v1.7
const TOKENS = [
  ['--bg', '#f4f2fb', '#0e1119'],
  ['--bg-glow-1', 'rgba(145,121,214,.24)', 'rgba(145,121,214,.32)'],
  ['--bg-glow-2', 'rgba(99,132,255,.14)', 'rgba(76,111,214,.22)'],
  ['--bg-panel', 'rgba(255,255,255,.78)', 'rgba(22,29,37,.78)'],
  ['--bg-panel-strong', 'rgba(255,255,255,.72)', 'rgba(22,29,37,.70)'],
  ['--bg-panel-solid', '#ffffff', '#161d25'],
  ['--bg-panel-raised', 'rgba(240,241,244,.90)', 'rgba(28,36,46,.90)'],
  ['--line', 'rgba(21,24,35,.08)', 'rgba(255,255,255,.08)'],
  ['--text-primary', '#151823', '#e9e4d8'],
  ['--text-secondary', '#565c6b', '#a9a89e'],
  ['--accent', '#9179d6', '#9179d6'],
  ['--accent-text', '#6d55b8', '#a996e3'],
  ['--accent-solid', '#6d55b8', '#6d55b8'],
  ['--accent-soft', 'rgba(145,121,214,.12)', 'rgba(145,121,214,.16)'],
  ['--accent-border', 'rgba(109,85,184,.35)', 'rgba(145,121,214,.45)'],
  ['--sage', '#177245', '#7fa387'],
  ['--brick', '#c4271c', '#d9786a'],
  ['--sage-soft', 'rgba(23,114,69,.10)', 'rgba(127,163,135,.08)'],
  ['--brick-soft', 'rgba(196,39,28,.10)', 'rgba(217,120,106,.08)'],
  ['--sage-border', 'rgba(23,114,69,.30)', 'rgba(127,163,135,.35)'],
  ['--brick-border', 'rgba(196,39,28,.30)', 'rgba(217,120,106,.35)'],
  ['--on-danger', '#ffffff', '#0e1119'],
  ['--scrim', 'rgba(21,24,35,.30)', 'rgba(5,7,12,.62)'],
  ['--heat-profit-1', 'rgba(31,157,85,.18)', 'rgba(127,163,135,.25)'],
  ['--heat-profit-2', 'rgba(31,157,85,.36)', 'rgba(127,163,135,.45)'],
  ['--heat-profit-3', 'rgba(31,157,85,.56)', 'rgba(127,163,135,.55)'],
  ['--heat-profit-4', 'rgba(31,157,85,.80)', 'rgba(127,163,135,.90)'],
  ['--heat-loss-1', 'rgba(217,45,32,.16)', 'rgba(217,120,106,.25)'],
  ['--heat-loss-2', 'rgba(217,45,32,.32)', 'rgba(217,120,106,.45)'],
  ['--heat-loss-3', 'rgba(217,45,32,.50)', 'rgba(217,120,106,.55)'],
  ['--heat-loss-4', 'rgba(217,45,32,.72)', 'rgba(217,120,106,.90)'],
  ['--text-on-heat-strong', '#151823', '#0e1119'],
  ['--auth-panel-from', '#6d55b8', '#6d55b8'],
  ['--auth-panel-to', '#4a3a8c', '#4a3a8c'],
]

describe('Token warna design.md §5.1', () => {
  const css = read('src/styles/tokens.css')
  const light = readBlock(css, /(?:^|\n)\s*:root\s*\{([^}]*)\}/)
  const dark = readBlock(css, /(?:^|\n)\s*\.dark\s*\{([^}]*)\}/)
  for (const [name, lightValue, darkValue] of TOKENS) {
    it(`${name} tema terang = ${lightValue}`, () => expect(light[name]).toBe(norm(lightValue)))
    it(`${name} tema gelap = ${darkValue}`, () => expect(dark[name] ?? light[name]).toBe(norm(darkValue)))
  }
})

function listSourceFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) listSourceFiles(p, out)
    else if (['.js', '.jsx', '.css'].includes(extname(p))) out.push(p)
  }
  return out
}

describe('Font IBM Plex Sans (FR-UI-8)', () => {
  it('index.html memuat IBM Plex Sans dengan sumbu wdth dan wght', () => {
    const html = read('index.html')
    expect(html).toContain('family=IBM+Plex+Sans:wdth,wght@87.5..100,400..700')
    expect(html).toContain('display=swap')
  })
  it('Space Grotesk, Inter, dan IBM Plex Mono tidak dimuat lagi', () => {
    const banned = /Space[ +]Grotesk|IBM[ +]Plex[ +]Mono|family=Inter\b|["']Inter["']/
    const files = [join(ROOT, 'index.html'), ...listSourceFiles(join(ROOT, 'src'))]
    const hits = files.filter((f) => banned.test(readFileSync(f, 'utf8')))
    expect(hits).toEqual([])
  })
})
