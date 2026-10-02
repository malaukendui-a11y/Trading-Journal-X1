import { Card } from '../ui/Card.jsx'
import { formatCurrency } from '../../lib/formatters.js'

/**
 * Grid 4 metrik statistik utama Dashboard (FR-DASH-1).
 * Komponen murni (props-only).
 *
 * @param {Object} props
 * @param {{ total: number, wins: number, winRate: number|null, revengeCount: number, totalPnl: number }} props.stats
 * @param {(key: string, params?: Object) => string} props.t
 * @param {'id'|'en'} props.lang
 */
export function StatGrid({ stats, t, lang }) {
  const total = stats?.total ?? 0
  const winRate = stats?.winRate !== null && stats?.winRate !== undefined ? `${stats.winRate}%` : '—'
  const revengeCount = stats?.revengeCount ?? 0
  const totalPnl = stats?.totalPnl ?? 0

  const pnlColorClass = totalPnl >= 0 ? 'text-sage' : 'text-brick'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Trade */}
      <Card className="p-4 border border-line bg-bg-panel flex flex-col justify-between">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('dashboard.totalTrades')}
        </p>
        <p className="text-2xl font-bold font-mono text-text-primary mt-2">
          {total}
        </p>
      </Card>

      {/* 2. Win Rate */}
      <Card className="p-4 border border-line bg-bg-panel flex flex-col justify-between">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('dashboard.winRate')}
        </p>
        <p className="text-2xl font-bold font-mono text-text-primary mt-2">
          {winRate}
        </p>
      </Card>

      {/* 3. Revenge Trade */}
      <Card className="p-4 border border-line bg-bg-panel flex flex-col justify-between">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('dashboard.revengeTrades')}
        </p>
        <p className="text-2xl font-bold font-mono text-text-primary mt-2">
          {revengeCount}
        </p>
      </Card>

      {/* 4. Total P&L */}
      <Card className="p-4 border border-line bg-bg-panel flex flex-col justify-between">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {t('dashboard.totalPnl')}
        </p>
        <p className={`text-2xl font-bold font-mono mt-2 ${pnlColorClass}`}>
          {formatCurrency(totalPnl, lang)}
        </p>
      </Card>
    </div>
  )
}
