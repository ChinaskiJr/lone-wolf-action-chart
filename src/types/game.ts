export type Cycle = 'kai' | 'magnakai' | 'grandmaster' | 'neworder'

export interface Weapon {
  name: string
  bonus?: number
  notes?: string
  equipped?: boolean   // undefined = équipé (rétrocompat)
}

export interface BackpackItem {
  id: string
  name: string
  notes?: string
  slots?: number      // defaults to 1; set to 2 for bulky items (rope, etc.)
  epRestore?: number  // if set, item is an EP potion
  csBonus?: number    // if set, item is a combat potion (one-combat HC bonus)
}

export interface SpecialItem {
  id: string
  name: string
  effect?: string
  hcBonus?: number
  peBonus?: number
  equipped?: boolean   // undefined = équipé (rétrocompat sauvegardes existantes)
}

// Snapshot of the whole inventory while it is confiscated (prison, capture...).
export interface ConfiscatedEquipment {
  weapons: Weapon[]
  goldCrowns: number
  meals: number
  backpack: BackpackItem[]
  specialItems: SpecialItem[]
  hasHerbPouch?: boolean
  herbPouch?: BackpackItem[]
}

// Items stored at the Kai Monastery between books (from book 6 onwards). No upper limit.
export interface MonasteryStorage {
  weapons: Weapon[]
  goldCrowns: number
  backpack: BackpackItem[]
  specialItems: SpecialItem[]
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
