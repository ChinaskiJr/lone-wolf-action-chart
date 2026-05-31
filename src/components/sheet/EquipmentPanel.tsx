import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Sword } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '@/store/characterStore'
import type { BackpackItem, SpecialItem, Weapon } from '@/types/game'

export function EquipmentPanel() {
  const {
    character,
    addWeapon, removeWeapon,
    addBackpackItem, removeBackpackItem,
    addSpecialItem, removeSpecialItem,
    setMeals,
  } = useCharacterStore()
  if (!character) return null

  const backpackMax = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10

  return (
    <div className="flex flex-col gap-6">
      <WeaponsSection weapons={character.weapons} onAdd={addWeapon} onRemove={removeWeapon} />
      <BackpackSection
        items={character.backpack}
        meals={character.meals}
        max={backpackMax}
        onAdd={addBackpackItem}
        onRemove={removeBackpackItem}
        onMealsChange={setMeals}
      />
      <SpecialItemsSection items={character.specialItems} onAdd={addSpecialItem} onRemove={removeSpecialItem} />
    </div>
  )
}

function WeaponsSection({
  weapons, onAdd, onRemove
}: {
  weapons: Weapon[]
  onAdd: (w: Weapon) => void
  onRemove: (i: number) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  function add() {
    if (!input.trim() || weapons.length >= 2) return
    onAdd({ name: input.trim() })
    setInput('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wide">
          <Sword size={14} />
          {t('sheet.weapons')}
        </div>
        <span className="text-xs text-slate-500">{weapons.length}/2</span>
      </div>
      <div className="space-y-2 mb-2">
        {weapons.map((w, i) => (
          <div key={i} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5">
            <div className="w-5 h-5 shrink-0 rounded bg-amber-800/40 flex items-center justify-center text-xs text-amber-500">⚔</div>
            <span className="flex-1 text-sm text-slate-200">{w.name}</span>
            {w.bonus && <span className="text-xs text-blue-400">{w.bonus > 0 ? '+' : ''}{w.bonus} HC</span>}
            <button onClick={() => onRemove(i)} className="text-slate-600 hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
        {weapons.length === 0 && (
          <div className="text-sm text-slate-600 italic px-3 py-2">Aucune arme</div>
        )}
      </div>
      {weapons.length < 2 && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder={t('sheet.addWeapon')}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
          />
          <button onClick={add} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function BackpackSection({
  items, meals, max, onAdd, onRemove, onMealsChange
}: {
  items: BackpackItem[]
  meals: number
  max: number
  onAdd: (item: BackpackItem) => void
  onRemove: (id: string) => void
  onMealsChange: (n: number) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const slotsUsed = items.length + meals
  const isFull = slotsUsed >= max

  function addItem() {
    if (!input.trim() || isFull) return
    onAdd({ id: uuidv4(), name: input.trim() })
    setInput('')
  }

  function addMeal() {
    if (isFull) return
    onMealsChange(meals + 1)
  }

  function removeMeal() {
    if (meals <= 0) return
    onMealsChange(meals - 1)
  }

  // Build the slot grid: ration slots first, then regular items, then empty slots
  const rationSlots = Array.from({ length: meals }, (_, i) => ({ type: 'meal' as const, index: i }))
  const itemSlots = items.map(item => ({ type: 'item' as const, item }))
  const emptyCount = max - slotsUsed
  const emptySlots = Array.from({ length: Math.max(0, emptyCount) }, (_, i) => ({ type: 'empty' as const, index: i }))
  const allSlots = [...rationSlots, ...itemSlots, ...emptySlots]

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{t('sheet.backpack')}</div>
        <span className={`text-xs ${isFull ? 'text-red-400' : 'text-slate-500'}`}>
          {t('sheet.slotsUsed', { used: slotsUsed, max })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
        {allSlots.map((slot, i) => {
          const slotNum = i + 1
          if (slot.type === 'meal') return (
            <div key={`meal-${slot.index}`} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-amber-900/40 bg-amber-950/20">
              <span className="text-xs text-slate-600 w-4 shrink-0">{slotNum}</span>
              <span className="text-xs text-amber-600 shrink-0">🍖</span>
              <span className="flex-1 text-sm text-amber-200/80">{t('sheet.meals')}</span>
              <button onClick={removeMeal} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                <X size={12} />
              </button>
            </div>
          )
          if (slot.type === 'item') return (
            <div key={slot.item.id} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-slate-700 bg-slate-800/60">
              <span className="text-xs text-slate-600 w-4 shrink-0">{slotNum}</span>
              <span className="flex-1 text-sm text-slate-200 truncate">{slot.item.name}</span>
              <button onClick={() => onRemove(slot.item.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                <X size={12} />
              </button>
            </div>
          )
          return (
            <div key={`empty-${slot.index}`} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-slate-800/60 bg-slate-900/30">
              <span className="text-xs text-slate-600 w-4 shrink-0">{slotNum}</span>
              <span className="text-sm text-slate-700 italic">—</span>
            </div>
          )
        })}
      </div>

      {/* Add controls */}
      {!isFull && (
        <div className="flex gap-2">
          <button
            onClick={addMeal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-900/50 text-amber-600 hover:bg-amber-950/30 hover:text-amber-400 text-xs font-medium transition-colors shrink-0"
          >
            <Plus size={12} />
            {t('sheet.meals')}
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder={t('sheet.addItem')}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
          />
          <button onClick={addItem} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function SpecialItemsSection({
  items, onAdd, onRemove
}: {
  items: SpecialItem[]
  onAdd: (item: SpecialItem) => void
  onRemove: (id: string) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [effect, setEffect] = useState('')

  function add() {
    if (!input.trim() || items.length >= 12) return
    onAdd({ id: uuidv4(), name: input.trim(), effect: effect.trim() || undefined })
    setInput('')
    setEffect('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{t('sheet.specialItems')}</div>
        <span className={`text-xs ${items.length >= 12 ? 'text-red-400' : 'text-slate-500'}`}>
          {items.length}/12
        </span>
      </div>
      <div className="space-y-1.5 mb-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-2 bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2">
            <span className="text-amber-500 text-xs mt-0.5 shrink-0">★</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-amber-100 font-medium">{item.name}</div>
              {item.effect && <div className="text-xs text-slate-400 mt-0.5">{item.effect}</div>}
            </div>
            <button onClick={() => onRemove(item.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5">
              <X size={13} />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-600 italic px-3 py-2">Aucun objet spécial</div>}
      </div>
      {items.length < 12 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('sheet.addSpecialItem')}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={effect}
              onChange={e => setEffect(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder={t('common.effect') + ' (optionnel)'}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
            <button onClick={add} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
