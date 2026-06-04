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

// Official Kai numbering: rank position = number of Disciplines mastered (1-10).
// A starting Kai has 5 Disciplines (Initiate).
export const KAI_RANKS: RankInfo[] = [
  { rank: 'novice',    minDisciplines: 1,  fr: 'Postulant',  en: 'Novice' },
  { rank: 'intuite',   minDisciplines: 2,  fr: 'Novice',     en: 'Intuite' },
  { rank: 'doan',      minDisciplines: 3,  fr: 'Apprenti',   en: 'Doan' },
  { rank: 'acolyte',   minDisciplines: 4,  fr: 'Disciple',   en: 'Acolyte' },
  { rank: 'initiate',  minDisciplines: 5,  fr: 'Initié',     en: 'Initiate' },
  { rank: 'aspirant',  minDisciplines: 6,  fr: 'Aspirant',   en: 'Aspirant' },
  { rank: 'guardian',  minDisciplines: 7,  fr: 'Gardien',    en: 'Guardian' },
  { rank: 'warman',    minDisciplines: 8,  fr: 'Guerrier',   en: 'Warman' },
  { rank: 'savant',    minDisciplines: 9,  fr: 'Savant',     en: 'Savant' },
  { rank: 'master',    minDisciplines: 10, fr: 'Maître',     en: 'Master' },
]

// Official Magnakai numbering: rank position = number of Disciplines mastered (1-10).
// A starting Magnakai has 3 Disciplines (Kai Master Superior).
export const MAGNAKAI_RANKS: RankInfo[] = [
  { rank: 'kaiMaster',        minDisciplines: 1,  fr: 'Maître Kaï',                        en: 'Kai Master' },
  { rank: 'kaiMasterSenior',  minDisciplines: 2,  fr: "Maître Kaï d'ordre intermédiaire",  en: 'Kai Master Senior' },
  { rank: 'kaiMasterSuperior',minDisciplines: 3,  fr: "Maître Kaï d'ordre supérieur",      en: 'Kai Master Superior' },
  { rank: 'primate',          minDisciplines: 4,  fr: 'Maître primat',                     en: 'Primate' },
  { rank: 'tutelary',         minDisciplines: 5,  fr: 'Maître tutélaire',                  en: 'Tutelary' },
  { rank: 'principalin',      minDisciplines: 6,  fr: 'Maître principal',                  en: 'Principalin' },
  { rank: 'mentora',          minDisciplines: 7,  fr: 'Maître mentor',                     en: 'Mentora' },
  { rank: 'scionMaster',      minDisciplines: 8,  fr: 'Maître éminent',                    en: 'Scion-Master' },
  { rank: 'archmaster',       minDisciplines: 9,  fr: 'Maître transcendant',               en: 'Archmaster' },
  { rank: 'grandMasterKai',   minDisciplines: 10, fr: 'Grand maître Kaï',                  en: 'Grand Master' },
]

// Grand Maître : démarre au rang 4 (Grand maître primat) avec 4 disciplines.
// Les rangs 1-3 sont théoriques (utilisés si départ depuis le livre 13 sans héritage Magnakaï).
export const GRAND_MASTER_RANKS: RankInfo[] = [
  { rank: 'kaiGrandMasterSenior',    minDisciplines: 0,  fr: 'Grand maître Kaï',                        en: 'Kai Grand Master Senior' },
  { rank: 'kaiGrandMasterSuperior',  minDisciplines: 1,  fr: "Grand maître Kaï d'ordre intermédiaire",  en: 'Kai Grand Master Superior' },
  { rank: 'kaiGrandSentinel',        minDisciplines: 2,  fr: "Grand maître Kaï d'ordre supérieur",      en: 'Kai Grand Sentinel' },
  { rank: 'kaiGrandDefender',        minDisciplines: 4,  fr: 'Grand maître primat',                     en: 'Kai Grand Defender' },
  { rank: 'kaiGrandGuardian',        minDisciplines: 5,  fr: 'Grand maître tutélaire',                  en: 'Kai Grand Guardian' },
  { rank: 'sunKnight',               minDisciplines: 6,  fr: 'Grand maître principal',                  en: 'Sun Knight' },
  { rank: 'sunLord',                 minDisciplines: 7,  fr: 'Grand maître mentor',                     en: 'Sun Lord' },
  { rank: 'sunThane',                minDisciplines: 8,  fr: 'Grand maître éminent',                    en: 'Sun Thane' },
  { rank: 'grandThane',              minDisciplines: 9,  fr: 'Grand maître transcendant',               en: 'Grand Thane' },
  { rank: 'grandCrown',              minDisciplines: 10, fr: 'Grand maître lunaire',                    en: 'Grand Crown' },
  { rank: 'sunPrince',               minDisciplines: 11, fr: 'Grand maître solaire',                    en: 'Sun Prince' },
  { rank: 'kaiSupremeMaster',        minDisciplines: 12, fr: 'Suprême grand maître',                    en: 'Kai Supreme Master' },
]

// Nouvel Ordre : mêmes noms de rang que Grand Maître, mais seuils décalés.
// Démarre au rang 1 (Grand maître Kaï) avec 4 disciplines ; Suprême grand maître atteint à 15 (sur 16).
export const NEW_ORDER_RANKS: RankInfo[] = [
  { rank: 'kaiGrandMasterSenior',    minDisciplines: 4,  fr: 'Grand maître Kaï',                        en: 'Kai Grand Master Senior' },
  { rank: 'kaiGrandMasterSuperior',  minDisciplines: 5,  fr: "Grand maître Kaï d'ordre intermédiaire",  en: 'Kai Grand Master Superior' },
  { rank: 'kaiGrandSentinel',        minDisciplines: 6,  fr: "Grand maître Kaï d'ordre supérieur",      en: 'Kai Grand Sentinel' },
  { rank: 'kaiGrandDefender',        minDisciplines: 7,  fr: 'Grand maître primat',                     en: 'Kai Grand Defender' },
  { rank: 'kaiGrandGuardian',        minDisciplines: 8,  fr: 'Grand maître tutélaire',                  en: 'Kai Grand Guardian' },
  { rank: 'sunKnight',               minDisciplines: 9,  fr: 'Grand maître principal',                  en: 'Sun Knight' },
  { rank: 'sunLord',                 minDisciplines: 10, fr: 'Grand maître mentor',                     en: 'Sun Lord' },
  { rank: 'sunThane',                minDisciplines: 11, fr: 'Grand maître éminent',                    en: 'Sun Thane' },
  { rank: 'grandThane',              minDisciplines: 12, fr: 'Grand maître transcendant',               en: 'Grand Thane' },
  { rank: 'grandCrown',              minDisciplines: 13, fr: 'Grand maître lunaire',                    en: 'Grand Crown' },
  { rank: 'sunPrince',               minDisciplines: 14, fr: 'Grand maître solaire',                    en: 'Sun Prince' },
  { rank: 'kaiSupremeMaster',        minDisciplines: 15, fr: 'Suprême grand maître',                    en: 'Kai Supreme Master' },
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
  return (rank?.rank ?? 'kaiGrandMasterSenior') as GrandMasterRank
}

export function computeNewOrderRank(disciplineCount: number): NewOrderRank {
  const rank = [...NEW_ORDER_RANKS].reverse().find(r => disciplineCount >= r.minDisciplines)
  return (rank?.rank ?? 'kaiGrandMasterSenior') as NewOrderRank
}
