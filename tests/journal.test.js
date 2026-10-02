import { describe, expect, it } from 'vitest'
import {
  formatDateDisplay,
  isValidISODateString,
  parseLocalISODate,
  todayLocalISO,
} from '../src/lib/dateHelpers.js'
import { formatCurrency, formatPrice } from '../src/lib/formatters.js'
import {
  buildJournalPayload,
  parseOptionalNumber,
  sanitizeInstrument,
  validateJournalForm,
} from '../src/lib/journalValidation.js'
import { sortJournalEntries } from '../src/context/JournalContext.jsx'

describe('M3: Date Helpers (Bebas UTC Day-Shift)', () => {
  it('todayLocalISO mengembalikan tanggal lokal dan kebal terhadap perbedaan UTC', () => {
    // Skenario WIB: 2026-10-02 jam 00:30:00 (di mana UTC masih 2026-10-01 17:30:00)
    // Date(year, monthIndex, day, hours, minutes) menggunakan waktu lokal sistem
    const localMidnight = new Date(2026, 9, 2, 0, 30, 0)
    expect(todayLocalISO(localMidnight)).toBe('2026-10-02')

    const localNoon = new Date(2026, 9, 2, 12, 0, 0)
    expect(todayLocalISO(localNoon)).toBe('2026-10-02')
  })

  it('parseLocalISODate memecah string tanggal ke jam 12:00 siang lokal tanpa bergeser hari', () => {
    const parsed = parseLocalISODate('2026-10-02')
    expect(parsed).not.toBeNull()
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(9) // Oktober = index 9
    expect(parsed.getDate()).toBe(2)
    expect(parsed.getHours()).toBe(12)

    expect(parseLocalISODate('')).toBeNull()
    expect(parseLocalISODate('invalid-date')).toBeNull()
  })

  it('formatDateDisplay memformat tanggal sesuai bahasa aktif', () => {
    const dateStr = '2026-10-02'
    const idFormatted = formatDateDisplay(dateStr, 'id')
    const enFormatted = formatDateDisplay(dateStr, 'en')

    expect(idFormatted).toMatch(/2\s+Okt(ober)?\s+2026/i)
    expect(enFormatted).toMatch(/Oct(ober)?\s+2,?\s+2026/i)
    expect(formatDateDisplay(null)).toBe('-')
  })

  it('isValidISODateString memvalidasi tanggal kalender nyata dan mencegah tanggal masa depan', () => {
    const fakeToday = new Date(2026, 9, 2, 10, 0, 0)

    // Tanggal valid
    expect(isValidISODateString('2026-10-02', fakeToday)).toBe(true)
    expect(isValidISODateString('2026-01-15', fakeToday)).toBe(true)
    expect(isValidISODateString('2020-02-29', fakeToday)).toBe(true) // Tahun kabisat sah

    // Tanggal masa depan ditolak
    expect(isValidISODateString('2026-10-03', fakeToday)).toBe(false)
    expect(isValidISODateString('2027-01-01', fakeToday)).toBe(false)

    // Tanggal tidak nyata di kalender ditolak
    expect(isValidISODateString('2026-02-30', fakeToday)).toBe(false)
    expect(isValidISODateString('2026-04-31', fakeToday)).toBe(false)
    expect(isValidISODateString('2025-02-29', fakeToday)).toBe(false) // 2025 bukan kabisat

    // Sebelum tahun 2000 ditolak
    expect(isValidISODateString('1999-12-31', fakeToday)).toBe(false)

    // Format ngawur ditolak
    expect(isValidISODateString('02-10-2026', fakeToday)).toBe(false)
    expect(isValidISODateString('abc', fakeToday)).toBe(false)
  })
})

describe('M3: Number & Currency Formatters', () => {
  it('formatCurrency menghasilkan simbol mata uang dengan tanda eksplisit + / - / $0.00', () => {
    expect(formatCurrency(250, 'en')).toBe('+$250.00')
    expect(formatCurrency(-45.5, 'en')).toBe('-$45.50')
    expect(formatCurrency(0, 'en')).toBe('$0.00')
    expect(formatCurrency('invalid', 'en')).toBe('-')
  })

  it('formatPrice memformat angka desimal hingga 8 angka tanpa trailing nol berlebih', () => {
    expect(formatPrice(60000, 'en')).toBe('60,000')
    expect(formatPrice(1.09542, 'en')).toBe('1.09542')
    expect(formatPrice(0.00001234, 'en')).toBe('0.00001234')
    expect(formatPrice('', 'en')).toBe('-')
    expect(formatPrice(null, 'en')).toBe('-')
  })
})

describe('M3: Journal Form Validation & Payload Building', () => {
  it('sanitizeInstrument merapikan spasi, membatasi panjang, dan membuat uppercase', () => {
    expect(sanitizeInstrument('  btc/usdt  ')).toBe('BTC/USDT')
    expect(sanitizeInstrument('eur   usd')).toBe('EUR USD')
    expect(sanitizeInstrument('a'.repeat(40))).toBe('A'.repeat(30))
    expect(sanitizeInstrument(null)).toBe('')
  })

  it('parseOptionalNumber mengonversi string kosong menjadi null (bukan "") agar Postgres aman', () => {
    expect(parseOptionalNumber('')).toBeNull()
    expect(parseOptionalNumber(null)).toBeNull()
    expect(parseOptionalNumber(undefined)).toBeNull()
    expect(parseOptionalNumber('100.5')).toBe(100.5)
    expect(parseOptionalNumber(250)).toBe(250)
  })

  it('validateJournalForm mengizinkan Realized P&L bernilai 0 (break-even)', () => {
    const fakeToday = new Date(2026, 9, 2, 10, 0, 0)
    const validFormData = {
      trade_date: '2026-10-02',
      instrument: 'BTC/USDT',
      direction: 'buy',
      entry_price: '65000',
      sl_price: '64000',
      exit_price: '65000',
      pnl: '0', // Break-even harus sah!
      status: 'plan',
      note: 'BE trade',
    }

    const result = validateJournalForm(validFormData, fakeToday)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('validateJournalForm mendeteksi kolom wajib yang kosong', () => {
    const fakeToday = new Date(2026, 9, 2, 10, 0, 0)
    const emptyData = {
      trade_date: '',
      instrument: '',
      direction: '',
      pnl: '',
      status: '',
    }

    const result = validateJournalForm(emptyData, fakeToday)
    expect(result.isValid).toBe(false)
    expect(result.errors.instrument).toBe('journal.errorInstrumentRequired')
    expect(result.errors.direction).toBe('journal.fieldRequired')
    expect(result.errors.pnl).toBe('journal.errorPnlRequired')
    expect(result.errors.status).toBe('journal.fieldRequired')
    expect(result.errors.trade_date).toBe('journal.errorDateInvalid')
  })

  it('validateJournalForm menolak harga entry/SL/exit yang bernilai <= 0 jika diisi', () => {
    const fakeToday = new Date(2026, 9, 2, 10, 0, 0)
    const badPrices = {
      trade_date: '2026-10-02',
      instrument: 'ETH/USDT',
      direction: 'sell',
      entry_price: '-10',
      sl_price: '0',
      exit_price: '',
      pnl: '50',
      status: 'plan',
    }

    const result = validateJournalForm(badPrices, fakeToday)
    expect(result.isValid).toBe(false)
    expect(result.errors.entry_price).toBe('journal.errorPricePositive')
    expect(result.errors.sl_price).toBe('journal.errorPricePositive')
  })

  it('validateJournalForm menolak catatan lebih dari 500 karakter', () => {
    const fakeToday = new Date(2026, 9, 2, 10, 0, 0)
    const longNoteData = {
      trade_date: '2026-10-02',
      instrument: 'SOL/USDT',
      direction: 'buy',
      pnl: '100',
      status: 'plan',
      note: 'x'.repeat(501),
    }

    const result = validateJournalForm(longNoteData, fakeToday)
    expect(result.isValid).toBe(false)
    expect(result.errors.note).toBe('journal.errorNoteMaxLength')
  })

  it('buildJournalPayload membentuk objek yang bersih dan mensyaratkan user_id', () => {
    const validFormData = {
      trade_date: '2026-10-02',
      instrument: '  btc/usdt  ',
      direction: 'buy',
      entry_price: '',
      sl_price: '',
      exit_price: '65000',
      pnl: '150.50',
      status: 'plan',
      note: '  Disiplin sesuai setup break & retest  ',
    }

    expect(() => buildJournalPayload(validFormData, null)).toThrow()

    const payload = buildJournalPayload(validFormData, 'user-123')
    expect(payload).toEqual({
      user_id: 'user-123',
      trade_date: '2026-10-02',
      instrument: 'BTC/USDT',
      direction: 'buy',
      entry_price: null,
      sl_price: null,
      exit_price: 65000,
      pnl: 150.5,
      status: 'plan',
      note: 'Disiplin sesuai setup break & retest',
    })
  })
})

describe('M3: Deterministic Journal Sorting', () => {
  it('mengurutkan trade_date desc, created_at desc, lalu id desc secara deterministik', () => {
    const entries = [
      { id: '1', trade_date: '2026-10-01', created_at: '2026-10-01T10:00:00Z' },
      { id: '3', trade_date: '2026-10-02', created_at: '2026-10-02T12:00:00Z' },
      { id: '2', trade_date: '2026-10-02', created_at: '2026-10-02T08:00:00Z' },
      { id: '4', trade_date: '2026-10-01', created_at: '2026-10-01T10:00:00Z' }, // id beda, date & time sama
    ]

    const sorted = sortJournalEntries(entries)

    expect(sorted.map(e => e.id)).toEqual(['3', '2', '4', '1'])
  })

  it('trade bertanggal mundur langsung ditempatkan di posisi yang benar tanpa me-refresh', () => {
    const existing = [
      { id: 'a', trade_date: '2026-10-03', created_at: '2026-10-03T10:00:00Z' },
      { id: 'c', trade_date: '2026-10-01', created_at: '2026-10-01T10:00:00Z' },
    ]

    const backdatedNewTrade = {
      id: 'b',
      trade_date: '2026-10-02',
      created_at: '2026-10-03T11:00:00Z',
    }

    const reSorted = sortJournalEntries([backdatedNewTrade, ...existing])
    expect(reSorted.map(e => e.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('M3: Regression & Runtime Crash Safety', () => {
  it('EmptyState aman merender icon berupa forwardRef component (seperti BookOpen dari lucide-react)', async () => {
    const React = (await import('react')).default
    const { renderToString } = await import('react-dom/server')
    const { BookOpen } = await import('lucide-react')
    const { EmptyState } = await import('../src/components/ui/EmptyState.jsx')

    expect(() => {
      renderToString(
        React.createElement(EmptyState, {
          icon: BookOpen,
          title: 'Belum Ada Catatan Trade',
          description: 'Mulai catat trade Anda',
        })
      )
    }).not.toThrow()
  })

  it('EmptyState aman merender icon yang sudah berupa elemen JSX', async () => {
    const React = (await import('react')).default
    const { renderToString } = await import('react-dom/server')
    const { BookOpen } = await import('lucide-react')
    const { EmptyState } = await import('../src/components/ui/EmptyState.jsx')

    expect(() => {
      renderToString(
        React.createElement(EmptyState, {
          icon: React.createElement(BookOpen, { className: 'w-6 h-6' }),
          title: 'Belum Ada Catatan Trade',
          description: 'Mulai catat trade Anda',
        })
      )
    }).not.toThrow()
  })

  it('ErrorBoundary mengaktifkan hasError dan merender fallback aman saat terjadi error', async () => {
    const React = (await import('react')).default
    const { renderToString } = await import('react-dom/server')
    const { ErrorBoundary } = await import('../src/components/ErrorBoundary.jsx')
    const { LanguageProvider } = await import('../src/context/LanguageContext.jsx')

    // 1. Verifikasi getDerivedStateFromError menghasilkan hasError = true
    const derived = ErrorBoundary.getDerivedStateFromError(new Error('Simulated Crash'))
    expect(derived).toEqual({ hasError: true })

    // 2. Verifikasi render fallback saat state error aktif
    class ControlledErrorBoundary extends ErrorBoundary {
      constructor(props) {
        super(props)
        this.state = { hasError: true }
      }
    }

    const html = renderToString(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(ControlledErrorBoundary, null, 'Normal Content')
      )
    )

    expect(html).toContain('Terjadi Gangguan pada Halaman')
    expect(html).toContain('Muat Ulang Halaman')
    expect(html).not.toContain('Normal Content')
  })
})



