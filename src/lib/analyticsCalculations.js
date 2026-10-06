/**
 * Modul murni kalkulasi data Analytics (FR-ANA-1 s.d. FR-ANA-5).
 * Bebas JSX, tanpa Supabase, tanpa dependensi DOM, dan tidak pernah throw.
 */

import { groupDailyPnl } from './calendarAggregations.js'

/**
 * Label baku untuk 9 bin R-multiple (FR-ANA-2).
 * Menggunakan karakter unicode minus '−' (U+2212).
 */
export const R_BIN_SPECS = [
  { bin: -3, label: '≤ −3R' },
  { bin: -2, label: '−2R' },
  { bin: -1, label: '−1R' },
  { bin: 0, label: '0R' },
  { bin: 1, label: '1R' },
  { bin: 2, label: '2R' },
  { bin: 3, label: '3R' },
  { bin: 4, label: '4R' },
  { bin: 5, label: '≥ 5R' },
]

/**
 * Menghitung Equity Curve kumulatif per hari trading (FR-ANA-1, EQ1).
 * Mengelompokkan P&L harian via groupDailyPnl, mengurutkan tanggal secara ascending,
 * lalu menjumlahkan kumulatif.
 *
 * @param {Array<Object>} [entries=[]]
 * @returns {Array<{ date: string, value: number }>}
 */
export function equityCurve(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return []
  }

  const dailyPnl = groupDailyPnl(entries)
  const sortedDates = Object.keys(dailyPnl).sort((a, b) => a.localeCompare(b))

  if (sortedDates.length === 0) {
    return []
  }

  let cumulativePnl = 0
  const result = []

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i]
    cumulativePnl += Number(dailyPnl[date].pnl) || 0
    result.push({
      date,
      value: cumulativePnl,
    })
  }

  return result
}

/**
 * Helper untuk mengambil harga numerik yang valid (> 0 dan finite).
 *
 * @param {any} val
 * @returns {number|null}
 */
function getValidPositivePrice(val) {
  if (val === null || val === undefined || val === '') return null
  const num = Number(val)
  return Number.isFinite(num) && num > 0 ? num : null
}

/**
 * Menghitung R-multiple realisasi untuk satu trade (FR-ANA-2, R1-R13).
 *
 * Rumus:
 * - Buy:  risk = entry − sl ;  R = (exit − entry) / risk
 * - Sell: risk = sl − entry ;  R = (entry − exit) / risk
 *
 * Mengembalikan null jika:
 * - sl atau exit kosong / tidak valid
 * - entry kosong / tidak valid
 * - risk <= 0 (entry = SL atau SL di sisi yang salah dari entry)
 * - arah posisi tidak valid (bukan 'buy' atau 'sell')
 *
 * @param {Object} entry
 * @returns {number|null}
 */
export function rMultiple(entry) {
  if (!entry || typeof entry !== 'object') return null

  const ep = getValidPositivePrice(
    entry.entry_price !== undefined ? entry.entry_price : (entry.entryPrice !== undefined ? entry.entryPrice : entry.entry)
  )
  const sl = getValidPositivePrice(
    entry.sl_price !== undefined ? entry.sl_price : (entry.slPrice !== undefined ? entry.slPrice : entry.sl)
  )
  const ex = getValidPositivePrice(
    entry.exit_price !== undefined ? entry.exit_price : (entry.exitPrice !== undefined ? entry.exitPrice : entry.exit)
  )

  if (ep === null || sl === null || ex === null) {
    return null
  }

  const direction = entry.direction || entry.type
  if (direction !== 'buy' && direction !== 'sell') {
    return null
  }

  if (direction === 'buy') {
    const risk = ep - sl
    if (risk <= 0) return null
    return (ex - ep) / risk
  } else {
    const risk = sl - ep
    if (risk <= 0) return null
    return (ep - ex) / risk
  }
}

/**
 * Menghitung distribusi histogram R-multiple dalam 9 bin (FR-ANA-2, R1-R13).
 *
 * Bin dihitung sebagai: clamp(Math.round(R), -3, 5), lalu -0 dinormalkan menjadi 0.
 *
 * Mengembalikan 9 bin lengkap (selalu ada meski count 0), jumlah trade yang dikecualikan,
 * serta rincian alasan pengecualian ({ missing, invalidRisk }).
 *
 * @param {Array<Object>} [entries=[]]
 * @returns {{
 *   bins: Array<{ bin: number, label: string, count: number }>,
 *   excluded: number,
 *   excludedReasons: { missing: number, invalidRisk: number }
 * }}
 */
export function rDistribution(entries) {
  const binCounts = {
    '-3': 0,
    '-2': 0,
    '-1': 0,
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  }

  let missingCount = 0
  let invalidRiskCount = 0

  if (Array.isArray(entries)) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      if (!entry || typeof entry !== 'object') {
        missingCount++
        continue
      }

      const ep = getValidPositivePrice(
        entry.entry_price !== undefined ? entry.entry_price : (entry.entryPrice !== undefined ? entry.entryPrice : entry.entry)
      )
      const sl = getValidPositivePrice(
        entry.sl_price !== undefined ? entry.sl_price : (entry.slPrice !== undefined ? entry.slPrice : entry.sl)
      )
      const ex = getValidPositivePrice(
        entry.exit_price !== undefined ? entry.exit_price : (entry.exitPrice !== undefined ? entry.exitPrice : entry.exit)
      )

      // 1. Cek kelengkapan harga
      if (ep === null || sl === null || ex === null) {
        missingCount++
        continue
      }

      const direction = entry.direction || entry.type
      if (direction !== 'buy' && direction !== 'sell') {
        missingCount++
        continue
      }

      // 2. Cek validitas risk
      const risk = direction === 'buy' ? ep - sl : sl - ep
      if (risk <= 0) {
        invalidRiskCount++
        continue
      }

      // 3. Hitung R dan masukkan ke bin
      const r = direction === 'buy' ? (ex - ep) / risk : (ep - ex) / risk

      // Pembulatan ke integer terdekat
      const rounded = Math.round(r)

      // Clamp ke [-3, 5]
      let clamped = Math.min(5, Math.max(-3, rounded))

      // Normalisasi -0 menjadi 0 (Object.is(-0, 0) bernilai false)
      if (clamped === 0) {
        clamped = 0
      }

      binCounts[String(clamped)] += 1
    }
  }

  const bins = R_BIN_SPECS.map((spec) => {
    let binKey = spec.bin
    if (binKey === 0) binKey = 0
    return {
      bin: binKey,
      label: spec.label,
      count: binCounts[String(spec.bin)] || 0,
    }
  })

  return {
    bins,
    excluded: missingCount + invalidRiskCount,
    excludedReasons: {
      missing: missingCount,
      invalidRisk: invalidRiskCount,
    },
  }
}

/**
 * Menghitung Skor Disiplin Eksekusi (FR-ANA-3, G1-G7).
 *
 * Rumus:
 * pct = round((jumlah trade status='plan' / total trade) * 100)
 * tone = >= 70 'sage' | >= 40 'accent' | < 40 'brick'
 *
 * Mengembalikan null jika total trade 0.
 *
 * @param {Array<Object>} [entries=[]]
 * @returns {{ pct: number, tone: 'sage'|'accent'|'brick' }|null}
 */
export function disciplineScore(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null
  }

  const total = entries.length
  let planCount = 0

  for (let i = 0; i < total; i++) {
    if (entries[i]?.status === 'plan') {
      planCount++
    }
  }

  const pct = Math.round((planCount / total) * 100)
  const tone = pct >= 70 ? 'sage' : pct >= 40 ? 'accent' : 'brick'

  return { pct, tone }
}
