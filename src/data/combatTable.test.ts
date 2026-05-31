import { describe, it, expect } from 'vitest'
import { lookupCombatResult, COMBAT_TABLE } from './combatTable'

describe('lookupCombatResult', () => {
  it('returns the correct value for ratio 0, rn 0', () => {
    expect(lookupCombatResult(10, 10, 0)).toEqual([3, 5])
  })

  it('returns the correct value for ratio 0, rn 5', () => {
    expect(lookupCombatResult(10, 10, 5)).toEqual([0, 9])
  })

  it('returns the correct value for ratio 0, rn 9', () => {
    expect(lookupCombatResult(10, 10, 9)).toEqual([0, 14])
  })

  it('clamps ratio above +11 to +11', () => {
    // ratio +15 and ratio +11 must produce identical results
    expect(lookupCombatResult(25, 10, 0)).toEqual(lookupCombatResult(21, 10, 0))
    expect(lookupCombatResult(25, 10, 0)).toEqual(COMBAT_TABLE['11'][0])
  })

  it('clamps ratio below -11 to -11', () => {
    expect(lookupCombatResult(5, 20, 0)).toEqual(lookupCombatResult(9, 20, 0))
    expect(lookupCombatResult(5, 20, 0)).toEqual(COMBAT_TABLE['-11'][0])
  })

  it('clamps rn below 0 to 0', () => {
    expect(lookupCombatResult(10, 10, -3)).toEqual(lookupCombatResult(10, 10, 0))
  })

  it('clamps rn above 9 to 9', () => {
    expect(lookupCombatResult(10, 10, 15)).toEqual(lookupCombatResult(10, 10, 9))
  })

  it('returns correct damage for negative ratio', () => {
    // ratio -5, rn 0 → table['-5'][0] = [5, 3]
    expect(lookupCombatResult(5, 10, 0)).toEqual([5, 3])
  })

  it('returns correct damage for positive ratio', () => {
    // ratio +4, rn 0 → table['4'][0] = [0, 8]
    expect(lookupCombatResult(14, 10, 0)).toEqual([0, 8])
  })
})
