import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

export interface PotionFormResult {
  name: string
  value: number
  notes?: string
  maxDoses?: number
}

interface Props {
  /** 'potion' restores EP, 'combat' grants a CS bonus. */
  variant: 'potion' | 'combat'
  /** Show an extra notes field (used by the herb pouch). */
  withNotes?: boolean
  /** Show an optional max doses field alongside notes. */
  withMaxDoses?: boolean
  onConfirm: (result: PotionFormResult) => void
  onCancel: () => void
}

const VARIANTS = {
  potion: {
    emoji: '🧪',
    nameKey: 'sheet.potion',
    unit: 'PE',
    defaultValue: 5,
    container: 'border-blue-900/40 bg-blue-950/10',
    focus: 'focus:border-blue-600',
    valueColor: 'text-green-400',
    okBtn: 'bg-blue-700 hover:bg-blue-600',
  },
  combat: {
    emoji: '⚗️',
    nameKey: 'sheet.combatPotion',
    unit: 'HC',
    defaultValue: 2,
    container: 'border-orange-900/40 bg-orange-950/10',
    focus: 'focus:border-orange-600',
    valueColor: 'text-orange-400',
    okBtn: 'bg-orange-700 hover:bg-orange-600',
  },
} as const

/** Inline form for adding a potion (EP restore) or combat potion (CS bonus) to a container. */
export function PotionAddForm({
  variant,
  withNotes = false,
  withMaxDoses = false,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation()
  const cfg = VARIANTS[variant]
  const [name, setName] = useState('')
  const [value, setValue] = useState<number>(cfg.defaultValue)
  const [notes, setNotes] = useState('')
  const [maxDosesStr, setMaxDosesStr] = useState('')

  function confirm() {
    const maxDoses =
      withMaxDoses && maxDosesStr.trim() !== ''
        ? Math.max(1, parseInt(maxDosesStr, 10))
        : undefined
    onConfirm({
      name: name.trim() || t(cfg.nameKey),
      value,
      notes: withNotes ? notes.trim() || undefined : undefined,
      maxDoses,
    })
  }

  return (
    <div className={`mb-2 p-2.5 rounded-lg border space-y-1.5 ${cfg.container}`}>
      <div className="flex gap-2">
        <span className="text-lg shrink-0">{cfg.emoji}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && confirm()}
          placeholder={t(cfg.nameKey)}
          className={`flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none ${cfg.focus}`}
        />
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-xs ${cfg.valueColor}`}>+</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Math.max(1, Number(e.target.value)))}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => e.key === 'Enter' && confirm()}
            min={1}
            className={`w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm font-bold text-center focus:outline-none ${cfg.valueColor} ${cfg.focus}`}
          />
          <span className="text-xs text-slate-500">{cfg.unit}</span>
        </div>
        <button
          onClick={confirm}
          className={`px-2 py-1 rounded text-white text-xs font-medium transition-colors shrink-0 ${cfg.okBtn}`}
        >
          OK
        </button>
        <button
          onClick={onCancel}
          aria-label={t('common.cancel')}
          className="relative text-slate-600 hover:text-slate-400 transition-colors shrink-0 before:absolute before:inset-[-10px]"
        >
          <X size={14} />
        </button>
      </div>
      {withNotes && (
        <div className="flex items-center gap-2">
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('sheet.itemNotes')}
            className={`flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none ${cfg.focus} placeholder:text-slate-600`}
          />
          {withMaxDoses && (
            <input
              type="number"
              value={maxDosesStr}
              onChange={(e) => setMaxDosesStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirm()}
              min={1}
              placeholder="–"
              title={t('sheet.maxDoses')}
              className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 text-center focus:outline-none focus:border-amber-600 placeholder:text-slate-600"
            />
          )}
        </div>
      )}
    </div>
  )
}
