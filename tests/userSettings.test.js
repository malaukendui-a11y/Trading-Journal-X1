import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import {
  buildUserSettingsPayload,
  validateBalanceInput,
  validateLang,
  validateTheme,
} from '../src/lib/userSettingsHelpers.js'
import { useUserSettings } from '../src/hooks/useUserSettings.js'

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

describe('M5: validateBalanceInput (FR-DASH-2)', () => {
  it('menolak string kosong dan spasi tanpa mengubahnya menjadi 0', () => {
    const emptyRes = validateBalanceInput('')
    expect(emptyRes.ok).toBe(false)
    expect(emptyRes.error).toBe('dashboard.errorInvalidBalance')

    const spaceRes = validateBalanceInput('   ')
    expect(spaceRes.ok).toBe(false)
    expect(spaceRes.error).toBe('dashboard.errorInvalidBalance')
  })

  it('menolak angka negatif, angka melebihi 1e12, dan string non-numerik', () => {
    const negRes = validateBalanceInput('-1')
    expect(negRes.ok).toBe(false)
    expect(negRes.error).toBe('dashboard.errorInvalidBalance')

    const overRes = validateBalanceInput('1e13')
    expect(overRes.ok).toBe(false)
    expect(overRes.error).toBe('dashboard.errorInvalidBalance')

    const abcRes = validateBalanceInput('abc')
    expect(abcRes.ok).toBe(false)
    expect(abcRes.error).toBe('dashboard.errorInvalidBalance')
  })

  it('menerima angka valid seperti 0 dan 1000', () => {
    const zeroRes = validateBalanceInput('0')
    expect(zeroRes.ok).toBe(true)
    expect(zeroRes.value).toBe(0)

    const thousandRes = validateBalanceInput('1000')
    expect(thousandRes.ok).toBe(true)
    expect(thousandRes.value).toBe(1000)

    const numZero = validateBalanceInput(0)
    expect(numZero.ok).toBe(true)
    expect(numZero.value).toBe(0)

    const numThousand = validateBalanceInput(1000)
    expect(numThousand.ok).toBe(true)
    expect(numThousand.value).toBe(1000)
  })
})

describe('M5: useUserSettings Consumer Hook', () => {
  it('melempar error jika digunakan di luar UserSettingsProvider', () => {
    function ConsumerWithoutProvider() {
      useUserSettings()
      return null
    }

    expect(() => {
      renderToString(createElement(ConsumerWithoutProvider))
    }).toThrow('useUserSettings must be used within a UserSettingsProvider')
  })
})


