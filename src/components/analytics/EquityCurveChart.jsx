import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDateDisplay } from '../../lib/dateHelpers.js'
import { formatCurrency } from '../../lib/formatters.js'

/**
 * Komponen grafik Equity Curve kumulatif (FR-ANA-1).
 * Menerima prop width/height opsional untuk testing tanpa DOM;
 * membungkus dalam ResponsiveContainer jika dimensi tidak disediakan.
 */
export function EquityCurveChart({ data = [], width, height, t, lang }) {
  const hasData = Array.isArray(data) && data.length > 0
  const finalPnl = hasData ? data[data.length - 1].value : 0
  const daysCount = hasData ? data.length : 0

  // Warna garis mengikuti performa akhir kumulatif
  const strokeColor = finalPnl >= 0 ? 'var(--color-sage, #22c55e)' : 'var(--color-brick, #ef4444)'

  // Kustomisasi Tooltip agar sesuai desain Trading Compass
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value
      return (
        <div className="rounded-lg border border-line bg-bg-panel p-2.5 shadow-md font-mono text-xs">
          <p className="text-text-secondary mb-1">
            {formatDateDisplay(label, lang)}
          </p>
          <p className={`font-bold ${val >= 0 ? 'text-sage' : 'text-brick'}`}>
            {formatCurrency(val, lang)}
          </p>
        </div>
      )
    }
    return null
  }

  const renderChart = (w, h) => (
    <LineChart
      width={w}
      height={h}
      data={data}
      margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
    >
      <CartesianGrid stroke="var(--color-line, #374151)" strokeDasharray="3 3" opacity={0.4} />
      <XAxis
        dataKey="date"
        stroke="var(--color-text-secondary, #9ca3af)"
        fontSize={11}
        tickLine={false}
        tickFormatter={(val) => {
          const parts = val.split('-')
          return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val
        }}
      />
      <YAxis
        stroke="var(--color-text-secondary, #9ca3af)"
        fontSize={11}
        tickLine={false}
        domain={['auto', 'auto']}
        tickFormatter={(val) => {
          if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(1)}k`
          return `$${val}`
        }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Line
        type="monotone"
        dataKey="value"
        stroke={strokeColor}
        strokeWidth={2.5}
        dot={{ r: 3, fill: strokeColor }}
        activeDot={{ r: 5 }}
      />
    </LineChart>
  )

  return (
    <div className="w-full space-y-2">
      {/* Teks Ringkasan Aksesibilitas Pembaca Layar */}
      <p className="sr-only">
        {t('analytics.equitySrSummary', {
          finalPnl: formatCurrency(finalPnl, lang),
          days: daysCount,
        })}
      </p>

      {/* Render Chart */}
      {width && height ? (
        renderChart(width, height)
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
