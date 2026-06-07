import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { EquipmentFields } from '@/components/EquipmentFields'
import type { BackpackItem, SpecialItem, Weapon } from '@/types/game'

interface Props {
  onDone: () => void
  onSkip: () => void
}

export function BookChangeEquipmentModal({ onDone, onSkip }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const {
    character,
    addWeapon, removeWeapon,
    addBackpackItem, removeBackpackItem,
    addSpecialItem, removeSpecialItem,
    setMeals: storeMeals,
  } = useCharacterStore()

  const [localWeapons, setLocalWeapons] = useState<Weapon[]>(() => character?.weapons ?? [])
  const [localBackpack, setLocalBackpack] = useState<BackpackItem[]>(() => character?.backpack ?? [])
  const [localSpecialItems, setLocalSpecialItems] = useState<SpecialItem[]>(() => character?.specialItems ?? [])
  const [localMeals, setLocalMeals] = useState(() => character?.meals ?? 0)

  if (!character) return null

  const maxBackpackSlots = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10

  function handleDone() {
    // Weapons: remove all existing, re-add local
    for (let i = 0; i < character!.weapons.length; i++) {
      removeWeapon(0)
    }
    for (const w of localWeapons) {
      addWeapon(w)
    }

    // Meals
    storeMeals(localMeals)

    // Backpack diff
    const originalBackpackIds = new Set((character!.backpack ?? []).map(i => i.id))
    const localBackpackIds = new Set(localBackpack.map(i => i.id))
    for (const id of originalBackpackIds) {
      if (!localBackpackIds.has(id)) removeBackpackItem(id)
    }
    for (const item of localBackpack) {
      if (!originalBackpackIds.has(item.id)) addBackpackItem(item)
    }

    // Special items diff
    const originalSpecialIds = new Set((character!.specialItems ?? []).map(i => i.id))
    const localSpecialIds = new Set(localSpecialItems.map(i => i.id))
    for (const id of originalSpecialIds) {
      if (!localSpecialIds.has(id)) removeSpecialItem(id)
    }
    for (const item of localSpecialItems) {
      if (!originalSpecialIds.has(item.id)) addSpecialItem(item)
    }

    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-blue-900/40 border border-blue-800/60 flex items-center justify-center shrink-0">
            <Package size={18} className="text-blue-300" />
          </div>
          <div>
            <div className="text-lg font-serif font-semibold text-amber-100">
              {t('sheet.bookWizard.equipmentTitle')}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              {lang === 'fr'
                ? `Modifiez votre équipement pour le livre ${character.currentBook} si besoin.`
                : `Adjust your equipment for book ${character.currentBook} if needed.`}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 pt-4 flex flex-col gap-5">
          <EquipmentFields
            weapons={localWeapons}
            onWeaponsChange={setLocalWeapons}
            backpack={localBackpack}
            onBackpackChange={setLocalBackpack}
            meals={localMeals}
            onMealsChange={setLocalMeals}
            specialItems={localSpecialItems}
            onSpecialItemsChange={setLocalSpecialItems}
            maxBackpackSlots={maxBackpackSlots}
          />
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-sm transition-colors"
          >
            {t('sheet.bookWizard.equipmentSkip')}
          </button>
          <button
            onClick={handleDone}
            className="flex-1 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
          >
            {t('sheet.bookWizard.equipmentDone')}
          </button>
        </div>
      </div>
    </div>
  )
}
