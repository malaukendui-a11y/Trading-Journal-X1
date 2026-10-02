import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { todayLocalISO } from '../../lib/dateHelpers.js'
import { validateJournalForm } from '../../lib/journalValidation.js'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'

export function JournalFormModal({ isOpen, onClose, onSubmit }) {
  const { t } = useLanguage()
  const dialogRef = useRef(null)

  const [formData, setFormData] = useState({
    trade_date: todayLocalISO(new Date()),
    instrument: '',
    direction: 'buy',
    entry_price: '',
    sl_price: '',
    exit_price: '',
    pnl: '',
    status: 'plan',
    note: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Buka atau tutup native <dialog>
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

  // Sinkronkan state React saat dialog ditutup oleh tombol Escape atau native event
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

  // Reset form saat dialog dibuka, hitung todayLocalISO saat itu juga
  useEffect(() => {
    if (isOpen) {
      setFormData({
        trade_date: todayLocalISO(new Date()),
        instrument: '',
        direction: 'buy',
        entry_price: '',
        sl_price: '',
        exit_price: '',
        pnl: '',
        status: 'plan',
        note: '',
      })
      setErrors({})
      setSubmitError(null)
      setSubmitting(false)
    }
  }, [isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleBackdropClick = e => {
    if (e.target === dialogRef.current && !submitting) {
      onClose()
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitError(null)

    const validation = validateJournalForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      const errKey = err?.message || 'journal.errorSaveFailed'
      setSubmitError(t(errKey))
    } finally {
      setSubmitting(false)
    }
  }

  const today = todayLocalISO(new Date())

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-xs p-0 bg-transparent rounded-2xl max-w-xl w-[calc(100%-2rem)] shadow-2xl m-auto"
      aria-labelledby="journal-modal-title"
    >
      <div className="bg-bg-panel border border-line rounded-2xl p-6 sm:p-7 text-text-primary max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <h2 id="journal-modal-title" className="text-lg font-display font-semibold text-text-primary">
            {t('journal.modalTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t('common.close')}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-panel-raised transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Submit Error */}
        {submitError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-brick/10 border border-brick/30 text-brick text-xs font-medium"
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Baris 1: Tanggal & Instrumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              id="trade_date"
              type="date"
              label={t('journal.tradeDate')}
              required
              max={today}
              value={formData.trade_date}
              onChange={e => handleChange('trade_date', e.target.value)}
              error={errors.trade_date ? t(errors.trade_date) : undefined}
              disabled={submitting}
            />

            <Input
              id="instrument"
              type="text"
              label={t('journal.instrument')}
              required
              placeholder={t('journal.instrumentPlaceholder')}
              maxLength={30}
              value={formData.instrument}
              onChange={e => handleChange('instrument', e.target.value)}
              error={errors.instrument ? t(errors.instrument) : undefined}
              disabled={submitting}
            />
          </div>

          {/* Baris 2: Arah Posisi (BUY / SELL) */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-text-secondary">
              {t('journal.direction')} <span className="text-brick">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                className={`flex items-center justify-center py-2.5 px-3 rounded-lg border text-xs font-mono font-medium cursor-pointer transition-colors ${
                  formData.direction === 'buy'
                    ? 'bg-sage/20 border-sage text-sage font-semibold shadow-xs'
                    : 'bg-bg-panel border-line text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="direction"
                  value="buy"
                  checked={formData.direction === 'buy'}
                  onChange={e => handleChange('direction', e.target.value)}
                  disabled={submitting}
                  className="sr-only"
                />
                <span>{t('journal.buy')}</span>
              </label>

              <label
                className={`flex items-center justify-center py-2.5 px-3 rounded-lg border text-xs font-mono font-medium cursor-pointer transition-colors ${
                  formData.direction === 'sell'
                    ? 'bg-brick/20 border-brick text-brick font-semibold shadow-xs'
                    : 'bg-bg-panel border-line text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="direction"
                  value="sell"
                  checked={formData.direction === 'sell'}
                  onChange={e => handleChange('direction', e.target.value)}
                  disabled={submitting}
                  className="sr-only"
                />
                <span>{t('journal.sell')}</span>
              </label>
            </div>
            {errors.direction && (
              <span className="text-xs text-brick font-medium">{t(errors.direction)}</span>
            )}
          </div>

          {/* Baris 3: Entry Price, SL Price, Exit Price (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              id="entry_price"
              type="number"
              step="any"
              label={t('journal.entryPrice')}
              placeholder="0.00"
              value={formData.entry_price}
              onChange={e => handleChange('entry_price', e.target.value)}
              error={errors.entry_price ? t(errors.entry_price) : undefined}
              disabled={submitting}
            />

            <Input
              id="sl_price"
              type="number"
              step="any"
              label={t('journal.slPrice')}
              placeholder="0.00"
              value={formData.sl_price}
              onChange={e => handleChange('sl_price', e.target.value)}
              error={errors.sl_price ? t(errors.sl_price) : undefined}
              disabled={submitting}
            />

            <Input
              id="exit_price"
              type="number"
              step="any"
              label={t('journal.exitPrice')}
              placeholder="0.00"
              value={formData.exit_price}
              onChange={e => handleChange('exit_price', e.target.value)}
              error={errors.exit_price ? t(errors.exit_price) : undefined}
              disabled={submitting}
            />
          </div>

          {/* Baris 4: Realized P&L (Wajib) & Status Eksekusi (Wajib) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
            <Input
              id="pnl"
              type="number"
              step="any"
              label={t('journal.pnl')}
              required
              placeholder="e.g. 150.50 or -50.00"
              value={formData.pnl}
              onChange={e => handleChange('pnl', e.target.value)}
              error={errors.pnl ? t(errors.pnl) : undefined}
              disabled={submitting}
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-medium text-text-secondary">
                {t('journal.status')} <span className="text-brick">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center justify-center py-2.5 px-2 rounded-lg border text-[11px] sm:text-xs font-medium cursor-pointer transition-colors text-center ${
                    formData.status === 'plan'
                      ? 'bg-sage/20 border-sage text-sage font-semibold shadow-xs'
                      : 'bg-bg-panel border-line text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="plan"
                    checked={formData.status === 'plan'}
                    onChange={e => handleChange('status', e.target.value)}
                    disabled={submitting}
                    className="sr-only"
                  />
                  <span>{t('journal.statusPlan')}</span>
                </label>

                <label
                  className={`flex items-center justify-center py-2.5 px-2 rounded-lg border text-[11px] sm:text-xs font-medium cursor-pointer transition-colors text-center ${
                    formData.status === 'revenge'
                      ? 'bg-brick/20 border-brick text-brick font-semibold shadow-xs'
                      : 'bg-bg-panel border-line text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="revenge"
                    checked={formData.status === 'revenge'}
                    onChange={e => handleChange('status', e.target.value)}
                    disabled={submitting}
                    className="sr-only"
                  />
                  <span>{t('journal.statusRevenge')}</span>
                </label>
              </div>
              {errors.status && (
                <span className="text-xs text-brick font-medium">{t(errors.status)}</span>
              )}
            </div>
          </div>

          {/* Baris 5: Catatan (Opsional, max 500) */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <div className="flex justify-between items-center text-xs font-medium text-text-secondary">
              <label htmlFor="journal-note">{t('journal.note')}</label>
              <span className="text-[10px] text-text-secondary font-mono">
                {formData.note.length}/500
              </span>
            </div>
            <textarea
              id="journal-note"
              rows={3}
              maxLength={500}
              value={formData.note}
              onChange={e => handleChange('note', e.target.value)}
              placeholder={t('journal.notePlaceholder')}
              disabled={submitting}
              className="w-full px-3.5 py-2 rounded-lg text-sm bg-bg-panel border border-line text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none transition-colors duration-150 disabled:opacity-50"
            />
            {errors.note && (
              <span className="text-xs text-brick font-medium">{t(errors.note)}</span>
            )}
          </div>

          {/* Footer Aksi */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

