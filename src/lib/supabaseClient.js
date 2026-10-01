import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

/**
 * Memeriksa apakah kredensial Supabase sudah terkonfigurasi di environment.
 * Mengembalikan boolean tanpa membocorkan nilai kunci.
 */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey)
}

if (!isSupabaseConfigured()) {
  console.warn(
    '[Trading Compass] Supabase URL atau Publishable Key belum terkonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY telah diatur di .env.local'
  )
}

/**
 * Supabase client instance.
 * Hanya memakai publishable key (bukan secret key) dengan persistensi sesi otomatis.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

/**
 * Memetakan error mentah dari Supabase ke pesan ramah pengguna yang aman.
 * Menghindari kebocoran informasi struktur database internal ke UI.
 *
 * @param {Error|Object|string} error Objek error dari Supabase
 * @param {string} [lang='id'] Bahasa aktif ('id' | 'en')
 * @returns {string} Pesan aman yang siap ditampilkan di UI
 */
export function mapSupabaseError(error, lang = 'id') {
  if (!error) return ''

  const message = typeof error === 'string' ? error : error.message || ''
  const status = error?.status

  const messages = {
    id: {
      invalid_credentials: 'Email atau password tidak sesuai.',
      email_not_confirmed: 'Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda.',
      user_already_registered: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
      password_too_short: 'Password minimal 6 karakter.',
      network_error: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
      session_expired: 'Sesi login telah berakhir. Silakan login kembali.',
      rls_violation: 'Akses ditolak. Anda tidak memiliki izin untuk data ini.',
      generic: 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.',
    },
    en: {
      invalid_credentials: 'Invalid email or password.',
      email_not_confirmed: 'Email address not confirmed. Please check your inbox.',
      user_already_registered: 'Email already registered. Please login or use another email.',
      password_too_short: 'Password must be at least 6 characters.',
      network_error: 'Unable to connect to server. Please check your internet connection.',
      session_expired: 'Session expired. Please sign in again.',
      rls_violation: 'Access denied. You do not have permission for this record.',
      generic: 'A system error occurred. Please try again later.',
    },
  }

  const dict = messages[lang] || messages.id
  const lowerMsg = message.toLowerCase()

  if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid_grant')) {
    return dict.invalid_credentials
  }
  if (lowerMsg.includes('email not confirmed')) {
    return dict.email_not_confirmed
  }
  if (lowerMsg.includes('user already registered') || lowerMsg.includes('already registered')) {
    return dict.user_already_registered
  }
  if (lowerMsg.includes('password should be at least') || lowerMsg.includes('password is too short')) {
    return dict.password_too_short
  }
  if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('networkerror') || status === 0) {
    return dict.network_error
  }
  if (lowerMsg.includes('jwt expired') || lowerMsg.includes('token expired')) {
    return dict.session_expired
  }
  if (lowerMsg.includes('row-level security') || lowerMsg.includes('violates row-level security')) {
    return dict.rls_violation
  }

  return dict.generic
}
