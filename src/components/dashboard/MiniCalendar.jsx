import { Link } from 'react-router-dom'
import { Card } from '../ui/Card.jsx'
import { dayLevel } from '../../lib/calendarAggregations.js'
import { formatDateDisplay } from '../../lib/dateHelpers.js'
import { formatCurrency } from '../../lib/formatters.js'

/**
 * Pemetaan class visual untuk setiap level warna kalender (FR-CAL-6).
 * Memiliki kontras baik di tema terang maupun gelap.
 * 'flat' memiliki penanda visual khas (border aksen + background raised) yang berbeda dari 'none'.
 */
const LEVEL_CLASSES = {
  none: 'bg-line/20 border-transparent text-text-secondary/50',
  flat: 'bg-bg-panel-raised border-accent/60 text-accent font-semibold ring-1 ring-accent/30',
  'profit-1': 'bg-sage/20 border-sage/40 text-text-primary',
  'profit-2': 'bg-sage/40 border-sage/60 text-text-primary',
  'profit-3': 'bg-sage/70 border-sage/90 text-text-primary font-semibold',
  'profit-4': 'bg-sage border-sage text-white font-bold',
  'loss-1': 'bg-brick/20 border-brick/40 text-text-primary',
  'loss-2': 'bg-brick/40 border-brick/60 text-text-primary',
  'loss-3': 'bg-brick/70 border-brick/90 text-text-primary font-semibold',
  'loss-4': 'bg-brick border-brick text-white font-bold',
}

/**
 * Subkomponen murni preview mini heatmap kalender bulan berjalan (FR-DASH-3, FR-CAL-6).
 * Seluruh kartu merupakan tautan yang dapat diklik ke /calendar.
 *
 * @param {Object} props
 * @param {Array<Array<{ date: string|null, day: number|null, inMonth: boolean }>>} props.grid Grid pekan
 * @param {Record<string, { pnl: number, count: number }>} props.dailyPnl Agregasi pnl harian
 * @param {number} props.maxAbs Nilai absolut pnl tertinggi di bulan berjalan
 * @param {number} props.year Tahun kalender
 * @param {number} props.month Bulan kalender (1-12)
 * @param {(key: string, params?: Object) => string} props.t
 * @param {'id'|'en'} props.lang
 */
export function MiniCalendar({ grid, dailyPnl = {}, maxAbs = 0, year, month, t, lang }) {
  const dayHeaders = [
    t('dashboard.daySen'),
    t('dashboard.daySel'),
    t('dashboard.dayRab'),
    t('dashboard.dayKam'),
    t('dashboard.dayJum'),
    t('dashboard.daySab'),
    t('dashboard.dayMin'),
  ]

  const weeks = Array.isArray(grid) ? grid : (grid?.weeks || [])

  return (
    <Link
      to="/calendar"
      aria-label={t('dashboard.miniCalendarAria')}
      className="block group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Card className="p-5 border border-line bg-bg-panel transition-all group-hover:border-accent/50 group-hover:shadow-sm">
        {/* Header Kartu */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display group-hover:text-accent transition-colors">
              {t('dashboard.miniCalendarTitle')}
            </h2>
          </div>
          <span className="text-xs font-medium text-accent flex items-center gap-1 group-hover:underline">
            {t('dashboard.viewFullCalendar')}
          </span>
        </div>

        {/* 7 Kolom Hari (Senin s.d. Minggu) */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
          {dayHeaders.map((header, idx) => (
            <div
              key={idx}
              className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider py-0.5"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Grid Pekan */}
        <div className="flex flex-col gap-1.5">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-1.5">
              {week.map((cell, cIdx) => {
                if (!cell.inMonth || !cell.date) {
                  return (
                    <div
                      key={cIdx}
                      className="aspect-square rounded-md bg-transparent"
                      aria-hidden="true"
                    />
                  )
                }

                const dayData = dailyPnl[cell.date]
                const level = dayLevel(dayData, maxAbs)
                const levelClass = LEVEL_CLASSES[level] || LEVEL_CLASSES.none

                // Format tooltip title
                let cellTitle = ''
                const dateDisplay = formatDateDisplay(cell.date, lang)
                if (dayData && dayData.count > 0) {
                  const pnlStr = formatCurrency(dayData.pnl, lang)
                  cellTitle = `${dateDisplay}: ${pnlStr} (${dayData.count} ${t('dashboard.tradeCountUnit')})`
                } else {
                  cellTitle = `${dateDisplay}: ${t('dashboard.noTradesOnDay')}`
                }

                return (
                  <div
                    key={cIdx}
                    title={cellTitle}
                    className={`aspect-square rounded-md border flex items-center justify-center text-xs font-mono transition-transform group-hover:scale-[1.02] ${levelClass}`}
                  >
                    <span>{cell.day}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>
    </Link>
  )
}
