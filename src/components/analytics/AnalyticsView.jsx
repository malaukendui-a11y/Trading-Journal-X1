import { Card } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { EquityCurveChart } from './EquityCurveChart.jsx'
import { RDistributionChart } from './RDistributionChart.jsx'
import { DisciplineRing } from './DisciplineRing.jsx'

/**
 * Komponen murni visualisasi Analytics (FR-ANA-1 s.d. FR-ANA-5).
 * Hanya menerima props (termasuk t dan lang), tanpa context dan tanpa Supabase.
 */
export function AnalyticsView({
  loading = false,
  error = null,
  onRetry,
  tradesCount = 0,
  equityData = [],
  rDistData = { bins: [], excluded: 0, excludedReasons: { missing: 0, invalidRisk: 0 } },
  score = null,
  chartWidth,
  chartHeight,
  t,
  lang,
}) {
  // 1. Loading State (Skeleton)
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={t('common.loading')}>
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-line/60 rounded-md" />
          <div className="h-4 w-72 bg-line/40 rounded-md" />
        </div>

        {/* 3 Kartu Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 border border-line bg-bg-panel space-y-4">
            <div className="h-5 w-48 bg-line/50 rounded" />
            <div className="h-64 bg-line/30 rounded-lg" />
          </Card>
          <Card className="p-5 border border-line bg-bg-panel space-y-4 flex flex-col items-center justify-center">
            <div className="h-5 w-36 bg-line/50 rounded" />
            <div className="w-40 h-40 rounded-full bg-line/30" />
          </Card>
        </div>

        <Card className="p-5 border border-line bg-bg-panel space-y-4">
          <div className="h-5 w-56 bg-line/50 rounded" />
          <div className="h-64 bg-line/30 rounded-lg" />
        </Card>
      </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {t('analytics.title')}
          </h1>
          <p className="font-body text-xs text-text-secondary mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>

        <Card className="p-6 border border-brick/40 bg-brick/5 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-brick/15 flex items-center justify-center text-brick font-bold">
            !
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display">
              {t('analytics.loadErrorTitle')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 max-w-md">
              {t(error) || t('analytics.loadErrorDesc')}
            </p>
          </div>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
              {t('common.retry')}
            </Button>
          )}
        </Card>
      </div>
    )
  }

  const hasTrades = tradesCount > 0
  const allExcluded = hasTrades && rDistData.bins.every((b) => b.count === 0)

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Halaman */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {t('analytics.title')}
        </h1>
        <p className="font-body text-xs text-text-secondary mt-1">
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* Baris Atas: Equity Curve (2 Kolom) + Skor Disiplin (1 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Kartu 1: Equity Curve (FR-ANA-1) */}
        <Card className="lg:col-span-2 p-5 border border-line bg-bg-panel flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text-primary font-display">
              {t('analytics.equityCurveTitle')}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('analytics.equityCurveDesc')}
            </p>
          </div>

          {!hasTrades ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-text-primary mb-1">
                {t('analytics.emptyTitle')}
              </p>
              <p className="text-xs text-text-secondary max-w-sm">
                {t('analytics.emptyDesc')}
              </p>
            </div>
          ) : (
            <EquityCurveChart
              data={equityData}
              width={chartWidth}
              height={chartHeight}
              t={t}
              lang={lang}
            />
          )}
        </Card>

        {/* Kartu 3: Skor Disiplin (FR-ANA-3) */}
        <Card className="p-5 border border-line bg-bg-panel flex flex-col justify-between items-center text-center">
          <div className="w-full text-left mb-2">
            <h2 className="text-base font-semibold text-text-primary font-display">
              {t('analytics.disciplineScoreTitle')}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('analytics.disciplineScoreDesc')}
            </p>
          </div>

          <div className="my-auto py-2">
            <DisciplineRing score={score} t={t} lang={lang} />
          </div>

          <div className="w-full pt-3 border-t border-line/40 text-left">
            <p className="text-[11px] text-text-secondary">
              {hasTrades
                ? `${tradesCount} ${t('dashboard.totalTrades').toLowerCase()} (${tradesCount - (score?.pct ? Math.round((tradesCount * (100 - score.pct)) / 100) : 0)} plan)`
                : t('analytics.disciplineNoTrades')}
            </p>
          </div>
        </Card>
      </div>

      {/* Baris Bawah: Distribusi R-Multiple (FR-ANA-2) */}
      <Card className="p-5 border border-line bg-bg-panel">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-text-primary font-display">
            {t('analytics.rrDistributionTitle')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('analytics.rrDistributionDesc')}
          </p>
        </div>

        {!hasTrades ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <p className="text-sm font-semibold text-text-primary mb-1">
              {t('analytics.emptyTitle')}
            </p>
            <p className="text-xs text-text-secondary max-w-sm">
              {t('analytics.emptyDesc')}
            </p>
          </div>
        ) : allExcluded ? (
          /* State Khusus jika Semua Trade Dikecualikan (FR-ANA-4) */
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
            <p className="text-sm font-semibold text-text-primary">
              {t('analytics.rDistAllExcludedTitle')}
            </p>
            <p className="text-xs text-text-secondary max-w-md">
              {t('analytics.rDistAllExcludedDesc')}
            </p>
            <div className="pt-2">
              <p className="text-xs text-text-secondary">
                {t('analytics.excludedText', {
                  count: rDistData.excluded,
                  missing: rDistData.excludedReasons?.missing || 0,
                  invalidRisk: rDistData.excludedReasons?.invalidRisk || 0,
                })}
              </p>
            </div>
          </div>
        ) : (
          <RDistributionChart
            bins={rDistData.bins}
            excluded={rDistData.excluded}
            excludedReasons={rDistData.excludedReasons}
            width={chartWidth}
            height={chartHeight}
            t={t}
            lang={lang}
          />
        )}
      </Card>
    </div>
  )
}
