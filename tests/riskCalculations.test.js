import { describe, expect, it } from 'vitest'
import {
  CONTRACT_PRESETS,
  calculate,
  getInitialBalance,
  parseDecimal,
} from '../src/lib/riskCalculations.js'

// Simple PRNG Mulberry32 untuk invarian deterministik
function mulberry32(seed) {
  let s = seed
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('M4: Unit Test parseDecimal & getInitialBalance', () => {
  it('parseDecimal menangani whitespace, string kosong, null, undefined', () => {
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('   ')).toBeNull()
    expect(parseDecimal(null)).toBeNull()
    expect(parseDecimal(undefined)).toBeNull()
    expect(parseDecimal('123.45')).toBe(123.45)
    expect(parseDecimal(123.45)).toBe(123.45)
    expect(Number.isNaN(parseDecimal('abc'))).toBe(true)
    expect(Number.isNaN(parseDecimal(Infinity))).toBe(true)
  })

  it('getInitialBalance hanya mengisi jika saldo > 0 dan belum disentuh (FR-CALC-6)', () => {
    // Saldo 0 tidak diisi agar tampil petunjuk netral, bukan error merah
    expect(getInitialBalance(0, '', false)).toBe('')
    expect(getInitialBalance('0', '', false)).toBe('')
    expect(getInitialBalance(-100, '', false)).toBe('')
    expect(getInitialBalance(null, '', false)).toBe('')
    expect(getInitialBalance(undefined, '', false)).toBe('')

    // Saldo > 0 dan belum disentuh -> diisi
    expect(getInitialBalance(5000, '', false)).toBe('5000')
    expect(getInitialBalance('10000', '', false)).toBe('10000')

    // Sudah disentuh -> pertahankan input pengguna
    expect(getInitialBalance(5000, '250', true)).toBe('250')
    expect(getInitialBalance(5000, '', true)).toBe('')
  })
})

describe('M4: Golden Vectors FR-CALC-7 (V1 s.d. V9 & E1 s.d. E5)', () => {
  // V1: Crypto, 10000, 1, 100, 98, TP 106, leverage 10
  it('V1: Crypto long normal', () => {
    const res = calculate('crypto', {
      balance: 10000,
      riskPercent: 1,
      entryPrice: 100,
      stopLossPrice: 98,
      takeProfitPrice: 106,
      leverage: 10,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(100)
    expect(res.distance).toBe(2)
    expect(res.distancePercent).toBeCloseTo(2.0, 9)
    expect(res.notionalValue).toBeCloseTo(5000, 9)
    expect(res.coinSize).toBeCloseTo(50, 9)
    expect(res.marginRequired).toBeCloseTo(500, 9)
    expect(res.warnings).toEqual([])
    expect(res.rr).toBeCloseTo(3, 9)
  })

  // V2: Crypto, 1000, 2, 60000, 59700, tanpa TP, leverage 2
  it('V2: Crypto dengan peringatan margin & tanpa TP', () => {
    const res = calculate('crypto', {
      balance: 1000,
      riskPercent: 2,
      entryPrice: 60000,
      stopLossPrice: 59700,
      takeProfitPrice: '',
      leverage: 2,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(20)
    expect(res.distance).toBe(300)
    expect(res.distancePercent).toBeCloseTo(0.5, 9)
    expect(res.notionalValue).toBeCloseTo(4000, 9)
    expect(res.coinSize).toBeCloseTo(4000 / 60000, 8)
    expect(res.marginRequired).toBe(2000)
    expect(res.warnings).toContain('calculator.marginWarning')
    expect(res.rr).toBeNull()
  })

  // V3: Crypto (short), 10000, 1, 98, 100, TP 92, leverage 10
  it('V3: Crypto short normal', () => {
    const res = calculate('crypto', {
      balance: 10000,
      riskPercent: 1,
      entryPrice: 98,
      stopLossPrice: 100,
      takeProfitPrice: 92,
      leverage: 10,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(100)
    expect(res.distance).toBe(2)
    expect(res.distancePercent).toBeCloseTo((2 / 98) * 100, 8)
    expect(res.notionalValue).toBeCloseTo(4900, 9)
    expect(res.coinSize).toBeCloseTo(50, 9)
    expect(res.marginRequired).toBeCloseTo(490, 9)
    expect(res.rr).toBeCloseTo(3, 9)
  })

  // V4: Forex (100000), 5000, 2, 1.1000, 1.0950, TP 1.1100
  it('V4: Forex lot standar 100.000 unit', () => {
    const res = calculate('forex', {
      balance: 5000,
      riskPercent: 2,
      entryPrice: 1.1,
      stopLossPrice: 1.095,
      takeProfitPrice: 1.11,
      contractSize: CONTRACT_PRESETS.forex,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(100)
    expect(res.distance).toBeCloseTo(0.005, 9)
    expect(res.positionSizeUnits).toBeCloseTo(20000, 9)
    expect(res.lot).toBeCloseTo(0.2, 9)
    expect(res.lotMini).toBeCloseTo(2.0, 9)
    expect(res.lotMicro).toBeCloseTo(20.0, 9)
    expect(res.rr).toBeCloseTo(2, 9)
  })

  // V5: Emas (100), 5000, 1, 2350, 2340, TP 2380
  it('V5: Emas (XAUUSD) preset 100 oz', () => {
    const res = calculate('forex', {
      balance: 5000,
      riskPercent: 1,
      entryPrice: 2350,
      stopLossPrice: 2340,
      takeProfitPrice: 2380,
      contractSize: CONTRACT_PRESETS.gold,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(50)
    expect(res.distance).toBe(10)
    expect(res.positionSizeUnits).toBe(5)
    expect(res.lot).toBeCloseTo(0.05, 9)
    expect(res.lotMini).toBeCloseTo(0.5, 9)
    expect(res.lotMicro).toBeCloseTo(5.0, 9)
    expect(res.rr).toBeCloseTo(3, 9)
  })

  // V6: Saham, 10000, 1, 50, 48
  it('V6: Saham normal', () => {
    const res = calculate('stock', {
      balance: 10000,
      riskPercent: 1,
      entryPrice: 50,
      stopLossPrice: 48,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(100)
    expect(res.distance).toBe(2)
    expect(res.shares).toBe(50)
    expect(res.totalValue).toBe(2500)
    expect(res.warnings).toEqual([])
  })

  // V7: Saham, 1000, 1, 100.2, 100.1 -> 100 lembar (bukan 99)
  it('V7: Saham toleransi floating-point menghasilkan tepat 100 lembar (bukan 99)', () => {
    const res = calculate('stock', {
      balance: 1000,
      riskPercent: 1,
      entryPrice: 100.2,
      stopLossPrice: 100.1,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(10)
    expect(res.shares).toBe(100)
    expect(res.totalValue).toBeCloseTo(10020, 9)
  })

  // V8: Saham, 100, 1, 50, 48 -> 0 lembar + pesan risiko terlalu kecil
  it('V8: Saham 0 lembar dengan peringatan risiko terlalu kecil', () => {
    const res = calculate('stock', {
      balance: 100,
      riskPercent: 1,
      entryPrice: 50,
      stopLossPrice: 48,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(1)
    expect(res.shares).toBe(0)
    expect(res.totalValue).toBe(0)
    expect(res.warnings).toContain('calculator.warningZeroShares')
  })

  // V9: Forex kustom 5000, 5000, 1, 30, 29.5
  it('V9: Forex dengan ukuran kontrak kustom 5000', () => {
    const res = calculate('forex', {
      balance: 5000,
      riskPercent: 1,
      entryPrice: 30,
      stopLossPrice: 29.5,
      contractSize: 5000,
    })

    expect(res.ok).toBe(true)
    expect(res.riskAmount).toBe(50)
    expect(res.distance).toBeCloseTo(0.5, 9)
    expect(res.positionSizeUnits).toBeCloseTo(100, 9)
    expect(res.lot).toBeCloseTo(0.02, 9)
    expect(res.lotMini).toBeCloseTo(0.2, 9)
    expect(res.lotMicro).toBeCloseTo(2.0, 9)
  })

  // E1: entry = SL -> error di field SL
  it('E1: entry = SL menghasilkan error zero distance di field SL', () => {
    const res = calculate('crypto', {
      balance: 1000,
      riskPercent: 1,
      entryPrice: 100,
      stopLossPrice: 100,
      leverage: 10,
    })

    expect(res.ok).toBe(false)
    expect(res.errors.stopLossPrice).toBe('calculator.errorZeroDistance')
  })

  // E2: entry kosong -> petunjuk netral (missing), tanpa hasil
  it('E2: field wajib kosong dilaporkan di missing', () => {
    const res = calculate('crypto', {
      balance: 1000,
      riskPercent: 1,
      entryPrice: '',
      stopLossPrice: 90,
      leverage: 10,
    })

    expect(res.ok).toBe(false)
    expect(res.missing).toContain('entryPrice')
  })

  // E3: risiko 0 atau 150 -> error di field risiko
  it('E3: risiko 0 atau 150 menghasilkan error', () => {
    const resZero = calculate('crypto', {
      balance: 1000,
      riskPercent: 0,
      entryPrice: 100,
      stopLossPrice: 90,
      leverage: 10,
    })
    expect(resZero.ok).toBe(false)
    expect(resZero.errors.riskPercent).toBe('calculator.errorInvalidRiskPercent')

    const res150 = calculate('crypto', {
      balance: 1000,
      riskPercent: 150,
      entryPrice: 100,
      stopLossPrice: 90,
      leverage: 10,
    })
    expect(res150.ok).toBe(false)
    expect(res150.errors.riskPercent).toBe('calculator.errorInvalidRiskPercent')
  })

  // E4: Crypto leverage 0.5 -> error di field leverage
  it('E4: Crypto leverage < 1 menghasilkan error', () => {
    const res = calculate('crypto', {
      balance: 1000,
      riskPercent: 1,
      entryPrice: 100,
      stopLossPrice: 90,
      leverage: 0.5,
    })

    expect(res.ok).toBe(false)
    expect(res.errors.leverage).toBe('calculator.errorInvalidLeverage')
  })

  // E5: Forex ukuran kontrak 0 -> error di field contractSize
  it('E5: Forex contractSize <= 0 menghasilkan error', () => {
    const res = calculate('forex', {
      balance: 1000,
      riskPercent: 1,
      entryPrice: 100,
      stopLossPrice: 90,
      contractSize: 0,
    })

    expect(res.ok).toBe(false)
    expect(res.errors.contractSize).toBe('calculator.errorInvalidContractSize')
  })
})

describe('M4: Invariant Tests dengan PRNG Mulberry32 (Seed 42)', () => {
  const prng = mulberry32(42)

  it('Invarian Crypto: coinSize * distance ≈ riskAmount & margin * leverage ≈ notional (toleransi 1e-9)', () => {
    for (let i = 0; i < 300; i++) {
      const balance = 100 + prng() * 99900
      const riskPercent = 0.1 + prng() * 9.9
      const entryPrice = 1 + prng() * 100000
      const distance = 0.01 + prng() * (entryPrice * 0.5)
      const stopLossPrice = entryPrice - distance
      const leverage = 1 + prng() * 99

      const res = calculate('crypto', {
        balance,
        riskPercent,
        entryPrice,
        stopLossPrice,
        leverage,
      })

      expect(res.ok).toBe(true)

      // coinSize * distance ≈ riskAmount
      const relDiffCoin =
        Math.abs(res.coinSize * res.distance - res.riskAmount) /
        Math.max(res.riskAmount, 1e-9)
      expect(relDiffCoin).toBeLessThanOrEqual(1e-9)

      // marginRequired * leverage ≈ notionalValue
      const relDiffMargin =
        Math.abs(res.marginRequired * leverage - res.notionalValue) /
        Math.max(res.notionalValue, 1e-9)
      expect(relDiffMargin).toBeLessThanOrEqual(1e-9)
    }
  })

  it('Invarian Forex: lot * contractSize ≈ positionSizeUnits & mini = 10*lot, micro = 100*lot (toleransi 1e-9)', () => {
    for (let i = 0; i < 300; i++) {
      const balance = 100 + prng() * 99900
      const riskPercent = 0.1 + prng() * 9.9
      const entryPrice = 0.5 + prng() * 3000
      const distance = 0.0001 + prng() * 10
      const stopLossPrice = entryPrice - distance
      const contractSize = 100 + prng() * 100000

      const res = calculate('forex', {
        balance,
        riskPercent,
        entryPrice,
        stopLossPrice,
        contractSize,
      })

      expect(res.ok).toBe(true)

      const relDiffLot =
        Math.abs(res.lot * contractSize - res.positionSizeUnits) /
        Math.max(res.positionSizeUnits, 1e-9)
      expect(relDiffLot).toBeLessThanOrEqual(1e-9)

      const relDiffMini =
        Math.abs(res.lotMini - 10 * res.lot) / Math.max(res.lotMini, 1e-9)
      expect(relDiffMini).toBeLessThanOrEqual(1e-9)

      const relDiffMicro =
        Math.abs(res.lotMicro - 100 * res.lot) / Math.max(res.lotMicro, 1e-9)
      expect(relDiffMicro).toBeLessThanOrEqual(1e-9)
    }
  })

  it('Invarian Saham: shares * distance <= riskAmount < (shares + 1) * distance (toleransi 1e-9)', () => {
    for (let i = 0; i < 300; i++) {
      const balance = 100 + prng() * 99900
      const riskPercent = 0.1 + prng() * 9.9
      const entryPrice = 1 + prng() * 1000
      const distance = 0.001 + prng() * (entryPrice * 0.5)
      const stopLossPrice = entryPrice - distance

      const res = calculate('stock', {
        balance,
        riskPercent,
        entryPrice,
        stopLossPrice,
      })

      expect(res.ok).toBe(true)
      expect(Number.isInteger(res.shares)).toBe(true)

      // shares * distance <= riskAmount * (1 + 1e-9)
      expect(res.shares * res.distance).toBeLessThanOrEqual(
        res.riskAmount * (1 + 1e-9)
      )

      // (shares + 1) * distance > riskAmount * (1 - 1e-9)
      expect((res.shares + 1) * res.distance).toBeGreaterThan(
        res.riskAmount * (1 - 1e-9)
      )
    }
  })
})

describe('M4: Robustness & Never Throw Exception', () => {
  it('tidak pernah crash atau throw dengan input invalid atau nilai ekstrem', () => {
    const invalidInputs = [
      null,
      undefined,
      {},
      { balance: 'abc', riskPercent: -5 },
      { balance: 1e15, entryPrice: 100, stopLossPrice: 90 }, // > 1e12
      { entryPrice: Infinity, stopLossPrice: 90 },
      { mode: 'unknown_mode' },
    ]

    for (const input of invalidInputs) {
      expect(() => calculate('crypto', input)).not.toThrow()
      const res = calculate('crypto', input)
      expect(res.ok).toBe(false)
    }

    expect(() => calculate('invalid_mode', {})).not.toThrow()
    const invalidModeRes = calculate('invalid_mode', {})
    expect(invalidModeRes.ok).toBe(false)
    expect(invalidModeRes.errors.mode).toBe('calculator.errorInvalidMode')
  })
})
