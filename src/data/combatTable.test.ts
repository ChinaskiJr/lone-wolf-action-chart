import { describe, it, expect } from 'vitest'
import { lookupCombatResult, K } from './combatTable'

// lookupCombatResult returns [enemyLoss, playerLoss]; K = -1 means instant kill

describe('lookupCombatResult', () => {
  it('ratio=0, rn=0: enemy loses 12, player loses 0', () => {
    expect(lookupCombatResult(10, 10, 0)).toEqual([12, 0])
  })

  it('ratio=0, rn=5: enemy loses 7, player loses 2', () => {
    expect(lookupCombatResult(10, 10, 5)).toEqual([7, 2])
  })

  it('ratio=0, rn=9: enemy loses 11, player loses 0', () => {
    expect(lookupCombatResult(10, 10, 9)).toEqual([11, 0])
  })

  it('clamps ratio above +11 to ≥+11 bucket', () => {
    expect(lookupCombatResult(25, 10, 0)).toEqual(lookupCombatResult(21, 10, 0))
  })

  it('clamps ratio below -11 to ≤-11 bucket', () => {
    expect(lookupCombatResult(5, 20, 0)).toEqual(lookupCombatResult(9, 20, 0))
  })

  it('clamps rn below 0 to 0', () => {
    expect(lookupCombatResult(10, 10, -3)).toEqual(lookupCombatResult(10, 10, 0))
  })

  it('clamps rn above 9 to 9', () => {
    expect(lookupCombatResult(10, 10, 15)).toEqual(lookupCombatResult(10, 10, 9))
  })

  it('ratio=-5 (bucket -6/-5), rn=0: enemy loses 9, player loses 0', () => {
    expect(lookupCombatResult(5, 10, 0)).toEqual([9, 0])
  })

  it('ratio=+4 (bucket +3/+4), rn=0: enemy loses 16, player loses 0', () => {
    expect(lookupCombatResult(14, 10, 0)).toEqual([16, 0])
  })

  it('player is instantly killed at ratio ≤-11, rn=1', () => {
    expect(lookupCombatResult(0, 20, 1)).toEqual([0, K])
  })

  it('player is instantly killed at ratio ≤-11, rn=2', () => {
    expect(lookupCombatResult(0, 20, 2)).toEqual([0, K])
  })

  it('enemy is instantly killed at ratio ≥+11, rn=8', () => {
    expect(lookupCombatResult(22, 10, 8)).toEqual([K, 0])
  })

  it('enemy is instantly killed at ratio ≥+11, rn=9', () => {
    expect(lookupCombatResult(22, 10, 9)).toEqual([K, 0])
  })

  it('enemy is instantly killed at ratio ≥+11, rn=0', () => {
    expect(lookupCombatResult(22, 10, 0)).toEqual([K, 0])
  })
})
