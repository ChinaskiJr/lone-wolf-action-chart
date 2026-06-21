import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Pencil, Check, Wallet } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { BackpackItem, SpecialItem } from '@/types/game'
import { BonusBadge } from '@/components/ui/BonusBadge'

interface Props {
  items: SpecialItem[]
  onAdd: (item: SpecialItem) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<SpecialItem>) => void
  hasHerbPouch: boolean
  herbPouch: BackpackItem[]
  showHerbPouch: boolean
  onToggleHerbPouch: () => void
  onOpenHerbPouch: () => void
}

export function SpecialItemsEditor({
  items,
  onAdd,
  onRemove,
  onUpdate,
  hasHerbPouch,
  herbPouch,
  showHerbPouch,
  onToggleHerbPouch,
  onOpenHerbPouch,
}: Props) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [effect, setEffect] = useState('')
  const [hcBonus, setHcBonus] = useState('')
  const [hcPermanent, setHcPermanent] = useState(false)
  const [peBonus, setPeBonus] = useState('')
  const [pePermanent, setPePermanent] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEffect, setEditEffect] = useState('')
  const [editHcBonus, setEditHcBonus] = useState('')
  const [editHcPermanent, setEditHcPermanent] = useState(false)
  const [editPeBonus, setEditPeBonus] = useState('')
  const [editPePermanent, setEditPePermanent] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<
    { type: 'item'; id: string; name: string } | { type: 'herbPouch' } | null
  >(null)

  const totalSlots = items.length + (hasHerbPouch ? 1 : 0)

  function add() {
    if (!input.trim() || totalSlots >= 12) return
    const hc = parseInt(hcBonus) || undefined
    const pe = parseInt(peBonus) || undefined
    onAdd({
      id: uuidv4(),
      name: input.trim(),
      effect: effect.trim() || undefined,
      hcBonus: hc,
      hcBonusPermanent: hc != null ? hcPermanent || undefined : undefined,
      peBonus: pe,
      peBonusPermanent: pe != null ? pePermanent || undefined : undefined,
    })
    setInput('')
    setEffect('')
    setHcBonus('')
    setHcPermanent(false)
    setPeBonus('')
    setPePermanent(false)
  }

  function startEdit(item: SpecialItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditEffect(item.effect ?? '')
    setEditHcBonus(item.hcBonus != null ? String(item.hcBonus) : '')
    setEditHcPermanent(item.hcBonusPermanent ?? false)
    setEditPeBonus(item.peBonus != null ? String(item.peBonus) : '')
    setEditPePermanent(item.peBonusPermanent ?? false)
  }

  function confirmEdit(item: SpecialItem) {
    const name = editName.trim() || item.name
    const hc = parseInt(editHcBonus) || undefined
    const pe = parseInt(editPeBonus) || undefined
    onUpdate(item.id, {
      name,
      effect: editEffect.trim() || undefined,
      hcBonus: hc,
      hcBonusPermanent: hc != null ? editHcPermanent || undefined : undefined,
      peBonus: pe,
      peBonusPermanent: pe != null ? editPePermanent || undefined : undefined,
    })
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
        {items.map((item) => {
          const isEquipped = item.equipped !== false
          if (editingId === item.id)
            return (
              <div
                key={item.id}
                className="flex flex-col gap-1.5 bg-amber-950/20 border border-amber-700/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit(item)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-amber-100 font-medium focus:outline-none focus:border-amber-600"
                  />
                  <button
                    onClick={() => confirmEdit(item)}
                    aria-label={t('common.confirm')}
                    className="relative text-green-500 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    aria-label={t('common.cancel')}
                    className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <X size={13} />
                  </button>
                </div>
                <input
                  value={editEffect}
                  onChange={(e) => setEditEffect(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEdit(item)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  placeholder={t('common.effect') + ' (optionnel)'}
                  className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
                />
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1 bg-slate-900/60 border border-amber-900/30 rounded px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-amber-400 shrink-0">
                        {t('sheet.hcBonusItem')}
                      </span>
                      <input
                        type="number"
                        value={editHcBonus}
                        onChange={(e) => setEditHcBonus(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEdit(item)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        placeholder="0"
                        className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums min-w-0"
                      />
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editHcPermanent}
                        onChange={(e) => setEditHcPermanent(e.target.checked)}
                        className="accent-amber-600 w-3 h-3"
                      />
                      <span className="text-xs text-slate-500">{t('sheet.permanentBonus')}</span>
                    </label>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 bg-slate-900/60 border border-green-900/30 rounded px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-green-400 shrink-0">
                        {t('sheet.peBonusItem')}
                      </span>
                      <input
                        type="number"
                        value={editPeBonus}
                        onChange={(e) => setEditPeBonus(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEdit(item)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        placeholder="0"
                        className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums min-w-0"
                      />
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editPePermanent}
                        onChange={(e) => setEditPePermanent(e.target.checked)}
                        className="accent-green-600 w-3 h-3"
                      />
                      <span className="text-xs text-slate-500">{t('sheet.permanentBonus')}</span>
                    </label>
                  </div>
                </div>
              </div>
            )
          return (
            <div
              key={item.id}
              className="flex gap-2 bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2"
            >
              <label
                className={`flex items-center shrink-0 mt-0.5 cursor-pointer transition-opacity ${isEquipped ? '' : 'opacity-50'}`}
                aria-label={isEquipped ? t('sheet.unequipItem') : t('sheet.equipItem')}
              >
                <input
                  type="checkbox"
                  checked={isEquipped}
                  onChange={() => onUpdate(item.id, { equipped: !isEquipped })}
                  className="accent-amber-600 w-3.5 h-3.5"
                />
              </label>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-sm text-amber-100 font-medium transition-opacity ${isEquipped ? '' : 'opacity-50'}`}
                  >
                    {item.name}
                  </span>
                  {item.hcBonus != null && (
                    <BonusBadge
                      value={item.hcBonus}
                      kind="hc"
                      active={isEquipped || !!item.hcBonusPermanent}
                      permanent={!!item.hcBonusPermanent}
                    />
                  )}
                  {item.peBonus != null && (
                    <BonusBadge
                      value={item.peBonus}
                      kind="pe"
                      active={isEquipped || !!item.peBonusPermanent}
                      permanent={!!item.peBonusPermanent}
                    />
                  )}
                </div>
                {item.effect && (
                  <div
                    className={`text-xs text-slate-400 mt-0.5 transition-opacity ${isEquipped ? '' : 'opacity-50'}`}
                  >
                    {item.effect}
                  </div>
                )}
              </div>
              <button
                onClick={() => startEdit(item)}
                aria-label={t('sheet.editItem')}
                className={`relative text-slate-600 hover:text-slate-400 transition-opacity shrink-0 mt-0.5 before:absolute before:inset-[-10px] ${isEquipped ? '' : 'opacity-50'}`}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setConfirmDelete({ type: 'item', id: item.id, name: item.name })}
                aria-label={t('sheet.removeItem')}
                className={`relative text-slate-600 hover:text-red-400 transition-opacity shrink-0 mt-0.5 before:absolute before:inset-[-10px] ${isEquipped ? '' : 'opacity-50'}`}
              >
                <X size={13} />
              </button>
            </div>
          )
        })}

        {hasHerbPouch && (
          <div className="flex items-center gap-2 bg-green-950/20 border border-green-900/40 rounded-lg px-3 py-2">
            <div className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-sm text-green-100 font-medium">
              {t('sheet.herbPouch')}
            </span>
            <span className="text-xs text-slate-500 shrink-0">
              {t('sheet.herbPouchSlots', { used: herbPouch.length })}
            </span>
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

        {items.length === 0 && !hasHerbPouch && (
          <div className="text-sm text-slate-600 italic px-3 py-2">Aucun objet spécial</div>
        )}
      </div>

      {totalSlots < 12 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('sheet.addSpecialItem')}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              placeholder={t('common.effect') + ' (optionnel)'}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-800/60 border border-amber-900/30 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-amber-400 mb-1">
                {t('sheet.hcBonusItem')}
              </div>
              <input
                type="number"
                value={hcBonus}
                onChange={(e) => setHcBonus(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums"
              />
              <label className="flex items-center gap-1 mt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hcPermanent}
                  onChange={(e) => setHcPermanent(e.target.checked)}
                  className="accent-amber-600 w-3 h-3"
                />
                <span className="text-xs text-slate-500">{t('sheet.permanentBonus')}</span>
              </label>
            </div>
            <div className="flex-1 bg-slate-800/60 border border-green-900/30 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-green-400 mb-1">
                {t('sheet.peBonusItem')}
              </div>
              <input
                type="number"
                value={peBonus}
                onChange={(e) => setPeBonus(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="0"
                className="w-full bg-transparent text-sm text-slate-200 focus:outline-none text-center tabular-nums"
              />
              <label className="flex items-center gap-1 mt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pePermanent}
                  onChange={(e) => setPePermanent(e.target.checked)}
                  className="accent-green-600 w-3 h-3"
                />
                <span className="text-xs text-slate-500">{t('sheet.permanentBonus')}</span>
              </label>
            </div>
            <button
              onClick={add}
              aria-label={t('sheet.addSpecialItem')}
              className="self-end relative p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors before:absolute before:inset-[-6px]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {showHerbPouch && !hasHerbPouch && (
        <label
          className={`flex items-center gap-2 text-xs cursor-pointer px-1 mt-2 ${totalSlots >= 12 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:text-slate-400'}`}
        >
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
              <span className="font-semibold text-slate-100">
                {' '}
                {confirmDelete.type === 'item' ? confirmDelete.name : t('sheet.herbPouch')}
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors"
              >
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
