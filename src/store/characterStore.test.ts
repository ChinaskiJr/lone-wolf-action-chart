import { describe, it, expect, beforeEach } from 'vitest'
import { useCharacterStore } from './characterStore'
import { makeKaiChar, makeGrandMasterChar } from '@/test/fixtures'
import type { BackpackItem } from '@/types/game'

function makeItem(overrides: Partial<BackpackItem> = {}): BackpackItem {
  return { id: `item-${Math.random()}`, name: 'Test Item', ...overrides }
}

beforeEach(() => {
  useCharacterStore.setState({ character: null })
})

describe('addBackpackItem', () => {
  it('adds an item when backpack has room', () => {
    useCharacterStore.setState({ character: makeKaiChar() })
    useCharacterStore.getState().addBackpackItem(makeItem({ id: 'a' }))
    expect(useCharacterStore.getState().character?.backpack).toHaveLength(1)
  })

  it('rejects when backpack is full (8 slots for kai)', () => {
    const backpack = Array.from({ length: 8 }, (_, i) => makeItem({ id: `item-${i}` }))
    useCharacterStore.setState({ character: makeKaiChar({ backpack }) })
    useCharacterStore.getState().addBackpackItem(makeItem({ id: 'overflow' }))
    expect(useCharacterStore.getState().character?.backpack).toHaveLength(8)
  })

  it('rejects a 2-slot item when only 1 slot remains', () => {
    const backpack = Array.from({ length: 7 }, (_, i) => makeItem({ id: `item-${i}` }))
    useCharacterStore.setState({ character: makeKaiChar({ backpack }) })
    useCharacterStore.getState().addBackpackItem(makeItem({ id: 'rope', slots: 2 }))
    expect(useCharacterStore.getState().character?.backpack).toHaveLength(7)
  })

  it('accepts a 2-slot item when 2 slots remain', () => {
    const backpack = Array.from({ length: 6 }, (_, i) => makeItem({ id: `item-${i}` }))
    useCharacterStore.setState({ character: makeKaiChar({ backpack }) })
    useCharacterStore.getState().addBackpackItem(makeItem({ id: 'rope', slots: 2 }))
    expect(useCharacterStore.getState().character?.backpack).toHaveLength(7)
  })

  it('counts meals toward slot limit', () => {
    // 7 meals + 1 slot used → backpack full (8 slots kai)
    const backpack = Array.from({ length: 1 }, (_, i) => makeItem({ id: `item-${i}` }))
    useCharacterStore.setState({ character: makeKaiChar({ backpack, meals: 7 }) })
    useCharacterStore.getState().addBackpackItem(makeItem({ id: 'overflow' }))
    expect(useCharacterStore.getState().character?.backpack).toHaveLength(1)
  })
})

describe('usePotion', () => {
  it('restores EP and removes the potion from backpack', () => {
    const potion = makeItem({ id: 'potion-1', epRestore: 8 })
    const char = makeKaiChar({
      endurance: { current: 15, max: 30 },
      backpack: [potion],
    })
    useCharacterStore.setState({ character: char })
    useCharacterStore.getState().usePotion('potion-1')

    const state = useCharacterStore.getState().character!
    expect(state.endurance.current).toBe(23)
    expect(state.backpack).toHaveLength(0)
  })

  it('clamps restored EP to max endurance', () => {
    const potion = makeItem({ id: 'potion-1', epRestore: 10 })
    const char = makeKaiChar({
      endurance: { current: 22, max: 25 },
      backpack: [potion],
    })
    useCharacterStore.setState({ character: char })
    useCharacterStore.getState().usePotion('potion-1')

    expect(useCharacterStore.getState().character!.endurance.current).toBe(25)
  })

  it('does nothing for an item with no epRestore', () => {
    const item = makeItem({ id: 'non-potion' })
    const char = makeKaiChar({ backpack: [item], endurance: { current: 15, max: 25 } })
    useCharacterStore.setState({ character: char })
    useCharacterStore.getState().usePotion('non-potion')

    const state = useCharacterStore.getState().character!
    expect(state.endurance.current).toBe(15)
    expect(state.backpack).toHaveLength(1)
  })
})

describe('eatMeal', () => {
  it('consumes one meal when food is available', () => {
    useCharacterStore.setState({ character: makeKaiChar({ meals: 3, endurance: { current: 20, max: 25 } }) })
    useCharacterStore.getState().eatMeal()
    const state = useCharacterStore.getState().character!
    expect(state.meals).toBe(2)
    expect(state.endurance.current).toBe(20)
  })

  it('loses 3 EP when no meal is available', () => {
    useCharacterStore.setState({ character: makeKaiChar({ meals: 0, endurance: { current: 20, max: 25 } }) })
    useCharacterStore.getState().eatMeal()
    const state = useCharacterStore.getState().character!
    expect(state.meals).toBe(0)
    expect(state.endurance.current).toBe(17)
  })

  it('clamps EP loss at 0 when no meal and low EP', () => {
    useCharacterStore.setState({ character: makeKaiChar({ meals: 0, endurance: { current: 2, max: 25 } }) })
    useCharacterStore.getState().eatMeal()
    expect(useCharacterStore.getState().character!.endurance.current).toBe(0)
  })
})

describe('useDeliverance', () => {
  it('restores 20 EP when EP <= 8 and discipline owned', () => {
    useCharacterStore.setState({ character: makeGrandMasterChar({
      disciplines: ['deliverance'] as any,
      endurance: { current: 6, max: 35 },
    }) })
    useCharacterStore.getState().useDeliverance()
    const state = useCharacterStore.getState().character!
    expect(state.endurance.current).toBe(26)
    expect((state as any).deliveranceAvailable).toBe(false)
  })

  it('clamps restored EP to max', () => {
    useCharacterStore.setState({ character: makeGrandMasterChar({
      disciplines: ['deliverance'] as any,
      endurance: { current: 8, max: 20 },
    }) })
    useCharacterStore.getState().useDeliverance()
    expect(useCharacterStore.getState().character!.endurance.current).toBe(20)
  })

  it('does nothing when EP > 8', () => {
    useCharacterStore.setState({ character: makeGrandMasterChar({
      disciplines: ['deliverance'] as any,
      endurance: { current: 9, max: 35 },
    }) })
    useCharacterStore.getState().useDeliverance()
    expect(useCharacterStore.getState().character!.endurance.current).toBe(9)
  })

  it('does nothing when already used (deliveranceAvailable false)', () => {
    useCharacterStore.setState({ character: makeGrandMasterChar({
      disciplines: ['deliverance'] as any,
      endurance: { current: 5, max: 35 },
      deliveranceAvailable: false,
    }) })
    useCharacterStore.getState().useDeliverance()
    expect(useCharacterStore.getState().character!.endurance.current).toBe(5)
  })

  it('does nothing without the deliverance discipline', () => {
    useCharacterStore.setState({ character: makeGrandMasterChar({
      disciplines: [] as any,
      endurance: { current: 5, max: 35 },
    }) })
    useCharacterStore.getState().useDeliverance()
    expect(useCharacterStore.getState().character!.endurance.current).toBe(5)
  })

  it('recharges on completeBook (grandmaster)', () => {
    useCharacterStore.setState({ character: makeGrandMasterChar({
      disciplines: ['deliverance'] as any,
      deliveranceAvailable: false,
    }) })
    useCharacterStore.getState().completeBook(13)
    expect((useCharacterStore.getState().character as any).deliveranceAvailable).toBe(true)
  })
})

describe('setGold', () => {
  it('clamps gold above 50 to 50', () => {
    useCharacterStore.setState({ character: makeKaiChar({ goldCrowns: 10 }) })
    useCharacterStore.getState().setGold(99)
    expect(useCharacterStore.getState().character?.goldCrowns).toBe(50)
  })

  it('clamps gold below 0 to 0', () => {
    useCharacterStore.setState({ character: makeKaiChar({ goldCrowns: 10 }) })
    useCharacterStore.getState().setGold(-5)
    expect(useCharacterStore.getState().character?.goldCrowns).toBe(0)
  })

  it('sets gold within valid range', () => {
    useCharacterStore.setState({ character: makeKaiChar({ goldCrowns: 0 }) })
    useCharacterStore.getState().setGold(25)
    expect(useCharacterStore.getState().character?.goldCrowns).toBe(25)
  })
})

describe('setEnduranceCurrent', () => {
  it('clamps endurance below 0 to 0', () => {
    useCharacterStore.setState({ character: makeKaiChar({ endurance: { current: 5, max: 25 } }) })
    useCharacterStore.getState().setEnduranceCurrent(-10)
    expect(useCharacterStore.getState().character?.endurance.current).toBe(0)
  })

  it('accepts negative-delta values that result in 0', () => {
    useCharacterStore.setState({ character: makeKaiChar({ endurance: { current: 5, max: 25 } }) })
    useCharacterStore.getState().setEnduranceCurrent(0)
    expect(useCharacterStore.getState().character?.endurance.current).toBe(0)
  })
})

describe('setCombatSkillBonus', () => {
  it('accepts a negative bonus (curse)', () => {
    useCharacterStore.setState({ character: makeKaiChar({ combatSkill: { base: 15, bonus: 0 } }) })
    useCharacterStore.getState().setCombatSkillBonus(-3)
    expect(useCharacterStore.getState().character?.combatSkill.bonus).toBe(-3)
  })
})

describe('completeBook', () => {
  it('adds the book to booksCompleted', () => {
    useCharacterStore.setState({ character: makeKaiChar({ booksCompleted: [] }) })
    useCharacterStore.getState().completeBook(1)
    expect(useCharacterStore.getState().character?.booksCompleted).toContain(1)
  })

  it('does not add the same book twice', () => {
    useCharacterStore.setState({ character: makeKaiChar({ booksCompleted: [1] }) })
    useCharacterStore.getState().completeBook(1)
    expect(useCharacterStore.getState().character?.booksCompleted).toHaveLength(1)
  })

  it('stamps updatedAt', () => {
    const before = new Date('2020-01-01').toISOString()
    useCharacterStore.setState({
      character: makeKaiChar({ booksCompleted: [], updatedAt: before }),
    })
    useCharacterStore.getState().completeBook(1)
    expect(useCharacterStore.getState().character?.updatedAt).not.toBe(before)
  })
})
