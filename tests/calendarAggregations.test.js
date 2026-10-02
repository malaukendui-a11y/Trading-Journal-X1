import { describe, expect, it } from 'vitest'
import {
  buildMonthGrid,
  dayLevel,
  groupDailyPnl,
  monthMaxAbs,
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
})
