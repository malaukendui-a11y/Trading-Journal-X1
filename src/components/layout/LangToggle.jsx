import { Globe } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export function LangToggle({ lang, onToggle, className = '' }) {
  const { t } = useLanguage()

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${t('settings.language')}: ${lang.toUpperCase()}`}
      title={lang === 'id' ? t('settings.langEn') : t('settings.langId')}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-bg-panel hover:border-accent text-xs font-mono font-medium text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer ${className}`}
    >
      <Globe className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
      <span>{lang.toUpperCase()}</span>
    </button>
  )
}

