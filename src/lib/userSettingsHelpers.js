/**
 * Helper murni untuk validasi nilai dan pembuatan payload tabel user_settings.
 * Tidak bergantung pada React / JSX sehingga dapat di-unit-test dengan Vitest.
 */

/**
 * Memastikan nilai theme hanya 'light' atau 'dark'. Selain itu fallback ke 'dark'.
 * @param {string} theme
 * @returns {'dark'|'light'}
 */
export function validateTheme(theme) {
  return theme === 'light' || theme === 'dark' ? theme : 'dark'
}

/**
 * Memastikan nilai lang hanya 'id' atau 'en'. Selain itu fallback ke 'id'.
 * @param {string} lang
 * @returns {'id'|'en'}
 */
export function validateLang(lang) {
  return lang === 'id' || lang === 'en' ? lang : 'id'
}

/**
 * Membangun payload pembaruan user_settings yang aman dan valid.
 * Menyertakan kolom updated_at dengan timestamp ISO terkini karena kolom tersebut tidak memiliki trigger DB.
 *
 * @param {Object} fields
 * @param {string} [fields.theme]
 * @param {string} [fields.lang]
 * @param {number|string} [fields.balance]
 * @param {string} [fields.displayName]
 * @param {string} [fields.display_name]
 * @returns {Object} Payload siap kirim ke Supabase
 */
export function buildUserSettingsPayload(fields = {}) {
  const payload = {
    updated_at: new Date().toISOString(),
  }

  if (fields.theme !== undefined) {
    payload.theme = validateTheme(fields.theme)
  }

  if (fields.lang !== undefined) {
    payload.lang = validateLang(fields.lang)
  }

  if (fields.balance !== undefined) {
    const num = Number(fields.balance)
    payload.balance = Number.isFinite(num) ? Math.max(0, num) : 0
  }

  const name = fields.displayName !== undefined ? fields.displayName : fields.display_name
  if (name !== undefined) {
    payload.display_name = typeof name === 'string' && name.trim() ? name.trim() : 'Trader'
  }

  return payload
}

/**
 * Memvalidasi input saldo akun untuk pembaruan profil pengguna (FR-DASH-2).
 * String kosong, spasi, bukan angka, nilai negatif (< 0), atau lebih besar dari 1e12 dinyatakan TIDAK valid.
 * JANGAN mengubah string kosong '' atau spasi menjadi 0.
 *
 * @param {any} input
 * @returns {{ ok: true, value: number } | { ok: false, error: string }}
 */
export function validateBalanceInput(input) {
  if (input === null || input === undefined) {
    return { ok: false, error: 'dashboard.errorInvalidBalance' }
  }

  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (trimmed === '') {
      return { ok: false, error: 'dashboard.errorInvalidBalance' }
    }
    const num = Number(trimmed)
    if (!Number.isFinite(num) || isNaN(num) || num < 0 || num > 1e12) {
      return { ok: false, error: 'dashboard.errorInvalidBalance' }
    }
    return { ok: true, value: num }
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input) || isNaN(input) || input < 0 || input > 1e12) {
      return { ok: false, error: 'dashboard.errorInvalidBalance' }
    }
    return { ok: true, value: input }
  }

  return { ok: false, error: 'dashboard.errorInvalidBalance' }
}

