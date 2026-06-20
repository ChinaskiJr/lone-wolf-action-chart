import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Archive, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import type { BackpackItem, MonasteryStorage, SpecialItem, Weapon } from '@/types/game'

interface Props {
  onDone: () => void
  onSkip: () => void
}

const EMPTY_MONASTERY: MonasteryStorage = { weapons: [], goldCrowns: 0, backpack: [], specialItems: [] }

export function MonasteryStorageModal({ onDone, onSkip }: Props) {
  const { t } = useTranslation()
  const { character, syncMonastery } = useCharacterStore()

  if (!character) return null

  const existing = character.monastery ?? EMPTY_MONASTERY
  const totalGold = character.goldCrowns + existing.goldCrowns

  const [invWeapons, setInvWeapons] = useState<Weapon[]>(character.weapons)
  const [invBackpack, setInvBackpack] = useState<BackpackItem[]>(character.backpack)
  const [invSpecialItems, setInvSpecialItems] = useState<SpecialItem[]>(character.specialItems)
  const [invGold, setInvGold] = useState(character.goldCrowns)
  const meals = character.meals

  const [monWeapons, setMonWeapons] = useState<Weapon[]>(existing.weapons)
  const [monBackpack, setMonBackpack] = useState<BackpackItem[]>(existing.backpack)
  const [monSpecialItems, setMonSpecialItems] = useState<SpecialItem[]>(existing.specialItems)
  const [monGold, setMonGold] = useState(existing.goldCrowns)

  const maxBackpackSlots = character.cycle === 'kai' || character.cycle === 'magnakai' ? 8 : 10
  const usedBackpackSlots = invBackpack.reduce((s, i) => s + (i.slots ?? 1), 0) + meals

  function depositWeapon(idx: number) {
    const item = invWeapons[idx]
    setInvWeapons(prev => prev.filter((_, i) => i !== idx))
    setMonWeapons(prev => [...prev, item])
  }

  function retrieveWeapon(idx: number) {
    const item = monWeapons[idx]
    setMonWeapons(prev => prev.filter((_, i) => i !== idx))
    setInvWeapons(prev => [...prev, item])
  }

  function depositBackpackItem(id: string) {
    const item = invBackpack.find(i => i.id === id)!
    setInvBackpack(prev => prev.filter(i => i.id !== id))
    setMonBackpack(prev => [...prev, item])
  }

  function retrieveBackpackItem(id: string) {
    const item = monBackpack.find(i => i.id === id)!
    const itemSlots = item.slots ?? 1
    if (usedBackpackSlots + itemSlots > maxBackpackSlots) return
    setMonBackpack(prev => prev.filter(i => i.id !== id))
    setInvBackpack(prev => [...prev, item])
  }

  function depositSpecialItem(id: string) {
    const item = invSpecialItems.find(i => i.id === id)!
    setInvSpecialItems(prev => prev.filter(i => i.id !== id))
    setMonSpecialItems(prev => [...prev, item])
  }

  function retrieveSpecialItem(id: string) {
    const item = monSpecialItems.find(i => i.id === id)!
    setMonSpecialItems(prev => prev.filter(i => i.id !== id))
    setInvSpecialItems(prev => [...prev, item])
  }

  function deleteInvWeapon(idx: number) { setInvWeapons(prev => prev.filter((_, i) => i !== idx)) }
  function deleteMonWeapon(idx: number) { setMonWeapons(prev => prev.filter((_, i) => i !== idx)) }
  function deleteInvBackpackItem(id: string) { setInvBackpack(prev => prev.filter(i => i.id !== id)) }
  function deleteMonBackpackItem(id: string) { setMonBackpack(prev => prev.filter(i => i.id !== id)) }
  function deleteInvSpecialItem(id: string) { setInvSpecialItems(prev => prev.filter(i => i.id !== id)) }
  function deleteMonSpecialItem(id: string) { setMonSpecialItems(prev => prev.filter(i => i.id !== id)) }

  function handleInvGoldChange(val: number) {
    const clamped = Math.max(0, Math.min(totalGold, val))
    setInvGold(clamped)
    setMonGold(totalGold - clamped)
  }

  function handleMonGoldChange(val: number) {
    const clamped = Math.max(0, Math.min(totalGold, val))
    setMonGold(clamped)
    setInvGold(totalGold - clamped)
  }

  function handleConfirm() {
    syncMonastery(
      { weapons: invWeapons, goldCrowns: invGold, backpack: invBackpack, specialItems: invSpecialItems, meals },
      { weapons: monWeapons, goldCrowns: monGold, backpack: monBackpack, specialItems: monSpecialItems }
    )
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-800 bg-amber-950/20">
          <div className="w-9 h-9 rounded-lg bg-amber-900/40 border border-amber-800/50 flex items-center justify-center text-amber-400">
            <Archive size={18} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold text-amber-100">{t('sheet.monastery.title')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('sheet.monastery.subtitle')}</p>
          </div>
        </div>

        {/* Two-panel content */}
        <div className="p-5 grid grid-cols-2 gap-4">

          {/* LEFT — Your equipment */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('sheet.monastery.yourEquipment')}</div>

            {/* Weapons */}
            <Section label={t('sheet.weapons')}>
              {invWeapons.length === 0
                ? <EmptyRow label={t('sheet.monastery.noItems')} />
                : invWeapons.map((w, i) => (
                  <ItemRow key={i} name={w.name} sub={w.bonus ? `+${w.bonus} HC` : undefined}>
                    <MoveButton dir="right" onClick={() => depositWeapon(i)} label={t('sheet.monastery.store')} />
                    <DeleteButton onClick={() => deleteInvWeapon(i)} label={t('sheet.removeItem')} />
                  </ItemRow>
                ))
              }
            </Section>

            {/* Backpack */}
            <Section label={`${t('sheet.backpack')} ${usedBackpackSlots}/${maxBackpackSlots}`}>
              {invBackpack.length === 0
                ? <EmptyRow label={t('sheet.monastery.noItems')} />
                : invBackpack.map(item => (
                  <ItemRow key={item.id} name={item.name} sub={item.slots === 2 ? t('sheet.twoSlots') : undefined}>
                    <MoveButton dir="right" onClick={() => depositBackpackItem(item.id)} label={t('sheet.monastery.store')} />
                    <DeleteButton onClick={() => deleteInvBackpackItem(item.id)} label={t('sheet.removeItem')} />
                  </ItemRow>
                ))
              }
            </Section>

            {/* Special items */}
            <Section label={t('sheet.specialItems')}>
              {invSpecialItems.length === 0
                ? <EmptyRow label={t('sheet.monastery.noItems')} />
                : invSpecialItems.map(item => (
                  <ItemRow key={item.id} name={item.name} sub={
                    (item.hcBonus != null && item.hcBonus !== 0) || (item.peBonus != null && item.peBonus !== 0) ? <>
                      {item.hcBonus != null && item.hcBonus !== 0 && <span className="font-semibold rounded px-1 text-amber-400 bg-amber-900/40">{item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC</span>}
                      {item.peBonus != null && item.peBonus !== 0 && <span className="font-semibold rounded px-1 text-green-400 bg-green-900/40">{item.peBonus > 0 ? '+' : ''}{item.peBonus} PE</span>}
                    </> : undefined
                  }>
                    <MoveButton dir="right" onClick={() => depositSpecialItem(item.id)} label={t('sheet.monastery.store')} />
                    <DeleteButton onClick={() => deleteInvSpecialItem(item.id)} label={t('sheet.removeItem')} />
                  </ItemRow>
                ))
              }
            </Section>

            {/* Gold */}
            <Section label={t('sheet.goldCrowns')}>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span className="text-xs text-slate-400">{t('sheet.monastery.goldYours')}</span>
                <input
                  type="number"
                  min={0}
                  max={totalGold}
                  value={invGold}
                  onChange={e => handleInvGoldChange(Number(e.target.value))}
                  className="w-16 text-center text-sm bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-500">/ {totalGold}</span>
                <MoveButton dir="right" onClick={() => handleMonGoldChange(totalGold)} label="→" />
              </div>
            </Section>
          </div>

          {/* RIGHT — Monastery */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-amber-600/80 uppercase tracking-wider">{t('sheet.monastery.stored')}</div>

            {/* Weapons */}
            <Section label={t('sheet.weapons')}>
              {monWeapons.length === 0
                ? <EmptyRow label={t('sheet.monastery.noItems')} />
                : monWeapons.map((w, i) => (
                  <ItemRow key={i} name={w.name} sub={w.bonus ? `+${w.bonus} HC` : undefined}>
                    <MoveButton dir="left" onClick={() => retrieveWeapon(i)} label={t('sheet.monastery.retrieve')} />
                    <DeleteButton onClick={() => deleteMonWeapon(i)} label={t('sheet.removeItem')} />
                  </ItemRow>
                ))
              }
            </Section>

            {/* Backpack */}
            <Section label={t('sheet.backpack')}>
              {monBackpack.length === 0
                ? <EmptyRow label={t('sheet.monastery.noItems')} />
                : monBackpack.map(item => {
                  const wouldExceed = usedBackpackSlots + (item.slots ?? 1) > maxBackpackSlots
                  return (
                    <ItemRow key={item.id} name={item.name} sub={item.slots === 2 ? t('sheet.twoSlots') : undefined}>
                      <MoveButton
                        dir="left"
                        onClick={() => retrieveBackpackItem(item.id)}
                        label={t('sheet.monastery.retrieve')}
                        disabled={wouldExceed}
                        disabledLabel={t('sheet.monastery.inventoryFull')}
                      />
                      <DeleteButton onClick={() => deleteMonBackpackItem(item.id)} label={t('sheet.removeItem')} />
                    </ItemRow>
                  )
                })
              }
            </Section>

            {/* Special items */}
            <Section label={t('sheet.specialItems')}>
              {monSpecialItems.length === 0
                ? <EmptyRow label={t('sheet.monastery.noItems')} />
                : monSpecialItems.map(item => (
                  <ItemRow key={item.id} name={item.name} sub={
                    (item.hcBonus != null && item.hcBonus !== 0) || (item.peBonus != null && item.peBonus !== 0) ? <>
                      {item.hcBonus != null && item.hcBonus !== 0 && <span className="font-semibold rounded px-1 text-amber-400 bg-amber-900/40">{item.hcBonus > 0 ? '+' : ''}{item.hcBonus} HC</span>}
                      {item.peBonus != null && item.peBonus !== 0 && <span className="font-semibold rounded px-1 text-green-400 bg-green-900/40">{item.peBonus > 0 ? '+' : ''}{item.peBonus} PE</span>}
                    </> : undefined
                  }>
                    <MoveButton dir="left" onClick={() => retrieveSpecialItem(item.id)} label={t('sheet.monastery.retrieve')} />
                    <DeleteButton onClick={() => deleteMonSpecialItem(item.id)} label={t('sheet.removeItem')} />
                  </ItemRow>
                ))
              }
            </Section>

            {/* Gold */}
            <Section label={t('sheet.goldCrowns')}>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <MoveButton dir="left" onClick={() => handleInvGoldChange(totalGold)} label="←" />
                <span className="text-xs text-slate-400">{t('sheet.monastery.goldMonastery')}</span>
                <input
                  type="number"
                  min={0}
                  max={totalGold}
                  value={monGold}
                  onChange={e => handleMonGoldChange(Number(e.target.value))}
                  className="w-16 text-center text-sm bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-amber-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onSkip}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            {t('sheet.monastery.skip')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors"
          >
            {t('sheet.monastery.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="border border-slate-700/60 rounded-lg overflow-hidden divide-y divide-slate-700/40">
        {children}
      </div>
    </div>
  )
}

function ItemRow({ name, sub, children }: { name: string; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-800/30 text-sm">
      <div className="flex-1 min-w-0">
        <div className="text-slate-200 truncate">{name}</div>
        {sub && <div className="text-xs text-slate-500 flex gap-1 flex-wrap mt-0.5">{sub}</div>}
      </div>
      {children}
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="px-2 py-1.5 bg-slate-800/20 text-xs text-slate-600 italic">
      {label}
    </div>
  )
}

interface MoveButtonProps {
  dir: 'left' | 'right'
  onClick: () => void
  label: string
  disabled?: boolean
  disabledLabel?: string
}

function DeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="relative text-slate-600 hover:text-red-400 transition-colors p-0.5 rounded hover:bg-red-900/20 before:absolute before:inset-[-6px]"
    >
      <X size={12} />
    </button>
  )
}

function MoveButton({ dir, onClick, label, disabled, disabledLabel }: MoveButtonProps) {
  if (disabled) {
    return (
      <span className="text-xs text-slate-600 px-1" title={disabledLabel}>
        {dir === 'right' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </span>
    )
  }
  return (
    <button
      onClick={onClick}
      title={label}
      className="text-slate-400 hover:text-amber-400 transition-colors p-0.5 rounded hover:bg-amber-900/20"
    >
      {dir === 'right' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </button>
  )
}
