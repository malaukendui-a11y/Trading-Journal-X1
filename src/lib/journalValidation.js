import { isValidISODateString } from './dateHelpers.js'

/**
 * Sanitasi string instrumen: trim, rapikan spasi ganda, maks 30 karakter, ubah ke uppercase.
 * @param {string} raw
 * @returns {string}
 */
export function sanitizeInstrument(raw) {
  if (!raw || typeof raw !== 'string') return ''
  return raw.trim().replace(/\s+/g, ' ').toUpperCase().slice(0, 30)
}

/**
 * Mengonversi field angka opsional menjadi number atau null jika string kosong.
 * Mencegah Postgres menolak string kosong "" pada kolom numerik.
 *
 * @param {any} val
 * @returns {number|null}
 */
export function parseOptionalNumber(val) {
  if (val === '' || val === null || val === undefined) return null
  const num = Number(val)
  return Number.isFinite(num) ? num : null
}

/**
 * Validasi form tambah trade.
 * Mengembalikan objek { isValid, errors } dengan kunci error berbasis i18n.
 *
 * @param {Object} formData
 * @param {Date} [now=new Date()]
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateJournalForm(formData, now = new Date()) {
  const errors = {}

  // 1. Instrumen (wajib, max 30)
  const cleanInstrument = sanitizeInstrument(formData?.instrument)
  if (!cleanInstrument) {
    errors.instrument = 'journal.errorInstrumentRequired'
  }

  // 2. Arah (wajib: 'buy' atau 'sell')
  const direction = formData?.direction
  if (direction !== 'buy' && direction !== 'sell') {
    errors.direction = 'journal.fieldRequired'
  }

  // 3. Realized P&L (wajib, angka berhingga, |pnl| <= 1e12, P&L = 0 sah)
  if (
    formData?.pnl === '' ||
    formData?.pnl === null ||
    formData?.pnl === undefined
  ) {
    errors.pnl = 'journal.errorPnlRequired'
  } else {
    const pnlNum = Number(formData.pnl)
    if (!Number.isFinite(pnlNum) || Math.abs(pnlNum) > 1e12) {
      errors.pnl = 'journal.errorPnlInvalid'
    }
  }

  // 4. Status Eksekusi (wajib: 'plan' atau 'revenge')
  const status = formData?.status
  if (status !== 'plan' && status !== 'revenge') {
    errors.status = 'journal.fieldRequired'
  }

  // 5. Tanggal Trade (wajib, ISO valid, tidak di masa depan, >= 2000-01-01)
  if (!formData?.trade_date || !isValidISODateString(formData.trade_date, now)) {
    errors.trade_date = 'journal.errorDateInvalid'
  }

  // 6. Harga Opsional (entry, SL, exit): jika diisi harus > 0 dan finite <= 1e12
  const checkOptionalPrice = (val, fieldName) => {
    if (val !== '' && val !== null && val !== undefined) {
      const num = Number(val)
      if (!Number.isFinite(num) || num <= 0 || num > 1e12) {
        errors[fieldName] = 'journal.errorPricePositive'
      }
    }
  }

  checkOptionalPrice(formData?.entry_price, 'entry_price')
  checkOptionalPrice(formData?.sl_price, 'sl_price')
  checkOptionalPrice(formData?.exit_price, 'exit_price')

  // 7. Catatan (opsional, max 500)
  if (formData?.note && typeof formData.note === 'string' && formData.note.length > 500) {
    errors.note = 'journal.errorNoteMaxLength'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Membangun payload insert journal_entries yang bersih dan aman.
 * Mengharuskan userId eksplisit dari session login aktif.
 *
 * @param {Object} formData
 * @param {string} userId
 * @returns {Object}
 */
export function buildJournalPayload(formData, userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('user_id wajib disertakan untuk insert journal_entry')
  }

  return {
    user_id: userId,
    trade_date: formData.trade_date,
    instrument: sanitizeInstrument(formData.instrument),
    direction: formData.direction === 'sell' ? 'sell' : 'buy',
    entry_price: parseOptionalNumber(formData.entry_price),
    sl_price: parseOptionalNumber(formData.sl_price),
    exit_price: parseOptionalNumber(formData.exit_price),
    pnl: Number(formData.pnl),
    status: formData.status === 'revenge' ? 'revenge' : 'plan',
    note:
      formData.note && typeof formData.note === 'string' && formData.note.trim()
        ? formData.note.trim().slice(0, 500)
        : null,
  }
}

