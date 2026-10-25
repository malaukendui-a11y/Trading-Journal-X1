import { useEffect, useRef } from 'react'
import { Card } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { Tag } from '../ui/Tag.jsx'
import { dayLevel } from '../../lib/calendarAggregations.js'
import { formatDateDisplay } from '../../lib/dateHelpers.js'
import { formatCurrency } from '../../lib/formatters.js'
import { levelClassName } from './levelStyles.js'

/**
 * Komponen murni untuk visualisasi Kalender Trading (FR-CAL-1 s.d. FR-CAL-7).
 * Hanya menerima props (termasuk t dan lang), tanpa context dan tanpa Supabase.
 *
 * @param {Object} props
 * @param {boolean} [props.loading=false]
 * @param {string|null} [props.error=null]
 * @param {() => void} [props.onRetry]
 * @param {number} props.year Tahun kalender aktif
 * @param {number} props.month Bulan kalender aktif (1-12)
 * @param {() => void} props.onPrevMonth Handler navigasi bulan lalu
 * @param {() => void} props.onNextMonth Handler navigasi bulan depan
 * @param {() => void} props.onCurrentMonth Handler navigasi bulan berjalan
 * @param {Array<Array<{ date: string|null, day: number|null, inMonth: boolean }>>} props.grid
 * @param {Record<string, { pnl: number, count: number }>} props.dailyPnl
 * @param {number} props.maxAbs
 * @param {{ total: number, totalPnl: number, winRate: number|null, tradingDays: number }} props.summary
 * @param {string} props.todayIso Tanggal hari ini ('YYYY-MM-DD')
 * @param {string|null} props.selectedDate Tanggal terpilih untuk modal
 * @param {(date: string|null) => void} props.onSelectDate
 * @param {Array<Object>} props.dateTrades Daftar trade untuk tanggal terpilih
 * @param {(key: string, params?: Object) => string} props.t
 * @param {'id'|'en'} props.lang
 */
export function CalendarView({
  loading = false,
  error = null,
  onRetry,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  grid = [],
  dailyPnl = {},
  maxAbs = 0,
  summary = { total: 0, totalPnl: 0, winRate: null, tradingDays: 0 },
  todayIso,
  selectedDate = null,
  onSelectDate,
  dateTrades = [],
  t,
  lang,
}) {
  const dialogRef = useRef(null)
  const lastActiveCellRef = useRef(null)

  // Sinkronisasi native <dialog> dengan state React
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (selectedDate) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
      // Kembalikan fokus ke sel yang terakhir kali diklik
      if (lastActiveCellRef.current) {
        lastActiveCellRef.current.focus()
      }
    }
  }, [selectedDate])

  // 1. Loading State (Skeleton)
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={t('common.loading')}>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-bg-panel-raised rounded-md" />
            <div className="h-4 w-72 bg-bg-panel-raised rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-bg-panel-raised rounded-md" />
            <div className="h-9 w-24 bg-bg-panel-raised rounded-md" />
            <div className="h-9 w-20 bg-bg-panel-raised rounded-md" />
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <div className="h-3 w-28 bg-bg-panel-raised rounded" />
              <div className="h-7 w-24 bg-bg-panel-raised rounded" />
            </Card>
          ))}
        </div>

        {/* Grid Skeleton */}
        <Card className="p-5 space-y-4">
          <div className="h-80 bg-bg-panel-raised rounded-xl" />
        </Card>
      </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-[30px] font-semibold tracking-[-0.01em] text-text-primary">
            {t('calendar.title')}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {t('calendar.subtitle')}
          </p>
        </div>

        <Card className="p-6 border-brick-border text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-brick-soft flex items-center justify-center text-brick font-bold">
            !
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-display">
              {t('calendar.loadErrorTitle')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 max-w-md">
              {t(error) || t('calendar.loadErrorDesc')}
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

  // Format judul bulan (contoh: "Oktober 2026" / "October 2026")
  const monthDate = new Date(year, month - 1, 1)
  const monthTitle = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate)

  const dayHeaders = [
    t('dashboard.daySen'),
    t('dashboard.daySel'),
    t('dashboard.dayRab'),
    t('dashboard.dayKam'),
    t('dashboard.dayJum'),
    t('dashboard.daySab'),
    t('dashboard.dayMin'),
  ]

  const pnlColorClass = summary.totalPnl >= 0 ? 'text-sage' : 'text-brick'
  const winRateDisplay = summary.winRate !== null && summary.winRate !== undefined ? `${summary.winRate}%` : '—'

  const weeks = Array.isArray(grid) ? grid : (grid?.weeks || [])

  const handleCellClick = (e, dateStr) => {
    lastActiveCellRef.current = e.currentTarget
    if (onSelectDate) {
      onSelectDate(dateStr)
    }
  }

  const handleCloseModal = () => {
    if (onSelectDate) {
      onSelectDate(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Navigasi Bulan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="font-display text-2xl md:text-[30px] font-semibold tracking-[-0.01em] text-text-primary">
            {t('calendar.title')}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {t('calendar.subtitle')}
          </p>
        </div>

        {/* Tombol Navigasi Bulan */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-line bg-bg-panel-raised p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevMonth}
              aria-label={t('calendar.prevMonth')}
              className="px-2.5 py-1 text-sm"
            >
              ←
            </Button>
            <span className="px-3 py-1 font-display text-sm font-semibold text-text-primary select-none whitespace-nowrap min-w-[130px] text-center">
              {monthTitle}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextMonth}
              aria-label={t('calendar.nextMonth')}
              className="px-2.5 py-1 text-sm"
            >
              →
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onCurrentMonth}
            aria-label={t('calendar.currentMonth')}
            className="text-xs font-medium"
          >
            {t('calendar.currentMonth')}
          </Button>
        </div>
      </div>

      {/* 2. Ringkasan Performa Bulan (FR-CAL-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Net P&L */}
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-[13px] font-medium text-text-secondary">
            {t('calendar.monthPnl')}
          </p>
          <p className={`text-2xl font-medium tabular-nums mt-2 ${pnlColorClass}`}>
            {formatCurrency(summary.totalPnl, lang)}
          </p>
        </Card>

        {/* Win Rate */}
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-[13px] font-medium text-text-secondary">
            {t('calendar.winRate')}
          </p>
          <p className="text-2xl font-medium tabular-nums text-text-primary mt-2">
            {winRateDisplay}
          </p>
        </Card>

        {/* Hari Trading Aktif */}
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-[13px] font-medium text-text-secondary">
            {t('calendar.tradingDays')}
          </p>
          <p className="text-2xl font-medium tabular-nums text-text-primary mt-2">
            {summary.tradingDays}
          </p>
        </Card>
      </div>

      {/* 3. Grid Kalender Bulanan */}
      <Card className="p-5 space-y-3">
        {/* 7 Kolom Nama Hari (Senin s.d. Minggu) */}
        <div className="grid grid-cols-7 gap-2 text-center border-b border-line pb-2">
          {dayHeaders.map((header, idx) => (
            <div
              key={idx}
              className="text-xs font-medium text-text-secondary py-1"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Pekan & Sel Kalender */}
        <div className="flex flex-col gap-2">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-2">
              {week.map((cell, cIdx) => {
                if (!cell.inMonth || !cell.date) {
                  return (
                    <div
                      key={cIdx}
                      className="min-h-[70px] sm:min-h-[85px] rounded-xl bg-transparent border border-transparent"
                      aria-hidden="true"
                    />
                  )
                }

                const dayData = dailyPnl[cell.date]
                const level = dayLevel(dayData, maxAbs)
                const levelClass = levelClassName(level)
                const hasTrades = Boolean(dayData && dayData.count > 0)
                const isToday = cell.date === todayIso
                const dateDisplay = formatDateDisplay(cell.date, lang)

                // Tooltip & accessibility label
                let cellLabel = ''
                if (hasTrades) {
                  const pnlStr = formatCurrency(dayData.pnl, lang)
                  cellLabel = `${dateDisplay}: ${pnlStr} (${dayData.count} ${t('dashboard.tradeCountUnit')})`
                } else {
                  cellLabel = `${dateDisplay}: ${t('dashboard.noTradesOnDay')}`
                }

                // Penanda tanggal hari ini
                const todayIndicatorClass = isToday
                  ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg-panel'
                  : ''

                if (hasTrades) {
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={(e) => handleCellClick(e, cell.date)}
                      title={cellLabel}
                      aria-label={cellLabel}
                      className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${levelClass} ${todayIndicatorClass}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold tabular-nums">
                          {cell.day}
                        </span>
                        {isToday && (
                          <span className="text-[10px] uppercase font-bold text-accent-text px-1 rounded bg-bg-panel-raised">
                            {t('calendar.todayBadge')}
                          </span>
                        )}
                      </div>
                      <div className="text-right mt-2">
                        <p className="text-xs num-table truncate">
                          {formatCurrency(dayData.pnl, lang)}
                        </p>
                        <p className="text-[11px] tabular-nums">
                          {dayData.count} {t('dashboard.tradeCountUnit')}
                        </p>
                      </div>
                    </button>
                  )
                }

                // Hari tanpa trade: BUKAN button (tidak bisa difokus)
                return (
                  <div
                    key={cIdx}
                    title={cellLabel}
                    className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border flex flex-col justify-between select-none ${levelClass} ${todayIndicatorClass}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs tabular-nums text-text-secondary">
                        {cell.day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] uppercase font-bold text-accent-text px-1 rounded bg-bg-panel-raised">
                          {t('calendar.todayBadge')}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* 4. Legenda Kecil Kalender */}
        <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
          <div className="flex flex-wrap items-center gap-3">
            {/* Profit Scale */}
            <div className="flex items-center gap-1.5">
              <span>{t('calendar.legendProfit')}:</span>
              <div className="flex gap-1">
                <span className="w-3.5 h-3.5 rounded bg-heat-profit-1" title="profit-1" />
                <span className="w-3.5 h-3.5 rounded bg-heat-profit-2" title="profit-2" />
                <span className="w-3.5 h-3.5 rounded bg-heat-profit-3" title="profit-3" />
                <span className="w-3.5 h-3.5 rounded bg-heat-profit-4" title="profit-4" />
              </div>
            </div>

            {/* Loss Scale */}
            <div className="flex items-center gap-1.5">
              <span>{t('calendar.legendLoss')}:</span>
              <div className="flex gap-1">
                <span className="w-3.5 h-3.5 rounded bg-heat-loss-1" title="loss-1" />
                <span className="w-3.5 h-3.5 rounded bg-heat-loss-2" title="loss-2" />
                <span className="w-3.5 h-3.5 rounded bg-heat-loss-3" title="loss-3" />
                <span className="w-3.5 h-3.5 rounded bg-heat-loss-4" title="loss-4" />
              </div>
            </div>

            {/* Flat */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-bg-panel-raised border border-accent-border ring-1 ring-accent/30" />
              <span>{t('calendar.legendFlat')}</span>
            </div>

            {/* None */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-bg-panel-raised border border-line" />
              <span>{t('calendar.legendNone')}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Modal Detail Hari Native <dialog> (FR-CAL-2, D1) */}
      <dialog
        ref={dialogRef}
        onClose={handleCloseModal}
        onCancel={handleCloseModal}
        className="glass-strong rounded-[20px] text-text-primary p-0 shadow-2xl backdrop:bg-scrim max-w-2xl w-full m-auto"
      >
        {selectedDate && (
          <div className="p-6 space-y-4">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {t('calendar.dayDetailTitle')}
                </h3>
                <p className="text-xs text-text-secondary tabular-nums mt-0.5">
                  {formatDateDisplay(selectedDate, lang)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                aria-label={t('calendar.closeModal')}
                className="px-2 py-1"
              >
                ✕
              </Button>
            </div>

            {/* Ringkasan Hari */}
            {dailyPnl[selectedDate] && (
              <div className="flex items-center gap-4 text-xs tabular-nums py-1">
                <span>
                  Total P&L:{' '}
                  <strong
                    className={
                      dailyPnl[selectedDate].pnl >= 0 ? 'text-sage' : 'text-brick'
                    }
                  >
                    {formatCurrency(dailyPnl[selectedDate].pnl, lang)}
                  </strong>
                </span>
                <span>
                  {dailyPnl[selectedDate].count} {t('dashboard.tradeCountUnit')}
                </span>
              </div>
            )}

            {/* Tabel Daftar Trade Hari Tersebut (View-Only) */}
            {dateTrades.length === 0 ? (
              <p className="py-8 text-center text-xs text-text-secondary">
                {t('calendar.noTradesOnDay')}
              </p>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line text-text-secondary">
                      <th className="pb-2 font-medium">{t('journal.tableHeaderInstrument')}</th>
                      <th className="pb-2 font-medium">{t('journal.tableHeaderDirection')}</th>
                      <th className="pb-2 font-medium">{t('journal.tableHeaderStatus')}</th>
                      <th className="pb-2 font-medium text-right">{t('journal.tableHeaderPnl')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {dateTrades.map((trade) => {
                      const pnl = Number(trade?.pnl) || 0
                      const pnlClass = pnl >= 0 ? 'text-sage' : 'text-brick'

                      return (
                        <tr
                          key={trade.id || `${trade.trade_date}-${trade.instrument}`}
                          className="hover:bg-bg-panel-raised transition-colors"
                        >
                          <td className="py-2.5 font-medium text-text-primary whitespace-nowrap">
                            {trade.instrument || '-'}
                          </td>
                          <td className="py-2.5 whitespace-nowrap">
                            <Tag
                              variant={trade.direction === 'buy' ? 'buy' : 'sell'}
                              size="xs"
                            >
                              {trade.direction === 'buy' ? t('journal.buy') : t('journal.sell')}
                            </Tag>
                          </td>
                          <td className="py-2.5 whitespace-nowrap">
                            <Tag
                              variant={trade.status === 'plan' ? 'plan' : 'revenge'}
                              size="xs"
                            >
                              {trade.status === 'plan'
                                ? t('journal.statusPlan')
                                : t('journal.statusRevenge')}
                            </Tag>
                          </td>
                          <td className={`py-2.5 num-table text-right whitespace-nowrap ${pnlClass}`}>
                            {formatCurrency(pnl, lang)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Modal */}
            <div className="pt-3 border-t border-line flex justify-end">
              <Button variant="secondary" size="sm" onClick={handleCloseModal}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
