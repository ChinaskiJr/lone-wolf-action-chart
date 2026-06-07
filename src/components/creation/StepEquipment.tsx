import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Character } from '@/types/character'
import type { BackpackItem, SpecialItem, Weapon } from '@/types/game'
import { D10Roll } from '@/components/sheet/D10Roll'
import { getTotalEPMax } from '@/utils/character'
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

  function handleFinish() {
    const finalChar = {
      ...character,
      weapons,
      backpack,
      specialItems,
      goldCrowns: gold,
      meals,
    } as Character
    const totalMaxEP = getTotalEPMax(finalChar)
    onFinish({ ...finalChar, endurance: { ...finalChar.endurance, current: totalMaxEP } })
  }

  const backpackMax = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-serif font-semibold text-amber-100">{t('creation.step4')}</h2>

      {/* D10 */}
      <D10Roll />

      <EquipmentFields
        weapons={weapons}
        onWeaponsChange={setWeapons}
        backpack={backpack}
        onBackpackChange={setBackpack}
        meals={meals}
        onMealsChange={setMeals}
        specialItems={specialItems}
        onSpecialItemsChange={setSpecialItems}
        maxBackpackSlots={backpackMax}
      />

      {/* Gold */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('sheet.goldCrowns')} (max 50)</label>
        <input
          type="number"
          value={gold}
          onChange={e => setGold(Math.max(0, Math.min(50, Number(e.target.value))))}
          onFocus={e => e.target.select()}
          min={0}
          max={50}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
        />
      </div>

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-5 py-2 rounded border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-sm">
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
