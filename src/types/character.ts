import type {
  BackpackItem,
  GrandMasterDiscipline,
  GrandMasterRank,
  KaiDiscipline,
  KaiRank,
  LoreCircleId,
  LorestoneId,
  MagnakaiDiscipline,
  MagnakaiRank,
  NewOrderDiscipline,
  NewOrderRank,
  SpecialItem,
  Weapon,
} from './game'

interface BaseCharacter {
  id: string
  name: string
  currentBook: number
  booksCompleted: number[]
  combatSkill: { base: number; bonus: number }
  endurance: { current: number; max: number }
  weapons: Weapon[]
  goldCrowns: number
  meals: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface KaiCharacter extends BaseCharacter {
  cycle: 'kai'
  rank: KaiRank
  disciplines: KaiDiscipline[]
  weaponskillWeapon: string
  backpack: BackpackItem[]
  specialItems: SpecialItem[]
}

export interface MagnakaiCharacter extends BaseCharacter {
  cycle: 'magnakai'
  rank: MagnakaiRank
  kaiDisciplines: KaiDiscipline[]
  kaiWeaponskillWeapon: string
  disciplines: MagnakaiDiscipline[]
  weaponmasteryWeapons: string[]
  loreCirclesCompleted: LoreCircleId[]
  lorestones: LorestoneId[]
  backpack: BackpackItem[]
  specialItems: SpecialItem[]
}

export interface GrandMasterCharacter extends BaseCharacter {
  cycle: 'grandmaster'
  rank: GrandMasterRank
  magnakaiDisciplines: MagnakaiDiscipline[]
  loreCirclesBonusCS: number
  loreCirclesBonusEP: number
  disciplines: GrandMasterDiscipline[]
  weaponmasteryWeapons: string[]
  backpack: BackpackItem[]
  specialItems: SpecialItem[]
  // Deliverance (advanced Curing): restore 20 EP once per ~20 days.
  // Optional for save retro-compat; absent or true means available.
  deliveranceAvailable?: boolean
}

export interface NewOrderCharacter extends BaseCharacter {
  cycle: 'neworder'
  rank: NewOrderRank
  kaiName: string
  disciplines: NewOrderDiscipline[]
  weaponmasteryWeapons: string[]
  backpack: BackpackItem[]
  specialItems: SpecialItem[]
}

export type Character =
  | KaiCharacter
  | MagnakaiCharacter
  | GrandMasterCharacter
  | NewOrderCharacter
