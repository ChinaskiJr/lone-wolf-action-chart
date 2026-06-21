import { useEffect } from 'react'
import { X } from 'lucide-react'

export type ToastVariant = 'info' | 'error' | 'success'

interface Props {
  message: string
  variant?: ToastVariant
  action?: { label: string; onClick: () => void }
  onDismiss: () => void
  duration?: number // ms, 0 = persist until dismissed
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  info: 'bg-slate-800 border-slate-700 text-slate-200',
  success: 'bg-green-950 border-green-800 text-green-100',
  error: 'bg-red-950  border-red-800   text-red-100',
}

export function Toast({ message, variant = 'info', action, onDismiss, duration = 5000 }: Props) {
  useEffect(() => {
    if (!duration) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm w-[calc(100vw-2rem)] animate-victory ${VARIANT_CLASSES[variant]}`}
    >
      <span className="flex-1 text-sm">{message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick()
            onDismiss()
          }}
          className="text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100 shrink-0"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        aria-label="Fermer"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}
