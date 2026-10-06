import { lazy, Suspense } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AppShell } from './components/layout/AppShell.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { JournalProvider } from './context/JournalContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UserSettingsProvider } from './context/UserSettingsContext.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { CalculatorPage } from './pages/CalculatorPage.jsx'
import { CalendarPage } from './pages/CalendarPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { JournalPage } from './pages/JournalPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx'

const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage.jsx').then((m) => ({ default: m.AnalyticsPage }))
)

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-line/60 rounded-md" />
        <div className="h-4 w-72 bg-line/40 rounded-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-line/20 rounded-xl" />
        <div className="h-72 bg-line/20 rounded-xl" />
      </div>
      <div className="h-72 bg-line/20 rounded-xl" />
    </div>
  )
}

function ProtectedLayout() {
  const { user } = useAuth()

  return (
    <UserSettingsProvider key={user?.id || 'guest'}>
      <JournalProvider key={user?.id || 'guest'}>
        <AppShell>
          <Outlet />
        </AppShell>
      </JournalProvider>
    </UserSettingsProvider>
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

              {/* Rute Terproteksi dengan AppShell Layout & JournalProvider */}
              <Route
                element={
                  <ProtectedRoute>
                    <ProtectedLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route
                  path="/analytics"
                  element={
                    <Suspense fallback={<AnalyticsSkeleton />}>
                      <AnalyticsPage />
                    </Suspense>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}