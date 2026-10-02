import { useMemo, useState } from 'react'
import { CalendarView } from '../components/calendar/CalendarView.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useJournalEntries } from '../hooks/useJournalEntries.js'
import {
  buildMonthGrid,
  entriesForDate,
  groupDailyPnl,
  monthMaxAbs,
  monthSummary,
  shiftMonth,
} from '../lib/calendarAggregations.js'
import { todayLocalISO } from '../lib/dateHelpers.js'

export function CalendarPage() {
  const { t, lang } = useLanguage()
  const { entries, loading, error, refetch } = useJournalEntries()

  // Ambil tanggal hari ini (lokal bebas UTC bug)
  const todayIso = todayLocalISO()
  const [initYear, initMonth] = todayIso.split('-').map(Number)

  // State bulan dan tahun yang sedang ditampilkan
  const [period, setPeriod] = useState({ year: initYear, month: initMonth })

  // State tanggal terpilih untuk modal detail hari (FR-CAL-2)
  const [selectedDate, setSelectedDate] = useState(null)

  // Handlers navigasi bulan
  const handlePrevMonth = () => {
    setPeriod((prev) => shiftMonth(prev.year, prev.month, -1))
  }

  const handleNextMonth = () => {
    setPeriod((prev) => shiftMonth(prev.year, prev.month, 1))
  }

  const handleCurrentMonth = () => {
    const [nowY, nowM] = todayLocalISO().split('-').map(Number)
    setPeriod({ year: nowY, month: nowM })
  }

  // Memoized aggregations
  const grid = useMemo(
    () => buildMonthGrid(period.year, period.month),
    [period.year, period.month]
  )

  const dailyPnl = useMemo(() => groupDailyPnl(entries), [entries])

  const maxAbs = useMemo(
    () => monthMaxAbs(dailyPnl, period.year, period.month),
    [dailyPnl, period.year, period.month]
  )

  const summary = useMemo(
    () => monthSummary(entries, period.year, period.month),
    [entries, period.year, period.month]
  )

  const dateTrades = useMemo(
    () => (selectedDate ? entriesForDate(entries, selectedDate) : []),
    [entries, selectedDate]
  )

  return (
    <CalendarView
      loading={loading}
      error={error}
      onRetry={refetch}
      year={period.year}
      month={period.month}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onCurrentMonth={handleCurrentMonth}
      grid={grid}
      dailyPnl={dailyPnl}
      maxAbs={maxAbs}
      summary={summary}
      todayIso={todayIso}
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
      dateTrades={dateTrades}
      t={t}
      lang={lang}
    />
  )
}

