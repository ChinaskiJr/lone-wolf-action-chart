import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Pencil, Check, FlaskConical } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { BackpackItem } from '@/types/game'

interface Props {
  herbPouch: BackpackItem[]
  onAdd: (item: BackpackItem) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, item: BackpackItem) => void
  onUsePotion?: (id: string) => void
  onUseCombatPotion?: (id: string) => void
}

export function HerbPouchContent({ herbPouch, onAdd, onRemove, onUpdate, onUsePotion, onUseCombatPotion }: Props) {
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

  const isFull = herbPouch.length >= 6

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
    <div>
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
                {onUsePotion && (
                  <button onClick={() => onUsePotion(item.id)} aria-label={t('sheet.usePotion')} title={t('sheet.usePotion')} className="relative text-blue-400 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <FlaskConical size={13} />
                  </button>
                )}
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
                {onUseCombatPotion && (
                  <button onClick={() => setCombatPotionConfirm(item.id)} aria-label={t('sheet.useCombatPotion')} title={t('sheet.useCombatPotion')} className="relative text-violet-400 hover:text-violet-300 transition-colors shrink-0 before:absolute before:inset-[-10px]">
                    <FlaskConical size={13} />
                  </button>
                )}
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
      {combatPotionConfirm && onUseCombatPotion && (
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
  )
}
