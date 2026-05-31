import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Download, Trash2, BookOpen } from 'lucide-react'
import type { Character } from '@/types/character'
import { BOOKS } from '@/data/books'
import { KAI_RANKS, MAGNAKAI_RANKS, GRAND_MASTER_RANKS, NEW_ORDER_RANKS } from '@/data/ranks'

const CYCLE_COLORS: Record<string, string> = {
  kai: 'border-blue-700 bg-blue-900/20',
  magnakai: 'border-green-700 bg-green-900/20',
  grandmaster: 'border-amber-700 bg-amber-900/20',
  neworder: 'border-red-700 bg-red-900/20',
}

const CYCLE_BADGE: Record<string, string> = {
  kai: 'bg-blue-800/50 text-blue-300',
  magnakai: 'bg-green-800/50 text-green-300',
  grandmaster: 'bg-amber-800/50 text-amber-300',
  neworder: 'bg-red-800/50 text-red-300',
}

function getRankLabel(char: Character, lang: string): string {
  const ranks =
    char.cycle === 'kai' ? KAI_RANKS :
    char.cycle === 'magnakai' ? MAGNAKAI_RANKS :
    char.cycle === 'grandmaster' ? GRAND_MASTER_RANKS :
    NEW_ORDER_RANKS
  const info = ranks.find(r => r.rank === char.rank)
  return info ? (lang === 'fr' ? info.fr : info.en) : char.rank
}

interface Props {
  character: Character
  onContinue: () => void
  onExport: () => void
  onDelete: () => void
}

export function SaveCard({ character, onContinue, onExport, onDelete }: Props) {
  const { t, i18n } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const lang = i18n.language as 'fr' | 'en'
  const book = BOOKS.find(b => b.id === character.currentBook)
  const bookTitle = book ? book.title[lang] : `Livre ${character.currentBook}`

  const updatedDate = new Date(character.updatedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className={`rounded-lg border p-4 flex flex-col gap-3 ${CYCLE_COLORS[character.cycle]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-serif font-semibold text-amber-100 truncate">
            {character.cycle === 'neworder' && (character as any).kaiName
              ? (character as any).kaiName
              : character.name}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{getRankLabel(character, lang)}</div>
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CYCLE_BADGE[character.cycle]}`}>
          {t(`cycles.${character.cycle}`)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <BookOpen size={12} />
        <span className="truncate">{t('home.book')} {character.currentBook} — {bookTitle}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 rounded p-2">
        <div>
          <span className="text-slate-500">HC</span>{' '}
          <span className="text-slate-200 font-medium tabular-nums">
            {character.combatSkill.base + character.combatSkill.bonus}
          </span>
        </div>
        <div>
          <span className="text-slate-500">PE</span>{' '}
          <span className="text-slate-200 font-medium tabular-nums">
            {character.endurance.current}/{character.endurance.max}
          </span>
        </div>
      </div>

      <div className="text-xs text-slate-500">{t('home.lastPlayed')} : {updatedDate}</div>

      {confirmDelete ? (
        <div className="flex gap-2">
          <button
            onClick={() => { onDelete(); setConfirmDelete(false) }}
            className="flex-1 py-1.5 text-xs rounded bg-red-700 hover:bg-red-600 text-white transition-colors"
          >
            {t('common.confirm')}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 py-1.5 text-xs rounded border border-slate-600 text-slate-400 hover:text-slate-300 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
          >
            <Play size={13} />
            {t('home.continue')}
          </button>
          <button
            onClick={onExport}
            title={t('home.export')}
            className="p-2 rounded border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-700 transition-colors"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            title={t('home.delete')}
            className="p-2 rounded border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-700 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
