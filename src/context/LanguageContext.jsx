import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { translate } from '../lib/i18n.js'

const LANG_STORAGE_KEY = 'tc_lang'
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY)
      if (stored === 'id' || stored === 'en') {
        return stored
      }
    } catch {
      // Fallback aman jika localStorage tidak dapat diakses
    }
    return 'id' // Default bahasa Indonesia sesuai AGENTS.md
  })

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {
      // Abaikan jika penyimpanan lokal gagal
    }
    // Update atribut lang di tag <html> untuk SEO & aksesibilitas
    document.documentElement.lang = lang
  }, [lang])

  const setLanguage = (newLang) => {
    if (newLang === 'id' || newLang === 'en') {
      setLangState(newLang)
    }
  }

  const toggleLanguage = () => {
    setLangState((prev) => (prev === 'id' ? 'en' : 'id'))
  }

  // Helper penerjemahan yang otomatis terikat dengan bahasa aktif
  const t = useCallback(
    (path, params = {}) => {
      return translate(lang, path, params)
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
