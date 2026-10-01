import { describe, expect, it } from 'vitest'
import { translate, translations } from '../src/lib/i18n.js'
import { mapSupabaseError } from '../src/lib/supabaseClient.js'

function getNestedKeys(obj, prefix = '') {
  let keys = []
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getNestedKeys(value, fullPath))
    } else {
      keys.push(fullPath)
    }
  }
  return keys.sort()
}

describe('M0: i18n Dictionary Integrity', () => {
  it('kamus ID dan EN memiliki struktur key yang identik 1-banding-1', () => {
    const idKeys = getNestedKeys(translations.id)
    const enKeys = getNestedKeys(translations.en)

    expect(idKeys).toEqual(enKeys)
    expect(idKeys.length).toBeGreaterThan(50)
  })

  it('mampu menerjemahkan teks dalam bahasa Indonesia', () => {
    expect(translate('id', 'app.name')).toBe('Trading Compass')
    expect(translate('id', 'common.save')).toBe('Simpan')
    expect(translate('id', 'nav.dashboard')).toBe('Dashboard')
  })

  it('mampu menerjemahkan teks dalam bahasa Inggris', () => {
    expect(translate('en', 'app.name')).toBe('Trading Compass')
    expect(translate('en', 'common.save')).toBe('Save')
    expect(translate('en', 'nav.dashboard')).toBe('Dashboard')
    expect(translate('en', 'auth.loginButton')).toBe('Sign In to Dashboard')
  })

  it('mendukung interpolasi parameter variabel', () => {
    expect(translate('id', 'calendar.dayTradesCount', { count: 4 })).toBe('4 trade')
    expect(translate('en', 'calendar.dayTradesCount', { count: 4 })).toBe('4 trades')
  })

  it('fallback aman ke path key jika key tidak ditemukan', () => {
    expect(translate('id', 'non.existent.key')).toBe('non.existent.key')
    expect(translate('en', 'non.existent.key')).toBe('non.existent.key')
  })
})

describe('M0: Supabase Error Mapping Safety', () => {
  it('memetakan error invalid credentials ke pesan ramah bahasa Indonesia', () => {
    const err = { message: 'Invalid login credentials' }
    const result = mapSupabaseError(err, 'id')
    expect(result).toBe('Email atau password tidak sesuai.')
  })

  it('memetakan error invalid credentials ke pesan ramah bahasa Inggris', () => {
    const err = { message: 'Invalid login credentials' }
    const result = mapSupabaseError(err, 'en')
    expect(result).toBe('Invalid email or password.')
  })

  it('memetakan error password terlalu pendek', () => {
    const err = { message: 'Password should be at least 6 characters' }
    expect(mapSupabaseError(err, 'id')).toBe('Password minimal 6 karakter.')
    expect(mapSupabaseError(err, 'en')).toBe('Password must be at least 6 characters.')
  })

  it('memetakan error RLS tanpa membocorkan skema Postgres internal', () => {
    const err = { message: 'new row violates row-level security policy for table "journal_entries"' }
    expect(mapSupabaseError(err, 'id')).toBe('Akses ditolak. Anda tidak memiliki izin untuk data ini.')
    expect(mapSupabaseError(err, 'en')).toBe('Access denied. You do not have permission for this record.')
  })

  it('mengembalikan pesan generik untuk error tidak dikenal', () => {
    const err = { message: 'Unknown internal pg error code 42P01' }
    expect(mapSupabaseError(err, 'id')).toBe('Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.')
  })
})
