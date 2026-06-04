import { describe, it, expect } from 'vitest'
import { getTotalCS, getTotalEPMax, computeRank, filterCarryOverItems, getEffectiveModifier, hasDisciplineForModifier, getBowBonus, canIgnite } from './character'
import { makeKaiChar, makeMagnakaiChar, makeGrandMasterChar, makeNewOrderChar } from '@/test/fixtures'
import { COMBAT_MODIFIERS } from '@/data/combatModifiers'
import type { SpecialItem } from '@/types/game'

const WEAPONMASTERY = COMBAT_MODIFIERS.find(m => m.id === 'weaponmastery_3')!
const PSI_SURGE_STRONG = COMBAT_MODIFIERS.find(m => m.id === 'psiSurge_4')!
const KAI_SURGE_STRONG = COMBAT_MODIFIERS.find(m => m.id === 'kaiSurge_8')!
const UNARMED = COMBAT_MODIFIERS.find(m => m.id === 'unarmed_4')!

function makeItem(overrides: Partial<SpecialItem> = {}): SpecialItem {
  return { id: 'item-1', name: 'Test Item', ...overrides }
}

describe('getTotalCS', () => {
  it('returns base + bonus for kai', () => {
    const char = makeKaiChar({ combatSkill: { base: 15, bonus: 3 } })
    expect(getTotalCS(char)).toBe(18)
  })

  it('adds hcBonus from special items', () => {
    const char = makeKaiChar({
      combatSkill: { base: 15, bonus: 0 },
      specialItems: [makeItem({ hcBonus: 2 }), makeItem({ id: 'item-2', hcBonus: 1 })],
    })
    expect(getTotalCS(char)).toBe(18)
  })

  it('ignores items with no hcBonus', () => {
    const char = makeKaiChar({
      combatSkill: { base: 15, bonus: 0 },
      specialItems: [makeItem({ hcBonus: undefined })],
    })
    expect(getTotalCS(char)).toBe(15)
  })

  it('ignores hcBonus from unequipped items (equipped: false)', () => {
    const char = makeKaiChar({
      combatSkill: { base: 15, bonus: 0 },
      specialItems: [makeItem({ hcBonus: 8, equipped: false })],
    })
    expect(getTotalCS(char)).toBe(15)
  })

  it('counts hcBonus from items with equipped: undefined (legacy rétrocompat)', () => {
    const char = makeKaiChar({
      combatSkill: { base: 15, bonus: 0 },
      specialItems: [makeItem({ hcBonus: 8, equipped: undefined })],
    })
    expect(getTotalCS(char)).toBe(23)
  })

  it('counts hcBonus from items with equipped: true', () => {
    const char = makeKaiChar({
      combatSkill: { base: 15, bonus: 0 },
      specialItems: [makeItem({ hcBonus: 4, equipped: true }), makeItem({ id: 'item-2', hcBonus: 6, equipped: false })],
    })
    expect(getTotalCS(char)).toBe(19)
  })

  it('grandmaster: adds +1 CS per discipline beyond 4', () => {
    const char = makeGrandMasterChar({
      combatSkill: { base: 30, bonus: 0 },
      disciplines: ['a', 'b', 'c', 'd', 'e', 'f'] as any, // 6 → 2 extra
    })
    expect(getTotalCS(char)).toBe(32)
  })

  it('grandmaster: no bonus when disciplines <= 4', () => {
    const char = makeGrandMasterChar({
      combatSkill: { base: 30, bonus: 0 },
      disciplines: ['a', 'b', 'c', 'd'] as any,
    })
    expect(getTotalCS(char)).toBe(30)
  })

  it('neworder: adds +1 CS per discipline beyond 5', () => {
    const char = makeNewOrderChar({
      combatSkill: { base: 30, bonus: 0 },
      disciplines: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as any, // 7 → 2 extra
    })
    expect(getTotalCS(char)).toBe(32)
  })

  it('magnakai: no discipline bonus', () => {
    const char = makeMagnakaiChar({
      combatSkill: { base: 20, bonus: 0 },
      disciplines: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as any,
    })
    expect(getTotalCS(char)).toBe(20)
  })
})

describe('getTotalEPMax', () => {
  it('returns endurance.max for kai', () => {
    const char = makeKaiChar({ endurance: { current: 20, max: 25 } })
    expect(getTotalEPMax(char)).toBe(25)
  })

  it('adds peBonus from special items', () => {
    const char = makeKaiChar({
      endurance: { current: 20, max: 25 },
      specialItems: [makeItem({ peBonus: 4 })],
    })
    expect(getTotalEPMax(char)).toBe(29)
  })

  it('ignores peBonus from unequipped items (equipped: false)', () => {
    const char = makeKaiChar({
      endurance: { current: 20, max: 25 },
      specialItems: [makeItem({ peBonus: 4, equipped: false })],
    })
    expect(getTotalEPMax(char)).toBe(25)
  })

  it('counts peBonus from items with equipped: undefined (legacy rétrocompat)', () => {
    const char = makeKaiChar({
      endurance: { current: 20, max: 25 },
      specialItems: [makeItem({ peBonus: 4, equipped: undefined })],
    })
    expect(getTotalEPMax(char)).toBe(29)
  })

  it('grandmaster: adds +2 EP per discipline beyond 4', () => {
    const char = makeGrandMasterChar({
      endurance: { current: 35, max: 35 },
      disciplines: ['a', 'b', 'c', 'd', 'e'] as any, // 5 → 1 extra → +2
    })
    expect(getTotalEPMax(char)).toBe(37)
  })

  it('grandmaster: no bonus when disciplines <= 4', () => {
    const char = makeGrandMasterChar({
      endurance: { current: 35, max: 35 },
      disciplines: ['a', 'b', 'c', 'd'] as any,
    })
    expect(getTotalEPMax(char)).toBe(35)
  })

  it('neworder: adds +2 EP per discipline beyond 5', () => {
    const char = makeNewOrderChar({
      endurance: { current: 35, max: 35 },
      disciplines: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as any, // 7 → 2 extra → +4
    })
    expect(getTotalEPMax(char)).toBe(39)
  })
})

describe('computeRank', () => {
  it('returns correct kai rank (official numbering: 5 disciplines = Initiate)', () => {
    const char = makeKaiChar({ disciplines: ['a', 'b', 'c', 'd', 'e'] as any })
    expect(computeRank(char)).toBe('initiate')
  })

  it('returns correct magnakai rank (official numbering: 3 disciplines = Kai Master Superior)', () => {
    const char = makeMagnakaiChar({ disciplines: ['a', 'b', 'c'] as any })
    expect(computeRank(char)).toBe('kaiMasterSuperior')
  })

  it('returns correct grandmaster rank', () => {
    const char = makeGrandMasterChar({ disciplines: ['a', 'b', 'c', 'd'] as any })
    expect(computeRank(char)).toBe('kaiGrandDefender')
  })

  it('returns correct neworder rank', () => {
    const char = makeNewOrderChar({ disciplines: ['a', 'b', 'c', 'd'] as any })
    expect(computeRank(char)).toBe('kaiGrandMasterSenior')
  })
})

describe('getEffectiveModifier', () => {
  it('weaponmastery is +3 below Scion-kai (7 disciplines)', () => {
    const char = makeMagnakaiChar({ disciplines: Array(7).fill('weaponmastery') as any })
    expect(getEffectiveModifier(char, WEAPONMASTERY).hcBonus).toBe(3)
  })

  it('weaponmastery upgrades to +4 at Scion-kai (8 disciplines)', () => {
    const char = makeMagnakaiChar({ disciplines: Array(8).fill('weaponmastery') as any })
    expect(getEffectiveModifier(char, WEAPONMASTERY).hcBonus).toBe(4)
  })

  it('strong psi-surge is +4 / -2 EP, locked at EP<=6 (minEP 7) below Archmaster (8 disciplines)', () => {
    const char = makeMagnakaiChar({ disciplines: Array(8).fill('psiSurge') as any })
    const eff = getEffectiveModifier(char, PSI_SURGE_STRONG)
    expect(eff.hcBonus).toBe(4)
    expect(eff.epCostPerRound).toBe(2)
    expect(eff.minEP).toBe(7)
  })

  it('strong psi-surge upgrades to +6 / -1 EP, minEP 5 at Archmaster (9 disciplines)', () => {
    const char = makeMagnakaiChar({ disciplines: Array(9).fill('psiSurge') as any })
    const eff = getEffectiveModifier(char, PSI_SURGE_STRONG)
    expect(eff.hcBonus).toBe(6)
    expect(eff.epCostPerRound).toBe(1)
    expect(eff.minEP).toBe(5)
  })

  it('strong kai-surge requires minEP 7', () => {
    const char = makeGrandMasterChar({ disciplines: ['kaiSurge'] as any })
    expect(getEffectiveModifier(char, KAI_SURGE_STRONG).minEP).toBe(7)
  })

  it('unarmed is -4 by default', () => {
    expect(getEffectiveModifier(makeKaiChar(), UNARMED).hcBonus).toBe(-4)
  })

  it('magnakai unarmed becomes -2 at Tutelary (5 disc) with Weaponmastery', () => {
    const char = makeMagnakaiChar({ disciplines: ['weaponmastery', 'a', 'b', 'c', 'd'] as any })
    expect(getEffectiveModifier(char, UNARMED).hcBonus).toBe(-2)
  })

  it('magnakai unarmed becomes -1 at Scion-kai (8 disc) with Weaponmastery', () => {
    const char = makeMagnakaiChar({ disciplines: ['weaponmastery', ...Array(7).fill('x')] as any })
    expect(getEffectiveModifier(char, UNARMED).hcBonus).toBe(-1)
  })

  it('magnakai unarmed stays -4 without Weaponmastery', () => {
    const char = makeMagnakaiChar({ disciplines: Array(8).fill('x') as any })
    expect(getEffectiveModifier(char, UNARMED).hcBonus).toBe(-4)
  })

  it('unarmed becomes +3 at Grand Crown with Grand Weaponmastery (10 disciplines)', () => {
    const disciplines = ['grandWeaponmastery', ...Array(9).fill('x')] as any
    const char = makeGrandMasterChar({ disciplines })
    expect(getEffectiveModifier(char, UNARMED).hcBonus).toBe(3)
  })

  it('unarmed stays -4 with Grand Weaponmastery below Grand Crown (9 disciplines)', () => {
    const disciplines = ['grandWeaponmastery', ...Array(8).fill('x')] as any
    const char = makeGrandMasterChar({ disciplines })
    expect(getEffectiveModifier(char, UNARMED).hcBonus).toBe(-4)
  })
})

describe('getBowBonus', () => {
  it('magnakai Mentora (7 disc) with Weaponmastery gives +2', () => {
    const char = makeMagnakaiChar({ disciplines: ['weaponmastery', ...Array(6).fill('x')] as any })
    expect(getBowBonus(char)).toBe(2)
  })

  it('magnakai below Mentora (6 disc) gives 0', () => {
    const char = makeMagnakaiChar({ disciplines: ['weaponmastery', ...Array(5).fill('x')] as any })
    expect(getBowBonus(char)).toBe(0)
  })

  it('grandmaster with Grand Weaponmastery gives +3', () => {
    const char = makeGrandMasterChar({ disciplines: ['grandWeaponmastery'] as any })
    expect(getBowBonus(char)).toBe(3)
  })

  it('gives 0 without the relevant discipline', () => {
    expect(getBowBonus(makeKaiChar())).toBe(0)
    expect(getBowBonus(makeGrandMasterChar({ disciplines: ['x'] as any }))).toBe(0)
  })
})

describe('canIgnite', () => {
  it('grandmaster Sun Lord (7 disc) with Grand Weaponmastery can ignite', () => {
    const char = makeGrandMasterChar({ disciplines: ['grandWeaponmastery', ...Array(6).fill('x')] as any })
    expect(canIgnite(char)).toBe(true)
  })

  it('cannot ignite below Sun Lord (6 disc)', () => {
    const char = makeGrandMasterChar({ disciplines: ['grandWeaponmastery', ...Array(5).fill('x')] as any })
    expect(canIgnite(char)).toBe(false)
  })

  it('cannot ignite without Grand Weaponmastery', () => {
    const char = makeGrandMasterChar({ disciplines: Array(7).fill('x') as any })
    expect(canIgnite(char)).toBe(false)
  })
})

describe('hasDisciplineForModifier', () => {
  it('unarmed is always available regardless of disciplines', () => {
    expect(hasDisciplineForModifier(makeKaiChar(), UNARMED)).toBe(true)
    expect(hasDisciplineForModifier(makeGrandMasterChar(), UNARMED)).toBe(true)
  })
})

function makeSpecialItem(id: string, overrides: Partial<{ name: string; hcBonus: number; peBonus: number; effect: string }> = {}) {
  return { id, name: `Item ${id}`, ...overrides }
}

describe('filterCarryOverItems', () => {
  const items = [
    makeSpecialItem('id-1', { name: 'Glaive de Sommer', hcBonus: 8 }),
    makeSpecialItem('id-2', { name: "Casque d'Argent", peBonus: 4 }),
    makeSpecialItem('id-3', { name: 'Poignard de Vashna' }),
  ]

  it('returns empty array when selectedIds is empty', () => {
    expect(filterCarryOverItems(items, [])).toEqual([])
  })

  it('ignores unknown ids silently', () => {
    expect(filterCarryOverItems(items, ['unknown-id'])).toHaveLength(0)
  })

  it('returns only items whose id is in selectedIds', () => {
    const result = filterCarryOverItems(items, ['id-1', 'id-3'])
    expect(result).toHaveLength(2)
    expect(result.map(i => i.id)).toEqual(['id-1', 'id-3'])
  })

  it('preserves all item properties (hcBonus, peBonus, effect)', () => {
    const result = filterCarryOverItems(items, ['id-1'])
    expect(result[0]).toEqual(items[0])
  })

  it('truncates to 12 items when more than 12 ids are selected', () => {
    const manyItems = Array.from({ length: 15 }, (_, i) => makeSpecialItem(`id-${i}`))
    const allIds = manyItems.map(i => i.id)
    expect(filterCarryOverItems(manyItems, allIds)).toHaveLength(12)
  })

  it('returns items in their original order', () => {
    const result = filterCarryOverItems(items, ['id-3', 'id-1'])
    expect(result.map(i => i.id)).toEqual(['id-1', 'id-3'])
  })
})
