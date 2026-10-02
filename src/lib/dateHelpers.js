/**
 * Helper murni penanganan tanggal lokal bebas pergeseran timezone (UTC).
 * Tidak menggunakan .toISOString() untuk penentuan hari ini agar akurat di semua zona waktu.
 */

/**
 * Menghasilkan tanggal lokal hari ini dalam format 'YYYY-MM-DD'.
 * Menggunakan getFullYear, getMonth, dan getDate lokal dari objek Date.
 *
 * @param {Date} [now=new Date()]
 * @returns {string} Contoh: '2026-10-02'
 */
export function todayLocalISO(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Memecah string 'YYYY-MM-DD' dan membentuk objek Date pada jam 12:00 siang lokal.
 * Mencegah pergeseran hari yang sering terjadi jika menggunakan new Date('YYYY-MM-DD') (UTC).
 *
 * @param {string} isoStr
 * @returns {Date|null}
 */
export function parseLocalISODate(isoStr) {
  if (!isoStr || typeof isoStr !== 'string') return null
  const parts = isoStr.split('-')
  if (parts.length !== 3) return null

  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null

  // Gunakan jam 12:00:00 lokal agar kebal Daylight Saving Time dan batas tengah malam
  return new Date(year, month - 1, day, 12, 0, 0)
}

/**
 * Memformat tanggal dari string 'YYYY-MM-DD' sesuai bahasa aktif.
 *
 * @param {string} isoStr
 * @param {string} [lang='id']
 * @returns {string} Contoh ID: '2 Okt 2026', EN: 'Oct 2, 2026'
 */
export function formatDateDisplay(isoStr, lang = 'id') {
  const date = parseLocalISODate(isoStr)
  if (!date) return isoStr || '-'

  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Memvalidasi apakah string adalah tanggal ISO yang valid secara kalender,
 * tidak di masa depan, dan tidak sebelum 2000-01-01.
 *
 * @param {string} isoStr
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 */
export function isValidISODateString(isoStr, now = new Date()) {
  if (!isoStr || typeof isoStr !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return false

  const parts = isoStr.split('-').map(Number)
  const [year, month, day] = parts

  if (year < 2000) return false
  if (month < 1 || month > 12) return false

  // Validasi hari nyata dalam bulan (mis. 2026-02-30 otomatis ditolak)
  const checkDate = new Date(year, month - 1, day, 12, 0, 0)
  if (
    checkDate.getFullYear() !== year ||
    checkDate.getMonth() !== month - 1 ||
    checkDate.getDate() !== day
  ) {
    return false
  }

  // Tidak boleh di masa depan dibanding hari ini waktu lokal
  const today = todayLocalISO(now)
  if (isoStr > today) return false

  return true
}

