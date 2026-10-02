import { describe, expect, it } from 'vitest'
import {
  buildUserSettingsPayload,
  validateLang,
  validateTheme,
} from '../src/lib/userSettingsHelpers.js'

describe('M2: User Settings Validation Helpers', () => {
  it('memvalidasi tema hanya light atau dark, selain itu fallback ke dark', () => {
    expect(validateTheme('light')).toBe('light')
    expect(validateTheme('dark')).toBe('dark')
    expect(validateTheme('auto')).toBe('dark')
    expect(validateTheme('dim')).toBe('dark')
    expect(validateTheme('')).toBe('dark')
    expect(validateTheme(null)).toBe('dark')
    expect(validateTheme(undefined)).toBe('dark')
  })

  it('memvalidasi bahasa hanya id atau en, selain itu fallback ke id', () => {
    expect(validateLang('id')).toBe('id')
    expect(validateLang('en')).toBe('en')
    expect(validateLang('fr')).toBe('id')
    expect(validateLang('es')).toBe('id')
    expect(validateLang('')).toBe('id')
    expect(validateLang(null)).toBe('id')
    expect(validateLang(undefined)).toBe('id')
  })

  it('membangun payload pembaruan dengan menyertakan updated_at berformat ISO', () => {
    const payload = buildUserSettingsPayload({
      theme: 'light',
      lang: 'en',
      balance: 1500,
      displayName: 'Kenny Trader',
    })

    expect(payload.theme).toBe('light')
    expect(payload.lang).toBe('en')
    expect(payload.balance).toBe(1500)
    expect(payload.display_name).toBe('Kenny Trader')
    expect(payload.updated_at).toBeDefined()
    expect(new Date(payload.updated_at).toString()).not.toBe('Invalid Date')
  })

  it('menangani nilai tidak valid saat membangun payload update', () => {
    const payload = buildUserSettingsPayload({
      theme: 'invalid-theme',
      lang: 'invalid-lang',
      balance: -50,
      displayName: '',
    })

    expect(payload.theme).toBe('dark')
    expect(payload.lang).toBe('id')
    expect(payload.balance).toBe(0)
    expect(payload.display_name).toBe('Trader')
  })
})

