import { LORE_CIRCLES } from '@/data/loreCircles'
import { MAGNAKAI_DISCIPLINES } from '@/data/disciplines'

interface Props {
  selected: string[]
  lang: 'fr' | 'en'
}

export function LoreCirclesWidget({ selected, lang }: Props) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {lang === 'fr' ? 'Cercles de Connaissance' : 'Lore-Circles'}
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {LORE_CIRCLES.map(circle => {
          const matchCount = circle.disciplines.filter(d => selected.includes(d)).length
          const isComplete = matchCount === circle.disciplines.length
          const isPartial = matchCount > 0 && !isComplete
          return (
            <div
              key={circle.id}
              className={`rounded-lg border px-3 py-2 transition-colors
                ${isComplete
                  ? 'border-green-700/60 bg-green-950/25'
                  : isPartial
                  ? 'border-amber-800/40 bg-amber-950/10'
                  : 'border-slate-800/80 bg-slate-900/20'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium
                  ${isComplete ? 'text-green-300' : isPartial ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isComplete ? '✓ ' : ''}{lang === 'fr' ? circle.fr : circle.en}
                </span>
                <span className={`text-xs font-medium shrink-0 ml-2
                  ${isComplete ? 'text-green-400' : 'text-slate-600'}`}>
                  {[circle.bonusCS > 0 && `+${circle.bonusCS} HC`, circle.bonusEP > 0 && `+${circle.bonusEP} PE`]
                    .filter(Boolean).join(' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {circle.disciplines.map(dk => {
                  const d = MAGNAKAI_DISCIPLINES[dk as keyof typeof MAGNAKAI_DISCIPLINES]
                  const isOwned = selected.includes(dk)
                  return (
                    <span
                      key={dk}
                      className={`text-xs px-1.5 py-0.5 rounded border transition-colors
                        ${isOwned
                          ? 'bg-green-900/40 border-green-700/50 text-green-300'
                          : 'bg-slate-800/50 border-slate-700/40 text-slate-500'}`}
                    >
                      {d ? (lang === 'fr' ? d.fr : d.en) : dk}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
