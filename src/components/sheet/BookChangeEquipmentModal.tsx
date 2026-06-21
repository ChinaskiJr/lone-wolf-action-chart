import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { BookEquipmentStep, type BookEquipmentSnapshot } from '@/components/BookEquipmentStep'

interface Props {
  onDone: () => void
  onSkip: () => void
}

export function BookChangeEquipmentModal({ onDone, onSkip }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const {
    character,
    addWeapon,
    removeWeapon,
    addBackpackItem,
    removeBackpackItem,
    addSpecialItem,
    removeSpecialItem,
    setMeals,
    setGold,
    toggleQuiver,
    setArrows,
    toggleHerbPouch,
    addHerbItem,
    removeHerbItem,
  } = useCharacterStore()

  if (!character) return null

  const initial: BookEquipmentSnapshot = {
    weapons: character.weapons,
    backpack: character.backpack,
    meals: character.meals,
    goldCrowns: character.goldCrowns,
    specialItems: character.specialItems,
    hasQuiver: character.hasQuiver ?? false,
    arrows: character.arrows ?? 0,
    hasHerbPouch: character.hasHerbPouch ?? false,
    herbPouch: character.herbPouch ?? [],
  }

  const maxBackpackSlots = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10

  function handleConfirm(result: BookEquipmentSnapshot) {
    for (let i = 0; i < character!.weapons.length; i++) removeWeapon(0)
    for (const w of result.weapons) addWeapon(w)

    setMeals(result.meals)
    setGold(result.goldCrowns)

    const originalIds = new Set((character!.backpack ?? []).map((i) => i.id))
    const resultIds = new Set(result.backpack.map((i) => i.id))
    for (const id of originalIds) if (!resultIds.has(id)) removeBackpackItem(id)
    for (const item of result.backpack) if (!originalIds.has(item.id)) addBackpackItem(item)

    for (const item of character!.specialItems ?? []) removeSpecialItem(item.id)
    for (const item of result.specialItems) addSpecialItem(item)

    if (result.hasQuiver !== (character!.hasQuiver ?? false)) toggleQuiver()
    setArrows(result.arrows)

    if (result.hasHerbPouch !== (character!.hasHerbPouch ?? false)) toggleHerbPouch()
    if (result.hasHerbPouch) {
      for (const item of character!.herbPouch ?? []) removeHerbItem(item.id)
      for (const item of result.herbPouch) addHerbItem(item)
    }

    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 pb-4 flex items-start gap-4 border-b border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-900/40 border border-blue-800/60 flex items-center justify-center shrink-0">
            <Package size={18} className="text-blue-300" />
          </div>
          <div>
            <div className="text-lg font-serif font-semibold text-amber-100">
              {t('sheet.bookWizard.equipmentTitle')}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              {lang === 'fr' ? `Livre ${character.currentBook}` : `Book ${character.currentBook}`}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 pt-4">
          <BookEquipmentStep
            initial={initial}
            maxBackpackSlots={maxBackpackSlots}
            cycle={character.cycle}
            onConfirm={handleConfirm}
            onSkip={onSkip}
            confirmLabel={t('sheet.bookWizard.equipmentDone')}
          />
        </div>
      </div>
    </div>
  )
}
