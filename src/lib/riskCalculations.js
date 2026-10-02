/**
 * Logika murni Kalkulator Risiko (FR-CALC-1 s.d. FR-CALC-7).
 *
 * Aturan penting:
 * 1. Fungsi murni tanpa JSX dan tanpa network access.
 * 2. TIDAK PERNAH melempar exception: selalu mengembalikan { ok: false, ... } atau { ok: true, ... }.
 * 3. Nilai input harus finite dan |nilai| <= 1e12.
 */

export const CONTRACT_PRESETS = {
  forex: 100000,
  gold: 100,
}

const MAX_VALUE = 1e12

/**
 * Mengubah input mentah menjadi number atau null jika kosong.
 * Mengembalikan NaN jika tidak valid / bukan finite number.
 *
 * @param {string|number|null|undefined} raw
 * @returns {number|null}
 */
export function parseDecimal(raw) {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed === '') return null
    const num = Number(trimmed)
    if (!Number.isFinite(num)) return NaN
    return num
  }
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return NaN
    return raw
  }
  return NaN
}

/**
 * Helper murni untuk inisialisasi saldo dari user_settings.balance.
 * Hanya mengisi jika balance > 0 dan field belum pernah disentuh pengguna.
 *
 * @param {number|string|null|undefined} settingsBalance
 * @param {string} currentInput
 * @param {boolean} isTouched
 * @returns {string}
 */
export function getInitialBalance(settingsBalance, currentInput, isTouched) {
  if (isTouched) return currentInput
  const num = Number(settingsBalance)
  if (Number.isFinite(num) && num > 0) {
    return String(num)
  }
  return currentInput || ''
}

/**
 * Menghitung ukuran posisi dan parameter risiko berdasarkan mode trading.
 *
 * @param {'crypto'|'forex'|'stock'} mode
 * @param {Record<string, any>} rawInputs
 * @returns {object}
 */
export function calculate(mode, rawInputs = {}) {
  try {
    if (!['crypto', 'forex', 'stock'].includes(mode)) {
      return {
        ok: false,
        missing: [],
        errors: { mode: 'calculator.errorInvalidMode' },
      }
    }

    const missing = []
    const errors = {}

    // 1. Parsing seluruh input
    const balance = parseDecimal(rawInputs.balance)
    const riskPercent = parseDecimal(rawInputs.riskPercent)
    const entryPrice = parseDecimal(rawInputs.entryPrice)
    const stopLossPrice = parseDecimal(rawInputs.stopLossPrice)
    const takeProfitPrice = parseDecimal(rawInputs.takeProfitPrice)

    // 2. Validasi field dasar (Common)
    if (balance === null) {
      missing.push('balance')
    } else if (
      Number.isNaN(balance) ||
      !Number.isFinite(balance) ||
      balance <= 0 ||
      Math.abs(balance) > MAX_VALUE
    ) {
      errors.balance = 'calculator.errorInvalidBalance'
    }

    if (riskPercent === null) {
      missing.push('riskPercent')
    } else if (
      Number.isNaN(riskPercent) ||
      !Number.isFinite(riskPercent) ||
      riskPercent <= 0 ||
      riskPercent > 100 ||
      Math.abs(riskPercent) > MAX_VALUE
    ) {
      errors.riskPercent = 'calculator.errorInvalidRiskPercent'
    }

    if (entryPrice === null) {
      missing.push('entryPrice')
    } else if (
      Number.isNaN(entryPrice) ||
      !Number.isFinite(entryPrice) ||
      entryPrice <= 0 ||
      Math.abs(entryPrice) > MAX_VALUE
    ) {
      errors.entryPrice = 'calculator.errorInvalidEntryPrice'
    }

    if (stopLossPrice === null) {
      missing.push('stopLossPrice')
    } else if (
      Number.isNaN(stopLossPrice) ||
      !Number.isFinite(stopLossPrice) ||
      stopLossPrice <= 0 ||
      Math.abs(stopLossPrice) > MAX_VALUE
    ) {
      errors.stopLossPrice = 'calculator.errorInvalidStopLossPrice'
    }

    // Zero distance check (E1)
    if (
      entryPrice !== null &&
      stopLossPrice !== null &&
      !errors.entryPrice &&
      !errors.stopLossPrice
    ) {
      if (entryPrice === stopLossPrice) {
        errors.stopLossPrice = 'calculator.errorZeroDistance'
      }
    }

    // Take Profit (opsional)
    if (takeProfitPrice !== null) {
      if (
        Number.isNaN(takeProfitPrice) ||
        !Number.isFinite(takeProfitPrice) ||
        takeProfitPrice <= 0 ||
        Math.abs(takeProfitPrice) > MAX_VALUE
      ) {
        errors.takeProfitPrice = 'calculator.errorInvalidTakeProfitPrice'
      }
    }

    // 3. Validasi field spesifik mode
    let leverage = null
    let contractSize = null

    if (mode === 'crypto') {
      leverage = parseDecimal(rawInputs.leverage)
      if (leverage === null) {
        missing.push('leverage')
      } else if (
        Number.isNaN(leverage) ||
        !Number.isFinite(leverage) ||
        leverage < 1 ||
        Math.abs(leverage) > MAX_VALUE
      ) {
        errors.leverage = 'calculator.errorInvalidLeverage'
      }
    } else if (mode === 'forex') {
      contractSize = parseDecimal(rawInputs.contractSize)
      if (contractSize === null) {
        missing.push('contractSize')
      } else if (
        Number.isNaN(contractSize) ||
        !Number.isFinite(contractSize) ||
        contractSize <= 0 ||
        Math.abs(contractSize) > MAX_VALUE
      ) {
        errors.contractSize = 'calculator.errorInvalidContractSize'
      }
    }

    // Jika ada field kosong atau invalid -> jangan hitung
    if (missing.length > 0 || Object.keys(errors).length > 0) {
      return { ok: false, missing, errors }
    }

    // 4. Kalkulasi variabel dasar
    const riskAmount = balance * (riskPercent / 100)
    const distance = Math.abs(entryPrice - stopLossPrice)
    const rr =
      takeProfitPrice !== null ? Math.abs(takeProfitPrice - entryPrice) / distance : null
    const warnings = []

    // 5. Kalkulasi spesifik mode
    if (mode === 'crypto') {
      const distancePercent = (distance / entryPrice) * 100
      const notionalValue = riskAmount / (distancePercent / 100)
      const coinSize = notionalValue / entryPrice
      const marginRequired = notionalValue / leverage

      if (marginRequired > balance) {
        warnings.push('calculator.marginWarning')
      }

      return {
        ok: true,
        riskAmount,
        distance,
        rr,
        distancePercent,
        notionalValue,
        coinSize,
        marginRequired,
        warnings,
      }
    }

    if (mode === 'forex') {
      const positionSizeUnits = riskAmount / distance
      const lot = positionSizeUnits / contractSize
      const lotMini = lot * 10
      const lotMicro = lot * 100

      return {
        ok: true,
        riskAmount,
        distance,
        rr,
        positionSizeUnits,
        lot,
        lotMini,
        lotMicro,
        warnings,
      }
    }

    if (mode === 'stock') {
      const rawShares = riskAmount / distance
      const shares = Math.floor(rawShares * (1 + 1e-9))
      const totalValue = shares * entryPrice

      if (shares === 0) {
        warnings.push('calculator.warningZeroShares')
      }

      return {
        ok: true,
        riskAmount,
        distance,
        rr,
        shares,
        totalValue,
        warnings,
      }
    }

    return {
      ok: false,
      missing: [],
      errors: { mode: 'calculator.errorInvalidMode' },
    }
  } catch (err) {
    return {
      ok: false,
      missing: [],
      errors: { generic: 'common.error' },
    }
  }
}

