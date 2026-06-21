import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { worldMaps } from '@/data/worldMaps'
import { WorldMapViewer } from './WorldMapViewer'

interface Props {
  // Sizes the viewer area (e.g. 'aspect-square w-full' inline, 'flex-1 min-h-0 w-full' fullscreen).
  areaClassName?: string
  // Optional control rendered at the right of the tab bar (e.g. the fullscreen button).
  action?: ReactNode
}

export function WorldMapTabs({ areaClassName, action }: Props) {
  const { t } = useTranslation()
  const [active, setActive] = useState(worldMaps[0].id)

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800">
        {worldMaps.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`shrink-0 px-4 py-2 text-sm rounded-t-lg transition-colors whitespace-nowrap
              ${
                active === m.id
                  ? 'bg-amber-950/40 text-amber-300 border border-b-0 border-amber-800/50'
                  : 'text-slate-400 hover:text-amber-200/70 hover:bg-amber-950/10'
              }`}
          >
            {t(m.labelKey)}
          </button>
        ))}
        {action && <div className="ml-auto pl-2">{action}</div>}
      </div>

      {/* Both viewers stay mounted so each keeps its own zoom/position; the
          inactive one is hidden but retains its size (no display:none, which
          would zero the container and break reflow). */}
      <div className={`relative mt-3 ${areaClassName ?? ''}`}>
        {worldMaps.map((m) => (
          <div
            key={m.id}
            className={`absolute inset-0 ${active === m.id ? '' : 'opacity-0 pointer-events-none'}`}
          >
            <WorldMapViewer
              src={m.src}
              width={m.width}
              height={m.height}
              alt={t(m.labelKey)}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
