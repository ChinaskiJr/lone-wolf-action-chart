import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import type { Character } from '@/types/character'
import type { BackpackItem, SpecialItem, Weapon } from '@/types/game'
import { v4 as uuidv4 } from 'uuid'

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

  const [newWeapon, setNewWeapon] = useState('')
  const [newBackpackItem, setNewBackpackItem] = useState('')
  const [newBackpackItemTwoSlots, setNewBackpackItemTwoSlots] = useState(false)
  const [newSpecialItem, setNewSpecialItem] = useState('')
  const [newSpecialItemHC, setNewSpecialItemHC] = useState('')
  const [newSpecialItemPE, setNewSpecialItemPE] = useState('')

  function addWeapon() {
    if (!newWeapon.trim() || weapons.length >= 2) return
    setWeapons([...weapons, { name: newWeapon.trim() }])
    setNewWeapon('')
  }

  function addBackpackItem() {
    const maxSlots = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10
    const usedSlots = backpack.reduce((sum, i) => sum + (i.slots ?? 1), 0) + meals
    const itemSlots = newBackpackItemTwoSlots ? 2 : 1
    if (!newBackpackItem.trim() || usedSlots + itemSlots > maxSlots) return
    setBackpack([...backpack, {
      id: uuidv4(),
      name: newBackpackItem.trim(),
      slots: newBackpackItemTwoSlots ? 2 : undefined,
    }])
    setNewBackpackItem('')
    setNewBackpackItemTwoSlots(false)
  }

  function addSpecialItem() {
    if (!newSpecialItem.trim() || specialItems.length >= 12) return
    const hc = parseInt(newSpecialItemHC) || undefined
    const pe = parseInt(newSpecialItemPE) || undefined
    setSpecialItems([...specialItems, { id: uuidv4(), name: newSpecialItem.trim(), hcBonus: hc, peBonus: pe }])
    setNewSpecialItem('')
    setNewSpecialItemHC('')
    setNewSpecialItemPE('')
  }

  function toggleSpecialItemEquipped(id: string) {
    setSpecialItems(items => items.map(i =>
      i.id === id ? { ...i, equipped: i.equipped !== false ? false : true } : i
    ))
  }

  function handleFinish() {
    onFinish({
      ...character,
      weapons,
      backpack,
      specialItems,
      goldCrowns: gold,
      meals,
    } as Character)
  }

  const backpackMax = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-serif font-semibold text-amber-100">{t('creation.step4')}</h2>

      {/* Weapons */}
      <div>
        <div className="text-sm font-medium text-slate-300 mb-2">{t('sheet.weapons')} (max 2)</div>
        <div className="space-y-2 mb-2">
          {weapons.map((w, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-800/60 rounded px-3 py-2">
              <span className="flex-1 text-sm text-slate-200">{w.name}</span>
              <button onClick={() => setWeapons(weapons.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        {weapons.length < 2 && (
          <div className="flex gap-2">
            <input
              value={newWeapon}
              onChange={e => setNewWeapon(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWeapon()}
              placeholder={t('sheet.addWeapon')}
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
            <button onClick={addWeapon} className="relative p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]">
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Backpack */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">{t('sheet.backpack')}</span>
          <span className={`text-xs ${backpack.reduce((s, i) => s + (i.slots ?? 1), 0) + meals >= backpackMax ? 'text-red-400' : 'text-slate-500'}`}>
            {backpack.reduce((s, i) => s + (i.slots ?? 1), 0) + meals}/{backpackMax}
          </span>
        </div>
        <div className="space-y-1 mb-2">
          {Array.from({ length: meals }).map((_, i) => (
            <div key={`meal-${i}`} className="flex items-center gap-2 bg-amber-950/20 border border-amber-900/30 rounded px-3 py-1.5">
              <span className="text-xs">🍖</span>
              <span className="flex-1 text-sm text-amber-200/80">{t('sheet.meals')}</span>
              <button onClick={() => setMeals(meals - 1)} className="text-slate-500 hover:text-red-400 transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
          {backpack.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-slate-800/60 rounded px-3 py-1.5">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-sm text-slate-200 truncate">{item.name}</span>
                {(item.slots ?? 1) > 1 && (
                  <span className="text-xs text-slate-500 bg-slate-700 rounded px-1 shrink-0">×{item.slots}</span>
                )}
              </div>
              <button onClick={() => setBackpack(backpack.filter(i => i.id !== item.id))} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        {backpack.reduce((s, i) => s + (i.slots ?? 1), 0) + meals < backpackMax && (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <button
                onClick={() => setMeals(meals + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded border border-amber-900/50 text-amber-600 hover:bg-amber-950/30 text-xs font-medium transition-colors shrink-0"
              >
                <Plus size={12} />
                {t('sheet.meals')}
              </button>
              <input
                value={newBackpackItem}
                onChange={e => setNewBackpackItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBackpackItem()}
                placeholder={t('sheet.addItem')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
              />
              <button onClick={addBackpackItem} className="relative p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]">
                <Plus size={16} />
              </button>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={newBackpackItemTwoSlots}
                onChange={e => setNewBackpackItemTwoSlots(e.target.checked)}
                className="accent-amber-600 w-3.5 h-3.5"
              />
              {t('sheet.twoSlots')}
            </label>
          </div>
        )}
      </div>

      {/* Special items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">{t('sheet.specialItems')}</span>
          <span className="text-xs text-slate-500">{specialItems.length}/12</span>
        </div>
        <div className="space-y-1 mb-2">
          {specialItems.map(item => {
            const isEquipped = item.equipped !== false
            return (
              <div key={item.id} className={`flex items-center gap-2 bg-slate-800/60 rounded px-3 py-1.5 transition-opacity ${isEquipped ? '' : 'opacity-50'}`}>
                <label className="flex items-center shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEquipped}
                    onChange={() => toggleSpecialItemEquipped(item.id)}
                    className="accent-amber-600 w-3.5 h-3.5"
                  />
                </label>
                <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm text-slate-200">{item.name}</span>
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
                <button onClick={() => setSpecialItems(specialItems.filter(i => i.id !== item.id))} className="text-slate-500 hover:text-red-400 transition-colors">
                  <X size={13} />
                </button>
              </div>
            )
          })}
        </div>
        {specialItems.length < 12 && (
          <div className="flex flex-col gap-1.5">
            <input
              value={newSpecialItem}
              onChange={e => setNewSpecialItem(e.target.value)}
              placeholder={t('sheet.addSpecialItem')}
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800/60 border border-amber-900/30 rounded px-3 py-2">
                <div className="text-xs font-semibold text-amber-400 mb-1">{t('sheet.hcBonusItem')}</div>
                <input
                  type="number"
                  value={newSpecialItemHC}
                  onChange={e => setNewSpecialItemHC(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums"
                />
              </div>
              <div className="flex-1 bg-slate-800/60 border border-green-900/30 rounded px-3 py-2">
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
              <button onClick={addSpecialItem} className="self-end relative p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]">
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

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
