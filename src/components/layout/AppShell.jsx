import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useUserSettings } from '../../hooks/useUserSettings.js'
import { SidebarNav } from './SidebarNav.jsx'
import { TopBar } from './TopBar.jsx'

export function AppShell({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const {
    theme,
    lang,
    updateTheme,
    updateLanguage,
    balance,
    displayName,
  } = useUserSettings()

  return (
    <div className="min-h-screen bg-bg text-text-primary flex transition-colors duration-200">
      {/* Sidebar Nav (Desktop Sticky + Mobile Drawer) */}
      <SidebarNav
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          isMobileOpen={isMobileOpen}
          onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
          theme={theme}
          onToggleTheme={() => updateTheme(theme === 'dark' ? 'light' : 'dark')}
          lang={lang}
          onToggleLang={() => updateLanguage(lang === 'id' ? 'en' : 'id')}
          balance={balance}
          displayName={displayName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

