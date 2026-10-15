import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 space-y-4">
        <div className="tabular-nums text-4xl font-semibold text-accent-text">404</div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.01em] text-text-primary">
          {t('common.notFoundTitle')}
        </h1>
        <p className="text-sm text-text-secondary">
          {t('common.notFoundDesc')}
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-11 px-4 py-2 rounded-xl text-[15px] font-semibold bg-accent-solid text-white shadow-[0_0_18px_rgba(145,121,214,.35)] hover:brightness-105 transition-all"
          >
            {t('common.backToHome')}
          </Link>
        </div>
      </Card>
    </div>
  )
}

