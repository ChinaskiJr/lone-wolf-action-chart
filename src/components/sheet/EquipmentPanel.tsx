import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Sword, FlaskConical, Utensils } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import type { BackpackItem, SpecialItem, Weapon } from '@/types/game'
import type { Character } from '@/types/character'

// Hunting (Kai) / Huntmastery (Magnakai+) often remove the need to eat a meal.
function characterHasHunting(char: Character): boolean {
  switch (char.cycle) {
    case 'kai':
      return char.disciplines.includes('hunting')
    case 'magnakai':
      return char.disciplines.includes('huntmastery') || char.kaiDisciplines.includes('hunting')
    case 'grandmaster':
      return char.disciplines.includes('grandHuntmastery') || char.magnakaiDisciplines.includes('huntmastery')
    case 'neworder':
      return char.disciplines.includes('grandHuntmastery')
  }
}

export function EquipmentPanel() {
  const {
    character,
    addWeapon, removeWeapon, equipWeapon,
    addBackpackItem, removeBackpackItem,
    addSpecialItem, removeSpecialItem, updateSpecialItem,
    setMeals,
    eatMeal,
    usePotion,
  } = useCharacterStore()
  const { setCombatPotionBonus, setCombatModalOpen } = useUIStore()
  if (!character) return null

  const backpackMax = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10
  const hasHunting = characterHasHunting(character)

  function handleUseCombatPotion(id: string) {
    const item = character!.backpack.find(i => i.id === id)
    if (!item?.csBonus) return
    setCombatPotionBonus(item.csBonus)
    removeBackpackItem(id)
    setCombatModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <WeaponsSection weapons={character.weapons} onAdd={addWeapon} onRemove={removeWeapon} onEquip={equipWeapon} />
      <BackpackSection
        items={character.backpack}
        meals={character.meals}
        max={backpackMax}
        hasHunting={hasHunting}
        onAdd={addBackpackItem}
        onRemove={removeBackpackItem}
        onMealsChange={setMeals}
        onEat={eatMeal}
        onUsePotion={usePotion}
        onUseCombatPotion={handleUseCombatPotion}
      />
      <SpecialItemsSection items={character.specialItems} onAdd={addSpecialItem} onRemove={removeSpecialItem} onUpdate={updateSpecialItem} />
    </div>
  )
}

function WeaponsSection({
  weapons, onAdd, onRemove, onEquip
}: {
  weapons: Weapon[]
  onAdd: (w: Weapon) => void
  onRemove: (i: number) => void
  onEquip: (i: number) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [bonusInput, setBonusInput] = useState('')

  function add() {
    if (!input.trim() || weapons.length >= 2) return
    const parsed = parseInt(bonusInput, 10)
    onAdd({ name: input.trim(), bonus: !isNaN(parsed) && parsed !== 0 ? parsed : undefined })
    setInput('')
    setBonusInput('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Sword size={14} />
          {t('sheet.weapons')}
        </div>
        <span className="text-xs text-slate-500">{weapons.length}/2</span>
      </div>
      <div className="space-y-2 mb-2">
        {weapons.map((w, i) => {
          const isEquipped = w.equipped !== false
          return (
            <div key={i} className={`flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 transition-opacity ${isEquipped ? '' : 'opacity-50'}`}>
              <label className="flex items-center shrink-0 cursor-pointer" aria-label={isEquipped ? t('sheet.unequipItem') : t('sheet.equipItem')}>
                <input
                  type="checkbox"
                  checked={isEquipped}
                  onChange={() => onEquip(i)}
                  className="accent-amber-600 w-3.5 h-3.5"
                />
              </label>
              <div className="w-5 h-5 shrink-0 rounded bg-amber-800/40 flex items-center justify-center text-xs text-amber-500">⚔</div>
              <span className="flex-1 text-sm text-slate-200">{w.name}</span>
              {w.bonus != null && w.bonus !== 0 && (
                <span className={`text-xs font-semibold rounded px-1 ${isEquipped ? 'text-amber-400 bg-amber-900/40' : 'text-slate-500 bg-slate-700/40'}`}>
                  {w.bonus > 0 ? '+' : ''}{w.bonus} HC
                </span>
              )}
              <button onClick={() => onRemove(i)} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors before:absolute before:inset-[-10px]">
                <X size={14} />
              </button>
            </div>
          )
        })}
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
          <div className="flex flex-col justify-center bg-slate-800/60 border border-amber-900/30 rounded-lg px-2 py-1 w-14 shrink-0">
            <div className="text-xs font-semibold text-amber-400 mb-0.5">{t('sheet.hcBonusItem')}</div>
            <input
              type="number"
              value={bonusInput}
              onChange={e => setBonusInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="0"
              className="w-full bg-transparent text-sm text-slate-200 focus:outline-none tabular-nums"
            />
          </div>
          <button onClick={add} aria-label={t('sheet.addWeapon')} className="relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]">
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function BackpackSection({
  items, meals, max, hasHunting, onAdd, onRemove, onMealsChange, onEat, onUsePotion, onUseCombatPotion
}: {
  items: BackpackItem[]
  meals: number
  max: number
  hasHunting: boolean
  onAdd: (item: BackpackItem) => void
  onRemove: (id: string) => void
  onMealsChange: (n: number) => void
  onEat: () => void
  onUsePotion: (id: string) => void
  onUseCombatPotion: (id: string) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [description, setDescription] = useState('')
  const [twoSlots, setTwoSlots] = useState(false)
  const [addingPotion, setAddingPotion] = useState(false)
  const [potionName, setPotionName] = useState('')
  const [potionEP, setPotionEP] = useState(5)
  const [addingCombatPotion, setAddingCombatPotion] = useState(false)
  const [combatPotionName, setCombatPotionName] = useState('')
  const [combatPotionCS, setCombatPotionCS] = useState(2)
  const [combatPotionConfirm, setCombatPotionConfirm] = useState<string | null>(null)

  const slotsUsed = items.reduce((sum, i) => sum + (i.slots ?? 1), 0) + meals
  const isFull = slotsUsed >= max

  function addItem() {
    if (!input.trim()) return
    const itemSlots = twoSlots ? 2 : 1
    if (slotsUsed + itemSlots > max) return
    onAdd({
      id: uuidv4(),
      name: input.trim(),
      notes: description.trim() || undefined,
      slots: twoSlots ? 2 : undefined,
    })
    setInput('')
    setDescription('')
    setTwoSlots(false)
  }

  function addMeal() {
    if (isFull) return
    onMealsChange(meals + 1)
  }

  function removeMeal() {
    if (meals <= 0) return
    onMealsChange(meals - 1)
  }

  function confirmAddPotion() {
    if (isFull) return
    onAdd({ id: uuidv4(), name: potionName.trim() || t('sheet.potion'), epRestore: potionEP })
    setPotionName('')
    setPotionEP(5)
    setAddingPotion(false)
  }

  function confirmAddCombatPotion() {
    if (isFull) return
    onAdd({ id: uuidv4(), name: combatPotionName.trim() || t('sheet.combatPotion'), csBonus: combatPotionCS })
    setCombatPotionName('')
    setCombatPotionCS(2)
    setAddingCombatPotion(false)
  }

  // Build renderable slot rows with proper slot numbering
  type SlotRow =
    | { type: 'meal'; index: number; startSlot: number }
    | { type: 'potion'; item: BackpackItem; startSlot: number; endSlot: number }
    | { type: 'combatPotion'; item: BackpackItem; startSlot: number; endSlot: number }
    | { type: 'item'; item: BackpackItem; startSlot: number; endSlot: number }
    | { type: 'empty'; startSlot: number }

  const slotRows: SlotRow[] = []
  let slotNum = 1
  for (let i = 0; i < meals; i++) {
    slotRows.push({ type: 'meal', index: i, startSlot: slotNum })
    slotNum++
  }
  for (const item of items) {
    const s = item.slots ?? 1
    const type = item.csBonus ? 'combatPotion' as const : item.epRestore ? 'potion' as const : 'item' as const
    slotRows.push({ type, item, startSlot: slotNum, endSlot: slotNum + s - 1 })
    slotNum += s
  }
  while (slotNum <= max) {
    slotRows.push({ type: 'empty', startSlot: slotNum })
    slotNum++
  }

  function slotLabel(start: number, end?: number) {
    return end != null && end !== start ? `${start}-${end}` : `${start}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-sm font-semibold text-slate-200">{t('sheet.backpack')}</div>
        <span className={`text-xs ${isFull ? 'text-red-400' : 'text-slate-500'}`}>
          {t('sheet.slotsUsed', { used: slotsUsed, max })}
        </span>
      </div>

      {/* Eat a meal */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onEat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-900/50 text-amber-300 hover:bg-amber-950/30 text-xs font-medium transition-colors shrink-0"
        >
          <Utensils size={12} />
          {t('sheet.eatMeal')}
        </button>
        <span className="text-xs text-slate-500 truncate">
          {meals === 0
            ? t('sheet.noFoodPenalty')
            : hasHunting
              ? t('sheet.huntingHint')
              : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
        {slotRows.map((slot, i) => {
          if (slot.type === 'meal') return (
            <div key={`meal-${slot.index}`} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-amber-900/40 bg-amber-950/20">
              <span className="text-xs text-slate-600 w-6 shrink-0">{slot.startSlot}</span>
              <span className="shrink-0">🍖</span>
              <span className="flex-1 text-sm text-amber-200/80">{t('sheet.meals')}</span>
              <button onClick={removeMeal} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                <X size={12} />
              </button>
            </div>
          )
          if (slot.type === 'potion') return (
            <div key={slot.item.id} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-blue-900/50 bg-blue-950/20">
              <span className="text-xs text-slate-600 w-6 shrink-0">{slotLabel(slot.startSlot, slot.endSlot)}</span>
              <span className="shrink-0">🧪</span>
              <span className="flex-1 text-sm text-blue-200 truncate">{slot.item.name}</span>
              <span className="text-xs text-green-400 font-medium shrink-0">+{slot.item.epRestore} PE</span>
              <button
                onClick={() => onUsePotion(slot.item.id)}
                aria-label={t('sheet.usePotion')}
                title={t('sheet.usePotion')}
                className="relative text-blue-400 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
              >
                <FlaskConical size={13} />
              </button>
              <button
                onClick={() => onRemove(slot.item.id)}
                aria-label={t('sheet.removeItem')}
                className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
              >
                <X size={12} />
              </button>
            </div>
          )
          if (slot.type === 'combatPotion') return (
            <div key={slot.item.id} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-orange-900/50 bg-orange-950/20">
              <span className="text-xs text-slate-600 w-6 shrink-0">{slotLabel(slot.startSlot, slot.endSlot)}</span>
              <span className="shrink-0">⚗️</span>
              <span className="flex-1 text-sm text-orange-200 truncate">{slot.item.name}</span>
              <span className="text-xs text-orange-400 font-medium shrink-0">+{slot.item.csBonus} HC</span>
              <button
                onClick={() => setCombatPotionConfirm(slot.item.id)}
                aria-label={t('sheet.useCombatPotion')}
                title={t('sheet.useCombatPotion')}
                className="relative text-orange-400 hover:text-amber-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
              >
                <FlaskConical size={13} />
              </button>
              <button
                onClick={() => onRemove(slot.item.id)}
                aria-label={t('sheet.removeItem')}
                className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
              >
                <X size={12} />
              </button>
            </div>
          )
          if (slot.type === 'item') return (
            <div key={slot.item.id} className="flex items-start gap-2 rounded-lg px-3 py-2 border border-slate-700 bg-slate-800/60">
              <span className="text-xs text-slate-600 w-6 shrink-0 mt-0.5">{slotLabel(slot.startSlot, slot.endSlot)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-200 truncate">{slot.item.name}</span>
                  {(slot.item.slots ?? 1) > 1 && (
                    <span className="text-xs text-slate-500 bg-slate-700 rounded px-1 shrink-0">×{slot.item.slots}</span>
                  )}
                </div>
                {slot.item.notes && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{slot.item.notes}</div>
                )}
              </div>
              <button onClick={() => onRemove(slot.item.id)} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]">
                <X size={12} />
              </button>
            </div>
          )
          return (
            <div key={`empty-${i}`} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-slate-800/60 bg-slate-900/30">
              <span className="text-xs text-slate-600 w-6 shrink-0">{slot.startSlot}</span>
              <span className="text-sm text-slate-700 italic">—</span>
            </div>
          )
        })}
      </div>

      {/* Potion add form (inline) */}
      {addingPotion && !isFull && (
        <div className="flex gap-2 mb-2 p-2.5 rounded-lg border border-blue-900/40 bg-blue-950/10">
          <span className="text-lg shrink-0">🧪</span>
          <input
            value={potionName}
            onChange={e => setPotionName(e.target.value)}
            placeholder={t('sheet.potion')}
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-green-400">+</span>
            <input
              type="number"
              value={potionEP}
              onChange={e => setPotionEP(Math.max(1, Number(e.target.value)))}
              onFocus={e => e.target.select()}
              min={1}
              className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-green-400 font-bold text-center focus:outline-none focus:border-blue-600"
            />
            <span className="text-xs text-slate-500">PE</span>
          </div>
          <button onClick={confirmAddPotion} className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium transition-colors shrink-0">
            OK
          </button>
          <button onClick={() => setAddingPotion(false)} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Combat potion add form (inline) */}
      {addingCombatPotion && !isFull && (
        <div className="flex gap-2 mb-2 p-2.5 rounded-lg border border-orange-900/40 bg-orange-950/10">
          <span className="text-lg shrink-0">⚗️</span>
          <input
            value={combatPotionName}
            onChange={e => setCombatPotionName(e.target.value)}
            placeholder={t('sheet.combatPotion')}
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-orange-600"
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-orange-400">+</span>
            <input
              type="number"
              value={combatPotionCS}
              onChange={e => setCombatPotionCS(Math.max(1, Number(e.target.value)))}
              onFocus={e => e.target.select()}
              min={1}
              className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-orange-400 font-bold text-center focus:outline-none focus:border-orange-600"
            />
            <span className="text-xs text-slate-500">HC</span>
          </div>
          <button onClick={confirmAddCombatPotion} className="px-2 py-1 rounded bg-orange-700 hover:bg-orange-600 text-white text-xs font-medium transition-colors shrink-0">
            OK
          </button>
          <button onClick={() => setAddingCombatPotion(false)} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Add controls */}
      {!isFull && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              onClick={addMeal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-900/50 text-amber-600 hover:bg-amber-950/30 hover:text-amber-400 text-xs font-medium transition-colors shrink-0"
            >
              <Plus size={12} />
              {t('sheet.meals')}
            </button>
            <button
              onClick={() => setAddingPotion(v => !v)}
              aria-label={t('sheet.potion')}
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
              onClick={() => setAddingCombatPotion(v => !v)}
              aria-label={t('sheet.combatPotion')}
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
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder={t('sheet.addItem')}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
            <button onClick={addItem} aria-label={t('sheet.addItem')} className="relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder={t('sheet.itemDescription')}
              className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer shrink-0 select-none">
              <input
                type="checkbox"
                checked={twoSlots}
                onChange={e => setTwoSlots(e.target.checked)}
                className="accent-amber-600 w-3.5 h-3.5"
              />
              {t('sheet.twoSlots')}
            </label>
          </div>
        </div>
      )}

      {/* Combat potion confirmation modal */}
      {combatPotionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-900 border border-orange-900/60 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-orange-300">
              <FlaskConical size={18} />
              <span className="font-semibold text-sm">{t('sheet.combatPotion')}</span>
            </div>
            <p className="text-sm text-slate-300 mb-5">{t('sheet.combatPotionConfirm')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCombatPotionConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  onUseCombatPotion(combatPotionConfirm)
                  setCombatPotionConfirm(null)
                }}
                className="px-4 py-2 rounded-lg bg-orange-700 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SpecialItemsSection({
  items, onAdd, onRemove, onUpdate
}: {
  items: SpecialItem[]
  onAdd: (item: SpecialItem) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<SpecialItem>) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [effect, setEffect] = useState('')
  const [hcBonus, setHcBonus] = useState('')
  const [peBonus, setPeBonus] = useState('')

  function add() {
    if (!input.trim() || items.length >= 12) return
    const hc = parseInt(hcBonus) || undefined
    const pe = parseInt(peBonus) || undefined
    onAdd({ id: uuidv4(), name: input.trim(), effect: effect.trim() || undefined, hcBonus: hc, peBonus: pe })
    setInput('')
    setEffect('')
    setHcBonus('')
    setPeBonus('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-sm font-semibold text-slate-200">{t('sheet.specialItems')}</div>
        <span className={`text-xs ${items.length >= 12 ? 'text-red-400' : 'text-slate-500'}`}>
          {items.length}/12
        </span>
      </div>
      <div className="space-y-1.5 mb-2">
        {items.map(item => {
          const isEquipped = item.equipped !== false
          return (
            <div key={item.id} className={`flex gap-2 bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2 transition-opacity ${isEquipped ? '' : 'opacity-50'}`}>
              <label className="flex items-center shrink-0 mt-0.5 cursor-pointer" aria-label={isEquipped ? t('sheet.unequipItem') : t('sheet.equipItem')}>
                <input
                  type="checkbox"
                  checked={isEquipped}
                  onChange={() => onUpdate(item.id, { equipped: !isEquipped })}
                  className="accent-amber-600 w-3.5 h-3.5"
                />
              </label>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm text-amber-100 font-medium">{item.name}</span>
                  {item.hcBonus != null && item.hcBonus !== 0 && (
                    <span className={`text-xs font-semibold rounded px-1 ${isEquipped ? 'text-amber-400 bg-amber-900/40' : 'text-slate-500 bg-slate-700/40'}`}>
                      {item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC
                    </span>
                  )}
                  {item.peBonus != null && item.peBonus !== 0 && (
                    <span className={`text-xs font-semibold rounded px-1 ${isEquipped ? 'text-green-400 bg-green-900/40' : 'text-slate-500 bg-slate-700/40'}`}>
                      {item.peBonus > 0 ? '+' : ''}{item.peBonus} PE
                    </span>
                  )}
                </div>
                {item.effect && <div className="text-xs text-slate-400 mt-0.5">{item.effect}</div>}
              </div>
              <button onClick={() => onRemove(item.id)} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]">
                <X size={13} />
              </button>
            </div>
          )
        })}
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
              placeholder={t('common.effect') + ' (optionnel)'}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-800/60 border border-amber-900/30 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-amber-400 mb-1">{t('sheet.hcBonusItem')}</div>
              <input
                type="number"
                value={hcBonus}
                onChange={e => setHcBonus(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums"
              />
            </div>
            <div className="flex-1 bg-slate-800/60 border border-green-900/30 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-green-400 mb-1">{t('sheet.peBonusItem')}</div>
              <input
                type="number"
                value={peBonus}
                onChange={e => setPeBonus(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && add()}
                placeholder="0"
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums"
              />
            </div>
            <button onClick={add} aria-label={t('sheet.addSpecialItem')} className="self-end relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]">
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
