export type Cycle = 'kai' | 'magnakai' | 'grandmaster' | 'neworder'

export interface Weapon {
  name: string
  bonus?: number
  notes?: string
}

export interface BackpackItem {
  id: string
  name: string
  notes?: string
  epRestore?: number  // if set, item is a potion
}

export interface SpecialItem {
  id: string
  name: string
  effect?: string
  hcBonus?: number
  peBonus?: number
}

// --- Kai ---
export type KaiDiscipline =
  | 'camouflage'
  | 'hunting'
  | 'sixthSense'
  | 'tracking'
  | 'healing'
  | 'weaponskill'
  | 'mindshield'
  | 'mindblast'
  | 'animalKinship'
  | 'mindOverMatter'

export type KaiRank =
  | 'novice'
  | 'intuite'
  | 'doan'
  | 'acolyte'
  | 'initiate'
  | 'aspirant'
  | 'guardian'
  | 'warman'
  | 'savant'
  | 'master'

// --- Magnakai ---
export type MagnakaiDiscipline =
  | 'weaponmastery'
  | 'animalControl'
  | 'curing'
  | 'invisibility'
  | 'huntmastery'
  | 'pathsmanship'
  | 'psiSurge'
  | 'psiScreen'
  | 'nexus'
  | 'divination'

export type LorestoneId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type LoreCircleId = 'fire' | 'light' | 'solaris' | 'spirit'

export type MagnakaiRank =
  | 'kaiMaster'
  | 'kaiMasterSenior'
  | 'kaiMasterSuperior'
  | 'primate'
  | 'tutelary'
  | 'principalin'
  | 'mentora'
  | 'scionMaster'
  | 'archmaster'
  | 'grandMasterKai'

// --- Grand Master ---
export type GrandMasterDiscipline =
  | 'grandWeaponmastery'
  | 'animalMastery'
  | 'deliverance'
  | 'assimilance'
  | 'grandHuntmastery'
  | 'grandPathsmanship'
  | 'kaiSurge'
  | 'kaiScreen'
  | 'grandNexus'
  | 'telegnosis'
  | 'magiMagic'
  | 'kaiAlchemy'

export type GrandMasterRank =
  | 'kaiGrandMasterSenior'
  | 'kaiGrandMasterSuperior'
  | 'kaiGrandSentinel'
  | 'kaiGrandDefender'
  | 'kaiGrandGuardian'
  | 'sunKnight'
  | 'sunLord'
  | 'sunThane'
  | 'grandThane'
  | 'grandCrown'
  | 'sunPrince'
  | 'kaiSupremeMaster'

// --- New Order ---
export type NewOrderDiscipline =
  | 'grandWeaponmastery'
  | 'animalMastery'
  | 'deliverance'
  | 'assimilance'
  | 'grandHuntmastery'
  | 'grandPathsmanship'
  | 'kaiSurge'
  | 'kaiScreen'
  | 'grandNexus'
  | 'telegnosis'
  | 'magiMagic'
  | 'kaiAlchemy'
  | 'astrology'
  | 'herbmastery'
  | 'elementalism'
  | 'bardsmanship'

export type NewOrderRank =
  | 'kaiGrandMasterSenior'
  | 'kaiGrandMasterSuperior'
  | 'kaiGrandSentinel'
  | 'kaiGrandDefender'
  | 'kaiGrandGuardian'
  | 'sunKnight'
  | 'sunLord'
  | 'sunThane'
  | 'grandThane'
  | 'grandCrown'
  | 'sunPrince'
  | 'kaiSupremeMaster'

export type KaiNamePrefix =
  | 'swift'
  | 'sun'
  | 'true'
  | 'bold'
  | 'moon'
  | 'sword'
  | 'wise'
  | 'storm'
  | 'rune'
  | 'brave'

export type KaiNameSuffix =
  | 'blade'
  | 'fire'
  | 'hawk'
  | 'heart'
  | 'friend'
  | 'star'
  | 'dancer'
  | 'helm'
  | 'strider'
  | 'shield'

export interface DisciplineData {
  key: string
  fr: string
  en: string
  effectFr: string
  effectEn: string
}

export interface BookData {
  id: number
  cycle: Cycle
  title: { fr: string; en: string }
  maxDisciplines: number
}

export interface LoreCircleData {
  id: LoreCircleId
  fr: string
  en: string
  disciplines: MagnakaiDiscipline[]
  bonusCS: number
  bonusEP: number
}
