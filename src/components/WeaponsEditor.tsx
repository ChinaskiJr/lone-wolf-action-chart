import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Pencil, Check, Sword } from 'lucide-react'
import type { Weapon } from '@/types/game'
import { BonusBadge } from '@/components/ui/BonusBadge'

interface Props {
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
}

export function WeaponsEditor({
  weapons, hasQuiver, arrows, showQuiver,
  onAdd, onRemove, onEquip, onUpdate, onToggleQuiver, onSetArrows,
}: Props) {
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
              {w.bonus != null && <BonusBadge value={w.bonus} kind="hc" active={isEquipped} dimWhenInactive={false} />}
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
              <button onClick={() => onSetArrows(arrows - 1)} className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm flex items-center justify-center">−</button>
              <span className="tabular-nums text-sm text-slate-200 min-w-[1.5rem] text-center">{arrows}</span>
              <button onClick={() => onSetArrows(arrows + 1)} className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm flex items-center justify-center">+</button>
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
