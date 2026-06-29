export type Cycle = 'kai' | 'magnakai' | 'grandmaster' | 'neworder'

export interface Weapon {
  name: string
  bonus?: number
  notes?: string
  equipped?: boolean // undefined = équipé (rétrocompat)
}

export interface BackpackItem {
  id: string
  name: string
  notes?: string
  slots?: number // defaults to 1; set to 2 for bulky items (rope, etc.)
  epRestore?: number // if set, item is an EP potion
  csBonus?: number // if set, item is a combat potion (one-combat HC bonus)
  maxDoses?: number // optional dose counter; auto-removed when it reaches 0
}

export interface SpecialItem {
  id: string
  name: string
  effect?: string
  hcBonus?: number
  hcBonusPermanent?: boolean // if true, bonus applies even when not equipped
  peBonus?: number
  peBonusPermanent?: boolean // if true, bonus applies even when not equipped
  equipped?: boolean // undefined = équipé (rétrocompat sauvegardes existantes)
  weightless?: boolean // if true, item has no encumbrance
}

// --- Currency (Belt Pouch) ---
// Gold Crowns are the base currency, stored on the character as `goldCrowns` for
// backward compatibility. Every other Magnamund currency is a CurrencyHolding in
// `otherCurrencies`. All currencies share the Belt Pouch's 50-slot capacity:
// `coinsPerSlot` coins occupy the space of a single Gold Crown (1 GC = 1 slot).
export type KnownCurrencyId = 'crown' | 'lune' | 'kika' | 'noble' | 'ren' | 'ain'

export interface CurrencyHolding {
  id: string // KnownCurrencyId (except 'crown', carried by goldCrowns) or a custom uuid
  amount: number
  // Set only for a custom (player-defined) currency; predefined ones resolve from data.
  name?: string
  valueInCrowns?: number // exchange value of one coin in Gold Crowns (e.g. Lune = 0.25)
  coinsPerSlot?: number // coins that fill one Belt Pouch slot (default 1)
}

// Snapshot of the whole inventory while it is confiscated (prison, capture...).
export interface ConfiscatedEquipment {
  weapons: Weapon[]
  goldCrowns: number
  otherCurrencies?: CurrencyHolding[]
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
  otherCurrencies?: CurrencyHolding[]
  backpack: BackpackItem[]
  specialItems: SpecialItem[]
  hasQuiver?: boolean
  arrows?: number
  hasHerbPouch?: boolean
  herbPouch?: BackpackItem[]
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
