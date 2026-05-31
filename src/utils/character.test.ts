import { describe, it, expect } from 'vitest'
import { getTotalCS, getTotalEPMax, computeRank, createCarryOverItems } from './character'
import { makeKaiChar, makeMagnakaiChar, makeGrandMasterChar, makeNewOrderChar } from '@/test/fixtures'
import type { SpecialItem } from '@/types/game'

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
  it('returns correct kai rank', () => {
    const char = makeKaiChar({ disciplines: ['a', 'b', 'c', 'd', 'e'] as any })
    expect(computeRank(char)).toBe('aspirant')
  })

  it('returns correct magnakai rank', () => {
    const char = makeMagnakaiChar({ disciplines: ['a', 'b', 'c'] as any })
    expect(computeRank(char)).toBe('primate')
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

const CATALOGUE = [
  { key: 'sommerswerd', fr: 'Glaive de Sommer', en: 'Sommerswerd (Sword of the Sun)' },
  { key: 'silverHelm', fr: "Casque d'Argent", en: 'Silver Helm' },
  { key: 'daggerOfVashna', fr: 'Poignard de Vashna', en: 'Dagger of Vashna' },
]

describe('createCarryOverItems', () => {
  it('returns empty array when no keys are selected', () => {
    expect(createCarryOverItems([], CATALOGUE, 'fr')).toEqual([])
  })

  it('ignores unknown keys silently', () => {
    const result = createCarryOverItems(['unknownKey'], CATALOGUE, 'fr')
    expect(result).toHaveLength(0)
  })

  it('creates items with the French name when lang is fr', () => {
    const result = createCarryOverItems(['sommerswerd'], CATALOGUE, 'fr')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Glaive de Sommer')
  })

  it('creates items with the English name when lang is en', () => {
    const result = createCarryOverItems(['sommerswerd'], CATALOGUE, 'en')
    expect(result[0].name).toBe('Sommerswerd (Sword of the Sun)')
  })

  it('returns only items whose key is in selectedKeys', () => {
    const result = createCarryOverItems(['sommerswerd', 'daggerOfVashna'], CATALOGUE, 'fr')
    expect(result).toHaveLength(2)
    expect(result.map(i => i.name)).toContain('Glaive de Sommer')
    expect(result.map(i => i.name)).toContain('Poignard de Vashna')
    expect(result.map(i => i.name)).not.toContain("Casque d'Argent")
  })

  it('truncates to 12 items when more than 12 keys are selected', () => {
    const bigCatalogue = Array.from({ length: 15 }, (_, i) => ({
      key: `item${i}`, fr: `Objet ${i}`, en: `Item ${i}`,
    }))
    const allKeys = bigCatalogue.map(i => i.key)
    const result = createCarryOverItems(allKeys, bigCatalogue, 'fr')
    expect(result).toHaveLength(12)
  })

  it('assigns a unique id to each created item', () => {
    const result = createCarryOverItems(
      ['sommerswerd', 'silverHelm', 'daggerOfVashna'],
      CATALOGUE,
      'fr'
    )
    const ids = result.map(i => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
