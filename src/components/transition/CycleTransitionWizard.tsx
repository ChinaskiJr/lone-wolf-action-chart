import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronLeft, Check, Archive } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { useSavesStore } from '@/store/savesStore'
import type { Character, MagnakaiCharacter } from '@/types/character'
import type { MonasteryStorage, SpecialItem, Weapon, BackpackItem } from '@/types/game'
import {
  createNewMagnakaiCharacter,
  createNewGrandMasterCharacter,
  createNewOrderCharacter,
  filterCarryOverItems,
  getTotalEPMax,
} from '@/utils/character'
import {
  MAGNAKAI_DISCIPLINES,
  GRAND_MASTER_DISCIPLINES,
  NEW_ORDER_DISCIPLINES,
  MAGNAKAI_WEAPONS,
} from '@/data/disciplines'
import { CARRY_OVER_SPECIAL_ITEMS, CARRY_OVER_SPECIAL_ITEMS_KAI_TO_MAGNAKAI } from '@/data/carryOverItems'
import { LoreCirclesWidget } from '@/components/LoreCirclesWidget'
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
  const [step, setStep] = useState<'intro' | 'disciplines' | 'weapons' | 'items' | 'monastery' | 'done'>('intro')
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([])
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([])
  const [selectedCarryOverItems, setSelectedCarryOverItems] = useState<string[]>([])
  const [wizMonastery, setWizMonastery] = useState<MonasteryStorage | null>(null)
  const [wizLeftSpecialItems, setWizLeftSpecialItems] = useState<SpecialItem[] | null>(null)
  const [wizPendingWeapons, setWizPendingWeapons] = useState<Weapon[] | null>(null)
  const [wizPendingBackpack, setWizPendingBackpack] = useState<BackpackItem[] | null>(null)
  const [wizPendingGold, setWizPendingGold] = useState<number | null>(null)

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
  const sourceSpecialItems = (source as any).specialItems as import('@/types/game').SpecialItem[] ?? []
  const allowedCarryOverItems =
    nextCycle === 'magnakai' ? CARRY_OVER_SPECIAL_ITEMS_KAI_TO_MAGNAKAI : CARRY_OVER_SPECIAL_ITEMS
  const needsItemsStep =
    (nextCycle === 'magnakai' || nextCycle === 'grandmaster') && sourceSpecialItems.length > 0

  function stepAfterDisciplines() {
    if (needsWeaponsStep) return 'weapons' as const
    return 'monastery' as const
  }

  function stepAfterWeapons() {
    return 'monastery' as const
  }

  const emptyMonastery: MonasteryStorage = { weapons: [], goldCrowns: 0, backpack: [], specialItems: [] }

  function applyWizardInventory<T extends { weapons: Weapon[]; backpack: BackpackItem[]; goldCrowns: number }>(char: T): T {
    return {
      ...char,
      ...(wizPendingWeapons !== null ? { weapons: wizPendingWeapons } : {}),
      ...(wizPendingBackpack !== null ? { backpack: wizPendingBackpack } : {}),
      ...(wizPendingGold !== null ? { goldCrowns: Math.max(0, Math.min(50, wizPendingGold)) } : {}),
    }
  }

  function buildTransitionedChar(): Character {
    const monastery = wizMonastery ?? (source as any).monastery ?? emptyMonastery
    if (nextCycle === 'magnakai') {
      const char = createNewMagnakaiCharacter(source!.cycle === 'kai' ? source as any : undefined)
      const kept = filterCarryOverItems(wizLeftSpecialItems ?? sourceSpecialItems, selectedCarryOverItems)
      const withItems = applyWizardInventory({ ...char, disciplines: selectedDisciplines as any, weaponmasteryWeapons: selectedWeapons, specialItems: kept })
      // Restore to full EP including bonuses from carried-over equipped special items.
      return { ...withItems, endurance: { ...withItems.endurance, current: getTotalEPMax(withItems) }, monastery }
    } else if (nextCycle === 'grandmaster') {
      const char = createNewGrandMasterCharacter(source!.cycle === 'magnakai' ? source as MagnakaiCharacter : undefined)
      const kept = filterCarryOverItems(wizLeftSpecialItems ?? (source as MagnakaiCharacter).specialItems, selectedCarryOverItems)
      return applyWizardInventory({ ...char, disciplines: selectedDisciplines as any, specialItems: kept, monastery } as any) as Character
    } else {
      return { ...createNewOrderCharacter(), disciplines: selectedDisciplines as any, monastery }
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
            {nextCycle === 'magnakai' && (
              <LoreCirclesWidget selected={selectedDisciplines} lang={lang} />
            )}

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
                onClick={() => setStep(stepAfterWeapons())}
                disabled={selectedWeapons.length === 0}
                className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium transition-colors"
              >
                {t('creation.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'items' && needsItemsStep && (
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
                {allowedCarryOverItems.map(item => (
                  <span key={item.key} className="px-2 py-0.5 rounded bg-slate-700/60 text-slate-400">
                    {lang === 'fr' ? item.fr : item.en}
                  </span>
                ))}
              </div>
            </div>

            {/* Player's actual items (only those not deposited in monastery) */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(wizLeftSpecialItems ?? sourceSpecialItems).map(item => {
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
              <button onClick={() => setStep('monastery')} className="px-5 py-2 rounded border border-slate-700 text-slate-400 text-sm hover:text-slate-200 transition-colors">
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

        {step === 'monastery' && (
          <MonasteryStep
            source={source}
            sourceSpecialItems={sourceSpecialItems}
            lang={lang}
            onConfirm={(result) => {
              setWizLeftSpecialItems(result.leftSpecialItems)
              setWizPendingWeapons(result.pendingWeapons)
              setWizPendingBackpack(result.pendingBackpack)
              setWizPendingGold(result.pendingGold)
              setWizMonastery(result.monastery)
              setStep(needsItemsStep && result.leftSpecialItems.length > 0 ? 'items' : 'done')
            }}
            onBack={() => {
              if (needsWeaponsStep) setStep('weapons')
              else setStep('disciplines')
            }}
            t={t}
          />
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

interface MonasteryStepResult {
  leftSpecialItems: SpecialItem[]
  pendingWeapons: Weapon[]
  pendingBackpack: BackpackItem[]
  pendingGold: number
  monastery: MonasteryStorage
}

interface MonasteryStepProps {
  source: { weapons: Weapon[]; backpack: BackpackItem[]; goldCrowns: number; monastery?: MonasteryStorage }
  sourceSpecialItems: SpecialItem[]
  lang: 'fr' | 'en'
  onConfirm: (result: MonasteryStepResult) => void
  onBack: () => void
  t: (key: string) => string
}

function MonasteryStep({ source, sourceSpecialItems, lang, onConfirm, onBack, t }: MonasteryStepProps) {
  const existing = source.monastery ?? { weapons: [], goldCrowns: 0, backpack: [], specialItems: [] }
  const totalGold = source.goldCrowns + existing.goldCrowns

  const [leftWeapons, setLeftWeapons] = useState<Weapon[]>(source.weapons)
  const [leftBackpack, setLeftBackpack] = useState<BackpackItem[]>(source.backpack)
  const [leftSpecialItems, setLeftSpecialItems] = useState<SpecialItem[]>(sourceSpecialItems)
  const [leftGold, setLeftGold] = useState(source.goldCrowns)

  const [rightWeapons, setRightWeapons] = useState<Weapon[]>(existing.weapons)
  const [rightBackpack, setRightBackpack] = useState<BackpackItem[]>(existing.backpack)
  const [rightSpecialItems, setRightSpecialItems] = useState<SpecialItem[]>(existing.specialItems)
  const [rightGold, setRightGold] = useState(existing.goldCrowns)

  // lang is used for item display if needed in future
  void lang

  function depositWeapon(idx: number) {
    const item = leftWeapons[idx]
    setLeftWeapons(prev => prev.filter((_, i) => i !== idx))
    setRightWeapons(prev => [...prev, item])
  }

  function retrieveWeapon(idx: number) {
    const item = rightWeapons[idx]
    setRightWeapons(prev => prev.filter((_, i) => i !== idx))
    setLeftWeapons(prev => [...prev, item])
  }

  function depositBackpack(id: string) {
    const item = leftBackpack.find(i => i.id === id)!
    setLeftBackpack(prev => prev.filter(i => i.id !== id))
    setRightBackpack(prev => [...prev, item])
  }

  function retrieveBackpack(id: string) {
    const item = rightBackpack.find(i => i.id === id)!
    setRightBackpack(prev => prev.filter(i => i.id !== id))
    setLeftBackpack(prev => [...prev, item])
  }

  function depositSpecial(id: string) {
    const item = leftSpecialItems.find(i => i.id === id)!
    setLeftSpecialItems(prev => prev.filter(i => i.id !== id))
    setRightSpecialItems(prev => [...prev, item])
  }

  function retrieveSpecial(id: string) {
    const item = rightSpecialItems.find(i => i.id === id)!
    setRightSpecialItems(prev => prev.filter(i => i.id !== id))
    setLeftSpecialItems(prev => [...prev, item])
  }

  function handleLeftGold(val: number) {
    const c = Math.max(0, Math.min(totalGold, val))
    setLeftGold(c)
    setRightGold(totalGold - c)
  }

  function handleRightGold(val: number) {
    const c = Math.max(0, Math.min(totalGold, val))
    setRightGold(c)
    setLeftGold(totalGold - c)
  }

  function handleConfirm() {
    onConfirm({
      leftSpecialItems,
      pendingWeapons: leftWeapons,
      pendingBackpack: leftBackpack,
      pendingGold: leftGold,
      monastery: { weapons: rightWeapons, goldCrowns: rightGold, backpack: rightBackpack, specialItems: rightSpecialItems },
    })
  }

  const noItems = t('sheet.monastery.noItems')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-800/50 flex items-center justify-center text-amber-400">
          <Archive size={16} />
        </div>
        <h2 className="text-xl font-serif font-semibold text-amber-100">{t('sheet.monastery.title')}</h2>
      </div>
      <p className="text-sm text-slate-400">{t('sheet.monastery.subtitle')}</p>

      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
        {/* Left panel */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase">{t('sheet.monastery.yourEquipment')}</div>

          <WizSection label={t('sheet.weapons')}>
            {leftWeapons.length === 0
              ? <WizEmpty label={noItems} />
              : leftWeapons.map((w, i) => (
                <WizRow key={i} name={w.name} badge={t('sheet.monastery.willCarryOver')} badgeGreen>
                  <WizBtn dir="right" onClick={() => depositWeapon(i)} />
                </WizRow>
              ))
            }
          </WizSection>

          <WizSection label={t('sheet.backpack')}>
            {leftBackpack.length === 0
              ? <WizEmpty label={noItems} />
              : leftBackpack.map(item => (
                <WizRow key={item.id} name={item.name} badge={t('sheet.monastery.willCarryOver')} badgeGreen>
                  <WizBtn dir="right" onClick={() => depositBackpack(item.id)} />
                </WizRow>
              ))
            }
          </WizSection>

          <WizSection label={t('sheet.specialItems')}>
            {leftSpecialItems.length === 0
              ? <WizEmpty label={noItems} />
              : leftSpecialItems.map(item => (
                <WizRow key={item.id} name={item.name} sub={
                  (item.hcBonus != null && item.hcBonus !== 0) || (item.peBonus != null && item.peBonus !== 0) ? <>
                    {item.hcBonus != null && item.hcBonus !== 0 && <span className="font-semibold rounded px-1 text-amber-400 bg-amber-900/40">{item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC</span>}
                    {item.peBonus != null && item.peBonus !== 0 && <span className="font-semibold rounded px-1 text-green-400 bg-green-900/40">{item.peBonus > 0 ? '+' : ''}{item.peBonus} PE</span>}
                  </> : undefined
                }>
                  <WizBtn dir="right" onClick={() => depositSpecial(item.id)} />
                </WizRow>
              ))
            }
          </WizSection>

          <WizSection label={t('sheet.goldCrowns')}>
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <input
                type="number"
                min={0}
                max={totalGold}
                value={leftGold}
                onChange={e => handleLeftGold(Number(e.target.value))}
                className="w-14 text-center text-xs bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-500">/ {totalGold}</span>
              <WizBtn dir="right" onClick={() => handleRightGold(totalGold)} />
            </div>
          </WizSection>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-amber-600/80 uppercase">{t('sheet.monastery.stored')}</div>

          <WizSection label={t('sheet.weapons')}>
            {rightWeapons.length === 0
              ? <WizEmpty label={noItems} />
              : rightWeapons.map((w, i) => (
                <WizRow key={i} name={w.name}>
                  <WizBtn dir="left" onClick={() => retrieveWeapon(i)} />
                </WizRow>
              ))
            }
          </WizSection>

          <WizSection label={t('sheet.backpack')}>
            {rightBackpack.length === 0
              ? <WizEmpty label={noItems} />
              : rightBackpack.map(item => (
                <WizRow key={item.id} name={item.name}>
                  <WizBtn dir="left" onClick={() => retrieveBackpack(item.id)} />
                </WizRow>
              ))
            }
          </WizSection>

          <WizSection label={t('sheet.specialItems')}>
            {rightSpecialItems.length === 0
              ? <WizEmpty label={noItems} />
              : rightSpecialItems.map(item => (
                <WizRow key={item.id} name={item.name} sub={
                  (item.hcBonus != null && item.hcBonus !== 0) || (item.peBonus != null && item.peBonus !== 0) ? <>
                    {item.hcBonus != null && item.hcBonus !== 0 && <span className="font-semibold rounded px-1 text-amber-400 bg-amber-900/40">{item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC</span>}
                    {item.peBonus != null && item.peBonus !== 0 && <span className="font-semibold rounded px-1 text-green-400 bg-green-900/40">{item.peBonus > 0 ? '+' : ''}{item.peBonus} PE</span>}
                  </> : undefined
                }>
                  <WizBtn dir="left" onClick={() => retrieveSpecial(item.id)} />
                </WizRow>
              ))
            }
          </WizSection>

          <WizSection label={t('sheet.goldCrowns')}>
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <WizBtn dir="left" onClick={() => handleLeftGold(totalGold)} />
              <input
                type="number"
                min={0}
                max={totalGold}
                value={rightGold}
                onChange={e => handleRightGold(Number(e.target.value))}
                className="w-14 text-center text-xs bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </WizSection>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-5 py-2 rounded border border-slate-700 text-slate-400 text-sm hover:text-slate-200 transition-colors">
          {t('creation.back')}
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
        >
          {t('creation.next')}
        </button>
      </div>
    </div>
  )
}

function WizSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="border border-slate-700/60 rounded overflow-hidden divide-y divide-slate-700/40">
        {children}
      </div>
    </div>
  )
}

function WizRow({ name, badge, badgeGreen, sub, children }: { name: string; badge?: string; badgeGreen?: boolean; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/30 text-xs">
      <div className="flex-1 min-w-0">
        <div className="truncate text-slate-200">{name}</div>
        {sub && <div className="flex gap-1 flex-wrap mt-0.5">{sub}</div>}
      </div>
      {badge && (
        <span className={`text-[10px] px-1 rounded shrink-0 ${badgeGreen ? 'bg-green-900/40 text-green-400' : 'bg-orange-900/40 text-orange-400'}`}>
          {badge}
        </span>
      )}
      {children}
    </div>
  )
}

function WizEmpty({ label }: { label: string }) {
  return <div className="px-2 py-1 bg-slate-800/20 text-xs text-slate-600 italic">{label}</div>
}

function WizBtn({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 rounded hover:bg-amber-900/20"
    >
      {dir === 'right' ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
    </button>
  )
}
