import type { Character, GrandMasterCharacter, KaiCharacter, MagnakaiCharacter, NewOrderCharacter } from '@/types/character'
import type { Cycle, GrandMasterDiscipline, KaiDiscipline, MagnakaiDiscipline, NewOrderDiscipline, SpecialItem } from '@/types/game'
import type { CombatModifier } from '@/data/combatModifiers'
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
  const itemsHC = char.specialItems.filter(i => i.equipped !== false).reduce((sum, i) => sum + (i.hcBonus ?? 0), 0)
  const weaponsHC = char.weapons.filter(w => w.equipped !== false).reduce((sum, w) => sum + (w.bonus ?? 0), 0)
  if (char.cycle === 'grandmaster') {
    const extraDisciplines = Math.max(0, char.disciplines.length - 4)
    return base + extraDisciplines + itemsHC + weaponsHC
  }
  if (char.cycle === 'neworder') {
    const extraDisciplines = Math.max(0, char.disciplines.length - 5)
    return base + extraDisciplines + itemsHC + weaponsHC
  }
  return base + itemsHC + weaponsHC
}

export function getTotalEPMax(char: Character): number {
  const base = char.endurance.max
  const itemsPE = char.specialItems.filter(i => i.equipped !== false).reduce((sum, i) => sum + (i.peBonus ?? 0), 0)
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

export function hasDisciplineForModifier(char: Character, modifier: CombatModifier): boolean {
  const key = modifier.disciplineKey
  // Unarmed combat is always available (no discipline required)
  if (key === 'unarmed') return true
  switch (char.cycle) {
    case 'kai':
      return char.disciplines.includes(key as KaiDiscipline)
    case 'magnakai':
      if (['weaponmastery', 'psiSurge'].includes(key))
        return char.disciplines.includes(key as MagnakaiDiscipline)
      return char.kaiDisciplines.includes(key as KaiDiscipline)
    case 'grandmaster':
      if (['grandWeaponmastery', 'kaiSurge'].includes(key))
        return char.disciplines.includes(key as GrandMasterDiscipline)
      return char.magnakaiDisciplines.includes(key as MagnakaiDiscipline)
    case 'neworder':
      return char.disciplines.includes(key as NewOrderDiscipline)
  }
}

export function isModifierSuperseded(char: Character, modifier: CombatModifier): boolean {
  if (!modifier.supersededBy?.length) return false
  switch (char.cycle) {
    case 'magnakai':
      return modifier.supersededBy.some(key => char.disciplines.includes(key as MagnakaiDiscipline))
    case 'grandmaster':
      return modifier.supersededBy.some(key => char.disciplines.includes(key as GrandMasterDiscipline))
    default:
      return false
  }
}

// Rank-based scaling of combat modifiers (rank position = discipline count).
// Returns the effective HC bonus, per-round EP cost, and the minimum current EP
// required to use the modifier (surge lockout); minEP 0 means no restriction.
export function getEffectiveModifier(
  char: Character,
  mod: CombatModifier
): { hcBonus: number; epCostPerRound: number; minEP: number } {
  let hcBonus = mod.hcBonus
  let epCostPerRound = mod.epCostPerRound ?? 0
  let minEP = 0

  if (char.cycle === 'magnakai') {
    const count = char.disciplines.length
    const hasWeaponmastery = char.disciplines.includes('weaponmastery' as MagnakaiDiscipline)

    // Scion-kai (8 disciplines): Weaponmastery +3 -> +4
    if (mod.disciplineKey === 'weaponmastery' && count >= 8) hcBonus = 4

    // Strong Psi-surge: +4/-2 EP, unusable at EP <= 6 (need >= 7).
    // Archmaster (9): +6/-1 EP, unusable at EP <= 4 (need >= 5).
    if (mod.id === 'psiSurge_4') {
      if (count >= 9) {
        hcBonus = 6
        epCostPerRound = 1
        minEP = 5
      } else {
        minEP = 7
      }
    }

    // Unarmed scaling (requires the Weaponmastery Discipline):
    // Tutelary (5) -> -2, Scion-kai (8) -> -1.
    if (mod.id === 'unarmed_4' && hasWeaponmastery) {
      if (count >= 8) hcBonus = -1
      else if (count >= 5) hcBonus = -2
    }
  }

  // Strong Kai-surge: unusable at EP <= 6 (need >= 7).
  if (mod.id === 'kaiSurge_8') minEP = 7

  // Grand Crown (10 disciplines) with Grand Weaponmastery:
  // unarmed combat grants +3 HC instead of the -4 penalty.
  if (
    char.cycle === 'grandmaster' &&
    mod.id === 'unarmed_4' &&
    char.disciplines.length >= 10 &&
    char.disciplines.includes('grandWeaponmastery' as GrandMasterDiscipline)
  ) {
    hcBonus = 3
  }

  return { hcBonus, epCostPerRound, minEP }
}

// Ranged (Bow / thrown weapon) bonus added to the picked Random Number.
// Magnakai Mentora (7) with Weaponmastery: +2. Grand Master / New Order with
// Grand Weaponmastery: +3. (The +5 ex-Mentora case is not tracked in-app.)
export function getBowBonus(char: Character): number {
  if (char.cycle === 'magnakai') {
    if (char.disciplines.length >= 7 && char.disciplines.includes('weaponmastery' as MagnakaiDiscipline)) return 2
  }
  if (char.cycle === 'grandmaster' && char.disciplines.includes('grandWeaponmastery' as GrandMasterDiscipline)) return 3
  if (char.cycle === 'neworder' && char.disciplines.includes('grandWeaponmastery' as NewOrderDiscipline)) return 3
  return 0
}

// Sun Lord (7) with Grand Weaponmastery: a burning blade inflicts +1 extra
// ENDURANCE loss on the enemy in every successful round.
export function canIgnite(char: Character): boolean {
  if (char.cycle === 'grandmaster') {
    return char.disciplines.length >= 7 && char.disciplines.includes('grandWeaponmastery' as GrandMasterDiscipline)
  }
  if (char.cycle === 'neworder') {
    return char.disciplines.length >= 7 && char.disciplines.includes('grandWeaponmastery' as NewOrderDiscipline)
  }
  return false
}

export function getItemsCSBonus(char: Character): number {
  return char.specialItems.filter(i => i.equipped !== false).reduce((sum, i) => sum + (i.hcBonus ?? 0), 0)
}

export function getWeaponsCSBonus(char: Character): number {
  return char.weapons.filter(w => w.equipped !== false).reduce((sum, w) => sum + (w.bonus ?? 0), 0)
}

export function getItemsEPBonus(char: Character): number {
  return char.specialItems.filter(i => i.equipped !== false).reduce((sum, i) => sum + (i.peBonus ?? 0), 0)
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
      rank: 'kaiMasterSuperior',
      kaiDisciplines: fromKai.disciplines,
      kaiWeaponskillWeapon: fromKai.weaponskillWeapon,
      disciplines: [],
      weaponmasteryWeapons: [],
      loreCirclesCompleted: [],
      lorestones: [],
      // Restore EP to max on cycle change.
      endurance: { ...fromKai.endurance, current: fromKai.endurance.max },
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
    rank: 'kaiMasterSuperior',
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

export function filterCarryOverItems(
  items: SpecialItem[],
  selectedIds: string[]
): SpecialItem[] {
  return items.filter(i => selectedIds.includes(i.id)).slice(0, 12)
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
