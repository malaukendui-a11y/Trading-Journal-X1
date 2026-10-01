import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { isSupabaseConfigured } from './lib/supabaseClient'

function FoundationDemo() {
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLanguage, t } = useLanguage()
  const supabaseReady = isSupabaseConfigured()

  return (
    <main className="min-h-screen p-8 bg-bg text-text-primary transition-colors duration-200 flex items-center justify-center">
      <div className="w-full max-w-lg p-6 rounded-xl bg-bg-panel border border-line shadow-sm space-y-6">
        <header>
          <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-accent/15 text-accent mb-2">
            M0 Fondasi
          </div>
          <h1 className="font-display text-accent text-2xl font-bold tracking-tight">
            {t('app.name')}
          </h1>
          <p className="font-body text-text-secondary text-sm mt-0.5">
            {t('app.tagline')}
          </p>
        </header>

        <section className="space-y-3 pt-2 border-t border-line">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t('settings.theme')}</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-panel-raised border border-line hover:border-accent transition-colors cursor-pointer"
            >
              {theme === 'dark' ? `🌙 ${t('settings.themeDark')}` : `☀️ ${t('settings.themeLight')}`}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t('settings.language')}</span>
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-panel-raised border border-line hover:border-accent transition-colors cursor-pointer"
            >
              🌐 {lang.toUpperCase()} — {lang === 'id' ? t('settings.langId') : t('settings.langEn')}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Koneksi Supabase</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
                supabaseReady
                  ? 'bg-sage/15 text-sage border border-sage/30'
                  : 'bg-brick/15 text-brick border border-brick/30'
              }`}
            >
              {supabaseReady ? 'Env Siap' : 'Env Belum Dikonfigurasi'}
            </span>
          </div>
        </section>

        <footer className="pt-3 border-t border-line text-xs text-text-secondary font-mono">
          Tokens, i18n, ThemeContext, LanguageContext & Supabase Client OK.
        </footer>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FoundationDemo />
      </LanguageProvider>
    </ThemeProvider>
  )
}