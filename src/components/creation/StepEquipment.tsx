import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Wallet, Package } from 'lucide-react'
import type { Character } from '@/types/character'
import type { BackpackItem, SpecialItem, Weapon } from '@/types/game'
import { D10Roll } from '@/components/sheet/D10Roll'
import { getTotalEPMax } from '@/utils/character'
import { WeaponsEditor } from '@/components/WeaponsEditor'
import { SpecialItemsEditor } from '@/components/SpecialItemsEditor'
import { HerbPouchContent } from '@/components/HerbPouchContent'
import { EquipmentFields } from '@/components/EquipmentFields'

interface Props {
  character: Character
  onFinish: (char: Character) => void
  onBack: () => void
}

export function StepEquipment({ character, onFinish, onBack }: Props) {
  const { t } = useTranslation()

  const [weapons, setWeapons] = useState<Weapon[]>(character.weapons)
  const [backpack, setBackpack] = useState<BackpackItem[]>(character.backpack)
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>(character.specialItems)
  const [gold, setGold] = useState(character.goldCrowns)
  const [meals, setMeals] = useState(character.meals)
  const [hasQuiver, setHasQuiver] = useState(character.hasQuiver ?? false)
  const [arrows, setArrows] = useState(character.arrows ?? 0)
  const [hasHerbPouch, setHasHerbPouch] = useState(character.hasHerbPouch ?? false)
  const [herbPouch, setHerbPouch] = useState<BackpackItem[]>(character.herbPouch ?? [])
  const [herbPouchOpen, setHerbPouchOpen] = useState(false)

  const showQuiverAndHerbPouch = character.cycle !== 'kai'

  function toggleHerbPouch() {
    if (hasHerbPouch) {
      setHasHerbPouch(false)
      setHerbPouch([])
    } else {
      setHasHerbPouch(true)
    }
  }

  function handleFinish() {
    const finalChar = {
      ...character,
      weapons,
      backpack,
      specialItems,
      goldCrowns: gold,
      meals,
      hasQuiver,
      arrows: hasQuiver ? arrows : 0,
      hasHerbPouch,
      herbPouch: hasHerbPouch ? herbPouch : [],
    } as Character
    const totalMaxEP = getTotalEPMax(finalChar)
    onFinish({ ...finalChar, endurance: { ...finalChar.endurance, current: totalMaxEP } })
  }

  const backpackMax = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10

  return (
    <div className="flex flex-col gap-5">
      <h2 className="flex items-center gap-2 text-xl font-serif font-semibold text-amber-100">
        <Package size={18} />
        {t('creation.step4')}
      </h2>

      {/* D10 */}
      <D10Roll />

      <WeaponsEditor
        weapons={weapons}
        hasQuiver={hasQuiver}
        arrows={arrows}
        showQuiver={showQuiverAndHerbPouch}
        onAdd={(w) => setWeapons((prev) => [...prev, w])}
        onRemove={(i) => setWeapons((prev) => prev.filter((_, j) => j !== i))}
        onEquip={(i) =>
          setWeapons((prev) =>
            prev.map((w, j) =>
              j === i ? { ...w, equipped: w.equipped !== false ? false : undefined } : w
            )
          )
        }
        onUpdate={(i, w) => setWeapons((prev) => prev.map((ww, j) => (j === i ? w : ww)))}
        onToggleQuiver={() => setHasQuiver((q) => !q)}
        onSetArrows={(n) => setArrows(Math.max(0, n))}
      />

      <EquipmentFields
        backpack={backpack}
        onBackpackChange={setBackpack}
        meals={meals}
        onMealsChange={setMeals}
        maxBackpackSlots={backpackMax}
        gold={gold}
        onGoldChange={setGold}
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

      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2 rounded border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          {t('creation.back')}
        </button>
        <button
          onClick={handleFinish}
          className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
        >
          {t('creation.create')}
        </button>
      </div>
    </div>
  )
}
