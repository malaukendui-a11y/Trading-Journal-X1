/**
 * Helper murni untuk validasi dan pemetaan error autentikasi Supabase.
 * Tidak mengandung kode JSX sehingga dapat di-unit-test secara terisolasi.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validasi format email.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  return EMAIL_REGEX.test(email.trim())
}

/**
 * Validasi password non-kosong untuk form login.
 * Akun lama dengan password apa pun tetap dapat login tanpa terhalang kebijakan baru.
 * @param {string} password
 * @returns {boolean}
 */
export function validateLoginPassword(password) {
  if (!password || typeof password !== 'string') return false
  return password.length > 0
}

/**
 * Mengecek rincian syarat kebijakan password FR-AUTH-2:
 * Minimal 8 karakter, huruf kecil, huruf besar, dan angka.
 * @param {string} password
 * @returns {{ minLength: boolean, hasLower: boolean, hasUpper: boolean, hasDigit: boolean, valid: boolean }}
 */
export function checkPasswordPolicy(password) {
  const p = typeof password === 'string' ? password : ''
  const minLength = p.length >= 8
  const hasLower = /[a-z]/.test(p)
  const hasUpper = /[A-Z]/.test(p)
  const hasDigit = /[0-9]/.test(p)
  return {
    minLength,
    hasLower,
    hasUpper,
    hasDigit,
    valid: minLength && hasLower && hasUpper && hasDigit,
  }
}

/**
 * Mendapatkan kunci error i18n untuk syarat kebijakan password yang gagal dipenuhi.
 * @param {string} password
 * @returns {string|null}
 */
export function getPasswordPolicyErrorKey(password) {
  const policy = checkPasswordPolicy(password)
  if (!policy.minLength) return 'auth.passwordMinLength'
  if (!policy.hasLower) return 'auth.passwordNeedLower'
  if (!policy.hasUpper) return 'auth.passwordNeedUpper'
  if (!policy.hasDigit) return 'auth.passwordNeedDigit'
  return null
}

/**
 * Validasi kebijakan password baru (FR-AUTH-2) untuk pendaftaran & reset password.
 * Minimal 8 karakter, mengandung huruf kecil, huruf besar, dan angka.
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  return checkPasswordPolicy(password).valid
}

/**
 * Validasi kecocokan konfirmasi password.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean}
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (!password || !confirmPassword) return false
  return password === confirmPassword
}

/**
 * Memetakan error dari Supabase Auth ke KUNCI terjemahan i18n (bukan teks langsung).
 * Semua pesan teks diterjemahkan lewat kamus i18n agar aman dan konsisten dua bahasa.
 *
 * Kode error Supabase Auth (GoTrue API):
 * - invalid_credentials / invalid_grant / Invalid login credentials
 * - user_already_exists / email_exists / User already registered
 * - weak_password / password_too_short
 * - over_email_send_rate_limit / over_request_rate_limit / 429
 *
 * @param {Error|Object|string} error Objek error dari Supabase
 * @returns {string} Key terjemahan i18n (mis. 'auth.errorInvalidCredentials')
 */
export function mapAuthError(error) {
  if (!error) return ''

  const code = (error?.code || '').toLowerCase()
  const message = (typeof error === 'string' ? error : error?.message || '').toLowerCase()
  const status = Number(error?.status)

  // 1. Kredensial salah
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    message.includes('invalid login credentials') ||
    message.includes('invalid_grant')
  ) {
    return 'auth.errorInvalidCredentials'
  }

  // 2. Email sudah terdaftar
  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    message.includes('user already registered') ||
    message.includes('already registered')
  ) {
    return 'auth.errorUserAlreadyRegistered'
  }

  // 3. Password lemah / terlalu pendek
  if (
    code === 'weak_password' ||
    code === 'password_too_short' ||
    message.includes('password should be at least') ||
    message.includes('password is too short')
  ) {
    return 'auth.errorWeakPassword'
  }

  // 4. Rate limiting (over_email_send_rate_limit, over_request_rate_limit, 429)
  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    return 'auth.errorRateLimit'
  }

  // Fallback generik aman untuk error tak dikenal
  return 'auth.errorGeneric'
}

