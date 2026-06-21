import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Wallet } from 'lucide-react'
import { WeaponsEditor } from '@/components/WeaponsEditor'
import { SpecialItemsEditor } from '@/components/SpecialItemsEditor'
import { HerbPouchContent } from '@/components/HerbPouchContent'
import { EquipmentFields } from '@/components/EquipmentFields'
import type { BackpackItem, Cycle, SpecialItem, Weapon } from '@/types/game'

export interface BookEquipmentSnapshot {
  weapons: Weapon[]
  backpack: BackpackItem[]
  meals: number
  goldCrowns: number
  specialItems: SpecialItem[]
  hasQuiver: boolean
  arrows: number
  hasHerbPouch: boolean
  herbPouch: BackpackItem[]
}

interface Props {
  initial: BookEquipmentSnapshot
  maxBackpackSlots: number
  cycle: Cycle
  onConfirm: (result: BookEquipmentSnapshot) => void
  onBack?: () => void
  onSkip?: () => void
  confirmLabel?: string
}

export function BookEquipmentStep({
  initial,
  maxBackpackSlots,
  cycle,
  onConfirm,
  onBack,
  onSkip,
  confirmLabel,
}: Props) {
  const { t } = useTranslation()

  const [weapons, setWeapons] = useState<Weapon[]>(initial.weapons ?? [])
  const [backpack, setBackpack] = useState<BackpackItem[]>(initial.backpack)
  const [meals, setMeals] = useState(initial.meals)
  const [goldCrowns, setGoldCrowns] = useState(initial.goldCrowns)
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>(initial.specialItems)
  const [hasQuiver, setHasQuiver] = useState(initial.hasQuiver)
  const [arrows, setArrows] = useState(initial.arrows)
  const [hasHerbPouch, setHasHerbPouch] = useState(initial.hasHerbPouch)
  const [herbPouch, setHerbPouch] = useState<BackpackItem[]>(initial.herbPouch)
  const [herbPouchOpen, setHerbPouchOpen] = useState(false)

  const showQuiverAndHerbPouch = cycle !== 'kai'

  function equipWeapon(i: number) {
    setWeapons((prev) =>
      prev.map((w, j) =>
        j === i ? { ...w, equipped: w.equipped !== false ? false : undefined } : w
      )
    )
  }

  function updateWeapon(i: number, w: Weapon) {
    setWeapons((prev) => prev.map((ww, j) => (j === i ? w : ww)))
  }

  function toggleHerbPouch() {
    if (hasHerbPouch) {
      setHasHerbPouch(false)
      setHerbPouch([])
    } else {
      setHasHerbPouch(true)
    }
  }

  function submit() {
    onConfirm({
      weapons,
      backpack,
      meals,
      goldCrowns,
      specialItems,
      hasQuiver,
      arrows: hasQuiver ? arrows : 0,
      hasHerbPouch,
      herbPouch: hasHerbPouch ? herbPouch : [],
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <WeaponsEditor
        weapons={weapons}
        hasQuiver={hasQuiver}
        arrows={arrows}
        showQuiver={showQuiverAndHerbPouch}
        onAdd={(w) => setWeapons((prev) => [...prev, w])}
        onRemove={(i) => setWeapons((prev) => prev.filter((_, j) => j !== i))}
        onEquip={equipWeapon}
        onUpdate={updateWeapon}
        onToggleQuiver={() => setHasQuiver((q) => !q)}
        onSetArrows={(n) => setArrows(Math.max(0, n))}
      />

      <EquipmentFields
        backpack={backpack}
        onBackpackChange={setBackpack}
        meals={meals}
        onMealsChange={setMeals}
        maxBackpackSlots={maxBackpackSlots}
        gold={goldCrowns}
        onGoldChange={setGoldCrowns}
      />

      <SpecialItemsEditor
        items={specialItems}
        onAdd={(item) => setSpecialItems((prev) => [...prev, item])}
        onRemove={(id) => setSpecialItems((prev) => prev.filter((i) => i.id !== id))}
        onUpdate={(id, updates) =>
          setSpecialItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
        }
        hasHerbPouch={hasHerbPouch}
        herbPouch={herbPouch}
        showHerbPouch={showQuiverAndHerbPouch}
        onToggleHerbPouch={toggleHerbPouch}
        onOpenHerbPouch={() => setHerbPouchOpen(true)}
      />

      {herbPouchOpen && (
        <div className="bg-slate-900 border border-green-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={15} className="text-green-400 shrink-0" />
            <span className="flex-1 font-semibold text-sm text-green-100">
              {t('sheet.herbPouch')}
            </span>
            <span
              className={`text-xs ${herbPouch.length >= 6 ? 'text-red-400' : 'text-slate-500'}`}
            >
              {t('sheet.herbPouchSlots', { used: herbPouch.length })}
            </span>
            <button
              onClick={() => setHerbPouchOpen(false)}
              aria-label={t('common.cancel')}
              className="relative text-slate-500 hover:text-slate-300 transition-colors before:absolute before:inset-[-10px]"
            >
              <X size={14} />
            </button>
          </div>
          <HerbPouchContent
            herbPouch={herbPouch}
            onAdd={(item) => setHerbPouch((prev) => [...prev, item])}
            onRemove={(id) => setHerbPouch((prev) => prev.filter((i) => i.id !== id))}
            onUpdate={(id, item) =>
              setHerbPouch((prev) => prev.map((i) => (i.id === id ? item : i)))
            }
          />
        </div>
      )}

      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="px-5 py-2 rounded border border-slate-700 text-slate-400 text-sm hover:text-slate-200 transition-colors"
          >
            {t('creation.back')}
          </button>
        )}
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-5 py-2 rounded border border-slate-600 text-slate-300 text-sm hover:text-slate-100 transition-colors"
          >
            {t('sheet.bookWizard.equipmentSkip')}
          </button>
        )}
        <button
          onClick={submit}
          className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors ml-auto"
        >
          {confirmLabel ?? t('creation.next')}
        </button>
      </div>
    </div>
  )
}
