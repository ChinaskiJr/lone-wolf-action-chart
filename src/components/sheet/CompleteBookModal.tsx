import { BookCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  isLastBook: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function CompleteBookModal({ isLastBook, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="p-8 flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-green-900/40 border border-green-800/60 flex items-center justify-center">
            <BookCheck size={24} className="text-green-300" />
          </div>
          <div className="text-center">
            <div className="text-xl font-serif font-semibold text-amber-100 mb-2">
              {t('sheet.completeBookConfirmTitle')}
            </div>
            <div className="text-sm text-slate-400 leading-relaxed">
              {isLastBook ? t('sheet.completeBookConfirmBodyLast') : t('sheet.completeBookConfirmBody')}
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-sm transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg bg-green-800 hover:bg-green-700 text-white text-sm font-medium transition-colors"
            >
              {t('sheet.completeBookConfirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
