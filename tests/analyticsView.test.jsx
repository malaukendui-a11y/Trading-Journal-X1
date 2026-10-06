import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AnalyticsView } from '../src/components/analytics/AnalyticsView.jsx'
import {
  disciplineScore,
  equityCurve,
  rDistribution,
} from '../src/lib/analyticsCalculations.js'
import { translate } from '../src/lib/i18n.js'

describe('M7: AnalyticsView Component SSR Render Tests (renderToString)', () => {
  const tId = (key, params) => translate('id', key, params)
  const tEn = (key, params) => translate('en', key, params)

  const mixedTrades = [
    { trade_date: '2026-10-01', direction: 'buy', entry: 100, sl: 95, exit: 110, pnl: 100, status: 'plan' },
    { trade_date: '2026-10-02', direction: 'sell', entry: 100, sl: 105, exit: 90, pnl: 50, status: 'revenge' },
    { trade_date: '2026-10-03', direction: 'buy', entry: 100, sl: 100, exit: 110, pnl: 20, status: 'plan' }, // invalid risk -> excluded
  ]

  const mixedEquity = equityCurve(mixedTrades)
  const mixedDist = rDistribution(mixedTrades)
  const mixedScore = disciplineScore(mixedTrades)

  const allExcludedTrades = [
    { trade_date: '2026-10-01', direction: 'buy', entry: 100, sl: null, exit: null, pnl: 50, status: 'plan' },
    { trade_date: '2026-10-02', direction: 'buy', entry: 100, sl: 105, exit: 110, pnl: -20, status: 'revenge' }, // SL > entry
  ]

  const allExcludedEquity = equityCurve(allExcludedTrades)
  const allExcludedDist = rDistribution(allExcludedTrades)
  const allExcludedScore = disciplineScore(allExcludedTrades)

  // 1. Kasus Tanpa Trade (Kosong)
  it('merender state tanpa trade tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <AnalyticsView
          loading={false}
          error={null}
          tradesCount={0}
          equityData={[]}
          rDistData={rDistribution([])}
          score={null}
          chartWidth={500}
          chartHeight={250}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <AnalyticsView
          loading={false}
          error={null}
          tradesCount={0}
          equityData={[]}
          rDistData={rDistribution([])}
          score={null}
          chartWidth={500}
          chartHeight={250}
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(htmlId).toContain(translate('id', 'analytics.emptyTitle'))
    expect(htmlId).toContain('—') // Skor disiplin kosong
    expect(htmlEn).toContain(translate('en', 'analytics.emptyTitle'))
    expect(htmlEn).toContain('—')
  })

  // 2. Kasus Semua Trade Dikecualikan
  it('merender state semua trade dikecualikan tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <AnalyticsView
          loading={false}
          error={null}
          tradesCount={allExcludedTrades.length}
          equityData={allExcludedEquity}
          rDistData={allExcludedDist}
          score={allExcludedScore}
          chartWidth={500}
          chartHeight={250}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <AnalyticsView
          loading={false}
          error={null}
          tradesCount={allExcludedTrades.length}
          equityData={allExcludedEquity}
          rDistData={allExcludedDist}
          score={allExcludedScore}
          chartWidth={500}
          chartHeight={250}
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(htmlId).toContain(translate('id', 'analytics.rDistAllExcludedTitle'))
    expect(htmlEn).toContain(translate('en', 'analytics.rDistAllExcludedTitle'))
  })

  // 3. Kasus Data Campuran
  it('merender data campuran tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <AnalyticsView
          loading={false}
          error={null}
          tradesCount={mixedTrades.length}
          equityData={mixedEquity}
          rDistData={mixedDist}
          score={mixedScore}
          chartWidth={500}
          chartHeight={250}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <AnalyticsView
          loading={false}
          error={null}
          tradesCount={mixedTrades.length}
          equityData={mixedEquity}
          rDistData={mixedDist}
          score={mixedScore}
          chartWidth={500}
          chartHeight={250}
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(htmlId).toContain('67%') // Skor disiplin (2 dari 3)
    expect(htmlId).toContain(translate('id', 'analytics.equityCurveTitle').replace(/&/g, '&amp;'))
    expect(htmlEn).toContain('67%')
    expect(htmlEn).toContain(translate('en', 'analytics.equityCurveTitle').replace(/&/g, '&amp;'))
  })

  // 4. Kasus Loading
  it('merender state loading tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <AnalyticsView
          loading={true}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <AnalyticsView
          loading={true}
          t={tEn}
          lang="en"
        />
      )
    }).not.toThrow()

    expect(htmlId).toContain('aria-busy="true"')
    expect(htmlEn).toContain('aria-busy="true"')
  })

  // 5. Kasus Error
  it('merender state error tanpa exception dalam bahasa ID dan EN', () => {
    let htmlId = ''
    let htmlEn = ''

    expect(() => {
      htmlId = renderToString(
        <AnalyticsView
          loading={false}
          error="journal.errorLoadFailed"
          onRetry={() => {}}
          t={tId}
          lang="id"
        />
      )
    }).not.toThrow()

    expect(() => {
      htmlEn = renderToString(
        <AnalyticsView
          loading={false}
          error="journal.errorLoadFailed"
          onRetry={() => {}}
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
