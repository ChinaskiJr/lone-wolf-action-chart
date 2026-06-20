import { Check, Plus } from 'lucide-react'
import type { DisciplineData } from '@/types/game'

export type DisciplineState = 'owned' | 'selected' | 'available' | 'disabled'

interface Props {
  disciplines: DisciplineData[]
  lang: 'fr' | 'en'
  getState: (key: string) => DisciplineState
  onPick: (key: string) => void
  columns?: 1 | 2
}

const CONTAINER: Record<DisciplineState, string> = {
  owned: 'border-amber-800/60 bg-amber-950/20 cursor-default',
  selected: 'border-amber-600 bg-amber-950/30 cursor-pointer',
  available: 'border-slate-700 bg-slate-800/20 opacity-75 hover:opacity-100 hover:border-amber-700/60 hover:bg-amber-950/10 cursor-pointer',
  disabled: 'border-slate-800 bg-slate-800/20 opacity-50 cursor-not-allowed',
}

const ICON_BOX: Record<DisciplineState, string> = {
  owned: 'bg-amber-600 border-amber-500',
  selected: 'bg-amber-700 border-amber-500',
  available: 'border-slate-600',
  disabled: 'border-slate-700',
}

const NAME: Record<DisciplineState, string> = {
  owned: 'text-amber-100',
  selected: 'text-amber-200',
  available: 'text-slate-300',
  disabled: 'text-slate-500',
}

/**
 * Shared discipline selection grid. The parent supplies a `getState` callback so each
 * usage controls its own selection semantics (additive, single-select, multi-select),
 * while the visual treatment stays consistent. Effects are shown for every state except
 * `disabled`.
 */
export function DisciplineGrid({ disciplines, lang, getState, onPick, columns = 2 }: Props) {
  return (
    <div className={`grid grid-cols-1 gap-2 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {disciplines.map(d => {
        const state = getState(d.key)
        const interactive = state === 'available' || state === 'selected'
        return (
          <button
            key={d.key}
            type="button"
            disabled={state === 'disabled'}
            onClick={() => interactive && onPick(d.key)}
            className={`flex gap-3 rounded-lg px-3 py-2.5 border text-left transition-colors ${CONTAINER[state]}`}
          >
            <div className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border ${ICON_BOX[state]}`}>
              {(state === 'owned' || state === 'selected') && <Check size={10} />}
              {state === 'available' && <Plus size={8} className="text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${NAME[state]}`}>
                {lang === 'fr' ? d.fr : d.en}
              </div>
              {state !== 'disabled' && (
                <div className={`text-xs mt-0.5 ${state === 'available' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {lang === 'fr' ? d.effectFr : d.effectEn}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
