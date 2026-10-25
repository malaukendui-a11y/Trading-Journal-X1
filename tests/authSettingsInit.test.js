import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

// Mock Supabase: tanpa jaringan. Effect tidak berjalan di SSR, jadi yang diuji adalah kontrak value awal AuthContext.
vi.mock('../src/lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => {
      throw new Error('Tes ini tidak boleh memanggil Supabase')
    },
  },
}))

import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx'
import { LanguageProvider } from '../src/context/LanguageContext.jsx'
import { ThemeProvider } from '../src/context/ThemeContext.jsx'

function renderAuthValue() {
  let captured = null
  function Probe() {
    captured = useAuth()
    return null
  }

  renderToString(
    createElement(
      ThemeProvider,
      null,
      createElement(LanguageProvider, null, createElement(AuthProvider, null, createElement(Probe)))
    )
  )
  return captured
}

describe('REG-11: gerbang baca user_settings (FR-DASH-2, design §6.3)', () => {
  it('AuthContext menyediakan isSettingsInitialized bertipe boolean yang ditunggu UserSettingsContext', () => {
    const auth = renderAuthValue()
    expect(typeof auth.isSettingsInitialized).toBe('boolean')
  })

  it('isSettingsInitialized bernilai false sebelum ada sesi dan upsert baris default', () => {
    const auth = renderAuthValue()
    expect(auth.user).toBeNull()
    expect(auth.isSettingsInitialized).toBe(false)
  })
})
