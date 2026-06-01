import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MapModal } from './MapModal'
import { WorldMapViewer } from './WorldMapViewer'

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

export function MapPanel({ bookNumber }: Props) {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const mapUrl = resolveMapUrl(bookNumber)

  if (!mapUrl) return null

  return (
    <>
      <div className="bg-slate-900/60 rounded-xl border border-amber-900/30 p-5">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
          {t('sheet.map')} — {t('home.book')} {bookNumber}
        </p>
        <img
          src={mapUrl}
          alt={`${t('sheet.map')} ${bookNumber}`}
          className="w-full h-auto rounded-lg mb-5"
        />

        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {t('sheet.worldMap')}
          </p>
          <button
            onClick={() => setShowModal(true)}
            title={t('sheet.fullscreen')}
            className="flex items-center justify-center w-6 h-6 text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 rounded transition-colors"
          >
            <Maximize2 size={13} />
          </button>
        </div>
        <WorldMapViewer className="aspect-square w-full" />
      </div>

      {showModal && <MapModal onClose={() => setShowModal(false)} />}
    </>
  )
}
