import { useTranslation } from 'react-i18next'
import { useCharacterStore } from '@/store/characterStore'

export function NotesPanel() {
  const { t } = useTranslation()
  const { character, setNotes } = useCharacterStore()
  if (!character) return null

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="text-xs uppercase tracking-widest text-slate-500">{t('sheet.notes')}</div>
      <textarea
        value={character.notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes de jeu, numéros de sections, objets trouvés..."
        className="flex-1 min-h-64 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-700 resize-none"
      />
      <div className="text-right text-xs text-slate-600">{character.notes.length} caractères</div>
    </div>
  )
}
