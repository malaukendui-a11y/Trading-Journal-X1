import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/ui/BrandLogo.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { logDevError } from '../lib/devLog.js'
import {
  getPasswordPolicyErrorKey,
  mapAuthError,
  validateEmail,
  validateLoginPassword,
  validatePassword,
  validatePasswordConfirmation,
} from '../lib/authHelpers.js'

export function AuthPage() {
  const [tab, setTab] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user, loading, signIn, signUp, sendPasswordReset } = useAuth()
  const { lang, toggleLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Jika pengguna sudah login, arahkan langsung ke Dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const clearFeedback = () => {
    setFormError('')
    setSuccessMessage('')
  }

  const handleTabChange = (newTab) => {
    setTab(newTab)
    clearFeedback()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearFeedback()

    // 1. Validasi input client-side
    if (!validateEmail(email)) {
      setFormError(t('auth.errorInvalidEmail'))
      return
    }

    if (tab === 'login') {
      if (!validateLoginPassword(password)) {
        setFormError(t('auth.passwordRequired'))
        return
      }
    }

    if (tab === 'register') {
      if (!validatePassword(password)) {
        const errorKey = getPasswordPolicyErrorKey(password) || 'auth.passwordPolicy'
        setFormError(t(errorKey))
        return
      }
      if (!validatePasswordConfirmation(password, confirmPassword)) {
        setFormError(t('auth.passwordMismatch'))
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (tab === 'login') {
        await signIn(email, password)
        navigate('/', { replace: true })
      } else if (tab === 'register') {
        const data = await signUp(email, password)
        // Perbaikan 5: Jika session langsung ada, arahkan ke Dashboard.
        // Jika session null (konfirmasi email aktif), tampilkan pesan ramah tanpa error.
        if (data?.session) {
          navigate('/', { replace: true })
        } else {
          setSuccessMessage(t('auth.checkEmailConfirm'))
          setPassword('')
          setConfirmPassword('')
        }
      } else if (tab === 'forgot') {
        await sendPasswordReset(email)
        setSuccessMessage(t('auth.resetSent'))
      }
    } catch (err) {
      logDevError('AuthPage:handleSubmit', err)
      const errorKey = mapAuthError(err)
      setFormError(t(errorKey))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top utility bar: Logo & quick toggles */}
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

      {/* Main card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border border-line bg-bg-panel shadow-md">
          {/* Header & Tagline */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
              {tab === 'login' && t('auth.loginTab')}
              {tab === 'register' && t('auth.registerTab')}
              {tab === 'forgot' && t('auth.forgotTab')}
            </h1>
            <p className="text-xs text-text-secondary mt-1 font-body">
              {t('app.tagline')}
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex p-1 bg-bg-panel-raised rounded-lg border border-line mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === 'login'
                  ? 'bg-bg-panel text-text-primary shadow-xs font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('auth.loginTab')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === 'register'
                  ? 'bg-bg-panel text-text-primary shadow-xs font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('auth.registerTab')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('forgot')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === 'forgot'
                  ? 'bg-bg-panel text-text-primary shadow-xs font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('auth.forgotTab')}
            </button>
          </div>

          {/* Status alerts */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.emailLabel')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              autoComplete="email"
              disabled={isSubmitting}
            />

            {tab !== 'forgot' && (
              <Input
                label={t('auth.passwordLabel')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                disabled={isSubmitting}
              />
            )}

            {tab === 'register' && (
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
            )}

            {tab === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleTabChange('forgot')}
                  className="text-xs text-accent hover:underline cursor-pointer"
                >
                  {t('auth.forgotPasswordLink')}
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {tab === 'login' && (isSubmitting ? t('auth.submitting') : t('auth.loginButton'))}
              {tab === 'register' && (isSubmitting ? t('auth.submitting') : t('auth.registerButton'))}
              {tab === 'forgot' && (isSubmitting ? t('auth.submitting') : t('auth.forgotButton'))}
            </Button>
          </form>

          {/* Secondary links */}
          <div className="mt-6 pt-4 border-t border-line text-center text-xs text-text-secondary">
            {tab === 'login' && (
              <span>
                {t('auth.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="text-accent hover:underline font-medium cursor-pointer"
                >
                  {t('auth.registerTab')}
                </button>
              </span>
            )}
            {tab === 'register' && (
              <span>
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="text-accent hover:underline font-medium cursor-pointer"
                >
                  {t('auth.loginTab')}
                </button>
              </span>
            )}
            {tab === 'forgot' && (
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className="text-accent hover:underline font-medium cursor-pointer"
              >
                ← {t('auth.backToLogin')}
              </button>
            )}
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-text-secondary">
        Trading Compass &bull; {t('app.tagline')}
      </footer>
    </div>
  )
}

