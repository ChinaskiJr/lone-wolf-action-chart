import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PackageOpen, Sword, Coins, Sparkles, Utensils } from 'lucide-react'
import { NumberStepper } from '@/components/ui/NumberStepper'
import type { Character } from '@/types/character'
import type { BackpackItem, ConfiscatedEquipment, SpecialItem, Weapon } from '@/types/game'
import { getBackpackMax, getGoldMax, getSpecialItemsMax } from '@/utils/character'

const MAX_WEAPONS = 2

interface Props {
  confiscated: ConfiscatedEquipment
  current: Character
  onConfirm: (selection: ConfiscatedEquipment) => void
  onCancel: () => void
}

type Source = 'current' | 'stash'
type Tagged<T> = { source: Source; item: T; key: string }

export function ConfiscationRecoverModal({ confiscated, current, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()

  const maxSlots = getBackpackMax(current)
  const maxSpecial = getSpecialItemsMax(current)
  const goldMax = getGoldMax(current)

  // Combined sources: newly-acquired items first, then the confiscated stash.
  const weapons: Tagged<Weapon>[] = [
    ...current.weapons.map((item, i) => ({ source: 'current' as Source, item, key: `cur-w-${i}` })),
    ...confiscated.weapons.map((item, i) => ({ source: 'stash' as Source, item, key: `stash-w-${i}` })),
  ]
  const specials: Tagged<SpecialItem>[] = [
    ...current.specialItems.map(item => ({ source: 'current' as Source, item, key: item.id })),
    ...confiscated.specialItems.map(item => ({ source: 'stash' as Source, item, key: item.id })),
  ]
  const bpItems: Tagged<BackpackItem>[] = [
    ...current.backpack.map(item => ({ source: 'current' as Source, item, key: item.id })),
    ...confiscated.backpack.map(item => ({ source: 'stash' as Source, item, key: item.id })),
  ]

  const totalGold = current.goldCrowns + confiscated.goldCrowns
  const finalGold = Math.min(goldMax, totalGold)
  const goldLost = totalGold - finalGold
  const totalMeals = current.meals + confiscated.meals

  // Default selection: greedily take what fits, current (new) items first.
  function defaultBackpack(): { keys: Set<string>; meals: number } {
    let used = 0
    let meals = 0
    const keys = new Set<string>()
    const addMeals = (n: number) => {
      const take = Math.min(n, maxSlots - used)
      meals += take
      used += take
    }
    const addItems = (list: Tagged<BackpackItem>[]) => {
      for (const e of list) {
        const s = e.item.slots ?? 1
        if (used + s <= maxSlots) {
          keys.add(e.key)
          used += s
        }
      }
    }
    addMeals(current.meals)
    addItems(bpItems.filter(e => e.source === 'current'))
    addMeals(confiscated.meals)
    addItems(bpItems.filter(e => e.source === 'stash'))
    return { keys, meals }
  }

  const [selWeapons, setSelWeapons] = useState<Set<string>>(
    () => new Set(weapons.slice(0, MAX_WEAPONS).map(e => e.key))
  )
  const [selSpecials, setSelSpecials] = useState<Set<string>>(
    () => new Set(specials.slice(0, maxSpecial).map(e => e.key))
  )
  const [selBp, setSelBp] = useState<Set<string>>(() => defaultBackpack().keys)
  const [meals, setMeals] = useState<number>(() => defaultBackpack().meals)

  const usedSlots =
    bpItems.filter(e => selBp.has(e.key)).reduce((s, e) => s + (e.item.slots ?? 1), 0) + meals
  const slotsFull = usedSlots >= maxSlots
  const freeSlots = maxSlots - usedSlots

  function toggleWeapon(key: string) {
    setSelWeapons(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else if (next.size < MAX_WEAPONS) next.add(key)
      return next
    })
  }

  function toggleSpecial(key: string) {
    setSelSpecials(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else if (next.size < maxSpecial) next.add(key)
      return next
    })
  }

  function toggleBp(e: Tagged<BackpackItem>) {
    setSelBp(prev => {
      const next = new Set(prev)
      if (next.has(e.key)) next.delete(e.key)
      else if (usedSlots + (e.item.slots ?? 1) <= maxSlots) next.add(e.key)
      return next
    })
  }

  function handleConfirm() {
    onConfirm({
      weapons: weapons.filter(e => selWeapons.has(e.key)).map(e => e.item),
      goldCrowns: finalGold,
      meals,
      backpack: bpItems.filter(e => selBp.has(e.key)).map(e => e.item),
      specialItems: specials.filter(e => selSpecials.has(e.key)).map(e => e.item),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-amber-900/40 border border-amber-800/60 flex items-center justify-center shrink-0">
            <PackageOpen size={18} className="text-amber-300" />
          </div>
          <div>
            <div className="text-lg font-serif font-semibold text-amber-100">
              {t('sheet.confiscation.recoverTitle')}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">{t('sheet.confiscation.recoverDesc')}</div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 pt-4 flex flex-col gap-5">
          {/* Weapons */}
          <section>
            <SectionHeader
              icon={<Sword size={14} />}
              label={t('sheet.weapons')}
              count={selWeapons.size}
              max={MAX_WEAPONS}
            />
            <div className="space-y-1.5">
              {weapons.length === 0 && <EmptyRow />}
              {weapons.map(e => (
                <ToggleRow
                  key={e.key}
                  source={e.source}
                  checked={selWeapons.has(e.key)}
                  cannotAdd={selWeapons.size >= MAX_WEAPONS}
                  onToggle={() => toggleWeapon(e.key)}
                >
                  <span className="flex-1 text-sm text-slate-200 truncate">{e.item.name}</span>
                  {e.item.bonus != null && e.item.bonus !== 0 && (
                    <span className="text-xs font-semibold rounded px-1 text-amber-400 bg-amber-900/40 shrink-0">
                      {e.item.bonus > 0 ? '+' : ''}{e.item.bonus} HC
                    </span>
                  )}
                </ToggleRow>
              ))}
            </div>
          </section>

          {/* Gold */}
          <section>
            <SectionHeader
              icon={<Coins size={14} />}
              label={t('sheet.goldCrowns')}
              count={finalGold}
              max={goldMax}
            />
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 border border-amber-900/40 bg-amber-950/20">
              <span className="text-xl shrink-0">🪙</span>
              <span className="flex-1 text-sm text-amber-100 font-semibold tabular-nums">{finalGold}</span>
              {goldLost > 0 && (
                <span className="text-xs text-red-400">
                  {t('sheet.confiscation.goldCappedNote', { max: goldMax, lost: goldLost })}
                </span>
              )}
            </div>
          </section>

          {/* Backpack */}
          <section>
            <SectionHeader
              label={t('sheet.backpack')}
              count={usedSlots}
              max={maxSlots}
              countLabel={t('sheet.slotsUsed', { used: usedSlots, max: maxSlots })}
            />
            <div className="space-y-1.5">
              {/* Meals stepper */}
              {totalMeals > 0 && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 border border-amber-900/40 bg-amber-950/20">
                  <Utensils size={13} className="text-amber-400 shrink-0" />
                  <span className="flex-1 text-sm text-amber-200/90">{t('sheet.meals')}</span>
                  <NumberStepper
                    value={meals}
                    max={totalMeals}
                    incrementDisabled={freeSlots <= 0}
                    onChange={setMeals}
                  />
                </div>
              )}
              {bpItems.length === 0 && totalMeals === 0 && <EmptyRow />}
              {bpItems.map(e => {
                const s = e.item.slots ?? 1
                return (
                  <ToggleRow
                    key={e.key}
                    source={e.source}
                    checked={selBp.has(e.key)}
                    cannotAdd={usedSlots + s > maxSlots}
                    onToggle={() => toggleBp(e)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-slate-200 truncate">{e.item.name}</span>
                        {s > 1 && (
                          <span className="text-xs text-slate-500 bg-slate-700 rounded px-1 shrink-0">×{s}</span>
                        )}
                        {e.item.epRestore != null && (
                          <span className="text-xs text-green-400 shrink-0">+{e.item.epRestore} PE</span>
                        )}
                        {e.item.csBonus != null && (
                          <span className="text-xs text-violet-400 shrink-0">+{e.item.csBonus} HC</span>
                        )}
                      </div>
                      {e.item.notes && <div className="text-xs text-slate-500 truncate">{e.item.notes}</div>}
                    </div>
                  </ToggleRow>
                )
              })}
            </div>
            {slotsFull && <div className="text-xs text-red-400 mt-1.5">{t('sheet.slotsUsed', { used: usedSlots, max: maxSlots })}</div>}
          </section>

          {/* Special items */}
          <section>
            <SectionHeader
              icon={<Sparkles size={14} />}
              label={t('sheet.specialItems')}
              count={selSpecials.size}
              max={maxSpecial}
            />
            <div className="space-y-1.5">
              {specials.length === 0 && <EmptyRow />}
              {specials.map(e => {
                const isEquipped = e.item.equipped !== false
                return (
                  <ToggleRow
                    key={e.key}
                    source={e.source}
                    checked={selSpecials.has(e.key)}
                    cannotAdd={selSpecials.size >= maxSpecial}
                    onToggle={() => toggleSpecial(e.key)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm text-amber-100 font-medium">{e.item.name}</span>
                        {e.item.hcBonus != null && e.item.hcBonus !== 0 && (
                          <span className={`text-xs font-semibold rounded px-1 ${e.item.hcBonus > 0 ? 'text-amber-400 bg-amber-900/40' : 'text-red-400 bg-red-900/40'}`}>
                            {e.item.hcBonus > 0 ? '+' : ''}{e.item.hcBonus} HC
                          </span>
                        )}
                        {e.item.peBonus != null && e.item.peBonus !== 0 && (
                          <span className={`text-xs font-semibold rounded px-1 ${e.item.peBonus > 0 ? 'text-green-400 bg-green-900/40' : 'text-red-400 bg-red-900/40'}`}>
                            {e.item.peBonus > 0 ? '+' : ''}{e.item.peBonus} PE
                          </span>
                        )}
                        {!isEquipped && (
                          <span className="text-xs text-slate-500">({t('sheet.unequipItem')})</span>
                        )}
                      </div>
                      {e.item.effect && <div className="text-xs text-slate-400 truncate">{e.item.effect}</div>}
                    </div>
                  </ToggleRow>
                )
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-sm transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
          >
            {t('sheet.confiscation.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  icon, label, count, max, countLabel,
}: {
  icon?: React.ReactNode
  label: string
  count: number
  max: number
  countLabel?: string
}) {
  const full = count >= max
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        {icon}
        {label}
      </div>
      <span className={`text-xs ${full ? 'text-red-400' : 'text-slate-500'}`}>
        {countLabel ?? `${count}/${max}`}
      </span>
    </div>
  )
}

function ToggleRow({
  source, checked, cannotAdd, onToggle, children,
}: {
  source: Source
  checked: boolean
  cannotAdd: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const disabled = cannotAdd && !checked
  return (
    <label
      className={`flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors ${
        checked ? 'border-amber-800/60 bg-amber-950/20' : 'border-slate-700 bg-slate-800/40'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="accent-amber-600 w-3.5 h-3.5 shrink-0"
      />
      <span
        className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
          source === 'stash' ? 'bg-slate-700 text-slate-300' : 'bg-blue-900/40 text-blue-300'
        }`}
      >
        {source === 'stash' ? t('sheet.confiscation.stashedItems') : t('sheet.confiscation.newItems')}
      </span>
      {children}
    </label>
  )
}

function EmptyRow() {
  const { t } = useTranslation()
  return <div className="text-sm text-slate-600 italic px-3 py-2">{t('sheet.confiscation.empty')}</div>
}
