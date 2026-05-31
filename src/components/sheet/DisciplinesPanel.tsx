import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import {
  KAI_DISCIPLINES,
  MAGNAKAI_DISCIPLINES,
  GRAND_MASTER_DISCIPLINES,
  NEW_ORDER_DISCIPLINES,
  KAI_WEAPONS,
} from '@/data/disciplines'
import { BOOKS } from '@/data/books'
import { LORE_CIRCLES, getCompletedCircles } from '@/data/loreCircles'
import type { DisciplineData } from '@/types/game'

export function DisciplinesPanel() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, addDiscipline, setWeaponskillWeapon } = useCharacterStore()
  const [pendingWeaponskill, setPendingWeaponskill] = useState(false)
  const [weaponChoice, setWeaponChoice] = useState('')

  if (!character) return null

  const disciplineMap: Record<string, DisciplineData> =
    character.cycle === 'kai' ? KAI_DISCIPLINES :
    character.cycle === 'magnakai' ? MAGNAKAI_DISCIPLINES :
    character.cycle === 'grandmaster' ? GRAND_MASTER_DISCIPLINES :
    NEW_ORDER_DISCIPLINES

  const disciplines = Object.values(disciplineMap)
  const selected = character.disciplines as string[]

  const currentBook = BOOKS.find(b => b.id === character.currentBook)
  const maxDisciplines = currentBook?.maxDisciplines ?? selected.length
  const canAdd = selected.length < maxDisciplines
  const slotsLeft = maxDisciplines - selected.length

  function handlePickDiscipline(key: string) {
    if (!canAdd || selected.includes(key)) return
    if (character!.cycle === 'kai' && key === 'weaponskill') {
      setPendingWeaponskill(true)
      return
    }
    addDiscipline(key)
  }

  function confirmWeaponskill() {
    addDiscipline('weaponskill')
    setWeaponskillWeapon(weaponChoice)
    setPendingWeaponskill(false)
    setWeaponChoice('')
  }

  const completedCircles = character.cycle === 'magnakai'
    ? getCompletedCircles(selected)
    : []

  return (
    <div className="flex flex-col gap-5">
      {/* New discipline available banner */}
      {canAdd && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-950/30 border border-amber-800/50 rounded-lg text-sm text-amber-300">
          <Plus size={14} className="shrink-0" />
          <span>
            {lang === 'fr'
              ? `Vous pouvez apprendre ${slotsLeft} nouvelle${slotsLeft > 1 ? 's' : ''} discipline${slotsLeft > 1 ? 's' : ''} — cliquez sur une discipline ci-dessous`
              : `You can learn ${slotsLeft} new discipline${slotsLeft > 1 ? 's' : ''} — click one below`}
          </span>
        </div>
      )}

      {/* Weaponskill weapon picker (Kai only) */}
      {pendingWeaponskill && (
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 flex flex-col gap-2">
          <div className="text-sm text-blue-300 font-medium">
            {lang === 'fr' ? 'Choisissez votre arme maîtrisée' : 'Choose your mastered weapon'}
          </div>
          <select
            value={weaponChoice}
            onChange={e => setWeaponChoice(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
          >
            <option value="">— {lang === 'fr' ? 'Choisir' : 'Choose'} —</option>
            {KAI_WEAPONS.map(w => (
              <option key={w.key} value={w.key}>{lang === 'fr' ? w.fr : w.en}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => { setPendingWeaponskill(false); setWeaponChoice('') }}
              className="px-3 py-1 text-xs text-slate-400 border border-slate-700 rounded hover:text-slate-200 transition-colors"
            >
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              onClick={confirmWeaponskill}
              disabled={!weaponChoice}
              className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
            >
              {lang === 'fr' ? 'Confirmer' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* Main disciplines list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">{t('sheet.disciplines')}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${canAdd ? 'text-amber-400 bg-amber-950/40 border border-amber-800/50' : 'text-slate-500'}`}>
            {selected.length} / {maxDisciplines}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {disciplines.map(d => {
            const isOwned = selected.includes(d.key)
            const isClickable = canAdd && !isOwned
            return (
              <div
                key={d.key}
                onClick={() => isClickable && handlePickDiscipline(d.key)}
                className={`flex gap-3 rounded-lg px-3 py-2.5 border transition-colors
                  ${isOwned
                    ? 'border-amber-800/60 bg-amber-950/20'
                    : isClickable
                    ? 'border-slate-700 bg-slate-800/20 opacity-75 hover:opacity-100 hover:border-amber-700/60 hover:bg-amber-950/10 cursor-pointer'
                    : 'border-slate-800 bg-slate-800/20 opacity-50'}`}
              >
                <div className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border
                  ${isOwned ? 'bg-amber-600 border-amber-500' : isClickable ? 'border-slate-600' : 'border-slate-700'}`}>
                  {isOwned && <Check size={10} />}
                  {isClickable && <Plus size={8} className="text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isOwned ? 'text-amber-100' : isClickable ? 'text-slate-300' : 'text-slate-500'}`}>
                    {lang === 'fr' ? d.fr : d.en}
                  </div>
                  {(isOwned || isClickable) && (
                    <div className={`text-xs mt-0.5 ${isOwned ? 'text-slate-400' : 'text-slate-500'}`}>
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
          <h3 className="text-sm font-semibold text-slate-200 mb-3">{t('sheet.loreCircles')}</h3>
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
          <h3 className="text-sm font-semibold text-slate-200 mb-3">{t('sheet.lorestones')} (7)</h3>
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
