import { describe, expect, it } from 'vitest'
import { computeDashboardStats } from '../src/lib/dashboardStats.js'

describe('M5: computeDashboardStats (FR-DASH-1, FR-DASH-5)', () => {
  it('S0: tanpa trade mengembalikan nilai default dengan winRate null', () => {
    const res = computeDashboardStats([])
    expect(res).toEqual({
      total: 0,
      wins: 0,
      winRate: null,
      revengeCount: 0,
      totalPnl: 0,
    })
  })

  it('S1: pnl [100, -50, 0, 25.5, -10], status [plan, revenge, plan, plan, revenge]', () => {
    const entries = [
      { pnl: 100, status: 'plan' },
      { pnl: -50, status: 'revenge' },
      { pnl: 0, status: 'plan' },
      { pnl: 25.5, status: 'plan' },
      { pnl: -10, status: 'revenge' },
    ]
    const res = computeDashboardStats(entries)

    expect(res.total).toBe(5)
    expect(res.wins).toBe(2)
    expect(res.winRate).toBe(40)
    expect(res.revengeCount).toBe(2)
    expect(res.totalPnl).toBeCloseTo(65.5)
  })

  it('S2: pnl [0.1, 0.2] dengan akumulasi floating-point dan winRate 100', () => {
    const entries = [
      { pnl: 0.1, status: 'plan' },
      { pnl: 0.2, status: 'plan' },
    ]
    const res = computeDashboardStats(entries)

    expect(res.total).toBe(2)
    expect(res.wins).toBe(2)
    expect(res.winRate).toBe(100)
    expect(res.revengeCount).toBe(0)
    expect(res.totalPnl).toBeCloseTo(0.3, 5)
  })

  it('S3: 2 menang dari 3 menghasilkan winRate 67', () => {
    const entries = [
      { pnl: 100, status: 'plan' },
      { pnl: 50, status: 'plan' },
      { pnl: -20, status: 'plan' },
    ]
    const res = computeDashboardStats(entries)

    expect(res.total).toBe(3)
    expect(res.wins).toBe(2)
    expect(res.winRate).toBe(67)
  })

  it('S4: 1 menang dari 8 menghasilkan winRate 13 (Math.round(12.5) = 13)', () => {
    const entries = [
      { pnl: 100, status: 'plan' },
      { pnl: -10, status: 'plan' },
      { pnl: -10, status: 'plan' },
      { pnl: -10, status: 'plan' },
      { pnl: -10, status: 'plan' },
      { pnl: -10, status: 'plan' },
      { pnl: -10, status: 'plan' },
      { pnl: -10, status: 'plan' },
    ]
    const res = computeDashboardStats(entries)

    expect(res.total).toBe(8)
    expect(res.wins).toBe(1)
    expect(res.winRate).toBe(13)
  })

  it('aman menangani input non-array atau undefined tanpa melempar exception', () => {
    expect(computeDashboardStats(null)).toEqual({
      total: 0,
      wins: 0,
      winRate: null,
      revengeCount: 0,
      totalPnl: 0,
    })
    expect(computeDashboardStats(undefined)).toEqual({
      total: 0,
      wins: 0,
      winRate: null,
      revengeCount: 0,
      totalPnl: 0,
    })
    expect(computeDashboardStats('not-an-array')).toEqual({
      total: 0,
      wins: 0,
      winRate: null,
      revengeCount: 0,
      totalPnl: 0,
    })
  })

  it('mengkonversi string pnl menjadi number (koreksi 5)', () => {
    const entries = [
      { pnl: '200', status: 'plan' },
      { pnl: '-50.5', status: 'revenge' },
    ]
    const res = computeDashboardStats(entries)

    expect(res.total).toBe(2)
    expect(res.wins).toBe(1)
    expect(res.winRate).toBe(50)
    expect(res.revengeCount).toBe(1)
    expect(res.totalPnl).toBeCloseTo(149.5)
  })
})
