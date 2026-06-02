import { useEffect, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MapModal } from './MapModal'
import { WorldMapTabs } from './WorldMapTabs'

// Web-sourced maps (higher quality, books 1–7 from magnamund.com)
const webMaps = import.meta.glob('@/assets/maps/web/*', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Trimmed scans (fallback for books without a web source)
const trimmedMaps = import.meta.glob('@/assets/maps/trimmed/*.png', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

function resolveMapUrl(bookNumber: number): string | undefined {
  const base = `/src/assets/maps/web/${bookNumber}`
  return (
    webMaps[`${base}.avif`] ??
    webMaps[`${base}.webp`] ??
    trimmedMaps[`/src/assets/maps/trimmed/${bookNumber}.png`]
  )
}

interface Props {
  bookNumber: number
}

function BookMapModal({ mapUrl, bookNumber, onClose }: { mapUrl: string; bookNumber: number; onClose: () => void }) {
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
        <span className="text-sm font-medium text-amber-200">
          {t('sheet.map')} — {t('home.book')} {bookNumber}
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-4">
        <img
          src={mapUrl}
          alt={`${t('sheet.map')} ${bookNumber}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  )
}

export function MapPanel({ bookNumber }: Props) {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const mapUrl = resolveMapUrl(bookNumber)

  if (!mapUrl) return null

  return (
    <>
      <div className="bg-slate-900/60 rounded-xl border border-amber-900/30 p-5">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
          {t('sheet.map')} — {t('home.book')} {bookNumber}
        </p>
        <div className="relative group mb-5">
          <img
            src={mapUrl}
            alt={`${t('sheet.map')} ${bookNumber}`}
            className="w-full h-auto rounded-lg cursor-zoom-in"
            onClick={() => setShowBookModal(true)}
          />
          <button
            onClick={() => setShowBookModal(true)}
            title={t('sheet.fullscreen')}
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 bg-black/60 text-slate-400 hover:text-slate-200 hover:bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
          {t('sheet.worldMap')}
        </p>
        <WorldMapTabs
          areaClassName="aspect-square w-full"
          action={
            <button
              onClick={() => setShowModal(true)}
              title={t('sheet.fullscreen')}
              className="flex items-center justify-center w-6 h-6 text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 rounded transition-colors"
            >
              <Maximize2 size={13} />
            </button>
          }
        />
      </div>

      {showModal && <MapModal onClose={() => setShowModal(false)} />}
      {showBookModal && (
        <BookMapModal
          mapUrl={mapUrl}
          bookNumber={bookNumber}
          onClose={() => setShowBookModal(false)}
        />
      )}
    </>
  )
}
