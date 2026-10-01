import { describe, expect, it } from 'vitest'
import {
  mapAuthError,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '../src/lib/authHelpers.js'
import { translate, translations } from '../src/lib/i18n.js'

describe('M1: Auth Validation Helpers', () => {
  it('memvalidasi format email dengan benar', () => {
    expect(validateEmail('trader@example.com')).toBe(true)
    expect(validateEmail('user.name+tag@sub.domain.co')).toBe(true)
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('trader@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail(null)).toBe(false)
  })

  it('memvalidasi panjang password minimal 6 karakter', () => {
    expect(validatePassword('123456')).toBe(true)
    expect(validatePassword('securePass123!')).toBe(true)
    expect(validatePassword('12345')).toBe(false)
    expect(validatePassword('')).toBe(false)
    expect(validatePassword(null)).toBe(false)
  })

  it('memvalidasi kecocokan konfirmasi password', () => {
    expect(validatePasswordConfirmation('secret123', 'secret123')).toBe(true)
    expect(validatePasswordConfirmation('secret123', 'secret456')).toBe(false)
    expect(validatePasswordConfirmation('secret123', '')).toBe(false)
    expect(validatePasswordConfirmation('', '')).toBe(false)
  })
})

describe('M1: mapAuthError Code Mapping to i18n Keys', () => {
  it('memetakan kredensial tidak valid ke auth.errorInvalidCredentials', () => {
    expect(mapAuthError({ code: 'invalid_credentials' })).toBe('auth.errorInvalidCredentials')
    expect(mapAuthError({ message: 'Invalid login credentials' })).toBe('auth.errorInvalidCredentials')
    expect(mapAuthError({ code: 'invalid_grant' })).toBe('auth.errorInvalidCredentials')
  })

  it('memetakan email sudah terdaftar ke auth.errorUserAlreadyRegistered', () => {
    expect(mapAuthError({ code: 'user_already_exists' })).toBe('auth.errorUserAlreadyRegistered')
    expect(mapAuthError({ message: 'User already registered' })).toBe('auth.errorUserAlreadyRegistered')
    expect(mapAuthError({ code: 'email_exists' })).toBe('auth.errorUserAlreadyRegistered')
  })

  it('memetakan password lemah ke auth.errorWeakPassword', () => {
    expect(mapAuthError({ code: 'weak_password' })).toBe('auth.errorWeakPassword')
    expect(mapAuthError({ message: 'Password should be at least 6 characters' })).toBe('auth.errorWeakPassword')
  })

  it('memetakan rate limit (over_email_send_rate_limit, 429) ke auth.errorRateLimit', () => {
    expect(mapAuthError({ code: 'over_email_send_rate_limit' })).toBe('auth.errorRateLimit')
    expect(mapAuthError({ status: 429 })).toBe('auth.errorRateLimit')
    expect(mapAuthError({ message: 'Email rate limit exceeded' })).toBe('auth.errorRateLimit')
  })

  it('memetakan error tak dikenal ke fallback aman auth.errorGeneric', () => {
    expect(mapAuthError({ code: 'random_db_error_500' })).toBe('auth.errorGeneric')
    expect(mapAuthError('Internal database table error')).toBe('auth.errorGeneric')
  })

  it('semua kunci error yang dipetakan wajib ada di kamus ID dan EN', () => {
    const errorKeys = [
      'auth.errorInvalidCredentials',
      'auth.errorUserAlreadyRegistered',
      'auth.errorWeakPassword',
      'auth.errorRateLimit',
      'auth.errorGeneric',
      'auth.errorInvalidEmail',
      'auth.checkEmailConfirm',
    ]

    for (const key of errorKeys) {
      const idText = translate('id', key)
      const enText = translate('en', key)

      // Memastikan bukan mengembalikan key aslinya (berarti ditemukan di kamus)
      expect(idText).not.toBe(key)
      expect(enText).not.toBe(key)
      expect(typeof idText).toBe('string')
      expect(typeof enText).toBe('string')
      expect(idText.length).toBeGreaterThan(0)
      expect(enText.length).toBeGreaterThan(0)
    }
  })
})

