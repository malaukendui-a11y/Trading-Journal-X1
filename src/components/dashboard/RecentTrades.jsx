import { Link } from 'react-router-dom'
import { Card } from '../ui/Card.jsx'
import { Tag } from '../ui/Tag.jsx'
import { formatDateDisplay } from '../../lib/dateHelpers.js'
import { formatCurrency } from '../../lib/formatters.js'

/**
 * Subkomponen murni untuk menampilkan 5 trade terakhir (FR-DASH-4).
 *
 * @param {Object} props
 * @param {Array<Object>} props.entries 5 entri teratas dari Jurnal
 * @param {(key: string, params?: Object) => string} props.t
 * @param {'id'|'en'} props.lang
 */
export function RecentTrades({ entries = [], t, lang }) {
  const hasTrades = Array.isArray(entries) && entries.length > 0

  return (
    <Card className="p-5 flex flex-col justify-between">
      {/* Header Kartu */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary font-display">
          {t('dashboard.recentTradesTitle')}
        </h2>
        <Link
          to="/journal"
          aria-label={t('dashboard.viewAllTrades')}
          className="text-xs font-medium text-accent-text hover:underline flex items-center gap-1"
        >
          {t('dashboard.viewAllTrades')}
        </Link>
      </div>

      {/* Konten Utama */}
      {!hasTrades ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <p className="text-xs text-text-secondary max-w-sm mb-3">
            {t('dashboard.noRecentTrades')}
          </p>
          <Link
            to="/journal"
            className="text-xs text-accent-text font-medium hover:underline inline-flex items-center gap-1"
          >
            {t('journal.addTradeButton')} →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-text-secondary">
                <th className="pb-2 font-medium">{t('journal.tableHeaderDate')}</th>
                <th className="pb-2 font-medium">{t('journal.tableHeaderInstrument')}</th>
                <th className="pb-2 font-medium">{t('journal.tableHeaderDirection')}</th>
                <th className="pb-2 font-medium">{t('journal.tableHeaderStatus')}</th>
                <th className="pb-2 font-medium text-right">{t('journal.tableHeaderPnl')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((trade) => {
                const pnl = Number(trade?.pnl) || 0
                const pnlColorClass = pnl >= 0 ? 'text-sage' : 'text-brick'

                return (
                  <tr key={trade.id || `${trade.trade_date}-${trade.instrument}`} className="hover:bg-bg-panel-raised transition-colors">
                    <td className="py-2.5 num-table text-text-secondary whitespace-nowrap">
                      {formatDateDisplay(trade.trade_date, lang)}
                    </td>
                    <td className="py-2.5 font-medium text-text-primary whitespace-nowrap">
                      {trade.instrument || '-'}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <Tag
                        variant={trade.direction === 'buy' ? 'buy' : 'sell'}
                        size="xs"
                      >
                        {trade.direction === 'buy' ? t('journal.buy') : t('journal.sell')}
                      </Tag>
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <Tag
                        variant={trade.status === 'plan' ? 'plan' : 'revenge'}
                        size="xs"
                      >
                        {trade.status === 'plan'
                          ? t('journal.statusPlan')
                          : t('journal.statusRevenge')}
                      </Tag>
                    </td>
                    <td className={`py-2.5 num-table text-right whitespace-nowrap ${pnlColorClass}`}>
                      {formatCurrency(pnl, lang)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
