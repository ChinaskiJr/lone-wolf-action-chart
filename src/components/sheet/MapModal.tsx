import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { WorldMapViewer } from './WorldMapViewer'

interface Props {
  onClose: () => void
}

export function MapModal({ onClose }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 h-12 border-b border-slate-800 shrink-0">
        <span className="text-sm font-medium text-amber-200">{t('sheet.worldMap')}</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <WorldMapViewer className="flex-1 min-h-0 w-full rounded-none" />
    </div>
  )
}
