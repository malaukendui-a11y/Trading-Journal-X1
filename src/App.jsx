import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AppShell } from './components/layout/AppShell.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { JournalProvider } from './context/JournalContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AnalyticsPage } from './pages/AnalyticsPage.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { CalculatorPage } from './pages/CalculatorPage.jsx'
import { CalendarPage } from './pages/CalendarPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { JournalPage } from './pages/JournalPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx'

function ProtectedLayout() {
  const { user } = useAuth()

  return (
    <JournalProvider key={user?.id || 'guest'}>
      <AppShell>
        <Outlet />
      </AppShell>
    </JournalProvider>
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