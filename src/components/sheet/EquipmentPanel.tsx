import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Sword, FlaskConical, Utensils, Lock, PackageOpen, Wallet, Pencil, Check } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import type { BackpackItem, ConfiscatedEquipment, SpecialItem, Weapon } from '@/types/game'
import type { Character } from '@/types/character'
import { ConfiscationRecoverModal } from './ConfiscationRecoverModal'
import { ConfiscationSelectModal } from './ConfiscationSelectModal'

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
    addWeapon, removeWeapon, equipWeapon, updateWeapon,
    toggleQuiver, setArrows,
    addBackpackItem, removeBackpackItem, updateBackpackItem,
    addSpecialItem, removeSpecialItem, updateSpecialItem,
    toggleHerbPouch, addHerbItem, removeHerbItem, updateHerbItem, useHerbPotion,
    setMeals,
    eatMeal,
    usePotion,
    confiscateSelected, recoverEquipment,
  } = useCharacterStore()
  const { setCombatPotionBonus, setCombatModalOpen } = useUIStore()
  const [confiscating, setConfiscating] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [herbPouchOpen, setHerbPouchOpen] = useState(false)
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

  function handleRecover(selection: ConfiscatedEquipment) {
    recoverEquipment(selection)
    setRecovering(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <ConfiscationBar
        confiscated={character.confiscated}
        onConfiscate={() => setConfiscating(true)}
        onRecover={() => setRecovering(true)}
      />
      <WeaponsSection
        weapons={character.weapons}
        hasQuiver={character.hasQuiver ?? false}
        arrows={character.arrows ?? 0}
        showQuiver={character.cycle !== 'kai'}
        onAdd={addWeapon}
        onRemove={removeWeapon}
        onEquip={equipWeapon}
        onUpdate={updateWeapon}
        onToggleQuiver={toggleQuiver}
        onSetArrows={setArrows}
      />
      <BackpackSection
        items={character.backpack}
        meals={character.meals}
        max={backpackMax}
        hasHunting={hasHunting}
        onAdd={addBackpackItem}
        onRemove={removeBackpackItem}
        onUpdate={updateBackpackItem}
        onMealsChange={setMeals}
        onEat={eatMeal}
        onUsePotion={usePotion}
        onUseCombatPotion={handleUseCombatPotion}
      />
      <SpecialItemsSection
        items={character.specialItems}
        onAdd={addSpecialItem}
        onRemove={removeSpecialItem}
        onUpdate={updateSpecialItem}
        hasHerbPouch={character.hasHerbPouch ?? false}
        herbPouch={character.herbPouch ?? []}
        showHerbPouch={character.cycle !== 'kai'}
        onToggleHerbPouch={toggleHerbPouch}
        onOpenHerbPouch={() => setHerbPouchOpen(true)}
      />

      {herbPouchOpen && (
        <HerbPouchModal
          herbPouch={character.herbPouch ?? []}
          onClose={() => setHerbPouchOpen(false)}
          onAdd={addHerbItem}
          onRemove={removeHerbItem}
          onUpdate={updateHerbItem}
          onUsePotion={useHerbPotion}
          onUseCombatPotion={(id) => {
            const item = character.herbPouch?.find(i => i.id === id)
            if (!item?.csBonus) return
            setCombatPotionBonus(item.csBonus)
            removeHerbItem(id)
            setCombatModalOpen(true)
            setHerbPouchOpen(false)
          }}
        />
      )}

      {confiscating && !character.confiscated && (
        <ConfiscationSelectModal
          character={character}
          onConfirm={(selection) => {
            confiscateSelected(selection)
            setConfiscating(false)
          }}
          onCancel={() => setConfiscating(false)}
        />
      )}

      {recovering && character.confiscated && (
        <ConfiscationRecoverModal
          confiscated={character.confiscated}
          current={character}
          onConfirm={handleRecover}
          onCancel={() => setRecovering(false)}
        />
      )}
    </div>
  )
}

function ConfiscationBar({
  confiscated, onConfiscate, onRecover,
}: {
  confiscated: ConfiscatedEquipment | undefined
  onConfiscate: () => void
  onRecover: () => void
}) {
  const { t } = useTranslation()

  if (confiscated) {
    const count =
      confiscated.weapons.length +
      confiscated.backpack.length +
      confiscated.specialItems.length +
      confiscated.meals +
      (confiscated.goldCrowns > 0 ? 1 : 0)
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2.5">
        <Lock size={15} className="text-red-400 shrink-0" />
        <span className="flex-1 text-sm text-red-200/90">
          {t('sheet.confiscation.banner', { count })}
        </span>
        <button
          onClick={onRecover}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-medium transition-colors shrink-0"
        >
          <PackageOpen size={13} />
          {t('sheet.confiscation.recover')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex justify-end">
      <button
        onClick={onConfiscate}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-900/50 text-amber-600 hover:bg-amber-950/30 hover:text-amber-400 text-xs font-medium transition-colors"
      >
        <Lock size={13} />
        {t('sheet.confiscation.button')}
      </button>
    </div>
  )
}

function WeaponsSection({
  weapons, hasQuiver, arrows, showQuiver, onAdd, onRemove, onEquip, onUpdate, onToggleQuiver, onSetArrows,
}: {
  weapons: Weapon[]
  hasQuiver: boolean
  arrows: number
  showQuiver: boolean
  onAdd: (w: Weapon) => void
  onRemove: (i: number) => void
  onEquip: (i: number) => void
  onUpdate: (index: number, weapon: Weapon) => void
  onToggleQuiver: () => void
  onSetArrows: (count: number) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [bonusInput, setBonusInput] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editBonus, setEditBonus] = useState('')
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null)

  function add() {
    if (!input.trim() || weapons.length >= 2) return
    const parsed = parseInt(bonusInput, 10)
    onAdd({ name: input.trim(), bonus: !isNaN(parsed) && parsed !== 0 ? parsed : undefined })
    setInput('')
    setBonusInput('')
  }

  function startEdit(i: number, w: Weapon) {
    setEditingIndex(i)
    setEditName(w.name)
    setEditBonus(w.bonus != null ? String(w.bonus) : '')
  }

  function confirmEdit(i: number, w: Weapon) {
    const name = editName.trim() || w.name
    const parsed = parseInt(editBonus, 10)
    onUpdate(i, { ...w, name, bonus: !isNaN(parsed) && parsed !== 0 ? parsed : undefined })
    setEditingIndex(null)
  }

  function cancelEdit() {
    setEditingIndex(null)
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
          if (editingIndex === i) return (
            <div key={i} className="flex items-center gap-2 bg-slate-800/60 border border-amber-700/50 rounded-lg px-3 py-2">
              <div className="w-5 h-5 shrink-0 rounded bg-amber-800/40 flex items-center justify-center text-xs text-amber-500">⚔</div>
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmEdit(i, w); if (e.key === 'Escape') cancelEdit() }}
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  value={editBonus}
                  onChange={e => setEditBonus(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmEdit(i, w); if (e.key === 'Escape') cancelEdit() }}
                  placeholder="0"
                  className="w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-amber-400 text-center focus:outline-none focus:border-amber-600"
                />
                <span className="text-xs text-slate-500">HC</span>
              </div>
              <button onClick={() => confirmEdit(i, w)} aria-label={t('common.confirm')} className="relative text-green-500 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                <Check size={14} />
              </button>
              <button onClick={cancelEdit} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                <X size={14} />
              </button>
            </div>
          )
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
              <button onClick={() => startEdit(i, w)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors before:absolute before:inset-[-10px]">
                <Pencil size={12} />
              </button>
              <button onClick={() => setConfirmDeleteIndex(i)} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors before:absolute before:inset-[-10px]">
                <X size={14} />
              </button>
            </div>
          )
        })}
        {weapons.length === 0 && (
          <div className="text-sm text-slate-600 italic px-3 py-2">Aucune arme</div>
        )}
      </div>
      {showQuiver && (
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input
              type="checkbox"
              checked={hasQuiver}
              onChange={onToggleQuiver}
              className="accent-amber-600 w-3.5 h-3.5"
            />
            {t('sheet.quiver')}
          </label>
          {hasQuiver && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => onSetArrows(arrows - 1)}
                className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm flex items-center justify-center"
              >−</button>
              <span className="tabular-nums text-sm text-slate-200 min-w-[1.5rem] text-center">{arrows}</span>
              <button
                onClick={() => onSetArrows(arrows + 1)}
                className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm flex items-center justify-center"
              >+</button>
              <span className="text-xs text-slate-500">{t('sheet.arrows')}</span>
            </div>
          )}
        </div>
      )}
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
      {confirmDeleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-900 border border-red-900/60 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-sm text-slate-300 mb-5">{t('sheet.confirmRemove')} <span className="font-semibold text-slate-100">{weapons[confirmDeleteIndex]?.name}</span></p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteIndex(null)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors">
                {t('common.cancel')}
              </button>
              <button onClick={() => { onRemove(confirmDeleteIndex); setConfirmDeleteIndex(null) }} className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BackpackSection({
  items, meals, max, hasHunting, onAdd, onRemove, onUpdate, onMealsChange, onEat, onUsePotion, onUseCombatPotion
}: {
  items: BackpackItem[]
  meals: number
  max: number
  hasHunting: boolean
  onAdd: (item: BackpackItem) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, item: BackpackItem) => void
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editTwoSlots, setEditTwoSlots] = useState(false)
  const [editValue, setEditValue] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'meal' } | { type: 'item'; id: string; label: string } | null>(null)

  function startEdit(item: BackpackItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditNotes(item.notes ?? '')
    setEditTwoSlots((item.slots ?? 1) > 1)
    setEditValue(item.epRestore ?? item.csBonus ?? 0)
  }

  function confirmEdit(item: BackpackItem) {
    const name = editName.trim() || item.name
    if (item.epRestore != null) {
      onUpdate(item.id, { ...item, name, epRestore: Math.max(1, editValue) })
    } else if (item.csBonus != null) {
      onUpdate(item.id, { ...item, name, csBonus: Math.max(1, editValue) })
    } else {
      onUpdate(item.id, { ...item, name, notes: editNotes.trim() || undefined, slots: editTwoSlots ? 2 : undefined })
    }
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

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
              <button onClick={() => setConfirmDelete({ type: 'meal' })} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                <X size={12} />
              </button>
            </div>
          )
          if (slot.type === 'potion') {
            if (editingId === slot.item.id) return (
              <div key={slot.item.id} className="flex items-center gap-1.5 rounded-lg px-3 py-2 border border-blue-700/50 bg-blue-950/20 col-span-full">
                <span className="text-xs text-slate-600 w-6 shrink-0">{slotLabel(slot.startSlot, slot.endSlot)}</span>
                <span className="shrink-0">🧪</span>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmEdit(slot.item); if (e.key === 'Escape') cancelEdit() }}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-600"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(Number(e.target.value))}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(slot.item); if (e.key === 'Escape') cancelEdit() }}
                    min={1}
                    className="w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-green-400 text-center focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-xs text-slate-500">PE</span>
                </div>
                <button onClick={() => confirmEdit(slot.item)} aria-label={t('common.confirm')} className="relative text-green-500 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <Check size={13} />
                </button>
                <button onClick={cancelEdit} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <X size={12} />
                </button>
              </div>
            )
            return (
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
                <button onClick={() => startEdit(slot.item)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => setConfirmDelete({ type: 'item', id: slot.item.id, label: slot.item.name })}
                  aria-label={t('sheet.removeItem')}
                  className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                >
                  <X size={12} />
                </button>
              </div>
            )
          }
          if (slot.type === 'combatPotion') {
            if (editingId === slot.item.id) return (
              <div key={slot.item.id} className="flex items-center gap-1.5 rounded-lg px-3 py-2 border border-violet-700/50 bg-violet-950/20 col-span-full">
                <span className="text-xs text-slate-600 w-6 shrink-0">{slotLabel(slot.startSlot, slot.endSlot)}</span>
                <span className="shrink-0">⚗️</span>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmEdit(slot.item); if (e.key === 'Escape') cancelEdit() }}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-violet-600"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(Number(e.target.value))}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(slot.item); if (e.key === 'Escape') cancelEdit() }}
                    min={1}
                    className="w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-violet-400 text-center focus:outline-none focus:border-violet-600"
                  />
                  <span className="text-xs text-slate-500">HC</span>
                </div>
                <button onClick={() => confirmEdit(slot.item)} aria-label={t('common.confirm')} className="relative text-green-500 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <Check size={13} />
                </button>
                <button onClick={cancelEdit} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <X size={12} />
                </button>
              </div>
            )
            return (
              <div key={slot.item.id} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-violet-900/50 bg-violet-950/20">
                <span className="text-xs text-slate-600 w-6 shrink-0">{slotLabel(slot.startSlot, slot.endSlot)}</span>
                <span className="shrink-0">⚗️</span>
                <span className="flex-1 text-sm text-violet-200 truncate">{slot.item.name}</span>
                <span className="text-xs text-violet-400 font-medium shrink-0">+{slot.item.csBonus} HC</span>
                <button
                  onClick={() => setCombatPotionConfirm(slot.item.id)}
                  aria-label={t('sheet.useCombatPotion')}
                  title={t('sheet.useCombatPotion')}
                  className="relative text-violet-400 hover:text-violet-300 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                >
                  <FlaskConical size={13} />
                </button>
                <button onClick={() => startEdit(slot.item)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => setConfirmDelete({ type: 'item', id: slot.item.id, label: slot.item.name })}
                  aria-label={t('sheet.removeItem')}
                  className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                >
                  <X size={12} />
                </button>
              </div>
            )
          }
          if (slot.type === 'item') {
            if (editingId === slot.item.id) return (
              <div key={slot.item.id} className="flex flex-col gap-1.5 rounded-lg px-3 py-2 border border-amber-700/50 bg-slate-800/60 col-span-full">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600 w-6 shrink-0">{slotLabel(slot.startSlot, slot.endSlot)}</span>
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(slot.item); if (e.key === 'Escape') cancelEdit() }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                  />
                  <button onClick={() => confirmEdit(slot.item)} aria-label={t('common.confirm')} className="relative text-green-500 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <Check size={13} />
                  </button>
                  <button onClick={cancelEdit} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <X size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 pl-7">
                  <input
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(slot.item); if (e.key === 'Escape') cancelEdit() }}
                    placeholder={t('sheet.itemDescription')}
                    className="flex-1 bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={editTwoSlots}
                      onChange={e => setEditTwoSlots(e.target.checked)}
                      className="accent-amber-600 w-3 h-3"
                    />
                    {t('sheet.twoSlots')}
                  </label>
                </div>
              </div>
            )
            return (
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
                <button onClick={() => startEdit(slot.item)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]">
                  <Pencil size={12} />
                </button>
                <button onClick={() => setConfirmDelete({ type: 'item', id: slot.item.id, label: slot.item.name })} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]">
                  <X size={12} />
                </button>
              </div>
            )
          }
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

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-900 border border-red-900/60 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-sm text-slate-300 mb-5">
              {t('sheet.confirmRemove')}
              {confirmDelete.type === 'item' && <span className="font-semibold text-slate-100"> {confirmDelete.label}</span>}
              {confirmDelete.type === 'meal' && <span className="font-semibold text-slate-100"> {t('sheet.meals')}</span>}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors">
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'meal') removeMeal()
                  else onRemove(confirmDelete.id)
                  setConfirmDelete(null)
                }}
                className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                {t('common.confirm')}
              </button>
            </div>
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
  items, onAdd, onRemove, onUpdate,
  hasHerbPouch, herbPouch, showHerbPouch, onToggleHerbPouch, onOpenHerbPouch,
}: {
  items: SpecialItem[]
  onAdd: (item: SpecialItem) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<SpecialItem>) => void
  hasHerbPouch: boolean
  herbPouch: BackpackItem[]
  showHerbPouch: boolean
  onToggleHerbPouch: () => void
  onOpenHerbPouch: () => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [effect, setEffect] = useState('')
  const [hcBonus, setHcBonus] = useState('')
  const [peBonus, setPeBonus] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEffect, setEditEffect] = useState('')
  const [editHcBonus, setEditHcBonus] = useState('')
  const [editPeBonus, setEditPeBonus] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'item'; id: string; name: string } | { type: 'herbPouch' } | null>(null)

  const totalSlots = items.length + (hasHerbPouch ? 1 : 0)

  function add() {
    if (!input.trim() || totalSlots >= 12) return
    const hc = parseInt(hcBonus) || undefined
    const pe = parseInt(peBonus) || undefined
    onAdd({ id: uuidv4(), name: input.trim(), effect: effect.trim() || undefined, hcBonus: hc, peBonus: pe })
    setInput('')
    setEffect('')
    setHcBonus('')
    setPeBonus('')
  }

  function startEdit(item: SpecialItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditEffect(item.effect ?? '')
    setEditHcBonus(item.hcBonus != null ? String(item.hcBonus) : '')
    setEditPeBonus(item.peBonus != null ? String(item.peBonus) : '')
  }

  function confirmEdit(item: SpecialItem) {
    const name = editName.trim() || item.name
    const hc = parseInt(editHcBonus) || undefined
    const pe = parseInt(editPeBonus) || undefined
    onUpdate(item.id, { name, effect: editEffect.trim() || undefined, hcBonus: hc, peBonus: pe })
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-sm font-semibold text-slate-200">{t('sheet.specialItems')}</div>
        <span className={`text-xs ${totalSlots >= 12 ? 'text-red-400' : 'text-slate-500'}`}>
          {totalSlots}/12
        </span>
      </div>
      <div className="space-y-1.5 mb-2">
        {items.map(item => {
          const isEquipped = item.equipped !== false
          if (editingId === item.id) return (
            <div key={item.id} className="flex flex-col gap-1.5 bg-amber-950/20 border border-amber-700/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmEdit(item); if (e.key === 'Escape') cancelEdit() }}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-amber-100 font-medium focus:outline-none focus:border-amber-600"
                />
                <button onClick={() => confirmEdit(item)} aria-label={t('common.confirm')} className="relative text-green-500 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <Check size={13} />
                </button>
                <button onClick={cancelEdit} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                  <X size={13} />
                </button>
              </div>
              <input
                value={editEffect}
                onChange={e => setEditEffect(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmEdit(item); if (e.key === 'Escape') cancelEdit() }}
                placeholder={t('common.effect') + ' (optionnel)'}
                className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
              />
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-1.5 bg-slate-900/60 border border-amber-900/30 rounded px-2 py-1">
                  <span className="text-xs font-semibold text-amber-400 shrink-0">{t('sheet.hcBonusItem')}</span>
                  <input
                    type="number"
                    value={editHcBonus}
                    onChange={e => setEditHcBonus(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(item); if (e.key === 'Escape') cancelEdit() }}
                    placeholder="0"
                    className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums min-w-0"
                  />
                </div>
                <div className="flex-1 flex items-center gap-1.5 bg-slate-900/60 border border-green-900/30 rounded px-2 py-1">
                  <span className="text-xs font-semibold text-green-400 shrink-0">{t('sheet.peBonusItem')}</span>
                  <input
                    type="number"
                    value={editPeBonus}
                    onChange={e => setEditPeBonus(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(item); if (e.key === 'Escape') cancelEdit() }}
                    placeholder="0"
                    className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums min-w-0"
                  />
                </div>
              </div>
            </div>
          )
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
                    <span className={`text-xs font-semibold rounded px-1 ${isEquipped ? (item.hcBonus > 0 ? 'text-amber-400 bg-amber-900/40' : 'text-red-400 bg-red-900/40') : 'text-slate-500 bg-slate-700/40'}`}>
                      {item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC
                    </span>
                  )}
                  {item.peBonus != null && item.peBonus !== 0 && (
                    <span className={`text-xs font-semibold rounded px-1 ${isEquipped ? (item.peBonus > 0 ? 'text-green-400 bg-green-900/40' : 'text-red-400 bg-red-900/40') : 'text-slate-500 bg-slate-700/40'}`}>
                      {item.peBonus > 0 ? '+' : ''}{item.peBonus} PE
                    </span>
                  )}
                </div>
                {item.effect && <div className="text-xs text-slate-400 mt-0.5">{item.effect}</div>}
              </div>
              <button onClick={() => startEdit(item)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]">
                <Pencil size={12} />
              </button>
              <button onClick={() => setConfirmDelete({ type: 'item', id: item.id, name: item.name })} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]">
                <X size={13} />
              </button>
            </div>
          )
        })}

        {hasHerbPouch && (
          <div className="flex items-center gap-2 bg-green-950/20 border border-green-900/40 rounded-lg px-3 py-2">
            <div className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-sm text-green-100 font-medium">{t('sheet.herbPouch')}</span>
            <span className="text-xs text-slate-500 shrink-0">{t('sheet.herbPouchSlots', { used: herbPouch.length })}</span>
            <button
              onClick={onOpenHerbPouch}
              aria-label={t('sheet.herbPouchOpen')}
              title={t('sheet.herbPouchOpen')}
              className="relative text-green-500 hover:text-green-300 transition-colors shrink-0 before:absolute before:inset-[-10px]"
            >
              <Wallet size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete({ type: 'herbPouch' })}
              aria-label={t('sheet.removeItem')}
              className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {items.length === 0 && !hasHerbPouch && <div className="text-sm text-slate-600 italic px-3 py-2">Aucun objet spécial</div>}
      </div>
      {totalSlots < 12 && (
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

      {showHerbPouch && !hasHerbPouch && (
        <label className={`flex items-center gap-2 text-xs cursor-pointer px-1 mt-2 ${totalSlots >= 12 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:text-slate-400'}`}>
          <input
            type="checkbox"
            checked={false}
            onChange={onToggleHerbPouch}
            disabled={totalSlots >= 12}
            className="accent-amber-600 w-3.5 h-3.5"
          />
          {t('sheet.herbPouch')}
        </label>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-900 border border-red-900/60 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-sm text-slate-300 mb-5">
              {t('sheet.confirmRemove')}
              <span className="font-semibold text-slate-100"> {confirmDelete.type === 'item' ? confirmDelete.name : t('sheet.herbPouch')}</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors">
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'item') onRemove(confirmDelete.id)
                  else onToggleHerbPouch()
                  setConfirmDelete(null)
                }}
                className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors"
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

function HerbPouchModal({
  herbPouch, onClose, onAdd, onRemove, onUpdate, onUsePotion, onUseCombatPotion,
}: {
  herbPouch: BackpackItem[]
  onClose: () => void
  onAdd: (item: BackpackItem) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, item: BackpackItem) => void
  onUsePotion: (id: string) => void
  onUseCombatPotion: (id: string) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [inputNotes, setInputNotes] = useState('')
  const [addingPotion, setAddingPotion] = useState(false)
  const [potionName, setPotionName] = useState('')
  const [potionNotes, setPotionNotes] = useState('')
  const [potionEP, setPotionEP] = useState(5)
  const [addingCombatPotion, setAddingCombatPotion] = useState(false)
  const [combatPotionName, setCombatPotionName] = useState('')
  const [combatPotionNotes, setCombatPotionNotes] = useState('')
  const [combatPotionCS, setCombatPotionCS] = useState(2)
  const [combatPotionConfirm, setCombatPotionConfirm] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editValue, setEditValue] = useState(0)

  function startEdit(item: BackpackItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditNotes(item.notes ?? '')
    setEditValue(item.epRestore ?? item.csBonus ?? 0)
  }

  function confirmEdit(item: BackpackItem) {
    const name = editName.trim() || item.name
    if (item.epRestore != null) {
      onUpdate(item.id, { ...item, name, epRestore: Math.max(1, editValue), notes: editNotes.trim() || undefined })
    } else if (item.csBonus != null) {
      onUpdate(item.id, { ...item, name, csBonus: Math.max(1, editValue), notes: editNotes.trim() || undefined })
    } else {
      onUpdate(item.id, { ...item, name, notes: editNotes.trim() || undefined })
    }
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  const isFull = herbPouch.length >= 6

  function addItem() {
    if (!input.trim() || isFull) return
    onAdd({ id: uuidv4(), name: input.trim(), notes: inputNotes.trim() || undefined })
    setInput('')
    setInputNotes('')
  }

  function confirmAddPotion() {
    if (isFull) return
    onAdd({ id: uuidv4(), name: potionName.trim() || t('sheet.potion'), epRestore: potionEP, notes: potionNotes.trim() || undefined })
    setPotionName('')
    setPotionNotes('')
    setPotionEP(5)
    setAddingPotion(false)
  }

  function confirmAddCombatPotion() {
    if (isFull) return
    onAdd({ id: uuidv4(), name: combatPotionName.trim() || t('sheet.combatPotion'), csBonus: combatPotionCS, notes: combatPotionNotes.trim() || undefined })
    setCombatPotionName('')
    setCombatPotionNotes('')
    setCombatPotionCS(2)
    setAddingCombatPotion(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-slate-900 border border-green-900/50 rounded-xl p-5 max-w-sm w-full shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={16} className="text-green-400 shrink-0" />
          <span className="flex-1 font-semibold text-sm text-green-100">{t('sheet.herbPouch')}</span>
          <span className={`text-xs ${isFull ? 'text-red-400' : 'text-slate-500'}`}>
            {t('sheet.herbPouchSlots', { used: herbPouch.length })}
          </span>
          <button onClick={onClose} aria-label={t('common.cancel')} className="relative text-slate-500 hover:text-slate-300 transition-colors before:absolute before:inset-[-10px]">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-1.5 mb-3">
          {herbPouch.map(item => {
            if (editingId === item.id) return (
              <div key={item.id} className="rounded-lg border border-amber-700/50 bg-slate-800/60 px-3 py-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0">{item.epRestore ? '🧪' : item.csBonus ? '⚗️' : '🌿'}</span>
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(item); if (e.key === 'Escape') cancelEdit() }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                  />
                  {(item.epRestore != null || item.csBonus != null) && (
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(Number(e.target.value))}
                        onKeyDown={e => { if (e.key === 'Enter') confirmEdit(item); if (e.key === 'Escape') cancelEdit() }}
                        min={1}
                        className={`w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-center focus:outline-none ${item.epRestore ? 'text-green-400 focus:border-blue-600' : 'text-violet-400 focus:border-violet-600'}`}
                      />
                      <span className="text-xs text-slate-500">{item.epRestore ? 'PE' : 'HC'}</span>
                    </div>
                  )}
                  <button onClick={() => confirmEdit(item)} aria-label={t('common.confirm')} className="relative text-green-500 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <Check size={13} />
                  </button>
                  <button onClick={cancelEdit} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <X size={12} />
                  </button>
                </div>
                <input
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmEdit(item); if (e.key === 'Escape') cancelEdit() }}
                  placeholder={t('sheet.itemDescription')}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
                />
              </div>
            )
            if (item.epRestore) return (
              <div key={item.id} className="rounded-lg border border-blue-900/50 bg-blue-950/20 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0">🧪</span>
                  <span className="flex-1 text-sm text-blue-200 truncate">{item.name}</span>
                  <span className="text-xs text-green-400 font-medium shrink-0">+{item.epRestore} PE</span>
                  <button onClick={() => onUsePotion(item.id)} aria-label={t('sheet.usePotion')} title={t('sheet.usePotion')} className="relative text-blue-400 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <FlaskConical size={13} />
                  </button>
                  <button onClick={() => startEdit(item)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(item.id)} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <X size={12} />
                  </button>
                </div>
                {item.notes && <p className="mt-1 text-xs text-slate-500 leading-snug">{item.notes}</p>}
              </div>
            )
            if (item.csBonus) return (
              <div key={item.id} className="rounded-lg border border-violet-900/50 bg-violet-950/20 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0">⚗️</span>
                  <span className="flex-1 text-sm text-violet-200 truncate">{item.name}</span>
                  <span className="text-xs text-violet-400 font-medium shrink-0">+{item.csBonus} HC</span>
                  <button onClick={() => setCombatPotionConfirm(item.id)} aria-label={t('sheet.useCombatPotion')} title={t('sheet.useCombatPotion')} className="relative text-violet-400 hover:text-violet-300 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <FlaskConical size={13} />
                  </button>
                  <button onClick={() => startEdit(item)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(item.id)} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <X size={12} />
                  </button>
                </div>
                {item.notes && <p className="mt-1 text-xs text-slate-500 leading-snug">{item.notes}</p>}
              </div>
            )
            return (
              <div key={item.id} className="rounded-lg border border-green-900/30 bg-green-950/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0">🌿</span>
                  <span className="flex-1 text-sm text-green-100 truncate">{item.name}</span>
                  <button onClick={() => startEdit(item)} aria-label={t('sheet.editItem')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(item.id)} aria-label={t('sheet.removeItem')} className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <X size={12} />
                  </button>
                </div>
                {item.notes && <p className="mt-1 text-xs text-slate-500 leading-snug">{item.notes}</p>}
              </div>
            )
          })}
          {herbPouch.length === 0 && (
            <div className="text-sm text-slate-600 italic px-3 py-2">Poche vide</div>
          )}
        </div>

        {addingPotion && !isFull && (
          <div className="mb-2 p-2.5 rounded-lg border border-blue-900/40 bg-blue-950/10 space-y-1.5">
            <div className="flex gap-2">
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
              <button onClick={confirmAddPotion} className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium transition-colors shrink-0">OK</button>
              <button onClick={() => setAddingPotion(false)} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                <X size={14} />
              </button>
            </div>
            <input
              value={potionNotes}
              onChange={e => setPotionNotes(e.target.value)}
              placeholder={t('sheet.itemNotes')}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-blue-600 placeholder:text-slate-600"
            />
          </div>
        )}

        {addingCombatPotion && !isFull && (
          <div className="mb-2 p-2.5 rounded-lg border border-orange-900/40 bg-orange-950/10 space-y-1.5">
            <div className="flex gap-2">
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
              <button onClick={confirmAddCombatPotion} className="px-2 py-1 rounded bg-orange-700 hover:bg-orange-600 text-white text-xs font-medium transition-colors shrink-0">OK</button>
              <button onClick={() => setAddingCombatPotion(false)} aria-label={t('common.cancel')} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                <X size={14} />
              </button>
            </div>
            <input
              value={combatPotionNotes}
              onChange={e => setCombatPotionNotes(e.target.value)}
              placeholder={t('sheet.itemNotes')}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-orange-600 placeholder:text-slate-600"
            />
          </div>
        )}

        {!isFull && (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <button
                onClick={() => setAddingPotion(v => !v)}
                aria-pressed={addingPotion}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors shrink-0 ${addingPotion ? 'border-blue-700 bg-blue-900/30 text-blue-300' : 'border-blue-900/50 text-blue-500 hover:bg-blue-950/30 hover:text-blue-400'}`}
              >
                <Plus size={12} />🧪
              </button>
              <button
                onClick={() => setAddingCombatPotion(v => !v)}
                aria-pressed={addingCombatPotion}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors shrink-0 ${addingCombatPotion ? 'border-orange-700 bg-orange-900/30 text-orange-300' : 'border-orange-900/50 text-orange-500 hover:bg-orange-950/30 hover:text-orange-400'}`}
              >
                <Plus size={12} />⚗️
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder={t('sheet.addHerb')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-green-700"
              />
              <button onClick={addItem} aria-label={t('sheet.addHerb')} className="relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]">
                <Plus size={16} />
              </button>
            </div>
            <input
              value={inputNotes}
              onChange={e => setInputNotes(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder={t('sheet.itemNotes')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-green-700 placeholder:text-slate-600"
            />
          </div>
        )}

        {confirmDeleteId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-slate-900 border border-red-900/60 rounded-xl p-6 max-w-sm w-full shadow-xl">
              <p className="text-sm text-slate-300 mb-5">
                {t('sheet.confirmRemove')}
                <span className="font-semibold text-slate-100"> {herbPouch.find(i => i.id === confirmDeleteId)?.name}</span>
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors">
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => { onRemove(confirmDeleteId); setConfirmDeleteId(null) }}
                  className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
        {combatPotionConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-slate-900 border border-orange-900/60 rounded-xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-orange-300">
                <FlaskConical size={18} />
                <span className="font-semibold text-sm">{t('sheet.combatPotion')}</span>
              </div>
              <p className="text-sm text-slate-300 mb-5">{t('sheet.combatPotionConfirm')}</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setCombatPotionConfirm(null)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors">
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
    </div>
  )
}
