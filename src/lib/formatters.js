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

/**
 * Memformat lot dengan tepat 4 desimal.
 *
 * @param {number|string|null} val
 * @param {string} [lang='id']
 * @returns {string} Contoh: '0,0500' (ID), '0.0500' (EN)
 */
export function formatLot(val, lang = 'id') {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (!Number.isFinite(num)) return '-'

  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(num)
}

/**
 * Memformat ukuran koin maksimal 8 desimal.
 *
 * @param {number|string|null} val
 * @param {string} [lang='id']
 * @returns {string}
 */
export function formatCoin(val, lang = 'id') {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (!Number.isFinite(num)) return '-'

  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(num)
}

/**
 * Memformat persentase dengan 2 desimal disertai simbol %.
 *
 * @param {number|string|null} val
 * @param {string} [lang='id']
 * @returns {string} Contoh: '2,00%' (ID), '2.00%' (EN)
 */
export function formatPercent(val, lang = 'id') {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (!Number.isFinite(num)) return '-'

  const formatted = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)

  return `${formatted}%`
}

/**
 * Memformat ukuran unit posisi hingga maksimal 4 desimal.
 *
 * @param {number|string|null} val
 * @param {string} [lang='id']
 * @returns {string}
 */
export function formatUnits(val, lang = 'id') {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (!Number.isFinite(num)) return '-'

  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(num)
}

/**
 * Memformat jumlah lembar saham sebagai bilangan bulat.
 *
 * @param {number|string|null} val
 * @param {string} [lang='id']
 * @returns {string} Contoh: '100'
 */
export function formatShares(val, lang = 'id') {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (!Number.isFinite(num)) return '-'

  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(Math.floor(num))
}

/**
 * Memformat rasio Risk:Reward menjadi format "1 : X.XX".
 *
 * @param {number|string|null} val
 * @param {string} [lang='id']
 * @returns {string} Contoh: '1 : 3,00' (ID), '1 : 3.00' (EN), atau '-'
 */
export function formatRR(val, lang = 'id') {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (!Number.isFinite(num)) return '-'

  const formatted = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)

  return `1 : ${formatted}`
}


