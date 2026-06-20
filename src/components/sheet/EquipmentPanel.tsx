import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, FlaskConical, Utensils, Lock, PackageOpen, Wallet, Pencil, Check } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import type { BackpackItem, ConfiscatedEquipment } from '@/types/game'
import type { Character } from '@/types/character'
import { WeaponsEditor } from '@/components/WeaponsEditor'
import { SpecialItemsEditor } from '@/components/SpecialItemsEditor'
import { HerbPouchContent } from '@/components/HerbPouchContent'
import { PotionAddForm } from '@/components/backpack/PotionAddForm'
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
      <WeaponsEditor
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
      <SpecialItemsEditor
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
  const [addingCombatPotion, setAddingCombatPotion] = useState(false)
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
        <PotionAddForm
          variant="potion"
          onConfirm={({ name, value }) => {
            onAdd({ id: uuidv4(), name, epRestore: value })
            setAddingPotion(false)
          }}
          onCancel={() => setAddingPotion(false)}
        />
      )}

      {/* Combat potion add form (inline) */}
      {addingCombatPotion && !isFull && (
        <PotionAddForm
          variant="combat"
          onConfirm={({ name, value }) => {
            onAdd({ id: uuidv4(), name, csBonus: value })
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
  const isFull = herbPouch.length >= 6
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
        <HerbPouchContent
          herbPouch={herbPouch}
          onAdd={onAdd}
          onRemove={onRemove}
          onUpdate={onUpdate}
          onUsePotion={onUsePotion}
          onUseCombatPotion={onUseCombatPotion}
        />
      </div>
    </div>
  )
}
