import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import type { Character } from '@/types/character'
import {
  KAI_DISCIPLINES,
  MAGNAKAI_DISCIPLINES,
  GRAND_MASTER_DISCIPLINES,
  NEW_ORDER_DISCIPLINES,
  KAI_WEAPONS,
  MAGNAKAI_WEAPONS,
} from '@/data/disciplines'
import type { DisciplineData } from '@/types/game'

const MAX_DISCIPLINES: Record<string, number> = {
  kai: 5,
  magnakai: 3,
  grandmaster: 4,
  neworder: 5,
}

interface Props {
  character: Character
  onNext: (char: Character) => void
  onBack: () => void
}

export function StepDisciplines({ character, onNext, onBack }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const maxD = MAX_DISCIPLINES[character.cycle]

  const [selected, setSelected] = useState<string[]>([])
  const [weaponskillWeapon, setWeaponskillWeapon] = useState('')
  const [weaponmasteryWeapons, setWeaponmasteryWeapons] = useState<string[]>([])
  const [hoveredDiscipline, setHoveredDiscipline] = useState<DisciplineData | null>(null)

  const disciplineMap: Record<string, DisciplineData> =
    character.cycle === 'kai' ? KAI_DISCIPLINES :
    character.cycle === 'magnakai' ? MAGNAKAI_DISCIPLINES :
    character.cycle === 'grandmaster' ? GRAND_MASTER_DISCIPLINES :
    NEW_ORDER_DISCIPLINES

  const disciplines = Object.values(disciplineMap)

  function toggle(key: string) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) :
      prev.length < maxD ? [...prev, key] : prev
    )
  }

  const needsWeaponmastery = character.cycle === 'magnakai' && selected.includes('weaponmastery')
  const needsGrandWeaponmastery = (character.cycle === 'grandmaster' || character.cycle === 'neworder') && selected.includes('grandWeaponmastery')

  function handleNext() {
    const updated = {
      ...character,
      disciplines: selected,
      ...(character.cycle === 'kai' ? { weaponskillWeapon } : {}),
      ...(needsWeaponmastery || needsGrandWeaponmastery ? { weaponmasteryWeapons } : {}),
    } as unknown as Character
    onNext(updated)
  }

  const needsWeaponskill = character.cycle === 'kai' && selected.includes('weaponskill')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold text-amber-100">{t('creation.chooseDisciplines')}</h2>
        <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
          selected.length === maxD ? 'bg-green-800/50 text-green-300' : 'bg-slate-800 text-slate-400'
        }`}>
          {selected.length}/{maxD}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
        {disciplines.map(d => {
          const isSelected = selected.includes(d.key)
          const isDisabled = !isSelected && selected.length >= maxD
          return (
            <button
              key={d.key}
              onClick={() => !isDisabled && toggle(d.key)}
              onMouseEnter={() => setHoveredDiscipline(d)}
              onMouseLeave={() => setHoveredDiscipline(null)}
              disabled={isDisabled}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                ${isSelected
                  ? 'border-amber-600 bg-amber-900/30 text-amber-100'
                  : isDisabled
                  ? 'border-slate-800 bg-slate-900/30 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500'}`}
            >
              <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border ${
                isSelected ? 'bg-amber-600 border-amber-500' : 'border-slate-600'
              }`}>
                {isSelected && <Check size={12} />}
              </div>
              <span className="text-sm font-medium">{lang === 'fr' ? d.fr : d.en}</span>
            </button>
          )
        })}
      </div>

      {hoveredDiscipline && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 min-h-[48px]">
          <span className="font-medium text-amber-300">{lang === 'fr' ? hoveredDiscipline.fr : hoveredDiscipline.en}</span>
          {' — '}
          {lang === 'fr' ? hoveredDiscipline.effectFr : hoveredDiscipline.effectEn}
        </div>
      )}

      {needsWeaponskill && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('creation.weaponskillWeapon')}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const idx = Math.floor(Math.random() * KAI_WEAPONS.length)
                setWeaponskillWeapon(KAI_WEAPONS[idx].key)
              }}
              className="px-4 py-2 rounded border border-amber-700 text-amber-400 hover:bg-amber-950/30 text-sm font-medium transition-colors shrink-0"
            >
              {t('creation.weaponskillRoll')}
            </button>
            {weaponskillWeapon && (
              <span className="text-sm font-semibold text-amber-200">
                {KAI_WEAPONS.find(w => w.key === weaponskillWeapon)?.[lang] ?? weaponskillWeapon}
              </span>
            )}
          </div>
        </div>
      )}

      {(needsWeaponmastery || needsGrandWeaponmastery) && (
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 flex flex-col gap-2">
          <label className="block text-sm font-medium text-slate-300">
            {lang === 'fr' ? 'Armes maîtrisées' : 'Mastered weapons'}
            {needsWeaponmastery && <span className="text-slate-500 ml-1 text-xs">{lang === 'fr' ? '(jusqu\'à 3)' : '(up to 3)'}</span>}
          </label>
          <div className="flex flex-wrap gap-1.5 min-h-[24px]">
            {weaponmasteryWeapons.map(key => {
              const w = MAGNAKAI_WEAPONS.find(ww => ww.key === key)
              return (
                <span key={key} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-800/60 text-xs text-blue-300">
                  {w ? (lang === 'fr' ? w.fr : w.en) : key}
                  <button type="button" onClick={() => setWeaponmasteryWeapons(prev => prev.filter(k => k !== key))} className="text-blue-500 hover:text-blue-200 ml-0.5">×</button>
                </span>
              )
            })}
          </div>
          {(needsWeaponmastery ? weaponmasteryWeapons.length < 3 : weaponmasteryWeapons.length < 1) && (
            <div className="flex gap-2 items-center">
              <select
                defaultValue=""
                onChange={e => {
                  const value = e.target.value
                  if (value) {
                    setWeaponmasteryWeapons(prev => prev.includes(value) ? prev : [...prev, value])
                    e.target.value = ''
                  }
                }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
              >
                <option value="">— {lang === 'fr' ? 'Choisir une arme' : 'Choose a weapon'} —</option>
                {MAGNAKAI_WEAPONS.filter(w => !weaponmasteryWeapons.includes(w.key)).map(w => (
                  <option key={w.key} value={w.key}>{lang === 'fr' ? w.fr : w.en}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-5 py-2 rounded border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-sm">
          {t('creation.back')}
        </button>
        <button
          onClick={handleNext}
          disabled={selected.length < maxD || (needsWeaponskill && !weaponskillWeapon) || ((needsWeaponmastery || needsGrandWeaponmastery) && weaponmasteryWeapons.length === 0)}
          className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-colors"
        >
          {t('creation.next')}
        </button>
      </div>
    </div>
  )
}
