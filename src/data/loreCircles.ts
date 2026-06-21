import type { LoreCircleData } from '@/types/game'

export const LORE_CIRCLES: LoreCircleData[] = [
  {
    id: 'fire',
    fr: 'Cercle du Feu',
    en: 'Circle of Fire',
    disciplines: ['weaponmastery', 'huntmastery'],
    bonusCS: 1,
    bonusEP: 2,
  },
  {
    id: 'light',
    fr: 'Cercle de la Lumière',
    en: 'Circle of Light',
    disciplines: ['animalControl', 'curing'],
    bonusCS: 0,
    bonusEP: 3,
  },
  {
    id: 'solaris',
    fr: 'Cercle de Solaris',
    en: 'Circle of Solaris',
    disciplines: ['invisibility', 'huntmastery', 'pathsmanship'],
    bonusCS: 1,
    bonusEP: 3,
  },
  {
    id: 'spirit',
    fr: "Cercle de l'Esprit",
    en: 'Circle of the Spirit',
    disciplines: ['psiSurge', 'psiScreen', 'nexus', 'divination'],
    bonusCS: 3,
    bonusEP: 3,
  },
]

export function getCompletedCircles(disciplines: string[]): LoreCircleData[] {
  return LORE_CIRCLES.filter((circle) => circle.disciplines.every((d) => disciplines.includes(d)))
}

export function computeLoreCircleBonuses(disciplines: string[]): {
  bonusCS: number
  bonusEP: number
} {
  const completed = getCompletedCircles(disciplines)
  return completed.reduce(
    (acc, c) => ({ bonusCS: acc.bonusCS + c.bonusCS, bonusEP: acc.bonusEP + c.bonusEP }),
    { bonusCS: 0, bonusEP: 0 }
  )
}
