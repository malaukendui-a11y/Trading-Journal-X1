import {
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  LayoutDashboard,
  LogOut,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import BrandLogo from '../ui/BrandLogo.jsx'

export function SidebarNav({ isMobileOpen, onCloseMobile }) {
  const { signOut } = useAuth()
  const { t } = useLanguage()

  // Tutup drawer mobile saat pengguna menekan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileOpen, onCloseMobile])

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/calculator', label: t('nav.calculator'), icon: Calculator, end: false },
    { to: '/journal', label: t('nav.journal'), icon: BookOpen, end: false },
    { to: '/calendar', label: t('nav.calendar'), icon: Calendar, end: false },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3, end: false },
  ]

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-line">
          <BrandLogo />
          {/* Close button inside mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-panel-raised focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label={t('nav.closeMenu')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* 5 Navigation Links */}
        <nav aria-label="Main Navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end} // Addition 4: end={true} untuk '/'
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                    isActive
                      ? 'bg-accent/15 text-accent font-semibold border-l-2 border-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-panel-raised font-medium'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer: HANYA tombol Keluar (Addition 5) */}
      <div className="pt-4 border-t border-line">
        <button
          type="button"
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-brick hover:bg-brick/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brick/40 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (>= 1024px): Fixed Sticky */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-bg-panel border-r border-line z-20 transition-colors duration-200">
        {navContent}
      </aside>

      {/* Mobile Drawer (< 1024px): Slide-over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            className="fixed inset-y-0 left-0 w-72 bg-bg-panel border-r border-line shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  )
}
