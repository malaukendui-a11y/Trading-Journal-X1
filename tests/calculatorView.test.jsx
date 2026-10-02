import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { CalculatorView } from '../src/components/calculator/CalculatorView.jsx'
import { calculate, CONTRACT_PRESETS } from '../src/lib/riskCalculations.js'
import { translate } from '../src/lib/i18n.js'

describe('M4: CalculatorView Component Render Tests (SSR / Node)', () => {
  const tId = (key, params) => translate('id', key, params)
  const tEn = (key, params) => translate('en', key, params)

  it('merender tampilan formulir awal kosong dengan petunjuk netral tanpa error merah', () => {
    const values = {
      balance: '',
      riskPercent: '1',
      entryPrice: '',
      stopLossPrice: '',
      takeProfitPrice: '',
      leverage: '10',
    }
    const result = calculate('crypto', values)

    const html = renderToString(
      <CalculatorView
        values={values}
        mode="crypto"
        result={result}
        lang="id"
        t={tId}
      />
    )

    expect(html).toContain('role="tablist"')
    expect(html).toContain('tab-crypto')
    // Petunjuk netral tampil
    expect(html).toContain(translate('id', 'calculator.missingFieldsHintCrypto'))
    // Tidak ada pesan error merah saat form awal
    expect(html).not.toContain(translate('id', 'calculator.errorInvalidBalance'))
  })

  it('merender V1 Crypto dengan hasil metrik yang lengkap dan R:R 1 : 3.00', () => {
    const values = {
      balance: '10000',
      riskPercent: '1',
      entryPrice: '100',
      stopLossPrice: '98',
      takeProfitPrice: '106',
      leverage: '10',
    }
    const result = calculate('crypto', values)

    const html = renderToString(
      <CalculatorView
        values={values}
        mode="crypto"
        result={result}
        lang="en"
        t={tEn}
      />
    )

    expect(html).toContain('+$100.00') // riskAmount
    expect(html).toContain('1 : 3.00') // rrRatio
    expect(html).toContain('50') // coinSize
    expect(html).toContain('+$500.00') // marginRequired
    expect(html).not.toContain('Warning: Required margin')
  })

  it('merender V2 Crypto dengan banner peringatan margin', () => {
    const values = {
      balance: '1000',
      riskPercent: '2',
      entryPrice: '60000',
      stopLossPrice: '59700',
      takeProfitPrice: '',
      leverage: '2',
    }
    const result = calculate('crypto', values)

    const html = renderToString(
      <CalculatorView
        values={values}
        mode="crypto"
        result={result}
        lang="id"
        t={tId}
      />
    )

    expect(html).toContain(translate('id', 'calculator.marginWarning'))
  })

  it('merender V5 Emas dengan lot 0,0500 di ID dan 0.0500 di EN, serta catatan edukasi kuotasi USD', () => {
    const values = {
      balance: '5000',
      riskPercent: '1',
      entryPrice: '2350',
      stopLossPrice: '2340',
      takeProfitPrice: '2380',
      contractSize: String(CONTRACT_PRESETS.gold),
    }
    const result = calculate('forex', values)

    // Bahasa Indonesia
    const htmlId = renderToString(
      <CalculatorView
        values={values}
        mode="forex"
        forexPreset="gold"
        result={result}
        lang="id"
        t={tId}
      />
    )
    expect(htmlId).toContain('0,0500')
    expect(htmlId).toContain(translate('id', 'calculator.forexDisclaimer'))

    // Bahasa Inggris
    const htmlEn = renderToString(
      <CalculatorView
        values={values}
        mode="forex"
        forexPreset="gold"
        result={result}
        lang="en"
        t={tEn}
      />
    )
    expect(htmlEn).toContain('0.0500')
    expect(htmlEn).toContain(translate('en', 'calculator.forexDisclaimer'))
  })

  it('merender V7 Saham dengan tepat 100 lembar', () => {
    const values = {
      balance: '1000',
      riskPercent: '1',
      entryPrice: '100.2',
      stopLossPrice: '100.1',
    }
    const result = calculate('stock', values)

    const html = renderToString(
      <CalculatorView
        values={values}
        mode="stock"
        result={result}
        lang="id"
        t={tId}
      />
    )

    expect(html).toContain('100')
  })

  it('merender V8 Saham dengan peringatan risiko terlalu kecil untuk 1 lembar', () => {
    const values = {
      balance: '100',
      riskPercent: '1',
      entryPrice: '50',
      stopLossPrice: '48',
    }
    const result = calculate('stock', values)

    const html = renderToString(
      <CalculatorView
        values={values}
        mode="stock"
        result={result}
        lang="id"
        t={tId}
      />
    )

    expect(html).toContain(translate('id', 'calculator.warningZeroShares'))
  })

  it('merender E1 dengan pesan error pada kolom Stop Loss', () => {
    const values = {
      balance: '1000',
      riskPercent: '1',
      entryPrice: '100',
      stopLossPrice: '100',
      leverage: '10',
    }
    const result = calculate('crypto', values)

    const html = renderToString(
      <CalculatorView
        values={values}
        mode="crypto"
        result={result}
        lang="id"
        t={tId}
      />
    )

    expect(html).toContain(translate('id', 'calculator.errorZeroDistance'))
  })
})

