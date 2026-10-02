import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { logDevError } from '../lib/devLog.js'
import { supabase } from '../lib/supabaseClient.js'
import {
  buildUserSettingsPayload,
  validateLang,
  validateTheme,
} from '../lib/userSettingsHelpers.js'

const THEME_STORAGE_KEY = 'tc_theme'
const LANG_STORAGE_KEY = 'tc_lang'

export function useUserSettings() {
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
          logDevError('useUserSettings:fetchSettings', error)
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

          // Tulis juga ke localStorage agar pemuatan berikutnya tidak berkedip (Addition 1)
          try {
            localStorage.setItem(THEME_STORAGE_KEY, dbTheme)
            localStorage.setItem(LANG_STORAGE_KEY, dbLang)
          } catch (e) {
            // Abaikan kesalahan akses storage
          }
        }
        // Kalau baris tetap tidak ditemukan, JANGAN menimpa tema/bahasa yang sedang aktif (Addition 2)
      } catch (err) {
        logDevError('useUserSettings:fetchSettingsCatch', err)
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
  }, [user?.id, isSettingsInitialized, setTheme, setLanguage])

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
          logDevError('useUserSettings:updateTheme', error)
        } else if (!data || data.length === 0) {
          // Addition 3: update ke 0 baris dicatat
          logDevError('useUserSettings:updateTheme', {
            message: 'Update theme affected 0 rows in user_settings',
          })
        }
      } catch (err) {
        logDevError('useUserSettings:updateThemeCatch', err)
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
          logDevError('useUserSettings:updateLanguage', error)
        } else if (!data || data.length === 0) {
          // Addition 3: update ke 0 baris dicatat
          logDevError('useUserSettings:updateLanguage', {
            message: 'Update language affected 0 rows in user_settings',
          })
        }
      } catch (err) {
        logDevError('useUserSettings:updateLanguageCatch', err)
      }
    },
    [user?.id, setLanguage]
  )

  return {
    settings,
    loading,
    theme,
    lang,
    updateTheme,
    updateLanguage,
    balance: settings.balance,
    displayName: settings.display_name || user?.email?.split('@')[0] || 'Trader',
  }
}
