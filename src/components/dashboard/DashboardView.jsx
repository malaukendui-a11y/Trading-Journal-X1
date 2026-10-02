import { Card } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { StatGrid } from './StatGrid.jsx'
import { BalanceInput } from './BalanceInput.jsx'
import { MiniCalendar } from './MiniCalendar.jsx'
import { RecentTrades } from './RecentTrades.jsx'

/**
 * Komponen orkestrator murni untuk tampilan Dashboard (FR-DASH-1 s.d. FR-DASH-5).
 * Hanya menerima props (termasuk t dan lang), tanpa context dan tanpa Supabase.
 *
 * @param {Object} props
 * @param {boolean} [props.loading=false] Status loading riwayat jurnal
 * @param {string|null} [props.error=null] Pesan error jurnal jika gagal
 * @param {() => void} [props.onRetry] Handler tombol coba lagi saat error
 * @param {Object} props.stats Metrik statistik { total, wins, winRate, revengeCount, totalPnl }
 * @param {number} props.balance Saldo tersimpan
 * @param {boolean} [props.settingsLoading=false] Status loading pengaturan akun
 * @param {(val: number) => Promise<any>} props.onSaveBalance Handler simpan saldo
 * @param {Object} props.calendarData Data kalender { grid, dailyPnl, maxAbs, year, month }
 * @param {Array<Object>} props.recentTrades Daftar 5 trade terakhir
 * @param {(key: string, params?: Object) => string} props.t
 * @param {'id'|'en'} props.lang
 */
export function DashboardView({
  loading = false,
  error = null,
  onRetry,
  stats,
  balance,
  settingsLoading = false,
  onSaveBalance,
  calendarData = {},
  recentTrades = [],
  t,
  lang,
}) {
  // 1. Loading State (Skeleton)
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={t('common.loading')}>
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-line/60 rounded-md" />
            <div className="h-4 w-72 bg-line/40 rounded-md" />
          </div>
          <div className="h-10 w-44 bg-line/40 rounded-md" />
        </div>

        {/* StatGrid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 border border-line bg-bg-panel space-y-3">
              <div className="h-3 w-20 bg-line/50 rounded" />
              <div className="h-8 w-24 bg-line/60 rounded" />
            </Card>
          ))}
        </div>

        {/* 2-Column Calendar & Trades Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 border border-line bg-bg-panel h-64 space-y-4">
            <div className="h-4 w-32 bg-line/50 rounded" />
            <div className="h-44 bg-line/30 rounded-lg" />
          </Card>
          <Card className="p-5 border border-line bg-bg-panel h-64 space-y-4">
            <div className="h-4 w-32 bg-line/50 rounded" />
            <div className="h-44 bg-line/30 rounded-lg" />
          </Card>
        </div>
      </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {t('dashboard.title')}
          </h1>
          <p className="font-body text-xs text-text-secondary mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <Card className="p-6 border border-brick/40 bg-brick/5 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-brick/15 flex items-center justify-center text-brick font-bold">
            !
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display">
              {t('dashboard.loadErrorTitle')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 max-w-md">
              {t(error) || t('dashboard.loadErrorDesc')}
            </p>
          </div>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              {t('common.retry')}
            </Button>
          )}
        </Card>
      </div>
    )
  }

  // 3. Normal State
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Balance Input */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2 border-b border-line/40">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {t('dashboard.title')}
          </h1>
          <p className="font-body text-xs text-text-secondary mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <BalanceInput
          balance={balance}
          loading={settingsLoading}
          onSaveBalance={onSaveBalance}
          t={t}
          lang={lang}
        />
      </div>

      {/* 4 Stat Cards */}
      <StatGrid stats={stats} t={t} lang={lang} />

      {/* Grid 2 Kolom: Mini Heatmap Kalender + 5 Trade Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Kolom Kiri: Mini Calendar Bulan Berjalan */}
        <MiniCalendar
          grid={calendarData?.grid || []}
          dailyPnl={calendarData?.dailyPnl || {}}
          maxAbs={calendarData?.maxAbs || 0}
          year={calendarData?.year}
          month={calendarData?.month}
          t={t}
          lang={lang}
        />

        {/* Kolom Kanan: 5 Trade Terakhir */}
        <RecentTrades entries={recentTrades} t={t} lang={lang} />
      </div>
    </div>
  )
}
