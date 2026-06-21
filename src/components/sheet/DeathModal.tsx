import { useTranslation } from 'react-i18next'

interface Props {
  onClose: () => void
  onReplay?: () => void
  roundCount?: number
}

export function DeathModal({ onClose, onReplay, roundCount }: Props) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="p-8 flex flex-col items-center gap-5 animate-victory">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-red-500/10 animate-ping-slow" />
            <div className="w-16 h-16 rounded-full bg-red-900/40 border border-red-800/60 flex items-center justify-center">
              <span className="text-3xl">☠</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-serif font-semibold text-red-300 mb-1">
              {t('combat.defeat')}
            </div>
            <div className="text-sm text-slate-400">{t('combat.defeatSub')}</div>
            {roundCount != null && roundCount > 0 && (
              <div className="text-sm text-slate-500 mt-1">
                {t('combat.roundCount', { count: roundCount })}
              </div>
            )}
          </div>
          <div className="flex gap-3 w-full">
            {onReplay && (
              <button
                onClick={onReplay}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-sm transition-colors"
              >
                {t('combat.replay')}
              </button>
            )}
            <button
              onClick={onClose}
              className={`py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors ${onReplay ? 'flex-1' : 'w-full'}`}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
