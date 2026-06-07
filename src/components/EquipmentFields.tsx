import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { BackpackItem, SpecialItem, Weapon } from '@/types/game'

interface Props {
  weapons?: Weapon[]
  onWeaponsChange?: (weapons: Weapon[]) => void
  backpack: BackpackItem[]
  onBackpackChange: (items: BackpackItem[]) => void
  meals: number
  onMealsChange: (count: number) => void
  specialItems: SpecialItem[]
  onSpecialItemsChange: (items: SpecialItem[]) => void
  maxBackpackSlots: number
}

export function EquipmentFields({
  weapons, onWeaponsChange,
  backpack, onBackpackChange,
  meals, onMealsChange,
  specialItems, onSpecialItemsChange,
  maxBackpackSlots,
}: Props) {
  const { t } = useTranslation()

  // Weapons form
  const [newWeapon, setNewWeapon] = useState('')
  const [newWeaponBonus, setNewWeaponBonus] = useState('')

  // Backpack form
  const [newItem, setNewItem] = useState('')
  const [newItemNotes, setNewItemNotes] = useState('')
  const [newItemTwoSlots, setNewItemTwoSlots] = useState(false)
  const [addingPotion, setAddingPotion] = useState(false)
  const [potionName, setPotionName] = useState('')
  const [potionEP, setPotionEP] = useState(5)
  const [addingCombatPotion, setAddingCombatPotion] = useState(false)
  const [combatPotionName, setCombatPotionName] = useState('')
  const [combatPotionCS, setCombatPotionCS] = useState(2)

  // Special items form
  const [newSpecialItem, setNewSpecialItem] = useState('')
  const [newSpecialItemEffect, setNewSpecialItemEffect] = useState('')
  const [newSpecialItemHC, setNewSpecialItemHC] = useState('')
  const [newSpecialItemPE, setNewSpecialItemPE] = useState('')

  const usedSlots = backpack.reduce((s, i) => s + (i.slots ?? 1), 0) + meals
  const isFull = usedSlots >= maxBackpackSlots

  function addWeapon() {
    if (!weapons || !onWeaponsChange || !newWeapon.trim() || weapons.length >= 2) return
    const parsed = parseInt(newWeaponBonus, 10)
    onWeaponsChange([...weapons, {
      name: newWeapon.trim(),
      bonus: !isNaN(parsed) && parsed !== 0 ? parsed : undefined,
    }])
    setNewWeapon('')
    setNewWeaponBonus('')
  }

  function addBackpackItem() {
    const itemSlots = newItemTwoSlots ? 2 : 1
    if (!newItem.trim() || usedSlots + itemSlots > maxBackpackSlots) return
    onBackpackChange([...backpack, {
      id: uuidv4(),
      name: newItem.trim(),
      notes: newItemNotes.trim() || undefined,
      slots: newItemTwoSlots ? 2 : undefined,
    }])
    setNewItem('')
    setNewItemNotes('')
    setNewItemTwoSlots(false)
  }

  function confirmAddPotion() {
    if (isFull) return
    onBackpackChange([...backpack, {
      id: uuidv4(),
      name: potionName.trim() || t('sheet.potion'),
      epRestore: potionEP,
    }])
    setPotionName('')
    setPotionEP(5)
    setAddingPotion(false)
  }

  function confirmAddCombatPotion() {
    if (isFull) return
    onBackpackChange([...backpack, {
      id: uuidv4(),
      name: combatPotionName.trim() || t('sheet.combatPotion'),
      csBonus: combatPotionCS,
    }])
    setCombatPotionName('')
    setCombatPotionCS(2)
    setAddingCombatPotion(false)
  }

  function addSpecialItem() {
    if (!newSpecialItem.trim() || specialItems.length >= 12) return
    const hc = parseInt(newSpecialItemHC) || undefined
    const pe = parseInt(newSpecialItemPE) || undefined
    onSpecialItemsChange([...specialItems, {
      id: uuidv4(),
      name: newSpecialItem.trim(),
      effect: newSpecialItemEffect.trim() || undefined,
      hcBonus: hc,
      peBonus: pe,
    }])
    setNewSpecialItem('')
    setNewSpecialItemEffect('')
    setNewSpecialItemHC('')
    setNewSpecialItemPE('')
  }

  function toggleEquipped(id: string) {
    onSpecialItemsChange(specialItems.map(i =>
      i.id === id ? { ...i, equipped: i.equipped !== false ? false : true } : i
    ))
  }

  return (
    <>
      {/* Weapons */}
      {weapons && onWeaponsChange && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
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
                      onChange={() => onWeaponsChange(weapons.map((ww, j) =>
                        j === i ? { ...ww, equipped: isEquipped ? false : undefined } : ww
                      ))}
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
                  <button
                    onClick={() => onWeaponsChange(weapons.filter((_, j) => j !== i))}
                    aria-label={t('sheet.removeItem')}
                    className="relative text-slate-600 hover:text-red-400 transition-colors before:absolute before:inset-[-10px]"
                  >
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
                value={newWeapon}
                onChange={e => setNewWeapon(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWeapon()}
                placeholder={t('sheet.addWeapon')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
              />
              <div className="flex flex-col justify-center bg-slate-800/60 border border-amber-900/30 rounded-lg px-2 py-1 w-14 shrink-0">
                <div className="text-xs font-semibold text-amber-400 mb-0.5">{t('sheet.hcBonusItem')}</div>
                <input
                  type="number"
                  value={newWeaponBonus}
                  onChange={e => setNewWeaponBonus(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addWeapon()}
                  placeholder="0"
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none tabular-nums"
                />
              </div>
              <button
                onClick={addWeapon}
                aria-label={t('sheet.addWeapon')}
                className="relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      )}

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
            <div key={`meal-${i}`} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-amber-900/40 bg-amber-950/20">
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
          {backpack.map(item => {
            if (item.epRestore) return (
              <div key={item.id} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-blue-900/50 bg-blue-950/20">
                <span className="shrink-0">🧪</span>
                <span className="flex-1 text-sm text-blue-200 truncate">{item.name}</span>
                <span className="text-xs text-green-400 font-medium shrink-0">+{item.epRestore} PE</span>
                <button
                  onClick={() => onBackpackChange(backpack.filter(i => i.id !== item.id))}
                  aria-label={t('sheet.removeItem')}
                  className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                >
                  <X size={12} />
                </button>
              </div>
            )
            if (item.csBonus) return (
              <div key={item.id} className="flex items-center gap-2 rounded-lg px-3 py-2 border border-violet-900/50 bg-violet-950/20">
                <span className="shrink-0">⚗️</span>
                <span className="flex-1 text-sm text-violet-200 truncate">{item.name}</span>
                <span className="text-xs text-violet-400 font-medium shrink-0">+{item.csBonus} HC</span>
                <button
                  onClick={() => onBackpackChange(backpack.filter(i => i.id !== item.id))}
                  aria-label={t('sheet.removeItem')}
                  className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                >
                  <X size={12} />
                </button>
              </div>
            )
            return (
              <div key={item.id} className="flex items-start gap-2 rounded-lg px-3 py-2 border border-slate-700 bg-slate-800/60">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-200 truncate">{item.name}</span>
                    {(item.slots ?? 1) > 1 && (
                      <span className="text-xs text-slate-500 bg-slate-700 rounded px-1 shrink-0">×{item.slots}</span>
                    )}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{item.notes}</div>
                  )}
                </div>
                <button
                  onClick={() => onBackpackChange(backpack.filter(i => i.id !== item.id))}
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
            <button onClick={confirmAddPotion} className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium transition-colors shrink-0">OK</button>
            <button onClick={() => setAddingPotion(false)} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
              <X size={14} />
            </button>
          </div>
        )}
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
            <button onClick={confirmAddCombatPotion} className="px-2 py-1 rounded bg-orange-700 hover:bg-orange-600 text-white text-xs font-medium transition-colors shrink-0">OK</button>
            <button onClick={() => setAddingCombatPotion(false)} className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
              <X size={14} />
            </button>
          </div>
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
                onClick={() => setAddingPotion(v => !v)}
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
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBackpackItem()}
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
                onChange={e => setNewItemNotes(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBackpackItem()}
                placeholder={t('sheet.itemDescription')}
                className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer shrink-0 select-none">
                <input
                  type="checkbox"
                  checked={newItemTwoSlots}
                  onChange={e => setNewItemTwoSlots(e.target.checked)}
                  className="accent-amber-600 w-3.5 h-3.5"
                />
                {t('sheet.twoSlots')}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Special items */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold text-slate-200">{t('sheet.specialItems')}</span>
          <span className={`text-xs ${specialItems.length >= 12 ? 'text-red-400' : 'text-slate-500'}`}>
            {specialItems.length}/12
          </span>
        </div>
        <div className="space-y-1.5 mb-2">
          {specialItems.map(item => {
            const isEquipped = item.equipped !== false
            return (
              <div key={item.id} className={`flex gap-2 bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2 transition-opacity ${isEquipped ? '' : 'opacity-50'}`}>
                <label className="flex items-center shrink-0 mt-0.5 cursor-pointer" aria-label={isEquipped ? t('sheet.unequipItem') : t('sheet.equipItem')}>
                  <input
                    type="checkbox"
                    checked={isEquipped}
                    onChange={() => toggleEquipped(item.id)}
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
                  {item.effect && (
                    <div className="text-xs text-slate-400 mt-0.5">{item.effect}</div>
                  )}
                </div>
                <button
                  onClick={() => onSpecialItemsChange(specialItems.filter(i => i.id !== item.id))}
                  aria-label={t('sheet.removeItem')}
                  className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-0.5 before:absolute before:inset-[-10px]"
                >
                  <X size={13} />
                </button>
              </div>
            )
          })}
          {specialItems.length === 0 && (
            <div className="text-sm text-slate-600 italic px-3 py-2">Aucun objet spécial</div>
          )}
        </div>
        {specialItems.length < 12 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                value={newSpecialItem}
                onChange={e => setNewSpecialItem(e.target.value)}
                placeholder={t('sheet.addSpecialItem')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="flex gap-2">
              <input
                value={newSpecialItemEffect}
                onChange={e => setNewSpecialItemEffect(e.target.value)}
                placeholder={`${t('common.effect')} (optionnel)`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800/60 border border-amber-900/30 rounded-lg px-3 py-2">
                <div className="text-xs font-semibold text-amber-400 mb-1">{t('sheet.hcBonusItem')}</div>
                <input
                  type="number"
                  value={newSpecialItemHC}
                  onChange={e => setNewSpecialItemHC(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums"
                />
              </div>
              <div className="flex-1 bg-slate-800/60 border border-green-900/30 rounded-lg px-3 py-2">
                <div className="text-xs font-semibold text-green-400 mb-1">{t('sheet.peBonusItem')}</div>
                <input
                  type="number"
                  value={newSpecialItemPE}
                  onChange={e => setNewSpecialItemPE(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSpecialItem()}
                  placeholder="0"
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums"
                />
              </div>
              <button
                onClick={addSpecialItem}
                aria-label={t('sheet.addSpecialItem')}
                className="self-end relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
