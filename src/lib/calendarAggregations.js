/**
 * Modul murni untuk agregasi data kalender dan visualisasi heatmap (FR-CAL-6).
 * Dipakai bersama oleh M5 (Mini Heatmap Dashboard) dan M6 (Calendar Page).
 * Tidak bergantung pada JSX, Supabase, atau DOM, dan tidak pernah melempar exception.
 */

import { computeDashboardStats } from './dashboardStats.js'

/**
 * Mengelompokkan daftar journal entries ke dalam map harian berdasarkan trade_date ('YYYY-MM-DD').
 * Memakai string trade_date tanpa konversi zona waktu (UTC).
 *
 * @param {Array<Object>} [entries=[]]
 * @returns {Record<string, { pnl: number, count: number }>}
 */
export function groupDailyPnl(entries) {
  const result = {}
  if (!Array.isArray(entries)) return result

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const dateStr = entry?.trade_date
    if (!dateStr || typeof dateStr !== 'string') continue

    const pnl = Number(entry?.pnl) || 0

    if (!result[dateStr]) {
      result[dateStr] = { pnl: 0, count: 0 }
    }

    result[dateStr].pnl += pnl
    result[dateStr].count += 1
  }

  return result
}

/**
 * Membangun struktur grid kalender bulanan.
 * - Pekan selalu dimulai hari SENIN.
 * - Sel sebelum tanggal 1 dan setelah tanggal terakhir diisi sel kosong { date: null, day: null, inMonth: false }.
 * - Jumlah pekan berkisar antara 4 sampai 6 pekan.
 *
 * @param {number} year Contoh: 2026
 * @param {number} month Bulan 1-12 (1 = Jan, 10 = Okt)
 * @returns {Array<Array<{ date: string|null, day: number|null, inMonth: boolean }>> & {
 *   weeks: Array<Array<{ date: string|null, day: number|null, inMonth: boolean }>>,
 *   leadingEmpty: number,
 *   trailingEmpty: number,
 *   daysInMonth: number,
 *   numWeeks: number
 * }}
 */
export function buildMonthGrid(year, month) {
  const y = Number(year)
  const m = Number(month)

  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    const emptyGrid = []
    emptyGrid.weeks = []
    emptyGrid.leadingEmpty = 0
    emptyGrid.trailingEmpty = 0
    emptyGrid.daysInMonth = 0
    emptyGrid.numWeeks = 0
    return emptyGrid
  }

  // Hari pertama bulan pada jam 12 siang lokal untuk menghindari pergeseran DST
  const firstDate = new Date(y, m - 1, 1, 12, 0, 0)
  // getDay: 0 = Sun, 1 = Mon, ..., 6 = Sat -> konversi ke Senin = 0
  const leadingEmpty = (firstDate.getDay() + 6) % 7

  // Jumlah hari dalam bulan
  const lastDate = new Date(y, m, 0, 12, 0, 0)
  const daysInMonth = lastDate.getDate()

  const totalFilled = leadingEmpty + daysInMonth
  const numWeeks = Math.ceil(totalFilled / 7)
  const totalCells = numWeeks * 7
  const trailingEmpty = totalCells - totalFilled

  const monthStr = String(m).padStart(2, '0')
  const weeks = []

  let currentDay = 1
  let cellIndex = 0

  for (let w = 0; w < numWeeks; w++) {
    const week = []
    for (let col = 0; col < 7; col++) {
      if (cellIndex < leadingEmpty || currentDay > daysInMonth) {
        week.push({ date: null, day: null, inMonth: false })
      } else {
        const dayStr = String(currentDay).padStart(2, '0')
        week.push({
          date: `${y}-${monthStr}-${dayStr}`,
          day: currentDay,
          inMonth: true,
        })
        currentDay++
      }
      cellIndex++
    }
    weeks.push(week)
  }

  // Tambahkan metadata ke array weeks agar ramah terhadap beragam pola konsumsi
  weeks.weeks = weeks
  weeks.leadingEmpty = leadingEmpty
  weeks.trailingEmpty = trailingEmpty
  weeks.daysInMonth = daysInMonth
  weeks.numWeeks = numWeeks

  return weeks
}

/**
 * Mencari nilai absolut P&L harian maksimum di antara hari yang memiliki trade
 * pada bulan dan tahun tertentu. Hari tanpa trade atau di luar bulan diabaikan.
 *
 * @param {Record<string, { pnl: number, count: number }>} daily
 * @param {number} year
 * @param {number} month (1-12)
 * @returns {number} Nilai max |pnl|, atau 0 jika tidak ada trade
 */
export function monthMaxAbs(daily, year, month) {
  if (!daily || typeof daily !== 'object') return 0

  const prefix = `${year}-${String(month).padStart(2, '0')}-`
  let max = 0

  const keys = Object.keys(daily)
  for (let i = 0; i < keys.length; i++) {
    const dateStr = keys[i]
    if (dateStr.startsWith(prefix)) {
      const entry = daily[dateStr]
      if (entry && entry.count > 0) {
        const absVal = Math.abs(Number(entry.pnl) || 0)
        if (absVal > max) {
          max = absVal
        }
      }
    }
  }

  return max
}

/**
 * Menentukan level warna kalender harian sesuai koreksi 1:
 * - day = { pnl, count } | undefined
 * - count yang menentukan 'none' (undefined atau count <= 0)
 * - count > 0 dan pnl = 0 -> 'flat'
 * - profit/loss -> 'profit-1' s.d. 'profit-4' / 'loss-1' s.d. 'loss-4'
 * - Jika maxAbs = 0, tidak menghasilkan NaN
 *
 * @param {{ pnl: number, count: number }|undefined} day
 * @param {number} maxAbs
 * @returns {'none'|'flat'|'profit-1'|'profit-2'|'profit-3'|'profit-4'|'loss-1'|'loss-2'|'loss-3'|'loss-4'}
 */
export function dayLevel(day, maxAbs) {
  if (!day || !day.count || day.count <= 0) {
    return 'none'
  }

  const pnl = Number(day.pnl) || 0

  if (pnl === 0) {
    return 'flat'
  }

  // Jika maxAbs 0 atau tidak valid tapi pnl != 0, hindari NaN
  if (!maxAbs || maxAbs <= 0 || !Number.isFinite(maxAbs)) {
    return pnl > 0 ? 'profit-1' : 'loss-1'
  }

  const ratio = Math.abs(pnl) / maxAbs
  const N = Math.min(4, Math.max(1, Math.ceil(ratio * 4)))

  return pnl > 0 ? `profit-${N}` : `loss-${N}`
}

/**
 * Menggeser bulan dengan aritmetika tahun dan bulan (FR-CAL-7, N1, N2).
 * DILARANG memakai Date.setMonth (karena 31 Jan + 1 bulan = 3 Mar akibat rollover hari).
 *
 * @param {number} year
 * @param {number} month (1-12)
 * @param {number} delta Perpindahan bulan (+1, -1, +15, -12, dsb.)
 * @returns {{ year: number, month: number }}
 */
export function shiftMonth(year, month, delta = 0) {
  if (year === null || year === undefined || month === null || month === undefined) {
    return { year: 2026, month: 1 }
  }

  const y = Number(year)
  const m = Number(month)
  const d = Number(delta) || 0

  if (!Number.isFinite(y) || !Number.isFinite(m) || y <= 0 || m < 1 || m > 12) {
    return { year: 2026, month: 1 }
  }

  const totalMonths = y * 12 + (m - 1) + d
  const newYear = Math.floor(totalMonths / 12)
  const newMonth = ((totalMonths % 12) + 12) % 12 + 1

  return { year: newYear, month: newMonth }
}

/**
 * Menyaring entri jurnal yang trade_date-nya berada pada bulan dan tahun tertentu.
 * Menggunakan perbandingan prefix string 'YYYY-MM-' tanpa konversi zona waktu (UTC).
 *
 * @param {Array<Object>} entries
 * @param {number} year
 * @param {number} month (1-12)
 * @returns {Array<Object>}
 */
export function entriesInMonth(entries, year, month) {
  if (!Array.isArray(entries)) return []
  const y = Number(year)
  const m = Number(month)
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return []

  const prefix = `${y}-${String(m).padStart(2, '0')}-`
  return entries.filter(
    (e) => typeof e?.trade_date === 'string' && e.trade_date.startsWith(prefix)
  )
}

/**
 * Menghitung ringkasan performa bulanan (FR-CAL-4, K1-K3).
 * Memakai ulang computeDashboardStats untuk totalPnl dan winRate agar konsisten 100% dengan Dashboard.
 *
 * @param {Array<Object>} entries
 * @param {number} year
 * @param {number} month (1-12)
 * @returns {{
 *   total: number,
 *   totalPnl: number,
 *   winRate: number|null,
 *   tradingDays: number
 * }}
 */
export function monthSummary(entries, year, month) {
  const monthEntries = entriesInMonth(entries, year, month)
  const stats = computeDashboardStats(monthEntries)

  const distinctDates = new Set()
  for (let i = 0; i < monthEntries.length; i++) {
    const d = monthEntries[i]?.trade_date
    if (d) {
      distinctDates.add(d)
    }
  }

  return {
    total: stats.total,
    totalPnl: stats.totalPnl,
    winRate: stats.winRate,
    tradingDays: distinctDates.size,
  }
}

/**
 * Mengambil dan mengurutkan daftar trade untuk tanggal tertentu (FR-CAL-2, D1).
 * Urutan: created_at descending (terbaru di atas), lalu id descending.
 *
 * @param {Array<Object>} entries
 * @param {string} isoDate 'YYYY-MM-DD'
 * @returns {Array<Object>}
 */
export function entriesForDate(entries, isoDate) {
  if (!Array.isArray(entries) || !isoDate || typeof isoDate !== 'string') return []

  const filtered = entries.filter((e) => e?.trade_date === isoDate)

  return filtered.sort((a, b) => {
    // 1. created_at desc
    const timeA = a?.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b?.created_at ? new Date(b.created_at).getTime() : 0
    if (timeA !== timeB) {
      return timeB - timeA
    }

    // 2. id desc
    return String(b?.id || '').localeCompare(String(a?.id || ''))
  })
}
