import {
  AlertTriangle,
  Coins,
  DollarSign,
  HelpCircle,
  Info,
  Layers,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  formatCoin,
  formatCurrency,
  formatLot,
  formatPercent,
  formatPrice,
  formatRR,
  formatShares,
  formatUnits,
} from '../../lib/formatters.js'
import { Button } from '../ui/Button.jsx'
import { Card } from '../ui/Card.jsx'
import { Input } from '../ui/Input.jsx'

/**
 * Komponen murni antarmuka Kalkulator Risiko (props-only).
 * Tidak memanggil context hooks maupun akses database/Supabase sehingga aman diuji di Node.
 */
export function CalculatorView({
  values = {},
  mode = 'crypto',
  forexPreset = 'forex',
  result = {},
  lang = 'id',
  t = (key) => key,
  onValueChange,
  onModeChange,
  onPresetChange,
}) {
  const hasErrors = result.errors && Object.keys(result.errors).length > 0
  const isMissing = !result.ok && result.missing && result.missing.length > 0 && !hasErrors

  return (
    <div className="space-y-6">
      {/* Tab Navigasi Mode */}
      <div
        role="tablist"
        aria-label={t('calculator.title')}
        className="flex border-b border-line gap-2 sm:gap-6"
      >
        <button
          type="button"
          role="tab"
          id="tab-crypto"
          aria-selected={mode === 'crypto'}
          aria-controls="panel-calculator"
          onClick={() => onModeChange?.('crypto')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors duration-150 flex items-center gap-2 ${
            mode === 'crypto'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{t('calculator.tabCrypto')}</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-forex"
          aria-selected={mode === 'forex'}
          aria-controls="panel-calculator"
          onClick={() => onModeChange?.('forex')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors duration-150 flex items-center gap-2 ${
            mode === 'forex'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{t('calculator.tabForex')}</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-stock"
          aria-selected={mode === 'stock'}
          aria-controls="panel-calculator"
          onClick={() => onModeChange?.('stock')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors duration-150 flex items-center gap-2 ${
            mode === 'stock'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('calculator.tabStocks')}</span>
        </button>
      </div>

      {/* Grid Formulir Input */}
      <Card className="border border-line bg-bg-panel p-5 sm:p-6 shadow-sm">
        <form
          id="panel-calculator"
          role="tabpanel"
          aria-labelledby={`tab-${mode}`}
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
        >
          {/* Saldo Akun */}
          <Input
            id="input-balance"
            label={t('calculator.balance')}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="10000"
            value={values.balance ?? ''}
            onChange={(e) => onValueChange?.('balance', e.target.value)}
            error={result.errors?.balance ? t(result.errors.balance) : undefined}
          />

          {/* Persentase Risiko */}
          <Input
            id="input-risk-percent"
            label={t('calculator.riskPercent')}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="1"
            value={values.riskPercent ?? ''}
            onChange={(e) => onValueChange?.('riskPercent', e.target.value)}
            error={result.errors?.riskPercent ? t(result.errors.riskPercent) : undefined}
          />

          {/* Harga Entry */}
          <Input
            id="input-entry-price"
            label={t('calculator.entryPrice')}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="100"
            value={values.entryPrice ?? ''}
            onChange={(e) => onValueChange?.('entryPrice', e.target.value)}
            error={result.errors?.entryPrice ? t(result.errors.entryPrice) : undefined}
          />

          {/* Harga Stop Loss */}
          <Input
            id="input-stop-loss-price"
            label={t('calculator.stopLossPrice')}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="98"
            value={values.stopLossPrice ?? ''}
            onChange={(e) => onValueChange?.('stopLossPrice', e.target.value)}
            error={result.errors?.stopLossPrice ? t(result.errors.stopLossPrice) : undefined}
          />

          {/* Harga Take Profit (Opsional) */}
          <Input
            id="input-take-profit-price"
            label={t('calculator.takeProfitOptional')}
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="106"
            value={values.takeProfitPrice ?? ''}
            onChange={(e) => onValueChange?.('takeProfitPrice', e.target.value)}
            error={result.errors?.takeProfitPrice ? t(result.errors.takeProfitPrice) : undefined}
          />

          {/* Field Spesifik Mode Crypto: Leverage */}
          {mode === 'crypto' && (
            <Input
              id="input-leverage"
              label={t('calculator.leverage')}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="10"
              value={values.leverage ?? ''}
              onChange={(e) => onValueChange?.('leverage', e.target.value)}
              error={result.errors?.leverage ? t(result.errors.leverage) : undefined}
            />
          )}

          {/* Field Spesifik Mode Forex: Presets & Ukuran Kontrak */}
          {mode === 'forex' && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label
                htmlFor="input-contract-size"
                className="text-xs font-medium text-text-secondary flex items-center justify-between"
              >
                <span>{t('calculator.contractSize')}</span>
                <span className="text-text-secondary/70">
                  {forexPreset === 'forex'
                    ? t('calculator.presetForex')
                    : forexPreset === 'gold'
                    ? t('calculator.presetGold')
                    : t('calculator.presetCustom')}
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant={forexPreset === 'forex' ? 'primary' : 'secondary'}
                  onClick={() => onPresetChange?.('forex')}
                  className="text-xs"
                >
                  {t('calculator.presetForex')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={forexPreset === 'gold' ? 'primary' : 'secondary'}
                  onClick={() => onPresetChange?.('gold')}
                  className="text-xs"
                >
                  {t('calculator.presetGold')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={forexPreset === 'custom' ? 'primary' : 'secondary'}
                  onClick={() => onPresetChange?.('custom')}
                  className="text-xs"
                >
                  {t('calculator.presetCustom')}
                </Button>
              </div>

              <Input
                id="input-contract-size"
                type="number"
                step="any"
                inputMode="decimal"
                value={values.contractSize ?? ''}
                onChange={(e) => onValueChange?.('contractSize', e.target.value)}
                error={result.errors?.contractSize ? t(result.errors.contractSize) : undefined}
              />
            </div>
          )}
        </form>
      </Card>

      {/* Petunjuk Netral Jika Ada Field Wajib yang Masih Kosong */}
      {isMissing && (
        <div className="rounded-lg border border-line bg-bg-panel/70 p-4 flex items-center gap-3 text-text-secondary">
          <Info className="w-5 h-5 shrink-0 text-accent" />
          <p className="text-xs sm:text-sm">
            {mode === 'crypto'
              ? t('calculator.missingFieldsHintCrypto')
              : mode === 'forex'
              ? t('calculator.missingFieldsHintForex')
              : t('calculator.missingFieldsHint')}
          </p>
        </div>
      )}

      {/* Area Hasil Perhitungan Live (aria-live="polite") */}
      <div aria-live="polite" aria-atomic="true">
        {result.ok && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Metrik Dasar: Nilai Risiko, Jarak SL, Rasio R:R */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="border border-line bg-bg-panel p-4">
                <span className="text-xs text-text-secondary block mb-1">
                  {t('calculator.riskAmount')}
                </span>
                <span className="font-display text-xl sm:text-2xl font-bold text-brick">
                  {formatCurrency(result.riskAmount, lang)}
                </span>
              </Card>

              <Card className="border border-line bg-bg-panel p-4">
                <span className="text-xs text-text-secondary block mb-1">
                  {t('calculator.stopLossDistance')}
                </span>
                <span className="font-display text-xl sm:text-2xl font-bold text-text-primary">
                  {formatPrice(result.distance, lang)}
                </span>
              </Card>

              <Card className="border border-line bg-bg-panel p-4">
                <span className="text-xs text-text-secondary block mb-1">
                  {t('calculator.rrRatio')}
                </span>
                <span className="font-display text-xl sm:text-2xl font-bold text-accent">
                  {formatRR(result.rr, lang)}
                </span>
              </Card>
            </div>

            {/* Metrik Spesifik Mode */}
            {mode === 'crypto' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.distancePercent')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-text-primary">
                      {formatPercent(result.distancePercent, lang)}
                    </span>
                  </Card>

                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.notionalValue')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-text-primary">
                      {formatCurrency(result.notionalValue, lang)}
                    </span>
                  </Card>

                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.coinSize')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-text-primary">
                      {formatCoin(result.coinSize, lang)}
                    </span>
                  </Card>

                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.marginRequired')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-accent">
                      {formatCurrency(result.marginRequired, lang)}
                    </span>
                  </Card>
                </div>

                {/* Peringatan Margin */}
                {result.warnings?.includes('calculator.marginWarning') && (
                  <div
                    role="alert"
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-2.5 text-amber-500 text-xs sm:text-sm"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{t('calculator.marginWarning')}</span>
                  </div>
                )}
              </div>
            )}

            {mode === 'forex' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.lotStandard')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-accent">
                      {formatLot(result.lot, lang)}
                    </span>
                  </Card>

                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.lotMini')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-text-primary">
                      {formatLot(result.lotMini, lang)}
                    </span>
                  </Card>

                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.lotMicro')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-text-primary">
                      {formatLot(result.lotMicro, lang)}
                    </span>
                  </Card>

                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.positionUnits')}
                    </span>
                    <span className="font-display text-lg sm:text-xl font-semibold text-text-primary">
                      {formatUnits(result.positionSizeUnits, lang)}
                    </span>
                  </Card>
                </div>

                {/* Catatan Edukasi Kuotasi USD & Kontrak Broker */}
                <div className="rounded-lg border border-line bg-bg-panel/40 p-3.5 flex items-start gap-2.5 text-text-secondary text-xs leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-accent mt-0.5" />
                  <span>{t('calculator.forexDisclaimer')}</span>
                </div>
              </div>
            )}

            {mode === 'stock' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.shares')}
                    </span>
                    <span className="font-display text-xl sm:text-2xl font-bold text-accent">
                      {formatShares(result.shares, lang)}
                    </span>
                  </Card>

                  <Card className="border border-line bg-bg-panel p-4">
                    <span className="text-xs text-text-secondary block mb-1">
                      {t('calculator.totalStockValue')}
                    </span>
                    <span className="font-display text-xl sm:text-2xl font-bold text-text-primary">
                      {formatCurrency(result.totalValue, lang)}
                    </span>
                  </Card>
                </div>

                {/* Peringatan Risiko Terlalu Kecil untuk 1 Lembar */}
                {result.warnings?.includes('calculator.warningZeroShares') && (
                  <div
                    role="alert"
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-2.5 text-amber-500 text-xs sm:text-sm"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{t('calculator.warningZeroShares')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
