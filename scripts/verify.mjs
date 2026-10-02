// scripts/verify.mjs — gerbang verifikasi Trading Compass (tanpa dependency).
// Jalankan dari root project:  node scripts/verify.mjs          (bandingkan dengan branch main)
//                               node scripts/verify.mjs --base HEAD
// Exit code 0 = semua lolos, 1 = ada yang gagal.

import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const args = process.argv.slice(2)
const baseIdx = args.indexOf('--base')
const BASE = baseIdx >= 0 ? args[baseIdx + 1] : 'main'

const results = []
const pass = (name, detail = '') => results.push({ ok: true, name, detail })
const fail = (name, detail = '') => results.push({ ok: false, name, detail })
const warn = (name, detail = '') => results.push({ ok: null, name, detail })

function run(cmd) {
  const r = spawnSync(cmd, { shell: true, encoding: 'utf8' })
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }
}

// 1. Ringkasan perubahan dibanding base (bukti di disk, bukan laporan agent)
const diff = run(`git diff --stat ${BASE}`)
console.log(`\n=== Perubahan dibanding ${BASE} (git diff --stat) ===\n${diff.out.trim() || '(tidak ada perubahan ter-track)'}`)
const untracked = run('git ls-files --others --exclude-standard')
if (untracked.out.trim()) console.log(`\n=== File baru (untracked) ===\n${untracked.out.trim()}`)

// 2. .env.local tidak boleh ter-track git
const envTracked = run('git ls-files --error-unmatch .env.local')
envTracked.code === 0 ? fail('.env.local ter-track git', 'jalankan: git rm --cached .env.local') : pass('.env.local tidak ter-track git')

// 3. File konfigurasi Tailwind v3 yang dilarang
const forbidden = ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.mjs', 'postcss.config.js', 'postcss.config.cjs', 'postcss.config.mjs']
const found = forbidden.filter((f) => existsSync(f))
found.length ? fail('File konfigurasi Tailwind v3 ditemukan', found.join(', ')) : pass('Tidak ada tailwind.config / postcss.config')

// 4. Dependency baru dibanding base harus disetujui manual
try {
  const now = JSON.parse(readFileSync('package.json', 'utf8'))
  const baseRaw = run(`git show ${BASE}:package.json`)
  if (baseRaw.code !== 0) throw new Error(`tidak bisa membaca package.json di ${BASE}`)
  const before = JSON.parse(baseRaw.out)
  const names = (p) => new Set([...Object.keys(p.dependencies || {}), ...Object.keys(p.devDependencies || {})])
  const added = [...names(now)].filter((n) => !names(before).has(n))
  added.length ? warn('Dependency BARU dibanding ' + BASE + ' (cek izin di AGENTS.md)', added.join(', ')) : pass('Tidak ada dependency baru')
} catch (e) {
  warn('Cek dependency dilewati', e.message)
}

// 5. Pola terlarang di src/
const PATTERNS = [
  { re: /sb_secret_|service_role/, msg: 'Secret key / service_role di kode frontend' },
  { re: /dangerouslySetInnerHTML/, msg: 'dangerouslySetInnerHTML (risiko XSS)' },
  { re: /toISOString\(\)\s*\.\s*(slice|substring|substr)\(\s*0\s*,\s*10\s*\)/, msg: 'toISOString().slice(0,10): tanggal UTC, salah di WIB 00:00-07:00' },
  { re: /new Date\(\s*['"`]\d{4}-\d{2}-\d{2}['"`]\s*\)/, msg: "new Date('YYYY-MM-DD'): diparse sebagai UTC" },
  { re: /localStorage\.setItem\([^)]*(token|password|session)/i, msg: 'Menyimpan token/password/sesi manual di localStorage' },
]
function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (['.js', '.jsx', '.mjs', '.css', '.html'].includes(extname(p))) out.push(p)
  }
  return out
}
const hits = []
for (const file of [...walk('src'), 'index.html'].filter(existsSync)) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((line, i) => {
    const t = line.trim()
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return // abaikan baris komentar
    PATTERNS.forEach(({ re, msg }) => { if (re.test(line)) hits.push(`${file}:${i + 1}  ${msg}`) })
  })
}
hits.length ? fail('Pola terlarang ditemukan', '\n    ' + hits.join('\n    ')) : pass('Tidak ada pola terlarang di src/')

// 6. Tes, lint (jika ada), build
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const tests = run('npx vitest run')
tests.code === 0 ? pass('npx vitest run') : fail('npx vitest run', '\n' + tests.out.split('\n').slice(-25).join('\n'))
if (pkg.scripts && pkg.scripts.lint) {
  const lint = run('npm run lint')
  lint.code === 0 ? pass('npm run lint') : fail('npm run lint', '\n' + lint.out.split('\n').slice(-25).join('\n'))
} else warn('npm run lint dilewati', 'tidak ada script "lint" di package.json')
const build = run('npm run build')
build.code === 0 ? pass('npm run build') : fail('npm run build', '\n' + build.out.split('\n').slice(-25).join('\n'))

// Ringkasan
console.log('\n=== HASIL VERIFIKASI ===')
for (const r of results) {
  const tag = r.ok === true ? 'PASS' : r.ok === false ? 'FAIL' : 'WARN'
  console.log(`[${tag}] ${r.name}${r.detail ? ' -> ' + r.detail : ''}`)
}
const failed = results.filter((r) => r.ok === false).length
console.log(failed ? `\n${failed} pemeriksaan GAGAL. Jangan commit.` : '\nSemua pemeriksaan wajib lolos. Lanjutkan tes manual.')
process.exit(failed ? 1 : 0)
