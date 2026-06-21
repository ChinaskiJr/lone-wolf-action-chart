import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  max: number
  min?: number
  onChange: (value: number) => void
  /** Extra condition that disables the increment button (e.g. no free slots). */
  incrementDisabled?: boolean
  /** Render a "/ max" suffix. Default true. */
  showMax?: boolean
}

/** Compact bounded [- value + /max] stepper used in the confiscation/recover modals. */
export function NumberStepper({
  value,
  max,
  min = 0,
  onChange,
  incrementDisabled = false,
  showMax = true,
}: Props) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="-"
        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={13} />
      </button>
      <span className="text-sm text-amber-100 font-semibold tabular-nums w-6 text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max || incrementDisabled}
        aria-label="+"
        className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={13} />
      </button>
      {showMax && <span className="text-xs text-slate-500 tabular-nums">/ {max}</span>}
    </div>
  )
}
