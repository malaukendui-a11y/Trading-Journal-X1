/**
 * Pemetaan kelas warna visual untuk setiap level heatmap kalender (FR-CAL-6).
 * Memiliki kontras yang baik di tema terang maupun gelap.
 * 'flat' memiliki penanda visual khas (border aksen + background raised) yang berbeda dari 'none'.
 */
export const LEVEL_CLASSES = {
  none: 'bg-line/20 border-transparent text-text-secondary/50',
  flat: 'bg-bg-panel-raised border-accent/60 text-accent font-semibold ring-1 ring-accent/30',
  'profit-1': 'bg-sage/20 border-sage/40 text-text-primary',
  'profit-2': 'bg-sage/40 border-sage/60 text-text-primary',
  'profit-3': 'bg-sage/70 border-sage/90 text-text-primary font-semibold',
  'profit-4': 'bg-sage border-sage text-white font-bold',
  'loss-1': 'bg-brick/20 border-brick/40 text-text-primary',
  'loss-2': 'bg-brick/40 border-brick/60 text-text-primary',
  'loss-3': 'bg-brick/70 border-brick/90 text-text-primary font-semibold',
  'loss-4': 'bg-brick border-brick text-white font-bold',
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
