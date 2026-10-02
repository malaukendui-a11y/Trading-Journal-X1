import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { DashboardView } from '../src/components/dashboard/DashboardView.jsx'
import { buildMonthGrid, groupDailyPnl, monthMaxAbs } from '../src/lib/calendarAggregations.js'
import { translate } from '../src/lib/i18n.js'

describe('M5: DashboardView SSR Render Tests (renderToString)', () => {
  const tId = (key, params) => translate('id', key, params)
  const tEn = (key, params) => translate('en', key, params)

  const emptyStats = {
    total: 0,
    wins: 0,
    winRate: null,
    revengeCount: 0,
    totalPnl: 0,
  }

  const s1Stats = {
    total: 5,
    wins: 2,
    winRate: 40,
    revengeCount: 2,
    totalPnl: 65.5,
  }

  const s1Trades = [
    { id: 1, trade_date: '2026-10-01', instrument: 'BTC/USDT', direction: 'buy', status: 'plan', pnl: 100 },
    { id: 2, trade_date: '2026-10-02', instrument: 'ETH/USDT', direction: 'sell', status: 'revenge', pnl: -50 },
    { id: 3, trade_date: '2026-10-05', instrument: 'SOL/USDT', direction: 'buy', status: 'plan', pnl: 0 },
    { id: 4, trade_date: '2026-10-07', instrument: 'XAU/USD', direction: 'buy', status: 'plan', pnl: 25.5 },
    { id: 5, trade_date: '2026-10-08', instrument: 'EUR/USD', direction: 'sell', status: 'revenge', pnl: -10 },
  ]

  const mockCalendarData = {
    year: 2026,
    month: 10,
    grid: buildMonthGrid(2026, 10),
    dailyPnl: groupDailyPnl(s1Trades),
    maxAbs: monthMaxAbs(groupDailyPnl(s1Trades), 2026, 10),
  }

  // 1. Kasus Kosong (ID & EN)
  it('merender state kosong (S0) tanpa exception dalam bahasa ID', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <MemoryRouter>
          <DashboardView
            loading={false}
            error={null}
            stats={emptyStats}
            balance={1000}
            settingsLoading={false}
            onSaveBalance={() => Promise.resolve({ ok: true })}
            calendarData={{
              year: 2026,
              month: 10,
              grid: buildMonthGrid(2026, 10),
              dailyPnl: {},
              maxAbs: 0,
            }}
            recentTrades={[]}
            t={tId}
            lang="id"
          />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(html).toContain(translate('id', 'dashboard.title'))
    expect(html).toContain('—') // Win rate null menjadi tanda dash
    expect(html).toContain(translate('id', 'dashboard.noRecentTrades'))
  })

  it('merender state kosong (S0) tanpa exception dalam bahasa EN', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <MemoryRouter>
          <DashboardView
            loading={false}
            error={null}
            stats={emptyStats}
            balance={1000}
            settingsLoading={false}
            onSaveBalance={() => Promise.resolve({ ok: true })}
            calendarData={{
              year: 2026,
              month: 10,
              grid: buildMonthGrid(2026, 10),
              dailyPnl: {},
              maxAbs: 0,
            }}
            recentTrades={[]}
            t={tEn}
            lang="en"
          />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(html).toContain(translate('en', 'dashboard.title'))
    expect(html).toContain('—')
    expect(html).toContain(translate('en', 'dashboard.noRecentTrades'))
  })

  // 2. Kasus dengan Data S1 (ID & EN)
  it('merender state data S1 tanpa exception dalam bahasa ID', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <MemoryRouter>
          <DashboardView
            loading={false}
            error={null}
            stats={s1Stats}
            balance={5000}
            settingsLoading={false}
            onSaveBalance={() => Promise.resolve({ ok: true })}
            calendarData={mockCalendarData}
            recentTrades={s1Trades}
            t={tId}
            lang="id"
          />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(html).toContain('40%') // Win rate
    expect(html).toContain('BTC/USDT')
    expect(html).toContain('ETH/USDT')
    expect(html).toContain(translate('id', 'dashboard.recentTradesTitle'))
    expect(html).toContain(translate('id', 'dashboard.miniCalendarTitle'))
  })

  it('merender state data S1 tanpa exception dalam bahasa EN', () => {
    let html = ''
    expect(() => {
      html = renderToString(
        <MemoryRouter>
          <DashboardView
            loading={false}
            error={null}
            stats={s1Stats}
            balance={5000}
            settingsLoading={false}
            onSaveBalance={() => Promise.resolve({ ok: true })}
            calendarData={mockCalendarData}
            recentTrades={s1Trades}
            t={tEn}
            lang="en"
          />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(html).toContain('40%')
    expect(html).toContain('BTC/USDT')
    expect(html).toContain(translate('en', 'dashboard.recentTradesTitle'))
    expect(html).toContain(translate('en', 'dashboard.miniCalendarTitle'))
  })

  // 3. Kasus Loading (ID & EN)
  it('merender state loading tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <MemoryRouter>
          <DashboardView
            loading={true}
            stats={emptyStats}
            balance={0}
            t={tId}
            lang="id"
          />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <MemoryRouter>
          <DashboardView
            loading={true}
            stats={emptyStats}
            balance={0}
            t={tEn}
            lang="en"
          />
        </MemoryRouter>
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
        <MemoryRouter>
          <DashboardView
            loading={false}
            error="journal.errorLoadFailed"
            onRetry={() => {}}
            stats={emptyStats}
            balance={0}
            t={tId}
            lang="id"
          />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <MemoryRouter>
          <DashboardView
            loading={false}
            error="journal.errorLoadFailed"
            onRetry={() => {}}
            stats={emptyStats}
            balance={0}
            t={tEn}
            lang="en"
          />
        </MemoryRouter>
      )
    }).not.toThrow()

    expect(htmlId).toContain(translate('id', 'journal.errorLoadFailed'))
    expect(htmlId).toContain(translate('id', 'common.retry'))
    expect(htmlEn).toContain(translate('en', 'journal.errorLoadFailed'))
    expect(htmlEn).toContain(translate('en', 'common.retry'))
  })
})
