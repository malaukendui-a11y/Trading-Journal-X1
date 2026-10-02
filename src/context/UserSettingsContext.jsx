import { createContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useLanguage } from './LanguageContext.jsx'
import { useTheme } from './ThemeContext.jsx'
import { logDevError } from '../lib/devLog.js'
import { supabase } from '../lib/supabaseClient.js'
import {
  buildUserSettingsPayload,
  validateBalanceInput,
  validateLang,
  validateTheme,
} from '../lib/userSettingsHelpers.js'

const THEME_STORAGE_KEY = 'tc_theme'
const LANG_STORAGE_KEY = 'tc_lang'

export const UserSettingsContext = createContext(null)

export function UserSettingsProvider({ children }) {
  const { user, isSettingsInitialized } = useAuth()
  const { theme, setTheme } = useTheme()
  const { lang, setLanguage } = useLanguage()

  const [settings, setSettings] = useState({
    balance: 0,
    display_name: 'Trader',
    lang: 'id',
    theme: 'dark',
  })
  const [loading, setLoading] = useState(true)

  // Mengambil data user_settings setelah inisialisasi baris default M1 selesai
  useEffect(() => {
    if (!user?.id || !isSettingsInitialized) {
      setLoading(false)
      return
    }

    let isCancelled = false
    setLoading(true)

    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('user_id, display_name, balance, lang, theme')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          logDevError('UserSettingsContext:fetchSettings', error)
          return
        }

        if (isCancelled) return

        // Kalau baris ditemukan: terapkan nilai database (database MENANG atas localStorage)
        if (data) {
          const dbTheme = validateTheme(data.theme)
          const dbLang = validateLang(data.lang)

          setSettings({
            balance: Number(data.balance) || 0,
            display_name: data.display_name || user.email?.split('@')[0] || 'Trader',
            lang: dbLang,
            theme: dbTheme,
          })

          // Terapkan ke Context
          setTheme(dbTheme)
          setLanguage(dbLang)

          // Tulis juga ke localStorage agar pemuatan berikutnya tidak berkedip
          try {
            localStorage.setItem(THEME_STORAGE_KEY, dbTheme)
            localStorage.setItem(LANG_STORAGE_KEY, dbLang)
          } catch (e) {
            // Abaikan kesalahan akses storage
          }
        }
      } catch (err) {
        logDevError('UserSettingsContext:fetchSettingsCatch', err)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchSettings()

    return () => {
      isCancelled = true
    }
  }, [user?.id, user?.email, isSettingsInitialized, setTheme, setLanguage])

  // Update theme secara optimis di UI + simpan ke DB
  const updateTheme = useCallback(
    async (newTheme) => {
      const validTheme = validateTheme(newTheme)

      // 1. Optimistic UI update
      setTheme(validTheme)
      setSettings((prev) => ({ ...prev, theme: validTheme }))
      try {
        localStorage.setItem(THEME_STORAGE_KEY, validTheme)
      } catch (e) {}

      if (!user?.id) return

      // 2. Persist ke DB
      try {
        const payload = buildUserSettingsPayload({ theme: validTheme })
        const { data, error } = await supabase
          .from('user_settings')
          .update(payload)
          .eq('user_id', user.id)
          .select('user_id')

        if (error) {
          logDevError('UserSettingsContext:updateTheme', error)
        } else if (!data || data.length === 0) {
          logDevError('UserSettingsContext:updateTheme', {
            message: 'Update theme affected 0 rows in user_settings',
          })
        }
      } catch (err) {
        logDevError('UserSettingsContext:updateThemeCatch', err)
      }
    },
    [user?.id, setTheme]
  )

  // Update language secara optimis di UI + simpan ke DB
  const updateLanguage = useCallback(
    async (newLang) => {
      const validLang = validateLang(newLang)

      // 1. Optimistic UI update
      setLanguage(validLang)
      setSettings((prev) => ({ ...prev, lang: validLang }))
      try {
        localStorage.setItem(LANG_STORAGE_KEY, validLang)
      } catch (e) {}

      if (!user?.id) return

      // 2. Persist ke DB
      try {
        const payload = buildUserSettingsPayload({ lang: validLang })
        const { data, error } = await supabase
          .from('user_settings')
          .update(payload)
          .eq('user_id', user.id)
          .select('user_id')

        if (error) {
          logDevError('UserSettingsContext:updateLanguage', error)
        } else if (!data || data.length === 0) {
          logDevError('UserSettingsContext:updateLanguage', {
            message: 'Update language affected 0 rows in user_settings',
          })
        }
      } catch (err) {
        logDevError('UserSettingsContext:updateLanguageCatch', err)
      }
    },
    [user?.id, setLanguage]
  )

  // Update balance sesuai FR-DASH-2 (tidak throw, mengembalikan { ok, error|balance })
  const updateBalance = useCallback(
    async (rawVal) => {
      const valRes = validateBalanceInput(rawVal)
      if (!valRes.ok) {
        return { ok: false, error: valRes.error }
      }

      // Jika nilainya tidak berubah dari state saat ini, lewati request
      if (valRes.value === settings.balance) {
        return { ok: true, unchanged: true, balance: settings.balance }
      }

      if (!user?.id) {
        return { ok: false, error: 'common.error' }
      }

      try {
        const payload = buildUserSettingsPayload({ balance: valRes.value })
        const { data, error } = await supabase
          .from('user_settings')
          .update(payload)
          .eq('user_id', user.id)
          .select('user_id, balance')

        if (error) {
          logDevError('UserSettingsContext:updateBalance', error)
          return { ok: false, error: 'dashboard.errorBalanceSave' }
        }

        if (!data || data.length === 0) {
          logDevError('UserSettingsContext:updateBalance', {
            message: 'Update balance affected 0 rows in user_settings',
          })
          return { ok: false, error: 'dashboard.errorBalanceSave' }
        }

        const newBalance = Number(data[0].balance)
        setSettings((prev) => ({ ...prev, balance: newBalance }))
        return { ok: true, balance: newBalance }
      } catch (err) {
        logDevError('UserSettingsContext:updateBalanceCatch', err)
        return { ok: false, error: 'dashboard.errorBalanceSave' }
      }
    },
    [user?.id, settings.balance]
  )

  const value = {
    settings,
    loading,
    theme,
    lang,
    updateTheme,
    updateLanguage,
    updateBalance,
    balance: settings.balance,
    displayName: settings.display_name || user?.email?.split('@')[0] || 'Trader',
  }

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  )
}
