import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Swords, ChevronLeft, Save, BookCheck } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { useSavesStore } from '@/store/savesStore'
import { useUIStore } from '@/store/uiStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { BOOKS, CYCLE_LAST_BOOK } from '@/data/books'
import { StatsPanel } from './StatsPanel'
import { DisciplinesPanel } from './DisciplinesPanel'
import { EquipmentPanel } from './EquipmentPanel'
import { GoldPanel } from './GoldPanel'
import { NotesPanel } from './NotesPanel'
import { CombatCalculator } from './CombatCalculator'

type SectionId = 'stats' | 'disciplines' | 'equipment' | 'gold' | 'notes'

export function AdventureSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { character, setCharacter, save, setCurrentBook, completeBook } = useCharacterStore()
  const { getSave } = useSavesStore()
  const { activeSection, setActiveSection, combatModalOpen, setCombatModalOpen } = useUIStore()

  useAutoSave()

  useEffect(() => {
    if (!character && id) {
      const saved = getSave(id)
      if (saved) setCharacter(saved)
      else navigate('/')
    }
  }, [id, character, getSave, setCharacter, navigate])

  if (!character) {
    return <div className="flex-1 flex items-center justify-center text-slate-500">{t('common.loading')}</div>
  }

  const lang = i18n.language as 'fr' | 'en'
  const currentBook = BOOKS.find(b => b.id === character.currentBook)
  const isLastBookOfCycle = character.currentBook === CYCLE_LAST_BOOK[character.cycle]

  const sections: { id: SectionId; label: string }[] = [
    { id: 'stats', label: t('sheet.stats') },
    { id: 'disciplines', label: t('sheet.disciplines') },
    { id: 'equipment', label: t('sheet.equipment') },
    { id: 'gold', label: t('sheet.gold') },
    { id: 'notes', label: t('sheet.notes') },
  ]

  function handleCompleteBook() {
    completeBook(character!.currentBook)
    if (isLastBookOfCycle) {
      save()
      navigate(`/transition/${character!.id}`)
    } else {
      const nextBook = character!.currentBook + 1
      setCurrentBook(nextBook)
      save()
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-4 gap-4">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => { save(); navigate('/') }}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-xl font-semibold text-amber-100 truncate">
            {character.cycle === 'neworder' && (character as any).kaiName
              ? (character as any).kaiName
              : character.name}
          </h1>
          <div className="text-xs text-slate-400">
            {t(`cycles.${character.cycle}`)} —{' '}
            {t('sheet.currentBook')} {character.currentBook}
            {currentBook ? ` : ${currentBook.title[lang]}` : ''}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCombatModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/50 border border-red-800 text-red-300 hover:bg-red-800/60 text-sm transition-colors"
          >
            <Swords size={14} />
            {t('combat.title')}
          </button>
          <button
            onClick={() => { save() }}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-700 transition-colors"
            title={t('common.save')}
          >
            <Save size={16} />
          </button>
          {!character.booksCompleted.includes(character.currentBook) && (
            <button
              onClick={handleCompleteBook}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-900/50 border border-green-800 text-green-300 hover:bg-green-800/60 text-sm transition-colors"
            >
              <BookCheck size={14} />
              {isLastBookOfCycle ? t('transition.proceed') : t('sheet.completeBook')}
            </button>
          )}
          {character.booksCompleted.includes(character.currentBook) && (
            <span className="text-xs text-green-500 bg-green-950/40 border border-green-900 px-2 py-1 rounded">
              ✓ {t('sheet.bookCompleted')}
            </span>
          )}
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-800">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`shrink-0 px-4 py-2 text-sm rounded-t-lg transition-colors whitespace-nowrap
              ${activeSection === s.id
                ? 'bg-slate-800 text-amber-300 border border-b-0 border-slate-700'
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Active section */}
      <div className="flex-1 bg-slate-900/60 rounded-xl border border-slate-800 p-5">
        {activeSection === 'stats' && <StatsPanel />}
        {activeSection === 'disciplines' && <DisciplinesPanel />}
        {activeSection === 'equipment' && <EquipmentPanel />}
        {activeSection === 'gold' && <GoldPanel />}
        {activeSection === 'notes' && <NotesPanel />}
      </div>

      {/* Combat calculator modal */}
      {combatModalOpen && <CombatCalculator onClose={() => setCombatModalOpen(false)} />}
    </div>
  )
}
