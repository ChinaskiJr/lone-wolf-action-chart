import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import type { Cycle } from '@/types/game'
import { BOOKS_BY_CYCLE } from '@/data/books'

const CYCLE_INFO: { id: Cycle; books: string; color: string; activeBg: string }[] = [
  {
    id: 'kai',
    books: '1–5',
    color: 'border-blue-700 hover:border-blue-500',
    activeBg: 'bg-blue-900/50 border-blue-500',
  },
  {
    id: 'magnakai',
    books: '6–12',
    color: 'border-green-700 hover:border-green-500',
    activeBg: 'bg-green-900/50 border-green-500',
  },
  {
    id: 'grandmaster',
    books: '13–20',
    color: 'border-amber-700 hover:border-amber-500',
    activeBg: 'bg-amber-900/50 border-amber-500',
  },
  {
    id: 'neworder',
    books: '21–32',
    color: 'border-red-700 hover:border-red-500',
    activeBg: 'bg-red-900/50 border-red-500',
  },
]

interface Props {
  initialCycle: Cycle
  initialBook: number
  onNext: (cycle: Cycle, book: number) => void
}

export function StepCycleBook({ initialCycle, initialBook, onNext }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const [cycle, setCycle] = useState<Cycle>(initialCycle)
  const [book, setBook] = useState(initialBook)

  function handleCycleChange(c: Cycle) {
    setCycle(c)
    setBook(BOOKS_BY_CYCLE[c][0].id)
  }

  const booksForCycle = BOOKS_BY_CYCLE[cycle]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="flex items-center gap-2 text-xl font-serif font-semibold text-amber-100">
        <BookOpen size={18} />
        {t('creation.chooseCycle')}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {CYCLE_INFO.map(({ id, books, color, activeBg }) => (
          <button
            key={id}
            onClick={() => handleCycleChange(id)}
            className={`rounded-lg border-2 p-3 text-left transition-all
              ${cycle === id ? activeBg : `border-slate-700 bg-slate-800/50 ${color}`}`}
          >
            <div className="font-semibold text-slate-100 text-sm">{t(`cycles.${id}`)}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {t('home.book')} {books}
            </div>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {t('creation.chooseBook')}
        </label>
        <select
          value={book}
          onChange={(e) => setBook(Number(e.target.value))}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
        >
          {booksForCycle.map((b) => (
            <option key={b.id} value={b.id}>
              {b.id}. {b.title[lang]}
            </option>
          ))}
        </select>
      </div>

      {cycle === 'magnakai' && (
        <div className="text-xs text-amber-700 bg-amber-950/30 border border-amber-900 rounded p-3">
          ⚠ Démarrer au cycle Magnakaï sans avoir joué le cycle Kaï. Vos disciplines Kaï seront
          vides.
        </div>
      )}

      <button
        onClick={() => onNext(cycle, book)}
        className="self-end px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
      >
        {t('creation.next')}
      </button>
    </div>
  )
}
