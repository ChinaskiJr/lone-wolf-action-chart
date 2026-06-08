import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Swords, ChevronLeft, Save, BookCheck } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { useSavesStore } from '@/store/savesStore'
import { useUIStore } from '@/store/uiStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { BOOKS, CYCLE_LAST_BOOK } from '@/data/books'
import { getTotalEPMax } from '@/utils/character'
import {
  KAI_DISCIPLINES,
  MAGNAKAI_DISCIPLINES,
  GRAND_MASTER_DISCIPLINES,
  NEW_ORDER_DISCIPLINES,
} from '@/data/disciplines'
import { StatsPanel } from './StatsPanel'
import { DisciplinesPanel } from './DisciplinesPanel'
import { EquipmentPanel } from './EquipmentPanel'
import { GoldPanel } from './GoldPanel'
import { NotesPanel } from './NotesPanel'
import { CombatCalculator } from './CombatCalculator'
import { DeathModal } from './DeathModal'
import { CompleteBookModal } from './CompleteBookModal'
import { BookChangeDisciplineModal } from './BookChangeDisciplineModal'
import { BookChangeEquipmentModal } from './BookChangeEquipmentModal'
import { PersistentStatBar } from './PersistentStatBar'
import { MapPanel } from './MapPanel'
import { D10Roll } from './D10Roll'

type SectionId = 'stats' | 'disciplines' | 'equipment' | 'gold' | 'notes'

export function AdventureSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { character, setCharacter, save, setCurrentBook, completeBook, setEnduranceCurrent } = useCharacterStore()
  const { getSave } = useSavesStore()
  const { activeSection, setActiveSection, combatModalOpen, setCombatModalOpen } = useUIStore()
  const [showDeathModal, setShowDeathModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showBookChangeDiscipline, setShowBookChangeDiscipline] = useState(false)
  const [showBookChangeEquipment, setShowBookChangeEquipment] = useState(false)
  const [pendingCycleTransition, setPendingCycleTransition] = useState(false)

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
      const cycleDisciplineMap =
        character!.cycle === 'kai' ? KAI_DISCIPLINES :
        character!.cycle === 'magnakai' ? MAGNAKAI_DISCIPLINES :
        character!.cycle === 'grandmaster' ? GRAND_MASTER_DISCIPLINES :
        NEW_ORDER_DISCIPLINES
      const ownedDiscs = character!.disciplines as string[]
      const hasMissingDisc = Object.keys(cycleDisciplineMap).some(d => !ownedDiscs.includes(d))
      if (hasMissingDisc) {
        setCurrentBook(character!.currentBook + 1)
        setPendingCycleTransition(true)
        setShowBookChangeDiscipline(true)
      } else {
        save()
        navigate(`/transition/${character!.id}`)
      }
    } else {
      const nextBook = character!.currentBook + 1
      setCurrentBook(nextBook)
      setEnduranceCurrent(getTotalEPMax(character!))
      setShowBookChangeDiscipline(true)
    }
  }

  function handleDisciplineConfirmed() {
    setShowBookChangeDiscipline(false)
    if (pendingCycleTransition) {
      setPendingCycleTransition(false)
      save()
      navigate(`/transition/${character!.id}`)
    } else {
      setShowBookChangeEquipment(true)
    }
  }

  function handleEquipmentFinished() {
    setShowBookChangeEquipment(false)
    save()
  }

  const characterName = character.cycle === 'neworder' && (character as any).kaiName
    ? (character as any).kaiName
    : character.name

  const bookSubtitle = [
    t(`cycles.${character.cycle}`),
    t('sheet.currentBook') + ' ' + character.currentBook,
    currentBook?.title[lang],
  ].filter(Boolean).join(' · ')

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-4 gap-3 overflow-y-auto">

      {/* Top bar — left: back + identity / right: actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { save(); navigate('/') }}
          aria-label={t('nav.home')}
          className="shrink-0 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-lg font-semibold text-amber-100 truncate leading-tight">
            {characterName}
          </h1>
          <p className="text-xs text-slate-400 truncate mt-0.5">{bookSubtitle}</p>
        </div>

        {/* Action cluster — visually grouped */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setCombatModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-900/40 border border-red-900/70 text-red-300 hover:bg-red-900/70 text-sm font-medium transition-colors"
          >
            <Swords size={14} />
            <span className="hidden sm:inline">{t('combat.title')}</span>
          </button>

          <div className="w-px h-5 bg-slate-700" />

          <button
            onClick={save}
            aria-label={t('common.save')}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-colors"
          >
            <Save size={16} />
          </button>

          {!character.booksCompleted.includes(character.currentBook) ? (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-900/40 border border-green-900/70 text-green-300 hover:bg-green-900/70 text-sm font-medium transition-colors"
            >
              <BookCheck size={14} />
              <span className="hidden sm:inline">
                {isLastBookOfCycle ? t('transition.proceed') : t('sheet.completeBook')}
              </span>
            </button>
          ) : (
            <span className="hidden sm:flex items-center gap-1 text-xs text-green-500 bg-green-950/40 border border-green-900/60 px-2 py-1.5 rounded-lg">
              ✓ {t('sheet.bookCompleted')}
            </span>
          )}
        </div>
      </div>

      <D10Roll />

      {/* Persistent stat bar */}
      <PersistentStatBar
        character={character}
        onDecrement={() => {
          const next = character.endurance.current - 1
          setEnduranceCurrent(next)
          if (next <= 0) setTimeout(() => setShowDeathModal(true), 150)
        }}
        onIncrement={() => setEnduranceCurrent(
          Math.min(getTotalEPMax(character), character.endurance.current + 1)
        )}
      />

      {/* Section nav */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-800">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`shrink-0 px-4 py-2 text-sm rounded-t-lg transition-colors whitespace-nowrap
              ${activeSection === s.id
                ? 'bg-amber-950/40 text-amber-300 border border-b-0 border-amber-800/50'
                : 'text-slate-400 hover:text-amber-200/70 hover:bg-amber-950/10'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Active section */}
      <div className="flex-1 bg-slate-900/60 rounded-xl border border-amber-900/30 p-5">
        {activeSection === 'stats' && <StatsPanel />}
        {activeSection === 'disciplines' && <DisciplinesPanel />}
        {activeSection === 'equipment' && <EquipmentPanel />}
        {activeSection === 'gold' && <GoldPanel />}
        {activeSection === 'notes' && <NotesPanel />}
      </div>

      <MapPanel bookNumber={character.currentBook} />

      {/* Combat calculator modal */}
      {combatModalOpen && <CombatCalculator onClose={() => setCombatModalOpen(false)} />}

      {/* Death modal (triggered from persistent EP bar) */}
      {showDeathModal && <DeathModal onClose={() => setShowDeathModal(false)} />}

      {/* Complete book confirmation modal */}
      {showCompleteModal && (
        <CompleteBookModal
          isLastBook={isLastBookOfCycle}
          onConfirm={() => { setShowCompleteModal(false); handleCompleteBook() }}
          onCancel={() => setShowCompleteModal(false)}
        />
      )}

      {/* Book change wizard — discipline step */}
      {showBookChangeDiscipline && (
        <BookChangeDisciplineModal onConfirm={handleDisciplineConfirmed} />
      )}

      {/* Book change wizard — equipment step */}
      {showBookChangeEquipment && (
        <BookChangeEquipmentModal onDone={handleEquipmentFinished} onSkip={handleEquipmentFinished} />
      )}
    </div>
  )
}
