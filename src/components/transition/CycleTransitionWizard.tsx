import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Check } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { useSavesStore } from '@/store/savesStore'
import type { Character } from '@/types/character'
import type { MagnakaiCharacter } from '@/types/character'
import {
  createNewMagnakaiCharacter,
  createNewGrandMasterCharacter,
  createNewOrderCharacter,
  filterCarryOverItems,
} from '@/utils/character'
import {
  MAGNAKAI_DISCIPLINES,
  GRAND_MASTER_DISCIPLINES,
  NEW_ORDER_DISCIPLINES,
  MAGNAKAI_WEAPONS,
} from '@/data/disciplines'
import { CARRY_OVER_SPECIAL_ITEMS } from '@/data/carryOverItems'
import type { DisciplineData } from '@/types/game'

const MAX_DISCIPLINES: Record<string, number> = {
  magnakai: 3,
  grandmaster: 4,
  neworder: 5,
}

export function CycleTransitionWizard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, setCharacter } = useCharacterStore()
  const { getSave, updateSave } = useSavesStore()

  const source = character ?? (id ? getSave(id) : null)
  const [step, setStep] = useState<'intro' | 'disciplines' | 'weapons' | 'items' | 'stats' | 'done'>('intro')
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([])
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([])
  const [selectedCarryOverItems, setSelectedCarryOverItems] = useState<string[]>([])

  if (!source) {
    navigate('/')
    return null
  }

  const nextCycle =
    source.cycle === 'kai' ? 'magnakai' :
    source.cycle === 'magnakai' ? 'grandmaster' :
    source.cycle === 'grandmaster' ? 'neworder' : null

  if (!nextCycle) {
    navigate(`/sheet/${source.id}`)
    return null
  }

  const disciplineMap: Record<string, DisciplineData> =
    nextCycle === 'magnakai' ? MAGNAKAI_DISCIPLINES :
    nextCycle === 'grandmaster' ? GRAND_MASTER_DISCIPLINES :
    NEW_ORDER_DISCIPLINES

  const availableDisciplines = Object.values(disciplineMap)
  const maxD = MAX_DISCIPLINES[nextCycle]

  const needsWeaponsStep = nextCycle === 'magnakai' && selectedDisciplines.includes('weaponmastery')

  function stepAfterDisciplines() {
    if (needsWeaponsStep) return 'weapons' as const
    if (nextCycle === 'grandmaster' && (source as MagnakaiCharacter).specialItems.length > 0) return 'items' as const
    return 'done' as const
  }

  function buildTransitionedChar(): Character {
    if (nextCycle === 'magnakai') {
      const char = createNewMagnakaiCharacter(source!.cycle === 'kai' ? source as any : undefined)
      return { ...char, disciplines: selectedDisciplines as any, weaponmasteryWeapons: selectedWeapons }
    } else if (nextCycle === 'grandmaster') {
      const char = createNewGrandMasterCharacter(source!.cycle === 'magnakai' ? source as MagnakaiCharacter : undefined)
      const kept = filterCarryOverItems((source as MagnakaiCharacter).specialItems, selectedCarryOverItems)
      return { ...char, disciplines: selectedDisciplines as any, specialItems: kept }
    } else {
      return { ...createNewOrderCharacter(), disciplines: selectedDisciplines as any }
    }
  }

  function handleFinish() {
    const transitioned = buildTransitionedChar()
    updateSave(transitioned)
    setCharacter(transitioned)
    navigate(`/sheet/${transitioned.id}`)
  }

  function toggleDiscipline(key: string) {
    setSelectedDisciplines(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) :
      prev.length < maxD ? [...prev, key] : prev
    )
  }

  const introKey = `transition.${source.cycle}_to_${nextCycle}`

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        {step === 'intro' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-serif font-semibold text-amber-100">{t('transition.title')}</h2>
            <div className="text-slate-300 leading-relaxed bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
              {t(introKey)}
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              <p>• HC actuel : <span className="text-amber-300">{source.combatSkill.base + source.combatSkill.bonus}</span></p>
              <p>• PE max : <span className="text-red-400">{source.endurance.max}</span></p>
              <p>• Disciplines actuelles : <span className="text-slate-200">{source.disciplines.length}</span></p>
            </div>
            <button
              onClick={() => setStep('disciplines')}
              className="self-end flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
            >
              {t('transition.selectNewDisciplines')}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 'disciplines' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-amber-100">{t('transition.selectNewDisciplines')}</h2>
              <span className={`text-sm px-2.5 py-1 rounded-full ${selectedDisciplines.length === maxD ? 'bg-green-800/50 text-green-300' : 'bg-slate-800 text-slate-400'}`}>
                {selectedDisciplines.length}/{maxD}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
              {availableDisciplines.map(d => {
                const isSelected = selectedDisciplines.includes(d.key)
                const isDisabled = !isSelected && selectedDisciplines.length >= maxD
                return (
                  <button
                    key={d.key}
                    onClick={() => !isDisabled && toggleDiscipline(d.key)}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                      ${isSelected ? 'border-amber-600 bg-amber-900/30 text-amber-100' :
                        isDisabled ? 'border-slate-800 text-slate-600 cursor-not-allowed' :
                        'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500'}`}
                  >
                    <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border ${isSelected ? 'bg-amber-600 border-amber-500' : 'border-slate-600'}`}>
                      {isSelected && <Check size={12} />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{lang === 'fr' ? d.fr : d.en}</div>
                      {isSelected && <div className="text-xs text-slate-400 mt-0.5">{lang === 'fr' ? d.effectFr : d.effectEn}</div>}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 justify-between">
              <button onClick={() => setStep('intro')} className="px-5 py-2 rounded border border-slate-700 text-slate-400 text-sm hover:text-slate-200 transition-colors">
                {t('creation.back')}
              </button>
              <button
                onClick={() => setStep(stepAfterDisciplines())}
                disabled={selectedDisciplines.length < maxD}
                className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-colors"
              >
                {t('creation.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'weapons' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-amber-100">
                {t('transition.masteredWeapons')}
              </h2>
              <span className={`text-sm px-2.5 py-1 rounded-full ${selectedWeapons.length === 3 ? 'bg-green-800/50 text-green-300' : 'bg-slate-800 text-slate-400'}`}>
                {selectedWeapons.length}/3
              </span>
            </div>
            <p className="text-sm text-slate-400">{t('transition.masteredWeaponsDesc')}</p>
            <div className="grid grid-cols-2 gap-2">
              {MAGNAKAI_WEAPONS.map(w => {
                const isSelected = selectedWeapons.includes(w.key)
                const isDisabled = !isSelected && selectedWeapons.length >= 3
                return (
                  <button
                    key={w.key}
                    onClick={() => {
                      if (isDisabled) return
                      setSelectedWeapons(prev =>
                        prev.includes(w.key) ? prev.filter(k => k !== w.key) : [...prev, w.key]
                      )
                    }}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                      ${isSelected ? 'border-amber-600 bg-amber-900/30 text-amber-100' :
                        isDisabled ? 'border-slate-800 text-slate-600 cursor-not-allowed' :
                        'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500'}`}
                  >
                    <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border ${isSelected ? 'bg-amber-600 border-amber-500' : 'border-slate-600'}`}>
                      {isSelected && <Check size={12} />}
                    </div>
                    <span className="text-sm font-medium">{lang === 'fr' ? w.fr : w.en}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 justify-between">
              <button onClick={() => setStep('disciplines')} className="px-5 py-2 rounded border border-slate-700 text-slate-400 text-sm hover:text-slate-200 transition-colors">
                {t('creation.back')}
              </button>
              <button
                onClick={() => setStep('done')}
                disabled={selectedWeapons.length === 0}
                className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-colors"
              >
                {t('creation.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'items' && nextCycle === 'grandmaster' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-amber-100">{t('transition.carryOverItems')}</h2>
              <span className={`text-sm px-2.5 py-1 rounded-full ${selectedCarryOverItems.length > 0 ? 'bg-amber-800/50 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {selectedCarryOverItems.length}/12
              </span>
            </div>

            {/* Canonical reference — informational only */}
            <div className="text-xs bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
              <div className="font-medium text-slate-400 mb-1.5">{t('transition.allowedItems')}</div>
              <div className="flex flex-wrap gap-1.5">
                {CARRY_OVER_SPECIAL_ITEMS.map(item => (
                  <span key={item.key} className="px-2 py-0.5 rounded bg-slate-700/60 text-slate-400">
                    {lang === 'fr' ? item.fr : item.en}
                  </span>
                ))}
              </div>
            </div>

            {/* Player's actual items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(source as MagnakaiCharacter).specialItems.map(item => {
                const isSelected = selectedCarryOverItems.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCarryOverItems(prev =>
                      prev.includes(item.id) ? prev.filter(id => id !== item.id) :
                      prev.length < 12 ? [...prev, item.id] : prev
                    )}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-all
                      ${isSelected ? 'border-amber-600 bg-amber-900/30 text-amber-100' : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500'}`}
                  >
                    <span className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-500' : 'border-slate-600'}`}>
                      {isSelected && <Check size={11} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium">{item.name}</span>
                        {item.hcBonus != null && item.hcBonus !== 0 && (
                          <span className="text-xs font-semibold text-amber-400 bg-amber-900/40 rounded px-1">{item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC</span>
                        )}
                        {item.peBonus != null && item.peBonus !== 0 && (
                          <span className="text-xs font-semibold text-green-400 bg-green-900/40 rounded px-1">{item.peBonus > 0 ? '+' : ''}{item.peBonus} PE</span>
                        )}
                      </div>
                      {item.effect && <div className="text-xs text-slate-400 mt-0.5">{item.effect}</div>}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3 justify-between">
              <button onClick={() => setStep('disciplines')} className="px-5 py-2 rounded border border-slate-700 text-slate-400 text-sm hover:text-slate-200 transition-colors">
                {t('creation.back')}
              </button>
              <button
                onClick={() => setStep('done')}
                className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
              >
                {t('creation.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col gap-5 text-center">
            <div className="text-4xl">⚔</div>
            <h2 className="text-2xl font-serif font-semibold text-amber-100">
              {t(`cycles.${nextCycle}`)}
            </h2>
            <p className="text-slate-400">{t('transition.proceed')}</p>
            <button
              onClick={handleFinish}
              className="self-center px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-lg transition-colors"
            >
              {t('transition.proceed')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
