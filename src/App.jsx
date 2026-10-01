import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import BrandLogo from './components/ui/BrandLogo.jsx'
import { Button } from './components/ui/Button.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx'

function DashboardPlaceholder() {
  const { user, signOut } = useAuth()
  const { t, lang, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="min-h-screen p-6 sm:p-12 bg-bg text-text-primary flex items-center justify-center transition-colors duration-200">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-xl bg-bg-panel border border-line shadow-sm space-y-6">
        <header className="flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-line bg-bg-panel-raised hover:border-accent transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium border border-line bg-bg-panel-raised hover:border-accent transition-colors cursor-pointer"
              aria-label="Toggle Language"
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </header>

        <section className="space-y-3 pt-4 border-t border-line">
          <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-sage/15 text-sage border border-sage/30">
            ✓ Terotentikasi (FR-AUTH OK)
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary">
            {user?.email}
          </h2>
          <p className="text-xs text-text-secondary font-mono break-all">
            User ID: {user?.id}
          </p>
          <p className="text-xs text-text-secondary pt-2">
            Autentikasi (M1) berhasil diverifikasi. Halaman Dashboard & navigasi lengkap akan dibangun pada modul berikutnya.
          </p>
        </section>

        <footer className="pt-4 border-t border-line flex items-center justify-between">
          <span className="text-xs text-text-secondary font-mono">Status: Sesi Aktif</span>
          <Button
            variant="danger"
            size="sm"
            onClick={signOut}
          >
            {t('nav.logout')}
          </Button>
        </footer>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              {/* Rute Publik */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Rute Terproteksi */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPlaceholder />
                  </ProtectedRoute>
                }
              />

              {/* Fallback ke root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}