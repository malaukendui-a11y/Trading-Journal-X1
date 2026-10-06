import { useMemo } from 'react'
import { AnalyticsView } from '../components/analytics/AnalyticsView.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useJournalEntries } from '../hooks/useJournalEntries.js'
import {
  disciplineScore,
  equityCurve,
  rDistribution,
} from '../lib/analyticsCalculations.js'

export function AnalyticsPage() {
  const { t, lang } = useLanguage()
  const { entries, loading, error, refetch } = useJournalEntries()

  // 1. Hitung Equity Curve kumulatif (FR-ANA-1)
  const equityData = useMemo(() => equityCurve(entries), [entries])

  // 2. Hitung Distribusi R-Multiple 9 bin (FR-ANA-2)
  const rDistData = useMemo(() => rDistribution(entries), [entries])

  // 3. Hitung Skor Disiplin Eksekusi (FR-ANA-3)
  const score = useMemo(() => disciplineScore(entries), [entries])

  return (
    <AnalyticsView
      loading={loading}
      error={error}
      onRetry={refetch}
      tradesCount={entries?.length || 0}
      equityData={equityData}
      rDistData={rDistData}
      score={score}
      t={t}
      lang={lang}
    />
  )
}

