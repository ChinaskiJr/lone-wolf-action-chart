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
    // ratio 0, rn 0 → [3, 5]
    const round = resolveCombatRound(10, 10, 0)
    expect(round.playerLoss).toBe(3)
    expect(round.enemyLoss).toBe(5)
    expect(round.randomNumber).toBe(0)
  })

  it('sets enemyKilled=true when ratio >= 4 and enemyLoss === 0', () => {
    // ratio +4, rn 9 → table['4'][9] = [0, 0] → instant kill
    const round = resolveCombatRound(14, 10, 9)
    expect(round.enemyLoss).toBe(0)
    expect(round.enemyKilled).toBe(true)
  })

  it('sets enemyKilled=false when ratio >= 4 but enemyLoss !== 0', () => {
    // ratio +4, rn 0 → table['4'][0] = [0, 8]
    const round = resolveCombatRound(14, 10, 0)
    expect(round.enemyLoss).toBe(8)
    expect(round.enemyKilled).toBe(false)
  })

  it('sets enemyKilled=false when ratio < 4 even if result would be 0', () => {
    // ratio +3, rn 9 → table['3'][9] = [0, 20] → enemyLoss=20, not instant kill
    const round = resolveCombatRound(13, 10, 9)
    expect(round.enemyKilled).toBe(false)
  })
})

describe('simulateCombat', () => {
  it('terminates when enemy EP reaches 0', () => {
    // ratio +11 (massive advantage), every round deals heavy damage to enemy
    // rollD10 mocked to 5 → table['11'][5] = [0, 0] → instant kill on first round
    vi.mocked(rollD10).mockReturnValue(5)
    const rounds = simulateCombat(21, 25, 10, 10)
    expect(rounds.length).toBeGreaterThan(0)
    expect(rounds[rounds.length - 1].enemyKilled).toBe(true)
  })

  it('terminates when player EP reaches 0', () => {
    // ratio -11 (massive disadvantage), player takes heavy damage each round
    // rollD10 mocked to 0 → table['-11'][0] = [8, 0]
    vi.mocked(rollD10).mockReturnValue(0)
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
