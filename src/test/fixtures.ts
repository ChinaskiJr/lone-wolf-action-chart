import type { GrandMasterCharacter, KaiCharacter, MagnakaiCharacter, NewOrderCharacter } from '@/types/character'

const BASE = {
  id: 'test-id',
  name: 'Loup Solitaire',
  currentBook: 1,
  booksCompleted: [],
  combatSkill: { base: 15, bonus: 0 },
  endurance: { current: 25, max: 25 },
  weapons: [],
  backpack: [],
  specialItems: [],
  goldCrowns: 10,
  meals: 0,
  notes: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function makeKaiChar(overrides: Partial<KaiCharacter> = {}): KaiCharacter {
  return {
    ...BASE,
    cycle: 'kai',
    rank: 'novice',
    disciplines: [],
    weaponskillWeapon: '',
    ...overrides,
  }
}

export function makeMagnakaiChar(overrides: Partial<MagnakaiCharacter> = {}): MagnakaiCharacter {
  return {
    ...BASE,
    currentBook: 6,
    cycle: 'magnakai',
    rank: 'kaiMaster',
    kaiDisciplines: [],
    kaiWeaponskillWeapon: '',
    disciplines: [],
    weaponmasteryWeapons: [],
    loreCirclesCompleted: [],
    lorestones: [],
    ...overrides,
  }
}

export function makeGrandMasterChar(overrides: Partial<GrandMasterCharacter> = {}): GrandMasterCharacter {
  return {
    ...BASE,
    currentBook: 13,
    combatSkill: { base: 30, bonus: 0 },
    endurance: { current: 35, max: 35 },
    cycle: 'grandmaster',
    rank: 'kaiGrandDefender',
    magnakaiDisciplines: [],
    loreCirclesBonusCS: 0,
    loreCirclesBonusEP: 0,
    disciplines: [],
    weaponmasteryWeapons: [],
    ...overrides,
  }
}

export function makeNewOrderChar(overrides: Partial<NewOrderCharacter> = {}): NewOrderCharacter {
  return {
    ...BASE,
    currentBook: 21,
    combatSkill: { base: 30, bonus: 0 },
    endurance: { current: 35, max: 35 },
    cycle: 'neworder',
    rank: 'kaiGrandMasterSenior',
    kaiName: '',
    disciplines: [],
    weaponmasteryWeapons: [],
    ...overrides,
  }
}
