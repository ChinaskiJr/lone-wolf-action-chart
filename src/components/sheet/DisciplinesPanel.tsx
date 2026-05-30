import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import {
  KAI_DISCIPLINES,
  MAGNAKAI_DISCIPLINES,
  GRAND_MASTER_DISCIPLINES,
  NEW_ORDER_DISCIPLINES,
  KAI_WEAPONS,
} from '@/data/disciplines'
import { LORE_CIRCLES, getCompletedCircles } from '@/data/loreCircles'
import type { DisciplineData } from '@/types/game'

export function DisciplinesPanel() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character } = useCharacterStore()
  if (!character) return null

  const disciplineMap: Record<string, DisciplineData> =
    character.cycle === 'kai' ? KAI_DISCIPLINES :
    character.cycle === 'magnakai' ? MAGNAKAI_DISCIPLINES :
    character.cycle === 'grandmaster' ? GRAND_MASTER_DISCIPLINES :
    NEW_ORDER_DISCIPLINES

  const disciplines = Object.values(disciplineMap)
  const selected = character.disciplines as string[]

  const completedCircles = character.cycle === 'magnakai'
    ? getCompletedCircles(selected)
    : []

  return (
    <div className="flex flex-col gap-5">
      {/* Main disciplines list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{t('sheet.disciplines')}</h3>
          <span className="text-xs text-slate-500">{selected.length} / {disciplines.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {disciplines.map(d => {
            const isOwned = selected.includes(d.key)
            return (
              <div
                key={d.key}
                className={`flex gap-3 rounded-lg px-3 py-2.5 border transition-colors
                  ${isOwned
                    ? 'border-amber-800/60 bg-amber-950/20'
                    : 'border-slate-800 bg-slate-800/20 opacity-50'}`}
              >
                <div className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border
                  ${isOwned ? 'bg-amber-600 border-amber-500' : 'border-slate-700'}`}>
                  {isOwned && <Check size={10} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isOwned ? 'text-amber-100' : 'text-slate-500'}`}>
                    {lang === 'fr' ? d.fr : d.en}
                  </div>
                  {isOwned && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      {lang === 'fr' ? d.effectFr : d.effectEn}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weaponskill weapon (Kai) */}
      {character.cycle === 'kai' && selected.includes('weaponskill') && (
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 text-sm">
          <span className="text-slate-400">Arme maîtrisée : </span>
          <span className="text-blue-300 font-medium">
            {(() => {
              const w = KAI_WEAPONS.find(ww => ww.key === (character as any).weaponskillWeapon)
              return w ? (lang === 'fr' ? w.fr : w.en) : (character as any).weaponskillWeapon
            })()}
          </span>
          <span className="text-slate-500 ml-2 text-xs">(+2 HC si portée)</span>
        </div>
      )}

      {/* Lore circles (Magnakai) */}
      {character.cycle === 'magnakai' && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('sheet.loreCircles')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LORE_CIRCLES.map(circle => {
              const isComplete = completedCircles.some(c => c.id === circle.id)
              const ownedCount = circle.disciplines.filter(d => selected.includes(d)).length
              return (
                <div key={circle.id} className={`rounded-lg border p-3 ${isComplete ? 'border-green-700 bg-green-950/20' : 'border-slate-800 bg-slate-800/20'}`}>
                  <div className={`font-medium text-sm ${isComplete ? 'text-green-300' : 'text-slate-400'}`}>
                    {isComplete && '✓ '}{lang === 'fr' ? circle.fr : circle.en}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {ownedCount}/{circle.disciplines.length} disciplines
                    {isComplete && <span className="text-green-500 ml-2">+{circle.bonusCS} HC +{circle.bonusEP} PE</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lorestones (Magnakai) */}
      {character.cycle === 'magnakai' && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('sheet.lorestones')} (7)</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(n => {
              const owned = (character as any).lorestones?.includes(n)
              return (
                <div
                  key={n}
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors
                    ${owned ? 'border-amber-500 bg-amber-700/40 text-amber-300' : 'border-slate-700 bg-slate-800/40 text-slate-600'}`}
                >
                  {n}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Previous cycle disciplines (GM/NO) */}
      {(character.cycle === 'grandmaster') && (character as any).magnakaiDisciplines?.length > 0 && (
        <div className="bg-green-950/10 border border-green-900/30 rounded-lg p-3">
          <div className="text-xs text-green-600 font-medium mb-1.5">Disciplines Magnakaï conservées</div>
          <div className="flex flex-wrap gap-1.5">
            {((character as any).magnakaiDisciplines as string[]).map(dk => {
              const d = MAGNAKAI_DISCIPLINES[dk as keyof typeof MAGNAKAI_DISCIPLINES]
              return d ? (
                <span key={dk} className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-900/50">
                  {lang === 'fr' ? d.fr : d.en}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
