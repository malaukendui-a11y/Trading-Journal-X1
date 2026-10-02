import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { CalendarView } from '../src/components/calendar/CalendarView.jsx'
import {
  buildMonthGrid,
  groupDailyPnl,
  monthMaxAbs,
  monthSummary,
} from '../src/lib/calendarAggregations.js'
import { translate } from '../src/lib/i18n.js'

describe('M6: CalendarView Component SSR Render Tests (renderToString)', () => {
  const tId = (key, params) => translate('id', key, params)
  const tEn = (key, params) => translate('en', key, params)

  const c3Trades = [
    { id: 1, trade_date: '2026-10-01', pnl: 60, status: 'plan', instrument: 'BTC/USDT', direction: 'buy' },
    { id: 2, trade_date: '2026-10-01', pnl: 40, status: 'plan', instrument: 'ETH/USDT', direction: 'buy' },
    { id: 3, trade_date: '2026-10-02', pnl: -25, status: 'plan', instrument: 'SOL/USDT', direction: 'sell' },
    { id: 4, trade_date: '2026-10-05', pnl: 0, status: 'plan', instrument: 'XAU/USD', direction: 'buy' },
    { id: 5, trade_date: '2026-10-07', pnl: 10, status: 'plan', instrument: 'EUR/USD', direction: 'buy' },
    { id: 6, trade_date: '2026-10-08', pnl: -60, status: 'revenge', instrument: 'AAPL', direction: 'sell' },
    { id: 7, trade_date: '2026-09-30', pnl: 500, status: 'plan', instrument: 'BTC/USDT', direction: 'buy' },
  ]

  const emptyGrid = buildMonthGrid(2026, 11)
  const c3Grid = buildMonthGrid(2026, 10)
  const c3DailyPnl = groupDailyPnl(c3Trades)
  const c3MaxAbs = monthMaxAbs(c3DailyPnl, 2026, 10)
  const c3Summary = monthSummary(c3Trades, 2026, 10)

  // 1. Kasus Bulan Kosong (ID & EN)
  it('merender bulan kosong tanpa exception dalam bahasa ID', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <CalendarView
          loading={false}
          error={null}
          year={2026}
          month={11}
          grid={emptyGrid}
          dailyPnl={{}}
          maxAbs={0}
          summary={{ total: 0, totalPnl: 0, winRate: null, tradingDays: 0 }}
          todayIso="2026-11-15"
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(html).toContain(translate('id', 'calendar.title'))
    expect(html).toContain('—') // Win rate null menjadi dash
    expect(html).toContain(translate('id', 'calendar.tradingDays'))
  })

  it('merender bulan kosong tanpa exception dalam bahasa EN', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <CalendarView
          loading={false}
          error={null}
          year={2026}
          month={11}
          grid={emptyGrid}
          dailyPnl={{}}
          maxAbs={0}
          summary={{ total: 0, totalPnl: 0, winRate: null, tradingDays: 0 }}
          todayIso="2026-11-15"
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(html).toContain(translate('en', 'calendar.title'))
    expect(html).toContain('—')
    expect(html).toContain(translate('en', 'calendar.tradingDays'))
  })

  // 2. Kasus Data C3 di Okt 2026 (ID & EN)
  it('merender data C3 di Okt 2026 dengan ringkasan akurat dalam bahasa ID', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <CalendarView
          loading={false}
          error={null}
          year={2026}
          month={10}
          grid={c3Grid}
          dailyPnl={c3DailyPnl}
          maxAbs={c3MaxAbs}
          summary={c3Summary}
          todayIso="2026-10-02"
          selectedDate="2026-10-01"
          dateTrades={[c3Trades[1], c3Trades[0]]}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(html).toContain('50%') // Win rate K1
    expect(html).toContain('25') // Total P&L K1
    expect(html).toContain('BTC/USDT')
    expect(html).toContain('ETH/USDT')
    expect(html).toContain(translate('id', 'calendar.legendProfit'))
    expect(html).toContain(translate('id', 'calendar.legendLoss'))
  })

  it('merender data C3 di Okt 2026 dengan ringkasan akurat dalam bahasa EN', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <CalendarView
          loading={false}
          error={null}
          year={2026}
          month={10}
          grid={c3Grid}
          dailyPnl={c3DailyPnl}
          maxAbs={c3MaxAbs}
          summary={c3Summary}
          todayIso="2026-10-02"
          selectedDate="2026-10-01"
          dateTrades={[c3Trades[1], c3Trades[0]]}
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(html).toContain('50%')
    expect(html).toContain('25')
    expect(html).toContain(translate('en', 'calendar.legendProfit'))
    expect(html).toContain(translate('en', 'calendar.legendLoss'))
  })

  // 3. Kasus Loading (ID & EN)
  it('merender state loading tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <CalendarView
          loading={true}
          year={2026}
          month={10}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <CalendarView
          loading={true}
          year={2026}
          month={10}
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(htmlId).toContain('aria-busy="true"')
    expect(htmlEn).toContain('aria-busy="true"')
  })

  // 4. Kasus Error (ID & EN)
  it('merender state error tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <CalendarView
          loading={false}
          error="journal.errorLoadFailed"
          onRetry={() => {}}
          year={2026}
          month={10}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <CalendarView
          loading={false}
          error="journal.errorLoadFailed"
          onRetry={() => {}}
          year={2026}
          month={10}
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(htmlId).toContain(translate('id', 'journal.errorLoadFailed'))
    expect(htmlId).toContain(translate('id', 'common.retry'))
    expect(htmlEn).toContain(translate('en', 'journal.errorLoadFailed'))
    expect(htmlEn).toContain(translate('en', 'common.retry'))
  })
})
