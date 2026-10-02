import { useEffect, useState } from 'react'
import { validateBalanceInput } from '../../lib/userSettingsHelpers.js'

/**
 * Komponen inline input saldo akun Dashboard (FR-DASH-2).
 * Komponen murni (props-only, tanpa context atau Supabase).
 *
 * Sesuai koreksi 2, 3, 4:
 * - Enter hanya memanggil blur(); penyimpanan hanya lewat onBlur.
 * - Abaikan pemicu selama status saving.
 * - Nonaktif sampai pengaturan termuat.
 * - Draf lokal hanya disinkronkan dari nilai tersimpan saat tidak sedang fokus/diedit.
 * - Validasi ketat (string kosong/spasi ditolak & kembali ke nilai tersimpan).
 *
 * @param {Object} props
 * @param {number} props.balance Nilai saldo akun tersimpan
 * @param {boolean} [props.loading=false] Status loading pengaturan
 * @param {(val: number) => Promise<{ ok: boolean, unchanged?: boolean, balance?: number, error?: string }>} props.onSaveBalance
 * @param {(key: string, params?: Object) => string} props.t
 * @param {'id'|'en'} props.lang
 */
export function BalanceInput({ balance, loading = false, onSaveBalance, t, lang }) {
  const [inputValue, setInputValue] = useState(
    balance !== undefined && balance !== null ? String(balance) : '0'
  )
  const [isFocused, setIsFocused] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const [errorMessage, setErrorMessage] = useState(null)

  // Sinkronisasi draf lokal hanya saat field TIDAK sedang fokus (koreksi 4)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(balance !== undefined && balance !== null ? String(balance) : '0')
    }
  }, [balance, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleKeyDown = (e) => {
    // Tombol Enter hanya memanggil blur(); penyimpanan HANYA lewat onBlur (koreksi 3)
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const handleBlur = async () => {
    setIsFocused(false)

    // Abaikan pemicu jika sedang memuat atau sedang dalam proses saving (koreksi 3 & 4)
    if (loading || status === 'saving') return

    // Validasi input
    const valRes = validateBalanceInput(inputValue)
    if (!valRes.ok) {
      setStatus('error')
      setErrorMessage(t(valRes.error))
      // Koreksi 2: string kosong/spasi/tidak valid tidak mengirim request dan kembali ke nilai tersimpan
      setInputValue(balance !== undefined && balance !== null ? String(balance) : '0')
      return
    }

    // Jika nilainya tidak berubah dari balance yang tersimpan, lewati
    if (valRes.value === Number(balance)) {
      setStatus('idle')
      setErrorMessage(null)
      return
    }

    // Mulai proses penyimpanan
    setStatus('saving')
    setErrorMessage(null)

    try {
      const res = await onSaveBalance(valRes.value)
      if (res?.ok) {
        setStatus('saved')
        setErrorMessage(null)
        setTimeout(() => {
          setStatus((prev) => (prev === 'saved' ? 'idle' : prev))
        }, 2500)
      } else {
        setStatus('error')
        setErrorMessage(t(res?.error || 'dashboard.errorBalanceSave'))
        // Kembali ke nilai tersimpan saat gagal
        setInputValue(balance !== undefined && balance !== null ? String(balance) : '0')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(t('dashboard.errorBalanceSave'))
      setInputValue(balance !== undefined && balance !== null ? String(balance) : '0')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label
          htmlFor="dashboard-balance-input"
          className="text-xs font-medium text-text-secondary uppercase tracking-wider"
        >
          {t('dashboard.balanceLabel')}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-text-secondary font-mono text-sm pointer-events-none select-none">
            $
          </span>
          <input
            id="dashboard-balance-input"
            type="number"
            step="any"
            inputMode="decimal"
            disabled={loading || status === 'saving'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'balance-error-msg' : 'balance-hint'}
            className={`w-44 pl-7 pr-3 py-1.5 rounded-lg border text-sm font-mono transition-colors focus:outline-none focus:ring-1 ${
              status === 'error'
                ? 'border-brick text-brick focus:ring-brick bg-brick/5'
                : 'border-line text-text-primary bg-bg-panel hover:border-line/80 focus:border-accent focus:ring-accent'
            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Status indicator */}
        <div className="text-xs font-medium">
          {status === 'saving' && (
            <span className="text-text-secondary animate-pulse">
              {t('dashboard.balanceSaving')}
            </span>
          )}
          {status === 'saved' && (
            <span className="text-sage flex items-center gap-1">
              ✓ {t('dashboard.balanceSaved')}
            </span>
          )}
        </div>
      </div>

      {/* Description / Error message */}
      {status === 'error' && errorMessage ? (
        <p id="balance-error-msg" className="text-xs text-brick font-medium">
          {errorMessage}
        </p>
      ) : (
        <p id="balance-hint" className="text-[11px] text-text-secondary">
          {t('dashboard.balanceHint')}
        </p>
      )}
    </div>
  )
}
