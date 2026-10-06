import { describe, expect, it } from 'vitest'
import {
  disciplineScore,
  equityCurve,
  rDistribution,
  rMultiple,
} from '../src/lib/analyticsCalculations.js'

describe('M7: analyticsCalculations (FR-ANA-1 s.d. FR-ANA-5)', () => {
  describe('FR-ANA-2: rMultiple & rDistribution Golden Vectors (R1-R13)', () => {
    it('R1: buy 100 / SL 95 / exit 110 -> R = 2', () => {
      const trade = { direction: 'buy', entry: 100, sl: 95, exit: 110 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(2)

      const dist = rDistribution([trade])
      const bin2 = dist.bins.find((b) => b.bin === 2)
      expect(bin2.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R2: sell 100 / SL 105 / exit 90 -> R = 2', () => {
      const trade = { direction: 'sell', entry: 100, sl: 105, exit: 90 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(2)

      const dist = rDistribution([trade])
      const bin2 = dist.bins.find((b) => b.bin === 2)
      expect(bin2.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R3: buy 100 / 95 / 95 -> R = -1 -> bin "-1R"', () => {
      const trade = { direction: 'buy', entry: 100, sl: 95, exit: 95 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(-1)

      const dist = rDistribution([trade])
      const binNeg1 = dist.bins.find((b) => b.bin === -1)
      expect(binNeg1.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R4: buy 1.1 / 1.095 / 1.11 -> R ≈ 1.9999999999999556 -> bin "2R" (bukan 1R)', () => {
      const trade = { direction: 'buy', entry: 1.1, sl: 1.095, exit: 1.11 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(2, 5)

      const dist = rDistribution([trade])
      const bin2 = dist.bins.find((b) => b.bin === 2)
      expect(bin2.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R5: buy 100 / 95 / 112.5 -> R = 2.5 -> bin "3R"', () => {
      const trade = { direction: 'buy', entry: 100, sl: 95, exit: 112.5 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(2.5)

      const dist = rDistribution([trade])
      const bin3 = dist.bins.find((b) => b.bin === 3)
      expect(bin3.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R6: buy 100 / 95 / 92.5 -> R = -1.5 -> bin "-1R"', () => {
      const trade = { direction: 'buy', entry: 100, sl: 95, exit: 92.5 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(-1.5)

      const dist = rDistribution([trade])
      const binNeg1 = dist.bins.find((b) => b.bin === -1)
      expect(binNeg1.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R7: buy 100 / 95 / 130 -> R = 6 -> bin "≥ 5R"', () => {
      const trade = { direction: 'buy', entry: 100, sl: 95, exit: 130 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(6)

      const dist = rDistribution([trade])
      const bin5 = dist.bins.find((b) => b.bin === 5)
      expect(bin5.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R8: buy 100 / 95 / 80 -> R = -4 -> bin "≤ −3R"', () => {
      const trade = { direction: 'buy', entry: 100, sl: 95, exit: 80 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(-4)

      const dist = rDistribution([trade])
      const binNeg3 = dist.bins.find((b) => b.bin === -3)
      expect(binNeg3.count).toBe(1)
      expect(dist.excluded).toBe(0)
    })

    it('R9–R12: Kasus Pengecualian Trade (missing & invalidRisk)', () => {
      // R9: exit kosong -> missing
      const r9 = { direction: 'buy', entry: 100, sl: 95, exit: null }
      expect(rMultiple(r9)).toBeNull()

      // R10: buy dengan SL 101 (SL > entry) -> invalidRisk
      const r10 = { direction: 'buy', entry: 100, sl: 101, exit: 105 }
      expect(rMultiple(r10)).toBeNull()

      // R11: sell dengan SL 99 (SL < entry) -> invalidRisk
      const r11 = { direction: 'sell', entry: 100, sl: 99, exit: 95 }
      expect(rMultiple(r11)).toBeNull()

      // R12: entry = SL -> invalidRisk
      const r12 = { direction: 'buy', entry: 100, sl: 100, exit: 105 }
      expect(rMultiple(r12)).toBeNull()

      const dist = rDistribution([r9, r10, r11, r12])
      expect(dist.excluded).toBe(4)
      expect(dist.excludedReasons.missing).toBe(1)
      expect(dist.excludedReasons.invalidRisk).toBe(3)
    })

    it('R13: buy 100 / 95 / 97.5 -> R = -0.5 -> bin "0R" (Object.is(bin, 0) harus true, bukan -0)', () => {
      const trade = { direction: 'buy', entry: 100, sl: 95, exit: 97.5 }
      const r = rMultiple(trade)
      expect(r).toBeCloseTo(-0.5)

      const dist = rDistribution([trade])
      const bin0 = dist.bins.find((b) => b.bin === 0)
      expect(bin0.count).toBe(1)
      expect(Object.is(bin0.bin, 0)).toBe(true)
      expect(Object.is(bin0.bin, -0)).toBe(false)
    })
  })

  describe('FR-ANA-3: disciplineScore Golden Vectors (G1-G7)', () => {
    it('G1: [P, P, R, P] -> 75 sage', () => {
      const entries = [
        { status: 'plan' },
        { status: 'plan' },
        { status: 'revenge' },
        { status: 'plan' },
      ]
      expect(disciplineScore(entries)).toEqual({ pct: 75, tone: 'sage' })
    })

    it('G2: [P, R] -> 50 aksen', () => {
      const entries = [{ status: 'plan' }, { status: 'revenge' }]
      expect(disciplineScore(entries)).toEqual({ pct: 50, tone: 'accent' })
    })

    it('G3: [P, R, R] -> 33 brick', () => {
      const entries = [{ status: 'plan' }, { status: 'revenge' }, { status: 'revenge' }]
      expect(disciplineScore(entries)).toEqual({ pct: 33, tone: 'brick' })
    })

    it('G4: 7P + 3R -> 70 sage (ambang batas inklusif 70 = sage)', () => {
      const entries = [
        ...Array(7).fill({ status: 'plan' }),
        ...Array(3).fill({ status: 'revenge' }),
      ]
      expect(disciplineScore(entries)).toEqual({ pct: 70, tone: 'sage' })
    })

    it('G5: 2P + 3R -> 40 aksen (ambang batas inklusif 40 = aksen)', () => {
      const entries = [
        ...Array(2).fill({ status: 'plan' }),
        ...Array(3).fill({ status: 'revenge' }),
      ]
      expect(disciplineScore(entries)).toEqual({ pct: 40, tone: 'accent' })
    })

    it('G6: [P, P, R] -> 67 aksen', () => {
      const entries = [{ status: 'plan' }, { status: 'plan' }, { status: 'revenge' }]
      expect(disciplineScore(entries)).toEqual({ pct: 67, tone: 'accent' })
    })

    it('G7: kosong -> null', () => {
      expect(disciplineScore([])).toBeNull()
      expect(disciplineScore(null)).toBeNull()
      expect(disciplineScore(undefined)).toBeNull()
    })
  })

  describe('FR-ANA-1: equityCurve Golden Vector (EQ1)', () => {
    it('EQ1: data C3 (FR-CAL-6) -> 30 Sep 500, 1 Okt 600, 2 Okt 575, 5 Okt 575, 7 Okt 585, 8 Okt 525', () => {
      const c3Entries = [
        { trade_date: '2026-10-01', pnl: 60, status: 'plan' },
        { trade_date: '2026-10-01', pnl: 40, status: 'plan' },
        { trade_date: '2026-10-02', pnl: -25, status: 'plan' },
        { trade_date: '2026-10-05', pnl: 0, status: 'plan' },
        { trade_date: '2026-10-07', pnl: 10, status: 'plan' },
        { trade_date: '2026-10-08', pnl: -60, status: 'revenge' },
        { trade_date: '2026-09-30', pnl: 500, status: 'plan' },
      ]

      const curve = equityCurve(c3Entries)
      expect(curve).toEqual([
        { date: '2026-09-30', value: 500 },
        { date: '2026-10-01', value: 600 },
        { date: '2026-10-02', value: 575 },
        { date: '2026-10-05', value: 575 },
        { date: '2026-10-07', value: 585 },
        { date: '2026-10-08', value: 525 },
      ])
    })

    it('mengembalikan array kosong jika input kosong', () => {
      expect(equityCurve([])).toEqual([])
      expect(equityCurve(null)).toEqual([])
      expect(equityCurve(undefined)).toEqual([])
    })
  })

  describe('Ketahanan Input & Tidak Pernah Throw', () => {
    it('menangani input acak atau rusak tanpa error', () => {
      expect(() => rMultiple(undefined)).not.toThrow()
      expect(rMultiple(undefined)).toBeNull()

      expect(() => rMultiple({})).not.toThrow()
      expect(rMultiple({})).toBeNull()

      expect(() => rMultiple({ direction: 'unknown', entry: 100, sl: 90, exit: 110 })).not.toThrow()
      expect(rMultiple({ direction: 'unknown', entry: 100, sl: 90, exit: 110 })).toBeNull()

      expect(() => rMultiple({ direction: 'buy', entry: 'abc', sl: 90, exit: 110 })).not.toThrow()
      expect(rMultiple({ direction: 'buy', entry: 'abc', sl: 90, exit: 110 })).toBeNull()

      expect(() => rDistribution('not an array')).not.toThrow()
      const dist = rDistribution('not an array')
      expect(dist.bins.length).toBe(9)
      expect(dist.excluded).toBe(0)

      expect(() => disciplineScore('invalid')).not.toThrow()
      expect(disciplineScore('invalid')).toBeNull()
    })
  })
})
