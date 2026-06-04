import { useEffect, useRef, useState } from 'react'
import { Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react'
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
    webMaps[`${base}.jpg`] ??
    trimmedMaps[`/src/assets/maps/trimmed/${bookNumber}.png`]
  )
}

interface Props {
  bookNumber: number
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 4
const ZOOM_STEP = 0.25

function BookMapModal({ mapUrl, bookNumber, onClose }: { mapUrl: string; bookNumber: number; onClose: () => void }) {
  const { t } = useTranslation()
  const [scale, setScale] = useState(1)
  const [fitSize, setFitSize] = useState<{ w: number; h: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoom = (delta: number) =>
    setScale(s => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round((s + delta) * 100) / 100)))

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    const pad = 32
    const cw = window.innerWidth - pad
    const ch = window.innerHeight - 48 - pad // 48px header
    const ratio = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
    setFitSize({ w: Math.round(img.naturalWidth * ratio), h: Math.round(img.naturalHeight * ratio) })
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if ((e.key === '+' || e.key === '=') && !e.ctrlKey) zoom(ZOOM_STEP)
      if (e.key === '-' && !e.ctrlKey) zoom(-ZOOM_STEP)
      if (e.key === '0') setScale(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      zoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const imgW = fitSize ? fitSize.w * scale : undefined
  const imgH = fitSize ? fitSize.h * scale : undefined

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 h-12 border-b border-slate-800 shrink-0">
        <span className="text-sm font-medium text-amber-200">
          {t('sheet.map')} — {t('home.book')} {bookNumber}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => zoom(-ZOOM_STEP)}
            disabled={scale <= ZOOM_MIN}
            title={t('sheet.zoomOut')}
            className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setScale(1)}
            title="Reset zoom"
            className="text-xs text-slate-400 hover:text-slate-200 w-10 text-center tabular-nums py-1 rounded hover:bg-slate-800 transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => zoom(ZOOM_STEP)}
            disabled={scale >= ZOOM_MAX}
            title={t('sheet.zoomIn')}
            className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ZoomIn size={14} />
          </button>
          <div className="w-px h-5 bg-slate-700 mx-1" />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto">
        <div
          className="flex items-center justify-center p-4"
          style={{ minHeight: '100%', minWidth: imgW ? imgW + 32 : '100%' }}
        >
          <img
            src={mapUrl}
            alt={`${t('sheet.map')} ${bookNumber}`}
            onLoad={handleImageLoad}
            style={
              fitSize
                ? { width: imgW, height: imgH, transition: 'width 0.15s ease, height 0.15s ease' }
                : { maxWidth: '100%', maxHeight: 'calc(100vh - 112px)' }
            }
            className="rounded-lg select-none block"
            draggable={false}
          />
        </div>
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
