import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock, Sword, Coins, Sparkles, Utensils, Plus, Minus } from 'lucide-react'
import { NumberStepper } from '@/components/ui/NumberStepper'
import type { Character } from '@/types/character'
import type { BackpackItem, ConfiscatedEquipment, SpecialItem, Weapon } from '@/types/game'

interface Props {
  character: Character
  onConfirm: (selection: ConfiscatedEquipment) => void
  onCancel: () => void
}

export function ConfiscationSelectModal({ character, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()

  const [selWeapons, setSelWeapons] = useState<Set<number>>(
    () => new Set(character.weapons.map((_, i) => i))
  )
  const [selSpecials, setSelSpecials] = useState<Set<string>>(
    () => new Set(character.specialItems.map(i => i.id))
  )
  const [selBp, setSelBp] = useState<Set<string>>(
    () => new Set(character.backpack.map(i => i.id))
  )
  const [gold, setGold] = useState<number>(character.goldCrowns)
  const [meals, setMeals] = useState<number>(character.meals)

  function toggleWeapon(idx: number) {
    setSelWeapons(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function toggleSpecial(id: string) {
    setSelSpecials(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleBp(id: string) {
    setSelBp(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const selectedWeapons: Weapon[] = character.weapons.filter((_, i) => selWeapons.has(i))
    const selectedBp: BackpackItem[] = character.backpack.filter(i => selBp.has(i.id))
    const selectedSpecials: SpecialItem[] = character.specialItems.filter(i => selSpecials.has(i.id))
    onConfirm({
      weapons: selectedWeapons,
      goldCrowns: gold,
      meals,
      backpack: selectedBp,
      specialItems: selectedSpecials,
    })
  }

  const nothingSelected =
    selWeapons.size === 0 &&
    selSpecials.size === 0 &&
    selBp.size === 0 &&
    gold === 0 &&
    meals === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-800/60 flex items-center justify-center shrink-0">
            <Lock size={18} className="text-red-300" />
          </div>
          <div>
            <div className="text-lg font-serif font-semibold text-red-100">
              {t('sheet.confiscation.selectTitle')}
            </div>
            <div className="text-sm text-slate-400 mt-0.5">{t('sheet.confiscation.selectDesc')}</div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 pt-4 flex flex-col gap-5">
          {/* Weapons */}
          {character.weapons.length > 0 && (
            <section>
              <SectionHeader icon={<Sword size={14} />} label={t('sheet.weapons')} />
              <div className="space-y-1.5">
                {character.weapons.map((w, i) => (
                  <ToggleRow
                    key={i}
                    checked={selWeapons.has(i)}
                    onToggle={() => toggleWeapon(i)}
                  >
                    <span className="flex-1 text-sm text-slate-200 truncate">{w.name}</span>
                    {w.bonus != null && w.bonus !== 0 && (
                      <span className="text-xs font-semibold rounded px-1 text-amber-400 bg-amber-900/40 shrink-0">
                        {w.bonus > 0 ? '+' : ''}{w.bonus} HC
                      </span>
                    )}
                  </ToggleRow>
                ))}
              </div>
            </section>
          )}

          {/* Gold */}
          {character.goldCrowns > 0 && (
            <section>
              <SectionHeader icon={<Coins size={14} />} label={t('sheet.confiscation.goldAmount')} />
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 border border-slate-700 bg-slate-800/40">
                <span className="text-xl shrink-0">🪙</span>
                <span className="flex-1 text-sm text-amber-100 font-semibold tabular-nums">{gold}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setGold(g => Math.max(0, g - 1))}
                    disabled={gold <= 0}
                    aria-label="-"
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-xs text-slate-500 tabular-nums">/ {character.goldCrowns}</span>
                  <button
                    onClick={() => setGold(g => Math.min(character.goldCrowns, g + 1))}
                    disabled={gold >= character.goldCrowns}
                    aria-label="+"
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Backpack */}
          {(character.meals > 0 || character.backpack.length > 0) && (
            <section>
              <SectionHeader label={t('sheet.backpack')} />
              <div className="space-y-1.5">
                {character.meals > 0 && (
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 border border-slate-700 bg-slate-800/40">
                    <Utensils size={13} className="text-amber-400 shrink-0" />
                    <span className="flex-1 text-sm text-amber-200/90">{t('sheet.meals')}</span>
                    <NumberStepper
                      value={meals}
                      max={character.meals}
                      onChange={setMeals}
                    />
                  </div>
                )}
                {character.backpack.map(item => {
                  const s = item.slots ?? 1
                  return (
                    <ToggleRow
                      key={item.id}
                      checked={selBp.has(item.id)}
                      onToggle={() => toggleBp(item.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-slate-200 truncate">{item.name}</span>
                          {s > 1 && (
                            <span className="text-xs text-slate-500 bg-slate-700 rounded px-1 shrink-0">×{s}</span>
                          )}
                          {item.epRestore != null && (
                            <span className="text-xs text-green-400 shrink-0">+{item.epRestore} PE</span>
                          )}
                          {item.csBonus != null && (
                            <span className="text-xs text-violet-400 shrink-0">+{item.csBonus} HC</span>
                          )}
                        </div>
                        {item.notes && <div className="text-xs text-slate-500 truncate">{item.notes}</div>}
                      </div>
                    </ToggleRow>
                  )
                })}
              </div>
            </section>
          )}

          {/* Special items */}
          {character.specialItems.length > 0 && (
            <section>
              <SectionHeader icon={<Sparkles size={14} />} label={t('sheet.specialItems')} />
              <div className="space-y-1.5">
                {character.specialItems.map(item => (
                  <ToggleRow
                    key={item.id}
                    checked={selSpecials.has(item.id)}
                    onToggle={() => toggleSpecial(item.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm text-amber-100 font-medium">{item.name}</span>
                        {item.hcBonus != null && item.hcBonus !== 0 && (
                          <span className={`text-xs font-semibold rounded px-1 ${item.hcBonus > 0 ? 'text-amber-400 bg-amber-900/40' : 'text-red-400 bg-red-900/40'}`}>
                            {item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC
                          </span>
                        )}
                        {item.peBonus != null && item.peBonus !== 0 && (
                          <span className={`text-xs font-semibold rounded px-1 ${item.peBonus > 0 ? 'text-green-400 bg-green-900/40' : 'text-red-400 bg-red-900/40'}`}>
                            {item.peBonus > 0 ? '+' : ''}{item.peBonus} PE
                          </span>
                        )}
                      </div>
                      {item.effect && <div className="text-xs text-slate-400 truncate">{item.effect}</div>}
                    </div>
                  </ToggleRow>
                ))}
              </div>
            </section>
          )}
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
            disabled={nothingSelected}
            className="flex-1 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('sheet.confiscation.confirmAction')}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-200">
      {icon}
      {label}
    </div>
  )
}

function ToggleRow({
  checked, onToggle, children,
}: {
  checked: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <label
      className={`flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors cursor-pointer ${
        checked ? 'border-red-800/60 bg-red-950/20' : 'border-slate-700 bg-slate-800/40'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-red-600 w-3.5 h-3.5 shrink-0"
      />
      {children}
    </label>
  )
}
