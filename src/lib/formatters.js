/**
 * Helper murni pemformatan angka, mata uang, dan harga.
 */

/**
 * Memformat angka P&L dalam mata uang USD dengan tanda eksplisit (+ / - / $0.00).
 *
 * @param {number|string} amount
 * @param {string} [lang='id']
 * @returns {string} Contoh: '+$250.00', '-$45.50', '$0.00'
 */
export function formatCurrency(amount, lang = 'id') {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '-'

  const absFormatted = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num))

  if (num > 0) {
    return `+${absFormatted}`
  }
  if (num < 0) {
    return `-${absFormatted}`
  }
  return absFormatted
}

/**
 * Memformat angka harga entry, SL, atau exit hingga 8 desimal tanpa trailing zeros berlebih.
 *
 * @param {number|string|null} price
 * @param {string} [lang='id']
 * @returns {string} Contoh: '60,000', '1.09542', '-'
 */
export function formatPrice(price, lang = 'id') {
  if (price === null || price === undefined || price === '') return '-'
  const num = Number(price)
  if (!Number.isFinite(num)) return '-'

  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(num)
}

