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
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx'

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage.jsx').then((m) => ({ default: m.DashboardPage }))
)
const CalculatorPage = lazy(() =>
  import('./pages/CalculatorPage.jsx').then((m) => ({ default: m.CalculatorPage }))
)
const JournalPage = lazy(() =>
  import('./pages/JournalPage.jsx').then((m) => ({ default: m.JournalPage }))
)
const CalendarPage = lazy(() =>
  import('./pages/CalendarPage.jsx').then((m) => ({ default: m.CalendarPage }))
)
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage.jsx').then((m) => ({ default: m.AnalyticsPage }))
)

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-bg-panel-raised rounded-md" />
        <div className="h-4 w-72 bg-bg-panel-raised rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-bg-panel-raised rounded-[20px]" />
        <div className="h-24 bg-bg-panel-raised rounded-[20px]" />
        <div className="h-24 bg-bg-panel-raised rounded-[20px]" />
        <div className="h-24 bg-bg-panel-raised rounded-[20px]" />
      </div>
      <div className="h-72 bg-bg-panel-raised rounded-[20px]" />
    </div>
  )
}

function ProtectedLayout() {
  const { user } = useAuth()

  return (
    <UserSettingsProvider key={user?.id || 'guest'}>
      <JournalProvider key={user?.id || 'guest'}>
        <AppShell>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
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
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}