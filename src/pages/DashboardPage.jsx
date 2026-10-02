import { useMemo } from 'react'
import { DashboardView } from '../components/dashboard/DashboardView.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useJournalEntries } from '../hooks/useJournalEntries.js'
import { useUserSettings } from '../hooks/useUserSettings.js'
import {
  buildMonthGrid,
  groupDailyPnl,
  monthMaxAbs,
} from '../lib/calendarAggregations.js'
import { computeDashboardStats } from '../lib/dashboardStats.js'
import { todayLocalISO } from '../lib/dateHelpers.js'

export function DashboardPage() {
  const { t, lang } = useLanguage()
  const { entries, loading: journalLoading, error, refetch } = useJournalEntries()
  const {
    balance,
    loading: settingsLoading,
    updateBalance,
  } = useUserSettings()

  // 1. Hitung statistik ringkasan Dashboard (FR-DASH-1)
  const stats = useMemo(() => computeDashboardStats(entries), [entries])

  // 2. Data kalender mini heatmap bulan berjalan (FR-DASH-3, FR-CAL-6)
  const calendarData = useMemo(() => {
    const todayIso = todayLocalISO()
    const [yearStr, monthStr] = todayIso.split('-')
    const currentYear = Number(yearStr)
    const currentMonth = Number(monthStr)

    const dailyPnl = groupDailyPnl(entries)
    const grid = buildMonthGrid(currentYear, currentMonth)
    const maxAbs = monthMaxAbs(dailyPnl, currentYear, currentMonth)

    return {
      year: currentYear,
      month: currentMonth,
      grid,
      dailyPnl,
      maxAbs,
    }
  }, [entries])

  // 3. 5 trade terakhir dengan urutan Jurnal (FR-DASH-4)
  const recentTrades = useMemo(() => {
    if (!Array.isArray(entries)) return []
    return entries.slice(0, 5)
  }, [entries])

  return (
    <DashboardView
      loading={journalLoading}
      error={error}
      onRetry={refetch}
      stats={stats}
      balance={balance}
      settingsLoading={settingsLoading}
      onSaveBalance={updateBalance}
      calendarData={calendarData}
      recentTrades={recentTrades}
      t={t}
      lang={lang}
    />
  )
}

