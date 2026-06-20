interface Props {
  value: number
  kind: 'hc' | 'pe'
  /** Whether the bonus is currently applied (item equipped or permanent). Default true. */
  active?: boolean
  /** Show the permanent (∞) marker. Default false. */
  permanent?: boolean
  /** Fade the badge when inactive. Default true (set false for weapons). */
  dimWhenInactive?: boolean
}

/**
 * Colored HC/PE bonus pill shared by the equipment editors.
 * Positive bonuses use the kind color (amber for HC, green for PE),
 * negative bonuses use red, and inactive bonuses fall back to slate.
 */
export function BonusBadge({ value, kind, active = true, permanent = false, dimWhenInactive = true }: Props) {
  if (value === 0) return null

  const label = `${value > 0 ? '+' : ''}${value} ${kind === 'hc' ? 'HC' : 'PE'}${permanent ? ' ∞' : ''}`

  const color = active
    ? value > 0
      ? kind === 'hc' ? 'text-amber-400 bg-amber-900/40' : 'text-green-400 bg-green-900/40'
      : 'text-red-400 bg-red-900/40'
    : `text-slate-500 bg-slate-700/40${dimWhenInactive ? ' opacity-50' : ''}`

  return (
    <span className={`text-xs font-semibold rounded px-1 transition-opacity ${color}`}>
      {label}
    </span>
  )
}
