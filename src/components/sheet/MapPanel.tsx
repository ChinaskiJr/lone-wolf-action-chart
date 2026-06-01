import { useTranslation } from 'react-i18next'

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
  const mapUrl = resolveMapUrl(bookNumber)

  if (!mapUrl) return null

  return (
    <div className="bg-slate-900/60 rounded-xl border border-amber-900/30 p-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
        {t('sheet.map')} — {t('home.book')} {bookNumber}
      </p>
      <img
        src={mapUrl}
        alt={`${t('sheet.map')} ${bookNumber}`}
        className="w-full h-auto rounded-lg"
      />
    </div>
  )
}
