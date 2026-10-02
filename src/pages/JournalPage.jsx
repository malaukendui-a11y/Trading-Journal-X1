import { useEffect, useState } from 'react'
import { AlertCircle, BookOpen, CheckCircle, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { DeleteConfirmModal } from '../components/journal/DeleteConfirmModal.jsx'
import { JournalFormModal } from '../components/journal/JournalFormModal.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Tag } from '../components/ui/Tag.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useJournalEntries } from '../hooks/useJournalEntries.js'
import { formatDateDisplay } from '../lib/dateHelpers.js'
import { formatCurrency, formatPrice } from '../lib/formatters.js'

export function JournalPage() {
  const { lang, t } = useLanguage()
  const { entries, loading, error, addEntry, deleteEntry, refetch } = useJournalEntries()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const handleAddTrade = async formData => {
    await addEntry(formData)
    setFeedback({
      type: 'success',
      text: t('journal.saveSuccess'),
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteEntry(deleteTarget.id)
      setDeleteTarget(null)
      setFeedback({
        type: 'success',
        text: t('journal.deleteSuccess'),
      })
    } catch (err) {
      const errKey = err?.message || 'journal.errorDeleteFailed'
      setFeedback({
        type: 'error',
        text: t(errKey),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            {t('journal.title')}
          </h1>
          <p className="font-body text-xs text-text-secondary mt-1">
            {t('journal.subtitle')}
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('journal.addTradeButton')}</span>
        </Button>
      </div>

      {/* Banner Notifikasi Umpan Balik */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-sage/10 border-sage/30 text-sage'
              : 'bg-brick/10 border-brick/30 text-brick'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* State Loading: Skeleton Table */}
      {loading && (
        <Card className="border border-line bg-bg-panel p-6 overflow-hidden">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-bg-panel-raised rounded-md w-1/4" />
            <div className="space-y-2.5 pt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-bg-panel-raised/70 rounded-lg w-full" />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* State Error: Tampilan Pesan Error Generik + Tombol Coba Lagi */}
      {!loading && error && (
        <Card className="border border-brick/30 bg-bg-panel p-8 text-center">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-brick/10 border border-brick/30 flex items-center justify-center text-brick mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-text-primary text-base mb-1">
              {t('common.error')}
            </h3>
            <p className="text-sm text-text-secondary mb-5 leading-relaxed">
              {t(error)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={refetch}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('common.retry')}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* State Kosong: Belum Ada Catatan Trade */}
      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={t('journal.emptyTitle')}
          description={t('journal.emptyDesc')}
          action={
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('journal.addTradeButton')}</span>
            </Button>
          }
        />
      )}

      {/* State Berisi Data: Tabel Riwayat Trade */}
      {!loading && !error && entries.length > 0 && (
        <Card className="border border-line bg-bg-panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-line bg-bg-panel-raised/50 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4 whitespace-nowrap">
                    {t('journal.tableHeaderDate')}
                  </th>
                  <th scope="col" className="py-3 px-4 whitespace-nowrap">
                    {t('journal.tableHeaderInstrument')}
                  </th>
                  <th scope="col" className="py-3 px-4 whitespace-nowrap">
                    {t('journal.tableHeaderDirection')}
                  </th>
                  <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">
                    {t('journal.tableHeaderEntry')}
                  </th>
                  <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">
                    {t('journal.tableHeaderSl')}
                  </th>
                  <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">
                    {t('journal.tableHeaderExit')}
                  </th>
                  <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">
                    {t('journal.tableHeaderPnl')}
                  </th>
                  <th scope="col" className="py-3 px-4 whitespace-nowrap text-center">
                    {t('journal.tableHeaderStatus')}
                  </th>
                  <th scope="col" className="py-3 px-4 min-w-[160px]">
                    {t('journal.tableHeaderNote')}
                  </th>
                  <th scope="col" className="py-3 px-4 text-center whitespace-nowrap">
                    {t('journal.tableHeaderActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {entries.map(entry => {
                  const pnlNum = Number(entry.pnl || 0)
                  const isProfit = pnlNum > 0
                  const isLoss = pnlNum < 0

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-bg-panel-raised/40 transition-colors"
                    >
                      {/* Tanggal */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-text-secondary font-mono">
                        {formatDateDisplay(entry.trade_date, lang)}
                      </td>

                      {/* Instrumen */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-text-primary text-xs">
                        {entry.instrument}
                      </td>

                      {/* Arah Posisi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Tag variant={entry.direction} size="xs">
                          {entry.direction?.toUpperCase()}
                        </Tag>
                      </td>

                      {/* Entry Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-xs text-text-secondary">
                        {formatPrice(entry.entry_price, lang)}
                      </td>

                      {/* Stop Loss Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-xs text-text-secondary">
                        {formatPrice(entry.sl_price, lang)}
                      </td>

                      {/* Exit Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-xs text-text-secondary">
                        {formatPrice(entry.exit_price, lang)}
                      </td>

                      {/* Realized P&L */}
                      <td
                        className={`py-3.5 px-4 whitespace-nowrap text-right font-mono font-semibold text-xs ${
                          isProfit
                            ? 'text-sage'
                            : isLoss
                            ? 'text-brick'
                            : 'text-text-secondary'
                        }`}
                      >
                        {formatCurrency(entry.pnl, lang)}
                      </td>

                      {/* Status Eksekusi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <Tag variant={entry.status} size="xs">
                          {entry.status === 'revenge'
                            ? t('journal.statusRevenge')
                            : t('journal.statusPlan')}
                        </Tag>
                      </td>

                      {/* Catatan (Plain text aman, anti XSS) */}
                      <td className="py-3.5 px-4 text-xs text-text-secondary">
                        <span
                          className="line-clamp-2 max-w-[240px] block"
                          title={entry.note || ''}
                        >
                          {entry.note || '-'}
                        </span>
                      </td>

                      {/* Aksi: Hapus */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(entry)}
                          aria-label={t('common.delete')}
                          title={t('common.delete')}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-brick hover:bg-brick/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Tambah Trade */}
      <JournalFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTrade}
      />

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        trade={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  )
}

