import type { Character, GrandMasterCharacter, KaiCharacter, MagnakaiCharacter, NewOrderCharacter } from '@/types/character'
import type { Cycle } from '@/types/game'
import { computeGrandMasterRank, computeKaiRank, computeMagnakaiRank, computeNewOrderRank } from '@/data/ranks'
import { computeLoreCircleBonuses } from '@/data/loreCircles'
import { rollD10 } from './rng'
import { v4 as uuidv4 } from 'uuid'

// Stat formulas by cycle
export function rollCombatSkill(cycle: Cycle): number {
  return cycle === 'kai' || cycle === 'magnakai' ? rollD10() + 10 : rollD10() + 25
}

export function rollEndurance(cycle: Cycle): number {
  return cycle === 'kai' || cycle === 'magnakai' ? rollD10() + 20 : rollD10() + 30
}

export function getTotalCS(char: Character): number {
  const base = char.combatSkill.base + char.combatSkill.bonus
  const itemsHC = char.specialItems.reduce((sum, i) => sum + (i.hcBonus ?? 0), 0)
  if (char.cycle === 'grandmaster') {
    const extraDisciplines = Math.max(0, char.disciplines.length - 4)
    return base + extraDisciplines + itemsHC
  }
  if (char.cycle === 'neworder') {
    const extraDisciplines = Math.max(0, char.disciplines.length - 5)
    return base + extraDisciplines + itemsHC
  }
  return base + itemsHC
}

export function getTotalEPMax(char: Character): number {
  const base = char.endurance.max
  const itemsPE = char.specialItems.reduce((sum, i) => sum + (i.peBonus ?? 0), 0)
  if (char.cycle === 'grandmaster') {
    const extraDisciplines = Math.max(0, char.disciplines.length - 4)
    return base + extraDisciplines * 2 + itemsPE
  }
  if (char.cycle === 'neworder') {
    const extraDisciplines = Math.max(0, char.disciplines.length - 5)
    return base + extraDisciplines * 2 + itemsPE
  }
  return base + itemsPE
}

export function computeRank(char: Character): string {
  const count = char.disciplines.length
  switch (char.cycle) {
    case 'kai': return computeKaiRank(count)
    case 'magnakai': return computeMagnakaiRank(count)
    case 'grandmaster': return computeGrandMasterRank(count)
    case 'neworder': return computeNewOrderRank(count)
  }
}

export function createNewKaiCharacter(overrides: Partial<KaiCharacter> = {}): KaiCharacter {
  const cs = rollCombatSkill('kai')
  const ep = rollEndurance('kai')
  return {
    id: uuidv4(),
    name: 'Loup Solitaire',
    cycle: 'kai',
    currentBook: 1,
    booksCompleted: [],
    combatSkill: { base: cs, bonus: 0 },
    endurance: { current: ep, max: ep },
    rank: 'novice',
    disciplines: [],
    weaponskillWeapon: '',
    weapons: [],
    backpack: [],
    specialItems: [],
    goldCrowns: 0,
    meals: 0,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createNewMagnakaiCharacter(fromKai?: KaiCharacter): MagnakaiCharacter {
  const now = new Date().toISOString()
  if (fromKai) {
    return {
      ...fromKai,
      cycle: 'magnakai',
      rank: 'kaiMaster',
      kaiDisciplines: fromKai.disciplines,
      kaiWeaponskillWeapon: fromKai.weaponskillWeapon,
      disciplines: [],
      weaponmasteryWeapons: [],
      loreCirclesCompleted: [],
      lorestones: [],
      currentBook: 6,
      updatedAt: now,
    }
  }
  const cs = rollCombatSkill('magnakai')
  const ep = rollEndurance('magnakai')
  return {
    id: uuidv4(),
    name: 'Loup Solitaire',
    cycle: 'magnakai',
    currentBook: 6,
    booksCompleted: [],
    combatSkill: { base: cs, bonus: 0 },
    endurance: { current: ep, max: ep },
    rank: 'kaiMaster',
    kaiDisciplines: [],
    kaiWeaponskillWeapon: '',
    disciplines: [],
    weaponmasteryWeapons: [],
    loreCirclesCompleted: [],
    lorestones: [],
    weapons: [],
    backpack: [],
    specialItems: [],
    goldCrowns: 0,
    meals: 0,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

export function createNewGrandMasterCharacter(fromMagnakai?: MagnakaiCharacter): GrandMasterCharacter {
  const now = new Date().toISOString()
  if (fromMagnakai) {
    const { bonusCS, bonusEP } = computeLoreCircleBonuses(fromMagnakai.disciplines)
    // Offer better stats: use old values + lore circle bonuses, or re-roll + bonuses
    const newBaseCS = Math.max(fromMagnakai.combatSkill.base, rollD10() + 25)
    const newBaseEP = Math.max(fromMagnakai.endurance.max, rollD10() + 30)
    return {
      ...fromMagnakai,
      cycle: 'grandmaster',
      rank: 'kaiGrandDefender',
      magnakaiDisciplines: fromMagnakai.disciplines,
      loreCirclesBonusCS: bonusCS,
      loreCirclesBonusEP: bonusEP,
      disciplines: [],
      weaponmasteryWeapons: fromMagnakai.weaponmasteryWeapons,
      combatSkill: { base: newBaseCS, bonus: fromMagnakai.combatSkill.bonus + bonusCS },
      endurance: { current: newBaseEP + bonusEP, max: newBaseEP + bonusEP },
      backpack: fromMagnakai.backpack.slice(0, 10),
      specialItems: fromMagnakai.specialItems.slice(0, 12),
      currentBook: 13,
      updatedAt: now,
    }
  }
  const cs = rollCombatSkill('grandmaster')
  const ep = rollEndurance('grandmaster')
  return {
    id: uuidv4(),
    name: 'Loup Solitaire',
    cycle: 'grandmaster',
    currentBook: 13,
    booksCompleted: [],
    combatSkill: { base: cs, bonus: 0 },
    endurance: { current: ep, max: ep },
    rank: 'kaiGrandDefender',
    magnakaiDisciplines: [],
    loreCirclesBonusCS: 0,
    loreCirclesBonusEP: 0,
    disciplines: [],
    weaponmasteryWeapons: [],
    weapons: [],
    backpack: [],
    specialItems: [],
    goldCrowns: 0,
    meals: 0,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

export function createNewOrderCharacter(): NewOrderCharacter {
  const now = new Date().toISOString()
  const cs = rollCombatSkill('neworder')
  const ep = rollEndurance('neworder')
  return {
    id: uuidv4(),
    name: '',
    cycle: 'neworder',
    currentBook: 21,
    booksCompleted: [],
    combatSkill: { base: cs, bonus: 0 },
    endurance: { current: ep, max: ep },
    rank: 'kaiGrandMasterSenior',
    kaiName: '',
    disciplines: [],
    weaponmasteryWeapons: [],
    weapons: [],
    backpack: [],
    specialItems: [],
    goldCrowns: rollD10() + 20,
    meals: 0,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

export function getBackpackMax(char: Character): number {
  return char.cycle === 'kai' || char.cycle === 'magnakai' ? 8 : 10
}

export function getSpecialItemsMax(_char: Character): number {
  return 12
}

export function getGoldMax(_char: Character): number {
  return 50
}
