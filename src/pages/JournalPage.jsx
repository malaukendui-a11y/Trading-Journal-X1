import { Card } from '../components/ui/Card.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export function JournalPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {t('journal.title')}
        </h1>
        <p className="font-body text-xs text-text-secondary mt-1">
          {t('journal.subtitle')}
        </p>
      </div>

      <Card className="border border-line bg-bg-panel p-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <p className="text-sm text-text-secondary">
            {t('common.moduleUpcoming')} (M3: Trading Journal)
          </p>
        </div>
      </Card>
    </div>
  )
}
