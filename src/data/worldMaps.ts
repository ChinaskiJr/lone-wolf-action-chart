import outspacedMap from '@/assets/maps/world/outspaced.avif'
import holmgaardMap from '@/assets/maps/world/magnamund.jpg'

export interface WorldMap {
  id: 'outspaced' | 'holmgaard'
  labelKey: string
  src: string
  width: number
  height: number
}

// The first entry is the map selected by default.
export const worldMaps: WorldMap[] = [
  { id: 'outspaced', labelKey: 'sheet.mapOutspaced', src: outspacedMap, width: 5234, height: 5234 },
  { id: 'holmgaard', labelKey: 'sheet.mapHolmgaard', src: holmgaardMap, width: 4000, height: 4957 },
]
