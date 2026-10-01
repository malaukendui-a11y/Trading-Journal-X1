import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/ui/BrandLogo.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import {
  mapAuthError,
  validatePassword,
  validatePasswordConfirmation,
} from '../lib/authHelpers.js'

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecoveryReady, setIsRecoveryReady] = useState(false)

  const { user, session, authEvent, updatePassword } = useAuth()
  const { lang, toggleLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Perbaikan 2: Halaman ini TETAP TAMPIL walau session sudah ada (sesi pemulihan PASSWORD_RECOVERY)
  useEffect(() => {
    // Supabase sets authEvent to 'PASSWORD_RECOVERY' when opening from reset password email link
    // or provides an active recovery session in the URL hash
    if (authEvent === 'PASSWORD_RECOVERY' || session || user) {
      setIsRecoveryReady(true)
    }
  }, [authEvent, session, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    // 1. Validasi password minimal 6 karakter
    if (!validatePassword(newPassword)) {
      setFormError(t('auth.passwordMinLength'))
      return
    }

    // 2. Validasi kecocokan konfirmasi password
    if (!validatePasswordConfirmation(newPassword, confirmPassword)) {
      setFormError(t('auth.passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(newPassword)
      setSuccessMessage(t('auth.updatePasswordSuccess'))

      // Perbaikan 1: Pengguna sudah login lewat sesi pemulihan, jadi langsung arahkan ke Dashboard ("/")
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1500)
    } catch (err) {
      const errorKey = mapAuthError(err)
      setFormError(t(errorKey))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Header bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <BrandLogo />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-line bg-bg-panel hover:border-accent transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium border border-line bg-bg-panel hover:border-accent transition-colors cursor-pointer"
            aria-label="Toggle Language"
          >
            {lang.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main container */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border border-line bg-bg-panel shadow-md">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
              {t('auth.resetPasswordTitle')}
            </h1>
            <p className="text-xs text-text-secondary mt-1 font-body">
              {t('auth.resetPasswordSubtitle')}
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg text-xs font-medium bg-brick/10 border border-brick/30 text-brick animate-in fade-in"
            >
              {formError}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-4 p-3 rounded-lg text-xs font-medium bg-sage/10 border border-sage/30 text-sage animate-in fade-in"
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.newPasswordLabel')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.newPasswordPlaceholder')}
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            <Input
              label={t('auth.confirmPasswordLabel')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? t('auth.updating') : t('auth.updatePasswordButton')}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-line text-center text-xs text-text-secondary">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-accent hover:underline font-medium cursor-pointer"
            >
              ← {t('auth.backToLogin')}
            </button>
          </div>
        </Card>
      </main>

      <footer className="text-center py-2 text-xs text-text-secondary">
        Trading Compass &bull; {t('app.tagline')}
      </footer>
    </div>
  )
}

