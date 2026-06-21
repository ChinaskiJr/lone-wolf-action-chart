import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { BackpackItem } from '@/types/game'
import { PotionAddForm } from '@/components/backpack/PotionAddForm'

interface Props {
  backpack: BackpackItem[]
  onBackpackChange: (items: BackpackItem[]) => void
  meals: number
  onMealsChange: (count: number) => void
  maxBackpackSlots: number
  gold?: number
  onGoldChange?: (amount: number) => void
}

/**
 * Backpack + meals (+ optional gold) editor. Simpler than the sheet's BackpackSection:
 * no slot numbering, no eat/use actions, no inline edit. Shared by the creation wizard
 * (StepEquipment) and the cycle transition (BookEquipmentStep). Weapons and special items
 * are handled by WeaponsEditor / SpecialItemsEditor.
 */
export function EquipmentFields({
  backpack,
  onBackpackChange,
  meals,
  onMealsChange,
  maxBackpackSlots,
  gold,
  onGoldChange,
}: Props) {
  const { t } = useTranslation()

  const [newItem, setNewItem] = useState('')
  const [newItemNotes, setNewItemNotes] = useState('')
  const [newItemTwoSlots, setNewItemTwoSlots] = useState(false)
  const [addingPotion, setAddingPotion] = useState(false)
  const [addingCombatPotion, setAddingCombatPotion] = useState(false)

  const usedSlots = backpack.reduce((s, i) => s + (i.slots ?? 1), 0) + meals
  const isFull = usedSlots >= maxBackpackSlots

  function addBackpackItem() {
    const itemSlots = newItemTwoSlots ? 2 : 1
    if (!newItem.trim() || usedSlots + itemSlots > maxBackpackSlots) return
    onBackpackChange([
      ...backpack,
      {
        id: uuidv4(),
        name: newItem.trim(),
        notes: newItemNotes.trim() || undefined,
        slots: newItemTwoSlots ? 2 : undefined,
      },
    ])
    setNewItem('')
    setNewItemNotes('')
    setNewItemTwoSlots(false)
  }

  return (
    <>
      {/* Backpack */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-200">{t('sheet.backpack')}</span>
          <span className={`text-xs ${isFull ? 'text-red-400' : 'text-slate-500'}`}>
            {usedSlots}/{maxBackpackSlots}
          </span>
        </div>
        <div className="space-y-1.5 mb-2">
          {Array.from({ length: meals }).map((_, i) => (
            <div
              key={`meal-${i}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 border border-amber-900/40 bg-amber-950/20"
            >
              <span className="shrink-0">🍖</span>
              <span className="flex-1 text-sm text-amber-200/80">{t('sheet.meals')}</span>
              <button
                onClick={() => onMealsChange(meals - 1)}
                className="relative text-slate-600 hover:text-red-400 transition-colors before:absolute before:inset-[-10px]"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {backpack.map((item) => {
            if (item.epRestore)
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 border border-blue-900/50 bg-blue-950/20"
                >
                  <span className="shrink-0">🧪</span>
                  <span className="flex-1 text-sm text-blue-200 truncate">{item.name}</span>
                  <span className="text-xs text-green-400 font-medium shrink-0">
                    +{item.epRestore} PE
                  </span>
                  <button
                    onClick={() => onBackpackChange(backpack.filter((i) => i.id !== item.id))}
                    aria-label={t('sheet.removeItem')}
                    className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            if (item.csBonus)
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 border border-violet-900/50 bg-violet-950/20"
                >
                  <span className="shrink-0">⚗️</span>
                  <span className="flex-1 text-sm text-violet-200 truncate">{item.name}</span>
                  <span className="text-xs text-violet-400 font-medium shrink-0">
                    +{item.csBonus} HC
                  </span>
                  <button
                    onClick={() => onBackpackChange(backpack.filter((i) => i.id !== item.id))}
                    aria-label={t('sheet.removeItem')}
                    className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            return (
              <div
                key={item.id}
                className="flex items-start gap-2 rounded-lg px-3 py-2 border border-slate-700 bg-slate-800/60"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-200 truncate">{item.name}</span>
                    {(item.slots ?? 1) > 1 && (
                      <span className="text-xs text-slate-500 bg-slate-700 rounded px-1 shrink-0">
                        ×{item.slots}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{item.notes}</div>
                  )}
                </div>
                <button
                  onClick={() => onBackpackChange(backpack.filter((i) => i.id !== item.id))}
                  aria-label={t('sheet.removeItem')}
                  className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]"
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Potion inline forms */}
        {addingPotion && !isFull && (
          <PotionAddForm
            variant="potion"
            onConfirm={({ name, value }) => {
              onBackpackChange([...backpack, { id: uuidv4(), name, epRestore: value }])
              setAddingPotion(false)
            }}
            onCancel={() => setAddingPotion(false)}
          />
        )}
        {addingCombatPotion && !isFull && (
          <PotionAddForm
            variant="combat"
            onConfirm={({ name, value }) => {
              onBackpackChange([...backpack, { id: uuidv4(), name, csBonus: value }])
              setAddingCombatPotion(false)
            }}
            onCancel={() => setAddingCombatPotion(false)}
          />
        )}

        {/* Add controls */}
        {!isFull && (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <button
                onClick={() => onMealsChange(meals + 1)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-900/50 text-amber-600 hover:bg-amber-950/30 hover:text-amber-400 text-xs font-medium transition-colors shrink-0"
              >
                <Plus size={12} />
                {t('sheet.meals')}
              </button>
              <button
                onClick={() => setAddingPotion((v) => !v)}
                aria-pressed={addingPotion}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors shrink-0 ${
                  addingPotion
                    ? 'border-blue-700 bg-blue-900/30 text-blue-300'
                    : 'border-blue-900/50 text-blue-500 hover:bg-blue-950/30 hover:text-blue-400'
                }`}
              >
                <Plus size={12} />
                🧪
              </button>
              <button
                onClick={() => setAddingCombatPotion((v) => !v)}
                aria-pressed={addingCombatPotion}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors shrink-0 ${
                  addingCombatPotion
                    ? 'border-orange-700 bg-orange-900/30 text-orange-300'
                    : 'border-orange-900/50 text-orange-500 hover:bg-orange-950/30 hover:text-orange-400'
                }`}
              >
                <Plus size={12} />
                ⚗️
              </button>
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBackpackItem()}
                placeholder={t('sheet.addItem')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
              />
              <button
                onClick={addBackpackItem}
                aria-label={t('sheet.addItem')}
                className="relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <input
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBackpackItem()}
                placeholder={t('sheet.itemDescription')}
                className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer shrink-0 select-none">
                <input
                  type="checkbox"
                  checked={newItemTwoSlots}
                  onChange={(e) => setNewItemTwoSlots(e.target.checked)}
                  className="accent-amber-600 w-3.5 h-3.5"
                />
                {t('sheet.twoSlots')}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Gold */}
      {gold !== undefined && onGoldChange && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-semibold text-slate-200">{t('sheet.goldCrowns')}</span>
            <span className="text-xs text-slate-500">{gold} / 50</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/60 border border-amber-900/30 rounded-lg px-4 py-3">
            <button
              onClick={() => onGoldChange(Math.max(0, gold - 1))}
              disabled={gold <= 0}
              className="w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-300 flex items-center justify-center text-lg leading-none transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={50}
              value={gold}
              onChange={(e) => onGoldChange(Math.max(0, Math.min(50, Number(e.target.value))))}
              onFocus={(e) => e.target.select()}
              className="flex-1 bg-transparent text-center text-2xl font-bold text-amber-400 tabular-nums focus:outline-none"
            />
            <button
              onClick={() => onGoldChange(Math.min(50, gold + 1))}
              disabled={gold >= 50}
              className="w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-300 flex items-center justify-center text-lg leading-none transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}
    </>
  )
}
