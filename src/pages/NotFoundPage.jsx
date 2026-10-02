import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 border border-line bg-bg-panel space-y-4">
        <div className="font-mono text-4xl font-bold text-accent">404</div>
        <h1 className="font-display text-xl font-bold text-text-primary">
          {t('common.notFoundTitle')}
        </h1>
        <p className="text-sm text-text-secondary">
          {t('common.notFoundDesc')}
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:brightness-105 transition-all"
          >
            {t('common.backToHome')}
          </Link>
        </div>
      </Card>
    </div>
  )
}
