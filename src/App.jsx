import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AppShell } from './components/layout/AppShell.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
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

              {/* Rute Terproteksi dengan AppShell Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <DashboardPage />
                    </AppShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calculator"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <CalculatorPage />
                    </AppShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journal"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <JournalPage />
                    </AppShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <CalendarPage />
                    </AppShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <AnalyticsPage />
                    </AppShell>
                  </ProtectedRoute>
                }
              />

              {/* Halaman Tidak Ditemukan (404) */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <NotFoundPage />
                    </AppShell>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}