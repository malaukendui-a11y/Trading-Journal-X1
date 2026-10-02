/**
 * Kalkulasi murni untuk statistik ringkasan Dashboard (FR-DASH-1).
 * Tidak bergantung pada JSX, Supabase, atau DOM, dan tidak pernah melempar exception.
 */

/**
 * Menghitung metrik ringkasan dari daftar journal entries.
 *
 * @param {Array<Object>} [entries=[]]
 * @returns {{
 *   total: number,
 *   wins: number,
 *   winRate: number|null,
 *   revengeCount: number,
 *   totalPnl: number
 * }}
 */
export function computeDashboardStats(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      total: 0,
      wins: 0,
      winRate: null,
      revengeCount: 0,
      totalPnl: 0,
    }
  }

  const total = entries.length
  let wins = 0
  let revengeCount = 0
  let totalPnl = 0

  for (let i = 0; i < total; i++) {
    const entry = entries[i]
    const pnl = Number(entry?.pnl) || 0

    totalPnl += pnl

    if (pnl > 0) {
      wins += 1
    }

    if (entry?.status === 'revenge') {
      revengeCount += 1
    }
  }

  const winRate = total > 0 ? Math.round((wins / total) * 100) : null

  return {
    total,
    wins,
    winRate,
    revengeCount,
    totalPnl,
  }
}
