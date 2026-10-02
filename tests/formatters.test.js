import { describe, expect, it } from 'vitest'
import {
  formatCoin,
  formatCurrency,
  formatLot,
  formatPercent,
  formatPrice,
  formatRR,
  formatShares,
  formatUnits,
} from '../src/lib/formatters.js'

describe('M4: Formatters Unit Tests (FR-CALC-5 & Correction 6)', () => {
  it('formatLot memformat tepat 4 desimal untuk V5 dan lainnya', () => {
    // V5: lot 0.05 harus tampil "0,0500" di ID dan "0.0500" di EN
    expect(formatLot(0.05, 'id')).toBe('0,0500')
    expect(formatLot(0.05, 'en')).toBe('0.0500')

    // V4: lot 0.2
    expect(formatLot(0.2, 'id')).toBe('0,2000')
    expect(formatLot(0.2, 'en')).toBe('0.2000')

    // Kasus null / invalid
    expect(formatLot(null)).toBe('-')
    expect(formatLot(undefined)).toBe('-')
    expect(formatLot('')).toBe('-')
    expect(formatLot('abc')).toBe('-')
  })

  it('formatCoin memformat koin hingga 8 desimal tanpa trailing zeros', () => {
    expect(formatCoin(50, 'id')).toBe('50')
    expect(formatCoin(0.06666667, 'en')).toBe('0.06666667')
    expect(formatCoin(null)).toBe('-')
  })

  it('formatPercent memformat persentase 2 desimal dengan simbol %', () => {
    expect(formatPercent(2, 'id')).toBe('2,00%')
    expect(formatPercent(2, 'en')).toBe('2.00%')
    expect(formatPercent(0.5, 'id')).toBe('0,50%')
    expect(formatPercent(null)).toBe('-')
  })

  it('formatUnits memformat unit hingga 4 desimal', () => {
    expect(formatUnits(20000, 'en')).toBe('20,000')
    expect(formatUnits(5, 'id')).toBe('5')
    expect(formatUnits(null)).toBe('-')
  })

  it('formatShares memformat lembar saham sebagai bilangan bulat', () => {
    expect(formatShares(100, 'id')).toBe('100')
    expect(formatShares(50, 'en')).toBe('50')
    expect(formatShares(0, 'id')).toBe('0')
    expect(formatShares(null)).toBe('-')
  })

  it('formatRR memformat rasio Risk:Reward format 1 : X.XX', () => {
    expect(formatRR(3, 'id')).toBe('1 : 3,00')
    expect(formatRR(3, 'en')).toBe('1 : 3.00')
    expect(formatRR(2.5, 'en')).toBe('1 : 2.50')
    expect(formatRR(null)).toBe('-')
    expect(formatRR(undefined)).toBe('-')
  })

  it('formatCurrency dan formatPrice berfungsi konsisten', () => {
    expect(formatCurrency(100, 'en')).toBe('+$100.00')
    expect(formatCurrency(-25, 'en')).toBe('-$25.00')
    expect(formatPrice(100.2, 'en')).toBe('100.2')
  })
})

