import type { Cycle } from '@/types/game'

export interface CombatModifier {
  id: string
  disciplineKey: string
  visibleFor: Cycle[]
  hcBonus: number
  epCostPerRound?: number
  exclusiveWith?: string[]
  labelFr: string
  labelEn: string
  conditionFr?: string
  conditionEn?: string
}

export const COMBAT_MODIFIERS: CombatModifier[] = [
  {
    id: 'weaponskill_2',
    disciplineKey: 'weaponskill',
    visibleFor: ['kai', 'magnakai'],
    hcBonus: 2,
    labelFr: 'Maîtrise des Armes',
    labelEn: 'Weaponskill',
    conditionFr: 'arme maîtrisée portée',
    conditionEn: 'mastered weapon carried',
  },
  {
    id: 'mindblast_2',
    disciplineKey: 'mindblast',
    visibleFor: ['kai', 'magnakai'],
    hcBonus: 2,
    labelFr: 'Puissance Psychique',
    labelEn: 'Mindblast',
    conditionFr: 'ennemi non immunisé',
    conditionEn: 'enemy not immune',
  },
  {
    id: 'weaponmastery_3',
    disciplineKey: 'weaponmastery',
    visibleFor: ['magnakai', 'grandmaster'],
    hcBonus: 3,
    labelFr: 'Science des Armes',
    labelEn: 'Weaponmastery',
    conditionFr: 'arme maîtrisée portée',
    conditionEn: 'mastered weapon carried',
  },
  {
    id: 'psiSurge_2',
    disciplineKey: 'psiSurge',
    visibleFor: ['magnakai', 'grandmaster'],
    hcBonus: 2,
    exclusiveWith: ['psiSurge_4'],
    labelFr: 'Foudroiement Psychique',
    labelEn: 'Psi-surge',
    conditionFr: 'variante faible',
    conditionEn: 'weak variant',
  },
  {
    id: 'psiSurge_4',
    disciplineKey: 'psiSurge',
    visibleFor: ['magnakai', 'grandmaster'],
    hcBonus: 4,
    epCostPerRound: 2,
    exclusiveWith: ['psiSurge_2'],
    labelFr: 'Foudroiement Psychique',
    labelEn: 'Psi-surge',
    conditionFr: '−2 PE/round',
    conditionEn: '−2 EP/round',
  },
  {
    id: 'grandWeaponmastery_5',
    disciplineKey: 'grandWeaponmastery',
    visibleFor: ['grandmaster', 'neworder'],
    hcBonus: 5,
    labelFr: 'G.D. Science des Armes',
    labelEn: 'Grand Weaponmastery',
    conditionFr: 'arme maîtrisée portée',
    conditionEn: 'mastered weapon carried',
  },
  {
    id: 'kaiSurge_4',
    disciplineKey: 'kaiSurge',
    visibleFor: ['grandmaster', 'neworder'],
    hcBonus: 4,
    exclusiveWith: ['kaiSurge_8'],
    labelFr: 'G.D. Foudroiement',
    labelEn: 'Kai-surge',
    conditionFr: 'variante faible',
    conditionEn: 'weak variant',
  },
  {
    id: 'kaiSurge_8',
    disciplineKey: 'kaiSurge',
    visibleFor: ['grandmaster', 'neworder'],
    hcBonus: 8,
    epCostPerRound: 1,
    exclusiveWith: ['kaiSurge_4'],
    labelFr: 'G.D. Foudroiement',
    labelEn: 'Kai-surge',
    conditionFr: '−1 PE/round',
    conditionEn: '−1 EP/round',
  },
  {
    id: 'unarmed_4',
    disciplineKey: 'unarmed',
    visibleFor: ['kai', 'magnakai', 'grandmaster', 'neworder'],
    hcBonus: -4,
    labelFr: 'Mains nues',
    labelEn: 'Unarmed',
    conditionFr: 'aucune arme',
    conditionEn: 'no weapon',
  },
]
