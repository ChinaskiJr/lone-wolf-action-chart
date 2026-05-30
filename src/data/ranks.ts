import type {
  GrandMasterRank,
  KaiRank,
  MagnakaiRank,
  NewOrderRank,
} from '@/types/game'

interface RankInfo {
  rank: string
  minDisciplines: number
  fr: string
  en: string
}

export const KAI_RANKS: RankInfo[] = [
  { rank: 'novice', minDisciplines: 0, fr: 'Novice', en: 'Novice' },
  { rank: 'intuite', minDisciplines: 1, fr: 'Intuant', en: 'Intuite' },
  { rank: 'doan', minDisciplines: 2, fr: 'Doyen', en: 'Doan' },
  { rank: 'acolyte', minDisciplines: 3, fr: 'Acolyte', en: 'Acolyte' },
  { rank: 'initiate', minDisciplines: 4, fr: 'Initié', en: 'Initiate' },
  { rank: 'aspirant', minDisciplines: 5, fr: 'Aspirant', en: 'Aspirant' },
  { rank: 'guardian', minDisciplines: 6, fr: 'Gardien', en: 'Guardian' },
  { rank: 'warman', minDisciplines: 7, fr: 'Guerrier', en: 'Warman' },
  { rank: 'savant', minDisciplines: 8, fr: 'Lettré', en: 'Savant' },
  { rank: 'master', minDisciplines: 9, fr: 'Maître', en: 'Master' },
]

export const MAGNAKAI_RANKS: RankInfo[] = [
  { rank: 'kaiMaster', minDisciplines: 0, fr: 'Maître Kaï', en: 'Kai Master' },
  { rank: 'kaiMasterSuperior', minDisciplines: 2, fr: 'Maître Kaï Supérieur', en: 'Kai Master Superior' },
  { rank: 'principalKaiMaster', minDisciplines: 4, fr: 'Maître Kaï Principal', en: 'Principal Kai Master' },
  { rank: 'mentorKaiMaster', minDisciplines: 6, fr: 'Maître Kaï Mentor', en: 'Mentor Kai Master' },
  { rank: 'scion', minDisciplines: 8, fr: 'Scion du Kaï', en: 'Scion-Kai' },
  { rank: 'archmaster', minDisciplines: 10, fr: 'Grand Archmaître', en: 'Archmaster' },
]

export const GRAND_MASTER_RANKS: RankInfo[] = [
  { rank: 'kaiGrandDefender', minDisciplines: 4, fr: 'Grand Défenseur Kaï', en: 'Kai Grand Defender' },
  { rank: 'kaiGrandGuardian', minDisciplines: 5, fr: 'Grand Gardien Kaï', en: 'Kai Grand Guardian' },
  { rank: 'sunKnight', minDisciplines: 6, fr: 'Chevalier du Soleil', en: 'Sun Knight' },
  { rank: 'sunLord', minDisciplines: 7, fr: 'Seigneur du Soleil', en: 'Sun Lord' },
  { rank: 'sunThane', minDisciplines: 8, fr: 'Thane du Soleil', en: 'Sun Thane' },
  { rank: 'grandThane', minDisciplines: 9, fr: 'Grand Thane', en: 'Grand Thane' },
  { rank: 'grandCrown', minDisciplines: 10, fr: 'Grande Couronne', en: 'Grand Crown' },
  { rank: 'sunPrince', minDisciplines: 11, fr: 'Prince du Soleil', en: 'Sun Prince' },
  { rank: 'kaiSupremeMaster', minDisciplines: 12, fr: 'Suprême Maître Kaï', en: 'Kai Supreme Master' },
]

export const NEW_ORDER_RANKS: RankInfo[] = [
  { rank: 'kaiGrandMasterSenior', minDisciplines: 5, fr: 'Grand Maître Kaï Senior', en: 'Kai Grand Master Senior' },
  { rank: 'kaiGrandMasterSuperior', minDisciplines: 6, fr: 'Grand Maître Kaï Supérieur', en: 'Kai Grand Master Superior' },
  { rank: 'kaiGrandSentinel', minDisciplines: 7, fr: 'Grand Sentinelle Kaï', en: 'Kai Grand Sentinel' },
  { rank: 'kaiGrandDefender', minDisciplines: 8, fr: 'Grand Défenseur Kaï', en: 'Kai Grand Defender' },
  { rank: 'kaiGrandGuardian', minDisciplines: 9, fr: 'Grand Gardien Kaï', en: 'Kai Grand Guardian' },
  { rank: 'sunKnight', minDisciplines: 10, fr: 'Chevalier du Soleil', en: 'Sun Knight' },
  { rank: 'sunLord', minDisciplines: 11, fr: 'Seigneur du Soleil', en: 'Sun Lord' },
  { rank: 'sunThane', minDisciplines: 12, fr: 'Thane du Soleil', en: 'Sun Thane' },
  { rank: 'grandThane', minDisciplines: 13, fr: 'Grand Thane', en: 'Grand Thane' },
  { rank: 'grandCrown', minDisciplines: 14, fr: 'Grande Couronne', en: 'Grand Crown' },
  { rank: 'sunPrince', minDisciplines: 15, fr: 'Prince du Soleil', en: 'Sun Prince' },
  { rank: 'kaiSupremeMaster', minDisciplines: 16, fr: 'Suprême Maître Kaï', en: 'Kai Supreme Master' },
]

export function computeKaiRank(disciplineCount: number): KaiRank {
  const rank = [...KAI_RANKS].reverse().find(r => disciplineCount >= r.minDisciplines)
  return (rank?.rank ?? 'novice') as KaiRank
}

export function computeMagnakaiRank(disciplineCount: number): MagnakaiRank {
  const rank = [...MAGNAKAI_RANKS].reverse().find(r => disciplineCount >= r.minDisciplines)
  return (rank?.rank ?? 'kaiMaster') as MagnakaiRank
}

export function computeGrandMasterRank(disciplineCount: number): GrandMasterRank {
  const rank = [...GRAND_MASTER_RANKS].reverse().find(r => disciplineCount >= r.minDisciplines)
  return (rank?.rank ?? 'kaiGrandDefender') as GrandMasterRank
}

export function computeNewOrderRank(disciplineCount: number): NewOrderRank {
  const rank = [...NEW_ORDER_RANKS].reverse().find(r => disciplineCount >= r.minDisciplines)
  return (rank?.rank ?? 'kaiGrandMasterSenior') as NewOrderRank
}
