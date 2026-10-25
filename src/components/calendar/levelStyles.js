/**
 * Pemetaan kelas warna visual untuk setiap level heatmap kalender (FR-CAL-6).
 * Memiliki kontras yang baik di tema terang maupun gelap.
 * 'flat' memiliki penanda visual khas (border aksen + background raised) yang berbeda dari 'none'.
 */
export const LEVEL_CLASSES = {
  none: 'bg-bg-panel-raised border-transparent text-text-secondary',
  flat: 'bg-bg-panel-raised border-accent-border text-accent-text font-semibold ring-1 ring-accent/30',
  'profit-1': 'bg-heat-profit-1 border-transparent text-text-primary',
  'profit-2': 'bg-heat-profit-2 border-transparent text-text-primary',
  'profit-3': 'bg-heat-profit-3 border-transparent text-text-primary font-semibold',
  'profit-4': 'bg-heat-profit-4 border-transparent text-text-on-heat-strong font-bold',
  'loss-1': 'bg-heat-loss-1 border-transparent text-text-primary',
  'loss-2': 'bg-heat-loss-2 border-transparent text-text-primary',
  'loss-3': 'bg-heat-loss-3 border-transparent text-text-primary font-semibold',
  'loss-4': 'bg-heat-loss-4 border-transparent text-text-on-heat-strong font-bold',
}

/**
 * Mengembalikan nama kelas Tailwind untuk level warna kalender yang diberikan.
 *
 * @param {string} level
 * @returns {string}
 */
export function levelClassName(level) {
  return LEVEL_CLASSES[level] || LEVEL_CLASSES.none
}
