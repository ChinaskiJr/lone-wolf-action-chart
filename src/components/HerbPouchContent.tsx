import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Pencil, Check, FlaskConical } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { BackpackItem } from '@/types/game'
import { PotionAddForm } from '@/components/backpack/PotionAddForm'

interface Props {
  herbPouch: BackpackItem[]
  onAdd: (item: BackpackItem) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, item: BackpackItem) => void
  onUsePotion?: (id: string) => void
  onUseCombatPotion?: (id: string) => void
}

export function HerbPouchContent({
  herbPouch,
  onAdd,
  onRemove,
  onUpdate,
  onUsePotion,
  onUseCombatPotion,
}: Props) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [inputNotes, setInputNotes] = useState('')
  const [inputMaxDoses, setInputMaxDoses] = useState('')
  const [addingPotion, setAddingPotion] = useState(false)
  const [addingCombatPotion, setAddingCombatPotion] = useState(false)
  const [combatPotionConfirm, setCombatPotionConfirm] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editValue, setEditValue] = useState(0)
  const [editMaxDoses, setEditMaxDoses] = useState('')

  const isFull = herbPouch.length >= 6

  function startEdit(item: BackpackItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditNotes(item.notes ?? '')
    setEditValue(item.epRestore ?? item.csBonus ?? 0)
    setEditMaxDoses(item.maxDoses != null ? String(item.maxDoses) : '')
  }

  function confirmEdit(item: BackpackItem) {
    const name = editName.trim() || item.name
    const maxDoses =
      editMaxDoses.trim() !== '' ? Math.max(1, parseInt(editMaxDoses, 10)) : undefined
    if (item.epRestore != null) {
      onUpdate(item.id, {
        ...item,
        name,
        epRestore: Math.max(1, editValue),
        notes: editNotes.trim() || undefined,
        maxDoses,
      })
    } else if (item.csBonus != null) {
      onUpdate(item.id, {
        ...item,
        name,
        csBonus: Math.max(1, editValue),
        notes: editNotes.trim() || undefined,
        maxDoses,
      })
    } else {
      onUpdate(item.id, { ...item, name, notes: editNotes.trim() || undefined, maxDoses })
    }
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function addItem() {
    if (!input.trim() || isFull) return
    const maxDoses =
      inputMaxDoses.trim() !== '' ? Math.max(1, parseInt(inputMaxDoses, 10)) : undefined
    onAdd({ id: uuidv4(), name: input.trim(), notes: inputNotes.trim() || undefined, maxDoses })
    setInput('')
    setInputNotes('')
    setInputMaxDoses('')
  }

  function consumeDose(item: BackpackItem) {
    if (item.maxDoses == null) return
    if (item.maxDoses <= 1) {
      onRemove(item.id)
    } else {
      onUpdate(item.id, { ...item, maxDoses: item.maxDoses - 1 })
    }
  }

  return (
    <div>
      <div className="space-y-1.5 mb-3">
        {herbPouch.map((item) => {
          if (editingId === item.id)
            return (
              <div
                key={item.id}
                className="rounded-lg border border-amber-700/50 bg-slate-800/60 px-3 py-2 space-y-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0">
                    {item.epRestore ? '🧪' : item.csBonus ? '⚗️' : '🌿'}
                  </span>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit(item)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                  />
                  {(item.epRestore != null || item.csBonus != null) && (
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEdit(item)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        min={1}
                        className={`w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-center focus:outline-none ${item.epRestore ? 'text-green-400 focus:border-blue-600' : 'text-violet-400 focus:border-violet-600'}`}
                      />
                      <span className="text-xs text-slate-500">{item.epRestore ? 'PE' : 'HC'}</span>
                    </div>
                  )}
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
                    <X size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit(item)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    placeholder={t('sheet.itemDescription')}
                    className="flex-1 bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-amber-600/60"
                  />
                  <input
                    type="number"
                    value={editMaxDoses}
                    onChange={(e) => setEditMaxDoses(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit(item)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    min={1}
                    placeholder="–"
                    title={t('sheet.maxDoses')}
                    className="w-14 bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 text-center focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            )
          if (item.epRestore)
            return (
              <div
                key={item.id}
                className="rounded-lg border border-blue-900/50 bg-blue-950/20 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0">🧪</span>
                  <span className="flex-1 text-sm text-blue-200 truncate">{item.name}</span>
                  <span className="text-xs text-green-400 font-medium shrink-0">
                    +{item.epRestore} PE
                  </span>
                  {item.maxDoses != null && (
                    <>
                      <span className="text-xs text-amber-400 font-medium shrink-0 tabular-nums">
                        {item.maxDoses} {t('sheet.doses')}
                      </span>
                      <button
                        onClick={() => consumeDose(item)}
                        aria-label={t('sheet.consumeDose')}
                        className="relative w-5 h-5 rounded bg-amber-900/40 border border-amber-800/60 hover:bg-amber-800/60 active:bg-amber-700/60 text-amber-300 font-bold text-sm transition-colors shrink-0 flex items-center justify-center before:absolute before:inset-[-10px]"
                      >
                        −
                      </button>
                    </>
                  )}
                  {onUsePotion && (
                    <button
                      onClick={() => onUsePotion(item.id)}
                      aria-label={t('sheet.usePotion')}
                      title={t('sheet.usePotion')}
                      className="relative text-blue-400 hover:text-green-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                    >
                      <FlaskConical size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(item)}
                    aria-label={t('sheet.editItem')}
                    className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    aria-label={t('sheet.removeItem')}
                    className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <X size={12} />
                  </button>
                </div>
                {item.notes && (
                  <p className="mt-1 text-xs text-slate-500 leading-snug">{item.notes}</p>
                )}
              </div>
            )
          if (item.csBonus)
            return (
              <div
                key={item.id}
                className="rounded-lg border border-violet-900/50 bg-violet-950/20 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0">⚗️</span>
                  <span className="flex-1 text-sm text-violet-200 truncate">{item.name}</span>
                  <span className="text-xs text-violet-400 font-medium shrink-0">
                    +{item.csBonus} HC
                  </span>
                  {item.maxDoses != null && (
                    <>
                      <span className="text-xs text-amber-400 font-medium shrink-0 tabular-nums">
                        {item.maxDoses} {t('sheet.doses')}
                      </span>
                      <button
                        onClick={() => consumeDose(item)}
                        aria-label={t('sheet.consumeDose')}
                        className="relative w-5 h-5 rounded bg-amber-900/40 border border-amber-800/60 hover:bg-amber-800/60 active:bg-amber-700/60 text-amber-300 font-bold text-sm transition-colors shrink-0 flex items-center justify-center before:absolute before:inset-[-10px]"
                      >
                        −
                      </button>
                    </>
                  )}
                  {onUseCombatPotion && (
                    <button
                      onClick={() => setCombatPotionConfirm(item.id)}
                      aria-label={t('sheet.useCombatPotion')}
                      title={t('sheet.useCombatPotion')}
                      className="relative text-violet-400 hover:text-violet-300 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                    >
                      <FlaskConical size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(item)}
                    aria-label={t('sheet.editItem')}
                    className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    aria-label={t('sheet.removeItem')}
                    className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                  >
                    <X size={12} />
                  </button>
                </div>
                {item.notes && (
                  <p className="mt-1 text-xs text-slate-500 leading-snug">{item.notes}</p>
                )}
              </div>
            )
          return (
            <div
              key={item.id}
              className="rounded-lg border border-green-900/30 bg-green-950/10 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0">🌿</span>
                <span className="flex-1 text-sm text-green-100 truncate">{item.name}</span>
                {item.maxDoses != null && (
                  <>
                    <span className="text-xs text-amber-400 font-medium shrink-0 tabular-nums">
                      {item.maxDoses} {t('sheet.doses')}
                    </span>
                    <button
                      onClick={() => consumeDose(item)}
                      aria-label={t('sheet.consumeDose')}
                      className="relative w-5 h-5 rounded bg-amber-900/40 border border-amber-800/60 hover:bg-amber-800/60 active:bg-amber-700/60 text-amber-300 font-bold text-sm transition-colors shrink-0 flex items-center justify-center before:absolute before:inset-[-10px]"
                    >
                      −
                    </button>
                  </>
                )}
                <button
                  onClick={() => startEdit(item)}
                  aria-label={t('sheet.editItem')}
                  className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(item.id)}
                  aria-label={t('sheet.removeItem')}
                  className="relative text-slate-600 hover:text-red-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
                >
                  <X size={12} />
                </button>
              </div>
              {item.notes && (
                <p className="mt-1 text-xs text-slate-500 leading-snug">{item.notes}</p>
              )}
            </div>
          )
        })}
        {herbPouch.length === 0 && (
          <div className="text-sm text-slate-600 italic px-3 py-2">Poche vide</div>
        )}
      </div>

      {addingPotion && !isFull && (
        <PotionAddForm
          variant="potion"
          withNotes
          withMaxDoses
          onConfirm={({ name, value, notes, maxDoses }) => {
            onAdd({ id: uuidv4(), name, epRestore: value, notes, maxDoses })
            setAddingPotion(false)
          }}
          onCancel={() => setAddingPotion(false)}
        />
      )}

      {addingCombatPotion && !isFull && (
        <PotionAddForm
          variant="combat"
          withNotes
          withMaxDoses
          onConfirm={({ name, value, notes, maxDoses }) => {
            onAdd({ id: uuidv4(), name, csBonus: value, notes, maxDoses })
            setAddingCombatPotion(false)
          }}
          onCancel={() => setAddingCombatPotion(false)}
        />
      )}

      {!isFull && (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <button
              onClick={() => setAddingPotion((v) => !v)}
              aria-pressed={addingPotion}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors shrink-0 ${addingPotion ? 'border-blue-700 bg-blue-900/30 text-blue-300' : 'border-blue-900/50 text-blue-500 hover:bg-blue-950/30 hover:text-blue-400'}`}
            >
              <Plus size={12} />
              🧪
            </button>
            <button
              onClick={() => setAddingCombatPotion((v) => !v)}
              aria-pressed={addingCombatPotion}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors shrink-0 ${addingCombatPotion ? 'border-orange-700 bg-orange-900/30 text-orange-300' : 'border-orange-900/50 text-orange-500 hover:bg-orange-950/30 hover:text-orange-400'}`}
            >
              <Plus size={12} />
              ⚗️
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder={t('sheet.addHerb')}
              className="min-w-0 flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-green-700"
            />
            <button
              onClick={addItem}
              aria-label={t('sheet.addHerb')}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors shrink-0"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={inputNotes}
              onChange={(e) => setInputNotes(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder={t('sheet.itemNotes')}
              className="min-w-0 flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-green-700 placeholder:text-slate-600"
            />
            <input
              type="number"
              value={inputMaxDoses}
              onChange={(e) => setInputMaxDoses(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              min={1}
              placeholder="–"
              title={t('sheet.maxDoses')}
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 text-center focus:outline-none focus:border-amber-600 placeholder:text-slate-600"
            />
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-slate-900 border border-red-900/60 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-sm text-slate-300 mb-5">
              {t('sheet.confirmRemove')}
              <span className="font-semibold text-slate-100">
                {' '}
                {herbPouch.find((i) => i.id === confirmDeleteId)?.name}
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 text-sm transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  onRemove(confirmDeleteId)
                  setConfirmDeleteId(null)
                }}
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
