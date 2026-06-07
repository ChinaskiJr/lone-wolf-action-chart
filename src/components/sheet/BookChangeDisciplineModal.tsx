import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus, BookOpen } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import {
  KAI_DISCIPLINES,
  MAGNAKAI_DISCIPLINES,
  GRAND_MASTER_DISCIPLINES,
  NEW_ORDER_DISCIPLINES,
  KAI_WEAPONS,
} from '@/data/disciplines'

interface Props {
  onConfirm: () => void
}

export function BookChangeDisciplineModal({ onConfirm }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, addDiscipline, setWeaponskillWeapon, addWeaponmasteryWeapon } = useCharacterStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [wmWeaponChoice, setWmWeaponChoice] = useState('')

  if (!character) return null

  const disciplineMap =
    character.cycle === 'kai' ? KAI_DISCIPLINES :
    character.cycle === 'magnakai' ? MAGNAKAI_DISCIPLINES :
    character.cycle === 'grandmaster' ? GRAND_MASTER_DISCIPLINES :
    NEW_ORDER_DISCIPLINES

  const disciplines = Object.values(disciplineMap)
  const owned = character.disciplines as string[]

  const needsWeapon = selected === 'weaponmastery' || selected === 'grandWeaponmastery'
  const canConfirm = selected !== null && (!needsWeapon || wmWeaponChoice !== '')

  const cycleLabel = lang === 'fr'
    ? ({ kai: 'Kaï', magnakai: 'Magnakaï', grandmaster: 'Grand Maître', neworder: 'Nouvel Ordre' })[character.cycle]
    : ({ kai: 'Kai', magnakai: 'Magnakai', grandmaster: 'Grand Master', neworder: 'New Order' })[character.cycle]

  const availableWmWeapons = KAI_WEAPONS.filter(w => {
    const currentMastered: string[] = (character as any).weaponmasteryWeapons ?? []
    return !currentMastered.includes(w.key)
  })

  function handleSelect(key: string) {
    if (owned.includes(key)) return
    if (selected === key) {
      setSelected(null)
      setWmWeaponChoice('')
    } else {
      setSelected(key)
      setWmWeaponChoice('')
    }
  }

  function handleConfirm() {
    if (!selected) return
    if (selected === 'weaponskill') {
      const idx = Math.floor(Math.random() * KAI_WEAPONS.length)
      addDiscipline('weaponskill')
      setWeaponskillWeapon(KAI_WEAPONS[idx].key)
    } else if (needsWeapon) {
      if (!wmWeaponChoice) return
      addDiscipline(selected)
      addWeaponmasteryWeapon(wmWeaponChoice)
    } else {
      addDiscipline(selected)
    }
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-amber-900/40 border border-amber-800/60 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-amber-300" />
          </div>
          <div>
            <div className="text-lg font-serif font-semibold text-amber-100">
              {t('sheet.bookWizard.disciplineTitle')}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              {lang === 'fr'
                ? `Livre ${character.currentBook - 1} terminé — choisissez une nouvelle discipline ${cycleLabel}.`
                : `Book ${character.currentBook - 1} completed — choose a new ${cycleLabel} discipline.`}
            </div>
          </div>
        </div>

        {/* Discipline list */}
        <div className="overflow-y-auto flex-1 p-6 pt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {disciplines.map(d => {
              const isOwned = owned.includes(d.key)
              const isSelected = selected === d.key
              return (
                <div
                  key={d.key}
                  onClick={() => !isOwned && handleSelect(d.key)}
                  className={`flex gap-3 rounded-lg px-3 py-2.5 border transition-colors
                    ${isOwned
                      ? 'border-amber-800/60 bg-amber-950/20 opacity-60 cursor-default'
                      : isSelected
                      ? 'border-amber-600 bg-amber-950/30 cursor-pointer'
                      : 'border-slate-700 bg-slate-800/20 opacity-75 hover:opacity-100 hover:border-amber-700/60 hover:bg-amber-950/10 cursor-pointer'}`}
                >
                  <div className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border
                    ${isOwned ? 'bg-amber-600 border-amber-500' : isSelected ? 'bg-amber-700 border-amber-500' : 'border-slate-600'}`}>
                    {(isOwned || isSelected) && <Check size={10} />}
                    {!isOwned && !isSelected && <Plus size={8} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isOwned ? 'text-amber-100' : isSelected ? 'text-amber-200' : 'text-slate-300'}`}>
                      {lang === 'fr' ? d.fr : d.en}
                    </div>
                    <div className={`text-xs mt-0.5 ${isOwned || isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      {lang === 'fr' ? d.effectFr : d.effectEn}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Weapon sub-selector for weaponmastery / grandWeaponmastery */}
          {needsWeapon && (
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 flex flex-col gap-2">
              <div className="text-xs text-slate-400">
                {lang === 'fr' ? 'Choisissez une arme maîtrisée' : 'Choose a mastered weapon'}
              </div>
              <select
                value={wmWeaponChoice}
                onChange={e => setWmWeaponChoice(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
              >
                <option value="">— {lang === 'fr' ? 'Choisir' : 'Choose'} —</option>
                {availableWmWeapons.map(w => (
                  <option key={w.key} value={w.key}>{lang === 'fr' ? w.fr : w.en}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-slate-800">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-colors"
          >
            {t('sheet.bookWizard.disciplineConfirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
