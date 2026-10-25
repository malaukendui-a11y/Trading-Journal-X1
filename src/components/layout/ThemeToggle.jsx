import { Moon, Sun } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export function ThemeToggle({ theme, onToggle, className = '' }) {
  const { t } = useLanguage()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? t('settings.themeLight') : t('settings.themeDark')}
      title={isDark ? t('settings.themeLight') : t('settings.themeDark')}
      className={`p-2 rounded-xl border border-line bg-bg-panel-raised hover:border-accent-border text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-accent-text" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-text-primary" aria-hidden="true" />
      )}
    </button>
  )
}

