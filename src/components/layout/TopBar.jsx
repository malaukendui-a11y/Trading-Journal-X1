import { Menu, Wallet, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import BrandLogo from '../ui/BrandLogo.jsx'
import { LangToggle } from './LangToggle.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'

export function TopBar({
  isMobileOpen,
  onToggleMobile,
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
  balance = 0,
  displayName = 'Trader',
}) {
  const { t } = useLanguage()

  // Format saldo ringkas ke format mata uang ($X,XXX.XX)
  const formattedBalance = new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance || 0)

  return (
    <header className="sticky top-4 z-30 mx-4 mt-4 glass-strong rounded-[20px] px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
        {/* Mobile Left: Hamburger button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onToggleMobile}
            aria-label={isMobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={isMobileOpen}
            className="p-2 rounded-xl border border-line bg-bg-panel-raised hover:border-accent-border text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-accent-text" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5 text-text-primary" aria-hidden="true" />
            )}
          </button>
          <BrandLogo />
        </div>

        {/* Desktop Left: Welcome text or title */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-xs text-text-secondary">
            {t('app.tagline')}
          </span>
        </div>

        {/* Right side: Saldo, Profil & Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Saldo ringkas read-only (Addition 5) */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-bg-panel-raised text-xs"
            title={`${t('dashboard.balanceLabel')}: ${formattedBalance}`}
          >
            <Wallet className="w-3.5 h-3.5 text-accent-text" aria-hidden="true" />
            <span className="text-text-secondary hidden sm:inline">{t('common.balance')}:</span>
            <span className="tabular-nums font-medium text-text-primary">{formattedBalance}</span>
          </div>

          {/* Nama Tampilan User (Desktop only) */}
          <div className="hidden md:flex items-center px-2 py-1 text-xs font-medium text-text-secondary">
            <span className="truncate max-w-[140px]" title={displayName}>
              {displayName}
            </span>
          </div>

          <div className="h-4 w-px bg-line hidden sm:block" />

          {/* Theme & Language Toggles */}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <LangToggle lang={lang} onToggle={onToggleLang} />
        </div>
      </div>
    </header>
  )
}

