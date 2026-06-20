import { MAGNAKAI_WEAPONS } from '@/data/disciplines'

interface Props {
  owned: string[]
  max: number
  hcBonus: number
  lang: 'fr' | 'en'
  onAdd: (key: string) => void
  onRemove: (key: string) => void
}

/**
 * Mastered-weapons picker: pills for owned weapons (with remove) plus a dropdown that
 * adds a weapon on selection. Shared by the sheet (DisciplinesPanel) and the creation
 * wizard (StepDisciplines). The grid-style multi-select used in the book-change and
 * cycle-transition flows is intentionally separate.
 */
export function WeaponmasterySelector({ owned, max, hcBonus, lang, onAdd, onRemove }: Props) {
  const canAdd = owned.length < max
  const available = MAGNAKAI_WEAPONS.filter(w => !owned.includes(w.key))

  return (
    <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {lang === 'fr' ? 'Armes maîtrisées' : 'Mastered weapons'}
          <span className="text-slate-600 ml-1">(+{hcBonus} HC {lang === 'fr' ? 'si portée' : 'if carried'})</span>
        </span>
        <span className="text-xs text-slate-600">{owned.length}/{max}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
        {owned.map(key => {
          const w = MAGNAKAI_WEAPONS.find(ww => ww.key === key)
          return (
            <span key={key} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-800/60 text-xs text-blue-300">
              {w ? (lang === 'fr' ? w.fr : w.en) : key}
              <button type="button" onClick={() => onRemove(key)} className="text-blue-500 hover:text-blue-200 ml-0.5">×</button>
            </span>
          )
        })}
      </div>
      {canAdd && (
        <select
          value=""
          onChange={e => {
            if (e.target.value) onAdd(e.target.value)
          }}
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
        >
          <option value="">— {lang === 'fr' ? 'Ajouter une arme' : 'Add a weapon'} —</option>
          {available.map(w => (
            <option key={w.key} value={w.key}>{lang === 'fr' ? w.fr : w.en}</option>
          ))}
        </select>
      )}
    </div>
  )
}
