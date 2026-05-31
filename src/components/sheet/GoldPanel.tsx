import { useTranslation } from 'react-i18next'
import { useCharacterStore } from '@/store/characterStore'

export function GoldPanel() {
  const { t } = useTranslation()
  const { character, setGold } = useCharacterStore()
  if (!character) return null

  const gold = character.goldCrowns
  const goldPercent = (gold / 50) * 100

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-800/50 rounded-xl p-5">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-4">{t('sheet.goldCrowns')}</div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{gold} / 50</span>
            <span className={gold >= 50 ? 'text-amber-400' : 'text-slate-500'}>
              {gold >= 50 ? 'Bourse pleine' : `${50 - gold} emplacements libres`}
            </span>
          </div>
          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, goldPercent)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setGold(gold - n)}
                disabled={gold < n}
                className="w-8 h-8 rounded bg-red-900/40 border border-red-900 hover:bg-red-800/60 disabled:opacity-30 text-red-300 text-xs font-bold transition-colors"
              >
                -{n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 rounded-lg px-4 py-2">
            <span className="text-amber-500 text-lg">◎</span>
            <span className="text-3xl font-bold text-amber-400 w-12 text-center">{gold}</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setGold(gold + n)}
                disabled={gold + n > 50}
                className="w-8 h-8 rounded bg-green-900/40 border border-green-900 hover:bg-green-800/60 disabled:opacity-30 text-green-300 text-xs font-bold transition-colors"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
        {character.cycle === 'magnakai' && (
          <div className="mt-4 text-xs text-slate-500 bg-slate-900/40 rounded p-2 text-center">
            Au-delà de 50 Couronnes, le surplus peut être déposé au Monastère Kaï.
          </div>
        )}
      </div>
    </div>
  )
}
