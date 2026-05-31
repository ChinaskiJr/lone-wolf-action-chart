import { useTranslation } from 'react-i18next'
import type { Character } from '@/types/character'
import { getTotalCS, getTotalEPMax } from '@/utils/character'

interface Props {
  character: Character
  onDecrement: () => void
  onIncrement: () => void
}

export function PersistentStatBar({ character, onDecrement, onIncrement }: Props) {
  const { t } = useTranslation()
  const totalCS = getTotalCS(character)
  const maxEP = getTotalEPMax(character)
  const currentEP = character.endurance.current
  const epPct = Math.max(0, Math.min(100, (currentEP / maxEP) * 100))

  const barColor = epPct > 50 ? 'bg-green-500' : epPct > 25 ? 'bg-yellow-500' : 'bg-red-500'
  const epTextColor = epPct > 50 ? 'text-green-400' : epPct > 25 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5">
      {/* HC */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-slate-500 font-medium" title={t('sheet.combatSkill')}>HC</span>
        <span className="text-xl font-bold text-amber-400 tabular-nums">{totalCS}</span>
      </div>

      <div className="w-px h-5 bg-slate-700 shrink-0" />

      <span className="text-xs text-slate-500 font-medium shrink-0" title={t('sheet.endurance')}>PE</span>

      {/* Decrement — 24px visual, 44px tap area via relative+pseudo */}
      <button
        onClick={onDecrement}
        aria-label={t('sheet.endurance') + ' −1'}
        className="relative w-6 h-6 rounded-full bg-red-900/50 border border-red-800 hover:bg-red-800/60 active:bg-red-700/80 text-red-300 font-bold text-sm transition-colors shrink-0 flex items-center justify-center before:absolute before:inset-[-10px]"
      >
        −
      </button>

      {/* Bar + values */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className={`text-sm font-bold tabular-nums leading-none ${epTextColor}`}>{currentEP}</span>
          <span className="text-xs text-slate-500 tabular-nums leading-none">{maxEP}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${epPct}%` }}
          />
        </div>
      </div>

      {/* Increment */}
      <button
        onClick={onIncrement}
        aria-label={t('sheet.endurance') + ' +1'}
        className="relative w-6 h-6 rounded-full bg-green-900/50 border border-green-800 hover:bg-green-800/60 active:bg-green-700/80 text-green-300 font-bold text-sm transition-colors shrink-0 flex items-center justify-center before:absolute before:inset-[-10px]"
      >
        +
      </button>
    </div>
  )
}
