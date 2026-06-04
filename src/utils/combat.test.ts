import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveCombatRound, simulateCombat } from './combat'

vi.mock('@/utils/rng', () => ({
  rollD10: vi.fn(() => 5),
}))

import { rollD10 } from '@/utils/rng'

beforeEach(() => {
  vi.mocked(rollD10).mockReturnValue(5)
})

describe('resolveCombatRound', () => {
  it('uses the provided rn and does not call rollD10', () => {
    resolveCombatRound(15, 10, 3)
    expect(rollD10).not.toHaveBeenCalled()
  })

  it('calls rollD10 when rn is not provided', () => {
    resolveCombatRound(15, 10)
    expect(rollD10).toHaveBeenCalledOnce()
  })

  it('returns correct playerLoss and enemyLoss from the table', () => {
    // ratio 0, rn 5 → table[5][6] = [7, 2] (enemyLoss, playerLoss)
    const round = resolveCombatRound(10, 10, 5)
    expect(round.enemyLoss).toBe(7)
    expect(round.playerLoss).toBe(2)
    expect(round.randomNumber).toBe(5)
  })

  it('sets enemyKilled=true when the table cell enemy loss is K', () => {
    // ratio +11, rn 0 → table[0][12] = [K, 0] → enemy instantly slain
    const round = resolveCombatRound(21, 10, 0)
    expect(round.enemyKilled).toBe(true)
    expect(round.enemyLoss).toBe(0)
  })

  it('sets enemyKilled=false when enemy loss is non-zero', () => {
    // ratio +4, rn 0 → table[0][8] = [16, 0]
    const round = resolveCombatRound(14, 10, 0)
    expect(round.enemyLoss).toBe(16)
    expect(round.enemyKilled).toBe(false)
  })

  it('sets playerKilled=true when the table cell player loss is K', () => {
    // ratio -15, rn 1 → table[1][0] = [0, K] → Lone Wolf instantly slain
    const round = resolveCombatRound(5, 20, 1)
    expect(round.playerKilled).toBe(true)
    expect(round.playerLoss).toBe(0)
  })
})

describe('simulateCombat', () => {
  it('terminates when enemy EP reaches 0', () => {
    // ratio +11 (massive advantage); rn 5 → table[5][12] = [14, 1]
    // enemy (10 EP) is destroyed in a single round
    vi.mocked(rollD10).mockReturnValue(5)
    const rounds = simulateCombat(21, 25, 10, 10)
    expect(rounds.length).toBeGreaterThan(0)
    const totalEnemyLoss = rounds.reduce((sum, r) => sum + r.enemyLoss, 0)
    expect(totalEnemyLoss).toBeGreaterThanOrEqual(10)
  })

  it('terminates when player EP reaches 0', () => {
    // ratio -15 (massive disadvantage); rn 3 → table[3][0] = [0, 8]
    // Lone Wolf (5 EP) takes 8 damage and falls
    vi.mocked(rollD10).mockReturnValue(3)
    const rounds = simulateCombat(5, 5, 20, 100)
    const totalPlayerLoss = rounds.reduce((sum, r) => sum + r.playerLoss, 0)
    expect(totalPlayerLoss).toBeGreaterThanOrEqual(5)
  })

  it('respects maxRounds and does not loop forever', () => {
    // Force a draw scenario: ratio 0, rn 0 → [3, 5] each round
    // Player has huge EP so never dies; limit rounds
    vi.mocked(rollD10).mockReturnValue(0)
    const rounds = simulateCombat(10, 1000, 10, 1000, 10)
    expect(rounds.length).toBeLessThanOrEqual(10)
  })

  it('returns all rounds as an array', () => {
    vi.mocked(rollD10).mockReturnValue(0)
    const rounds = simulateCombat(10, 10, 10, 10, 5)
    expect(Array.isArray(rounds)).toBe(true)
    expect(rounds.length).toBeGreaterThan(0)
  })
})
