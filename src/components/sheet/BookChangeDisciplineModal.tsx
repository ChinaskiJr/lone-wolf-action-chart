import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, BookOpen } from 'lucide-react'
import { DisciplineGrid } from '@/components/disciplines/DisciplineGrid'
import { useCharacterStore } from '@/store/characterStore'
import {
  KAI_WEAPONS,
  MAGNAKAI_WEAPONS,
  getDisciplineMap,
} from '@/data/disciplines'
import { LoreCirclesWidget } from '@/components/LoreCirclesWidget'

interface Props {
  onConfirm: () => void
}

export function BookChangeDisciplineModal({ onConfirm }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, addDiscipline, setWeaponskillWeapon, addWeaponmasteryWeapon } = useCharacterStore()
  const [selected, setSelected] = useState<string | null>(null)
  // Single weapon choice (grandWeaponmastery, or bonus slot for existing Magnakai WM)
  const [wmWeaponChoice, setWmWeaponChoice] = useState('')
  // Multi weapon choice (newly learning weaponmastery in Magnakai)
  const [wmWeaponsChoice, setWmWeaponsChoice] = useState<string[]>([])

  if (!character) return null

  const disciplines = Object.values(getDisciplineMap(character.cycle))
  const owned = character.disciplines as string[]
  const ownedWeapons: string[] = (character as any).weaponmasteryWeapons ?? []

  // Newly selecting weaponmastery in Magnakai → multi-weapon selection
  const needsMultiWeapon = selected === 'weaponmastery' && character.cycle === 'magnakai'
  // Newly selecting grandWeaponmastery → single weapon
  const needsSingleWeapon = selected === 'grandWeaponmastery'

  // Player already has weaponmastery in Magnakai: they earn +1 weapon slot this book
  const maxMagWM = character.cycle === 'magnakai' ? character.currentBook - 3 : 0
  const hasMagWMAlready = character.cycle === 'magnakai' && owned.includes('weaponmastery')
  const canAddBonusWeapon = hasMagWMAlready && ownedWeapons.length < maxMagWM

  // How many weapons to choose when newly learning weaponmastery in Magnakai
  const maxWmToChoose = character.cycle === 'magnakai' ? character.currentBook - 3 : 1

  const availableWmWeapons = MAGNAKAI_WEAPONS.filter(w => !ownedWeapons.includes(w.key))
  const cycleLabel = lang === 'fr'
    ? ({ kai: 'Kaï', magnakai: 'Magnakaï', grandmaster: 'Grand Maître', neworder: 'Nouvel Ordre' })[character.cycle]
    : ({ kai: 'Kai', magnakai: 'Magnakai', grandmaster: 'Grand Master', neworder: 'New Order' })[character.cycle]

  function handleSelect(key: string) {
    if (owned.includes(key)) return
    if (selected === key) {
      setSelected(null)
      setWmWeaponChoice('')
      setWmWeaponsChoice([])
    } else {
      setSelected(key)
      setWmWeaponChoice('')
      setWmWeaponsChoice([])
    }
  }

  function toggleMultiWeapon(key: string) {
    setWmWeaponsChoice(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) :
      prev.length < maxWmToChoose ? [...prev, key] : prev
    )
  }

  const disciplineOk =
    selected !== null &&
    (!needsMultiWeapon || wmWeaponsChoice.length > 0) &&
    (!needsSingleWeapon || wmWeaponChoice !== '')
  const bonusOk = !canAddBonusWeapon || wmWeaponChoice !== ''
  const canConfirm = disciplineOk && bonusOk

  function handleConfirm() {
    if (!selected) return
    if (selected === 'weaponskill') {
      const idx = Math.floor(Math.random() * KAI_WEAPONS.length)
      addDiscipline('weaponskill')
      setWeaponskillWeapon(KAI_WEAPONS[idx].key)
    } else if (needsMultiWeapon) {
      addDiscipline('weaponmastery')
      for (const w of wmWeaponsChoice) addWeaponmasteryWeapon(w)
    } else if (needsSingleWeapon) {
      if (!wmWeaponChoice) return
      addDiscipline('grandWeaponmastery')
      addWeaponmasteryWeapon(wmWeaponChoice)
    } else {
      addDiscipline(selected)
    }
    // Bonus weapon slot earned this book (already-owned weaponmastery)
    if (canAddBonusWeapon && wmWeaponChoice) {
      addWeaponmasteryWeapon(wmWeaponChoice)
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

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 pt-4 flex flex-col gap-4">

          {/* Bonus weapon slot for existing Magnakai weaponmastery holders */}
          {canAddBonusWeapon && (
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 flex flex-col gap-2">
              <div className="text-xs font-medium text-blue-300">
                {lang === 'fr'
                  ? `Science des Armes — nouvelle arme maîtrisée (livre ${character.currentBook - 1})`
                  : `Weaponmastery — new mastered weapon (book ${character.currentBook - 1})`}
              </div>
              <div className="text-xs text-slate-400">
                {lang === 'fr'
                  ? `${ownedWeapons.length}/${maxMagWM} types maîtrisés`
                  : `${ownedWeapons.length}/${maxMagWM} types mastered`}
              </div>
              <select
                value={wmWeaponChoice}
                onChange={e => setWmWeaponChoice(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-blue-600"
              >
                <option value="">— {lang === 'fr' ? 'Choisir' : 'Choose'} —</option>
                {availableWmWeapons.map(w => (
                  <option key={w.key} value={w.key}>{lang === 'fr' ? w.fr : w.en}</option>
                ))}
              </select>
            </div>
          )}

          {/* Discipline list */}
          <DisciplineGrid
            disciplines={disciplines}
            lang={lang}
            getState={key => owned.includes(key) ? 'owned' : selected === key ? 'selected' : 'available'}
            onPick={handleSelect}
          />

          {/* Multi-weapon selector — newly learning weaponmastery in Magnakai */}
          {needsMultiWeapon && (
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300 font-medium">
                  {lang === 'fr' ? 'Choisissez vos armes maîtrisées' : 'Choose your mastered weapons'}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${wmWeaponsChoice.length >= maxWmToChoose ? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                  {wmWeaponsChoice.length}/{maxWmToChoose}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'fr'
                  ? `Vous rattrapez les livres ${6}–${character.currentBook - 1} : ${maxWmToChoose} type${maxWmToChoose > 1 ? 's' : ''} au total.`
                  : `Retroactive for books ${6}–${character.currentBook - 1}: ${maxWmToChoose} type${maxWmToChoose > 1 ? 's' : ''} total.`}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {MAGNAKAI_WEAPONS.map(w => {
                  const isChosen = wmWeaponsChoice.includes(w.key)
                  const isDisabled = !isChosen && wmWeaponsChoice.length >= maxWmToChoose
                  return (
                    <button
                      key={w.key}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleMultiWeapon(w.key)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs text-left transition-colors
                        ${isChosen ? 'border-blue-600 bg-blue-900/30 text-blue-100' :
                          isDisabled ? 'border-slate-800 text-slate-600 cursor-not-allowed' :
                          'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-blue-700/60'}`}
                    >
                      <span className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center ${isChosen ? 'bg-blue-600 border-blue-500' : 'border-slate-600'}`}>
                        {isChosen && <Check size={9} />}
                      </span>
                      {lang === 'fr' ? w.fr : w.en}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Single weapon selector — grandWeaponmastery */}
          {needsSingleWeapon && (
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

          {/* Lore circles — Magnakai only */}
          {character.cycle === 'magnakai' && (
            <LoreCirclesWidget
              selected={selected ? [...owned, selected] : owned}
              lang={lang}
            />
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
