import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { formatDateDisplay } from '../../lib/dateHelpers.js'
import { formatCurrency } from '../../lib/formatters.js'
import { Button } from '../ui/Button.jsx'
import { Tag } from '../ui/Tag.jsx'

export function DeleteConfirmModal({
  isOpen,
  trade,
  onClose,
  onConfirm,
  loading = false,
}) {
  const { lang, t } = useLanguage()
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      if (isOpen) {
        onClose()
      }
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('cancel', handleClose)

    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('cancel', handleClose)
    }
  }, [isOpen, onClose])

  const handleBackdropClick = e => {
    if (e.target === dialogRef.current && !loading) {
      onClose()
    }
  }

  const pnlNum = Number(trade?.pnl || 0)
  const isProfit = pnlNum > 0
  const isLoss = pnlNum < 0

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-xs p-0 bg-transparent rounded-2xl max-w-md w-[calc(100%-2rem)] shadow-2xl m-auto"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-bg-panel border border-line rounded-2xl p-6 text-text-primary">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
          <div className="flex items-center gap-2.5 text-brick">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 id="delete-modal-title" className="text-base font-display font-semibold text-text-primary">
              {t('journal.deleteConfirmTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label={t('common.close')}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-panel-raised transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          {t('journal.deleteConfirmMessage')}
        </p>

        {trade && (
          <div className="mb-5 p-3.5 rounded-xl bg-bg-panel-raised border border-line flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-sm text-text-primary">
                  {trade.instrument}
                </span>
                <Tag variant={trade.direction} size="xs">
                  {trade.direction?.toUpperCase()}
                </Tag>
              </div>
              <span className="text-xs text-text-secondary">
                {formatDateDisplay(trade.trade_date, lang)}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`font-mono font-semibold text-sm ${
                  isProfit ? 'text-sage' : isLoss ? 'text-brick' : 'text-text-secondary'
                }`}
              >
                {formatCurrency(trade.pnl, lang)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            loading={loading}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? t('common.deleting') : t('common.delete')}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

