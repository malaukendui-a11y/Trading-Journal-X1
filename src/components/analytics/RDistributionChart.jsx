import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Komponen grafik Distribusi R-Multiple (FR-ANA-2).
 * Menerima prop width/height opsional untuk testing tanpa DOM;
 * membungkus dalam ResponsiveContainer jika dimensi tidak disediakan.
 */
export function RDistributionChart({
  bins = [],
  excluded = 0,
  excludedReasons = { missing: 0, invalidRisk: 0 },
  width,
  height,
  t,
  lang,
}) {
  const validTotal = bins.reduce((acc, curr) => acc + (curr.count || 0), 0)

  // Warna bar berbasis nilai bin R
  const getBarColor = (binVal) => {
    if (binVal > 0) return 'var(--sage)'
    if (binVal < 0) return 'var(--brick)'
    return 'var(--text-secondary)'
  }
  // Batang 0R memakai opasitas .45 (design.md §5.5)
  const getBarOpacity = (binVal) => (binVal === 0 ? 0.45 : 1)

  // Tooltip kustom
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="glass rounded-xl p-2.5 tabular-nums text-xs">
          <p className="font-bold text-text-primary mb-0.5">
            {item.label}
          </p>
          <p className="text-accent-text font-semibold">
            {item.count} {t('dashboard.tradeCountUnit')}
          </p>
        </div>
      )
    }
    return null
  }

  const renderChart = (w, h) => (
    <BarChart
      width={w}
      height={h}
      data={bins}
      margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
    >
      <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
      <XAxis
        dataKey="label"
        stroke="var(--text-secondary)"
        fontSize={11}
        tickLine={false}
      />
      <YAxis
        stroke="var(--text-secondary)"
        fontSize={11}
        tickLine={false}
        allowDecimals={false}
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
        {bins.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={getBarColor(entry.bin)} fillOpacity={getBarOpacity(entry.bin)} />
        ))}
      </Bar>
    </BarChart>
  )

  return (
    <div className="w-full space-y-2">
      {/* Teks Ringkasan Pembaca Layar */}
      <p className="sr-only">
        {t('analytics.rDistSrSummary', {
          valid: validTotal,
          excluded,
        })}
      </p>

      {/* Render Bar Chart */}
      {width && height ? (
        renderChart(width, height)
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}

      {/* Rincian Trade yang Dikecualikan dari Histogram */}
      <div className="pt-2 border-t border-line">
        {excluded > 0 ? (
          <p className="text-xs text-text-secondary">
            {t('analytics.excludedText', {
              count: excluded,
              missing: excludedReasons?.missing || 0,
              invalidRisk: excludedReasons?.invalidRisk || 0,
            })}
          </p>
        ) : (
          <p className="text-xs text-text-secondary">
            {t('analytics.excludedNone')}
          </p>
        )}
      </div>
    </div>
  )
}
