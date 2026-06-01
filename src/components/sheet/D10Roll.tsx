import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { rollD10 } from '@/utils/rng'

export function D10Roll() {
  const { t } = useTranslation()
  const [result, setResult] = useState<number | null>(null)
  const [prevResult, setPrevResult] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [rollKey, setRollKey] = useState(0)

  function handleRoll() {
    const n = rollD10()
    setPrevResult(result)
    setResult(n)
    setRolling(true)
    setRollKey(k => k + 1)
    setTimeout(() => setRolling(false), 220)
  }

  return (
    <button
      onClick={handleRoll}
      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/60 transition-colors"
    >
      <span className="text-xs uppercase tracking-widest text-slate-500 shrink-0">D10</span>
      <span className="flex-1 text-xs text-slate-400 text-left">
        {result === null ? t('sheet.d10.roll') : t('sheet.d10.reroll')}
      </span>
      <div className="relative h-9 w-7 overflow-hidden shrink-0">
        {rolling && prevResult !== null && (
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-mono font-bold text-amber-100 animate-d10-exit pointer-events-none">
            {prevResult}
          </span>
        )}
        <span
          key={rollKey}
          className={`absolute inset-0 flex items-center justify-center text-3xl font-mono font-bold ${
            result !== null
              ? `text-amber-100${rollKey > 0 ? ' animate-d10-enter' : ''}`
              : 'text-slate-600'
          }`}
        >
          {result !== null ? result : '—'}
        </span>
      </div>
    </button>
  )
}
