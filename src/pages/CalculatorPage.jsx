import { useEffect, useMemo, useRef, useState } from 'react'
import { CalculatorView } from '../components/calculator/CalculatorView.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useUserSettings } from '../hooks/useUserSettings.js'
import { CONTRACT_PRESETS, calculate, resolveInitialBalance } from '../lib/riskCalculations.js'

export function CalculatorPage() {
  const { t, lang } = useLanguage()
  const { balance: savedBalance } = useUserSettings()

  const [mode, setMode] = useState('crypto')
  const [forexPreset, setForexPreset] = useState('forex')
  const [values, setValues] = useState({
    balance: '',
    riskPercent: '1',
    entryPrice: '',
    stopLossPrice: '',
    takeProfitPrice: '',
    leverage: '10',
    contractSize: String(CONTRACT_PRESETS.forex),
  })

  const isBalanceTouchedRef = useRef(false)
  const hasInitializedBalanceRef = useRef(false)

  // Inisialisasi saldo dari user_settings.balance satu kali setelah termuat, jika belum disentuh (FR-CALC-6)
  useEffect(() => {
    if (hasInitializedBalanceRef.current) return

    const { value, lock } = resolveInitialBalance(
      savedBalance,
      values.balance,
      isBalanceTouchedRef.current
    )
    if (value && value !== values.balance) {
      setValues((prev) => ({ ...prev, balance: value }))
    }
    // Kunci hanya setelah saldo > 0 termuat atau field disentuh, bukan saat saldo awal masih 0
    if (lock) {
      hasInitializedBalanceRef.current = true
    }
  }, [savedBalance, values.balance])

  // Handler perubahan input nilai
  const handleValueChange = (field, val) => {
    if (field === 'balance') {
      isBalanceTouchedRef.current = true
    }

    if (field === 'contractSize') {
      const trimmed = val.trim()
      if (trimmed === String(CONTRACT_PRESETS.forex)) {
        setForexPreset('forex')
      } else if (trimmed === String(CONTRACT_PRESETS.gold)) {
        setForexPreset('gold')
      } else {
        setForexPreset('custom')
      }
    }

    setValues((prev) => ({
      ...prev,
      [field]: val,
    }))
  }

  // Handler pergantian preset Forex/Emas
  const handlePresetChange = (preset) => {
    setForexPreset(preset)
    if (preset === 'forex') {
      setValues((prev) => ({ ...prev, contractSize: String(CONTRACT_PRESETS.forex) }))
    } else if (preset === 'gold') {
      setValues((prev) => ({ ...prev, contractSize: String(CONTRACT_PRESETS.gold) }))
    }
  }

  // Hitung live tanpa akses database
  const result = useMemo(() => calculate(mode, values), [mode, values])

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h1 className="font-display text-2xl md:text-[30px] font-semibold tracking-[-0.01em] text-text-primary">
          {t('calculator.title')}
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          {t('calculator.subtitle')}
        </p>
      </div>

      <CalculatorView
        values={values}
        mode={mode}
        forexPreset={forexPreset}
        result={result}
        lang={lang}
        t={t}
        onValueChange={handleValueChange}
        onModeChange={setMode}
        onPresetChange={handlePresetChange}
      />
    </div>
  )
}

