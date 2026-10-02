import { describe, expect, it } from 'vitest'
import {
  buildMonthGrid,
  dayLevel,
  entriesForDate,
  entriesInMonth,
  groupDailyPnl,
  monthMaxAbs,
  monthSummary,
  shiftMonth,
} from '../src/lib/calendarAggregations.js'

describe('M5: calendarAggregations (FR-CAL-6)', () => {
  describe('C1: Okt 2026 Grid', () => {
    it('1 Okt = Kamis; 3 sel kosong di depan; 31 hari; 5 minggu; 1 sel kosong di belakang', () => {
      const grid = buildMonthGrid(2026, 10)

      expect(grid.numWeeks).toBe(5)
      expect(grid.length).toBe(5)
      expect(grid.daysInMonth).toBe(31)
      expect(grid.leadingEmpty).toBe(3)
      expect(grid.trailingEmpty).toBe(1)

      // Pekan pertama: 3 sel kosong di depan (Sen, Sel, Rab), Kamis = 1 Okt
      const week1 = grid[0]
      expect(week1[0]).toEqual({ date: null, day: null, inMonth: false })
      expect(week1[1]).toEqual({ date: null, day: null, inMonth: false })
      expect(week1[2]).toEqual({ date: null, day: null, inMonth: false })
      expect(week1[3]).toEqual({ date: '2026-10-01', day: 1, inMonth: true })
      expect(week1[6]).toEqual({ date: '2026-10-04', day: 4, inMonth: true })

      // Pekan kelima: 31 Okt = Sabtu (indeks 5), Minggu = kosong (indeks 6)
      const week5 = grid[4]
      expect(week5[5]).toEqual({ date: '2026-10-31', day: 31, inMonth: true })
      expect(week5[6]).toEqual({ date: null, day: null, inMonth: false })
    })
  })

  describe('C2: Variasi Durasi Pekan Kalender', () => {
    it('Feb 2027: 4 minggu, mulai Senin (0 sel kosong), 28 hari', () => {
      const grid = buildMonthGrid(2027, 2)
      expect(grid.numWeeks).toBe(4)
      expect(grid.length).toBe(4)
      expect(grid.daysInMonth).toBe(28)
      expect(grid.leadingEmpty).toBe(0)
      expect(grid.trailingEmpty).toBe(0)
      expect(grid[0][0]).toEqual({ date: '2027-02-01', day: 1, inMonth: true })
      expect(grid[3][6]).toEqual({ date: '2027-02-28', day: 28, inMonth: true })
    })

    it('Feb 2028: 5 minggu, 29 hari (tahun kabisat)', () => {
      const grid = buildMonthGrid(2028, 2)
      expect(grid.numWeeks).toBe(5)
      expect(grid.length).toBe(5)
      expect(grid.daysInMonth).toBe(29)
      // 1 Feb 2028 = Selasa (indeks 1) -> 1 sel kosong di depan
      expect(grid.leadingEmpty).toBe(1)
      // Total 1 + 29 = 30 sel, total sel 5 minggu = 35 -> 5 sel kosong di belakang
      expect(grid.trailingEmpty).toBe(5)
      expect(grid[4][0]).toEqual({ date: '2028-02-28', day: 28, inMonth: true })
      expect(grid[4][1]).toEqual({ date: '2028-02-29', day: 29, inMonth: true })
      expect(grid[4][2]).toEqual({ date: null, day: null, inMonth: false })
    })

    it('Nov 2026: 6 minggu, 30 hari (mulai Minggu -> 6 sel kosong di depan)', () => {
      const grid = buildMonthGrid(2026, 11)
      expect(grid.numWeeks).toBe(6)
      expect(grid.length).toBe(6)
      expect(grid.daysInMonth).toBe(30)
      expect(grid.leadingEmpty).toBe(6)
      // 6 sel kosong di depan + 30 hari = 36 sel. 6 minggu = 42 sel -> 6 sel kosong di belakang
      expect(grid.trailingEmpty).toBe(6)
      expect(grid[0][6]).toEqual({ date: '2026-11-01', day: 1, inMonth: true })
      expect(grid[5][0]).toEqual({ date: '2026-11-30', day: 30, inMonth: true })
      expect(grid[5][1]).toEqual({ date: null, day: null, inMonth: false })
    })
  })

  describe('C3: Agregasi dan Skala Level Heatmap (Okt 2026)', () => {
    it('mengelompokkan P&L harian dan menghitung maxAbs serta dayLevel persis', () => {
      const entries = [
        { trade_date: '2026-10-01', pnl: 60, status: 'plan' },
        { trade_date: '2026-10-01', pnl: 40, status: 'plan' },
        { trade_date: '2026-10-02', pnl: -25, status: 'plan' },
        { trade_date: '2026-10-05', pnl: 0, status: 'plan' },
        { trade_date: '2026-10-07', pnl: 10, status: 'plan' },
        { trade_date: '2026-10-08', pnl: -60, status: 'revenge' },
        { trade_date: '2026-09-30', pnl: 500, status: 'plan' }, // bulan September, bukan Oktober
      ]

      const daily = groupDailyPnl(entries)

      expect(daily['2026-10-01']).toEqual({ pnl: 100, count: 2 })
      expect(daily['2026-10-02']).toEqual({ pnl: -25, count: 1 })
      expect(daily['2026-10-05']).toEqual({ pnl: 0, count: 1 })
      expect(daily['2026-10-07']).toEqual({ pnl: 10, count: 1 })
      expect(daily['2026-10-08']).toEqual({ pnl: -60, count: 1 })
      expect(daily['2026-09-30']).toEqual({ pnl: 500, count: 1 })

      // maxAbs: 100 (30 Sep tidak dihitung karena bulan 9)
      const maxAbs = monthMaxAbs(daily, 2026, 10)
      expect(maxAbs).toBe(100)

      // Evaluasi level hari
      expect(dayLevel(daily['2026-10-01'], maxAbs)).toBe('profit-4')
      expect(dayLevel(daily['2026-10-02'], maxAbs)).toBe('loss-1')
      expect(dayLevel(daily['2026-10-05'], maxAbs)).toBe('flat')
      expect(dayLevel(daily['2026-10-07'], maxAbs)).toBe('profit-1')
      expect(dayLevel(daily['2026-10-08'], maxAbs)).toBe('loss-3')

      // Hari lain tanpa trade -> none
      expect(dayLevel(daily['2026-10-03'], maxAbs)).toBe('none')
      expect(dayLevel(daily['2026-10-04'], maxAbs)).toBe('none')
    })
  })

  describe('Koreksi 1: dayLevel spesifik & edge cases', () => {
    it('day undefined -> "none"', () => {
      expect(dayLevel(undefined, 100)).toBe('none')
      expect(dayLevel(null, 100)).toBe('none')
    })

    it('day dengan count 0 -> "none"', () => {
      expect(dayLevel({ pnl: 0, count: 0 }, 100)).toBe('none')
      expect(dayLevel({ pnl: 50, count: 0 }, 100)).toBe('none')
    })

    it('day dengan { pnl: 0, count: 1 } -> "flat"', () => {
      expect(dayLevel({ pnl: 0, count: 1 }, 100)).toBe('flat')
      expect(dayLevel({ pnl: 0, count: 5 }, 0)).toBe('flat')
    })

    it('maxAbs 0 tidak menghasilkan NaN', () => {
      const profitDay = { pnl: 25, count: 1 }
      const lossDay = { pnl: -25, count: 1 }

      expect(dayLevel(profitDay, 0)).toBe('profit-1')
      expect(dayLevel(lossDay, 0)).toBe('loss-1')
      expect(dayLevel(profitDay, -5)).toBe('profit-1')
    })
  })

  describe('Ketahanan input groupDailyPnl & monthMaxAbs', () => {
    it('groupDailyPnl menangani data kosong atau rusak', () => {
      expect(groupDailyPnl(null)).toEqual({})
      expect(groupDailyPnl(undefined)).toEqual({})
      expect(groupDailyPnl([])).toEqual({})
      expect(groupDailyPnl([{ trade_date: null, pnl: 10 }])).toEqual({})
      expect(groupDailyPnl([{ trade_date: '2026-10-01', pnl: '35.5' }])).toEqual({
        '2026-10-01': { pnl: 35.5, count: 1 },
      })
    })

    it('monthMaxAbs mengembalikan 0 jika data kosong atau tidak ada trade di bulan tersebut', () => {
      expect(monthMaxAbs(null, 2026, 10)).toBe(0)
      expect(monthMaxAbs({}, 2026, 10)).toBe(0)
      expect(monthMaxAbs({ '2026-09-01': { pnl: 100, count: 1 } }, 2026, 10)).toBe(0)
    })
  })

  describe('FR-CAL-7: shiftMonth (Aritmetika Bulan & Tahun, N1, N2)', () => {
    it('N1: Des 2026 + 1 bulan = Jan 2027 dan Jan 2026 - 1 bulan = Des 2025', () => {
      expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
      expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
    })

    it('N2: Okt 2026 - 12 bulan = Okt 2025 dan Okt 2026 + 15 bulan = Jan 2028', () => {
      expect(shiftMonth(2026, 10, -12)).toEqual({ year: 2025, month: 10 })
      expect(shiftMonth(2026, 10, 15)).toEqual({ year: 2028, month: 1 })
    })

    it('kebal input tidak valid dan fallback aman', () => {
      expect(shiftMonth(null, 10, 1)).toEqual({ year: 2026, month: 1 })
      expect(shiftMonth(2026, 13, 1)).toEqual({ year: 2026, month: 1 })
      expect(shiftMonth(2026, 0, 1)).toEqual({ year: 2026, month: 1 })
    })
  })

  describe('FR-CAL-4: monthSummary (Ringkasan Bulanan, K1, K2, K3)', () => {
    const c3Entries = [
      { trade_date: '2026-10-01', pnl: 60, status: 'plan' },
      { trade_date: '2026-10-01', pnl: 40, status: 'plan' },
      { trade_date: '2026-10-02', pnl: -25, status: 'plan' },
      { trade_date: '2026-10-05', pnl: 0, status: 'plan' },
      { trade_date: '2026-10-07', pnl: 10, status: 'plan' },
      { trade_date: '2026-10-08', pnl: -60, status: 'revenge' },
      { trade_date: '2026-09-30', pnl: 500, status: 'plan' },
    ]

    it('K1: data C3, Okt 2026 -> total P&L 25, win rate 50, hari trading 5', () => {
      const summary = monthSummary(c3Entries, 2026, 10)
      expect(summary.total).toBe(6)
      expect(summary.totalPnl).toBe(25)
      expect(summary.winRate).toBe(50)
      expect(summary.tradingDays).toBe(5)
    })

    it('K2: data C3, Sep 2026 -> total P&L 500, win rate 100, hari trading 1', () => {
      const summary = monthSummary(c3Entries, 2026, 9)
      expect(summary.total).toBe(1)
      expect(summary.totalPnl).toBe(500)
      expect(summary.winRate).toBe(100)
      expect(summary.tradingDays).toBe(1)
    })

    it('K3: data C3, Nov 2026 -> total P&L 0, win rate "—" (null), hari trading 0', () => {
      const summary = monthSummary(c3Entries, 2026, 11)
      expect(summary.total).toBe(0)
      expect(summary.totalPnl).toBe(0)
      expect(summary.winRate).toBeNull()
      expect(summary.tradingDays).toBe(0)
    })
  })

  describe('FR-CAL-2: entriesForDate (D1)', () => {
    it('D1: 1 Okt: trade pnl 60 dibuat lebih dulu, lalu trade pnl 40 -> daftar di modal: 40, lalu 60', () => {
      const entries = [
        {
          id: 't-1',
          trade_date: '2026-10-01',
          pnl: 60,
          created_at: '2026-10-01T08:00:00Z',
          instrument: 'BTC/USDT',
        },
        {
          id: 't-2',
          trade_date: '2026-10-01',
          pnl: 40,
          created_at: '2026-10-01T09:30:00Z',
          instrument: 'ETH/USDT',
        },
        {
          id: 't-3',
          trade_date: '2026-10-02',
          pnl: -25,
          created_at: '2026-10-02T10:00:00Z',
          instrument: 'SOL/USDT',
        },
      ]

      const result = entriesForDate(entries, '2026-10-01')
      expect(result.length).toBe(2)
      expect(result[0].pnl).toBe(40)
      expect(result[0].id).toBe('t-2')
      expect(result[1].pnl).toBe(60)
      expect(result[1].id).toBe('t-1')
    })

    it('mengembalikan array kosong jika input tidak valid', () => {
      expect(entriesForDate(null, '2026-10-01')).toEqual([])
      expect(entriesForDate([], null)).toEqual([])
    })
  })
})

