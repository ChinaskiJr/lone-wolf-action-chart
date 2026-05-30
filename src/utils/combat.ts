import { lookupCombatResult } from '@/data/combatTable'
import { rollD10 } from './rng'

export interface CombatRound {
  randomNumber: number
  playerLoss: number
  enemyLoss: number
  enemyKilled: boolean
}

export function resolveCombatRound(
  playerCS: number,
  enemyCS: number,
  rn?: number
): CombatRound {
  const randomNumber = rn ?? rollD10()
  const [playerLoss, enemyLoss] = lookupCombatResult(playerCS, enemyCS, randomNumber)
  return {
    randomNumber,
    playerLoss,
    enemyLoss,
    // 0 in the table with ratio >= 4 means instant kill
    enemyKilled: enemyLoss === 0 && playerCS - enemyCS >= 4,
  }
}

export function simulateCombat(
  playerCS: number,
  playerEP: number,
  enemyCS: number,
  enemyEP: number,
  maxRounds = 50
): CombatRound[] {
  const rounds: CombatRound[] = []
  let pEP = playerEP
  let eEP = enemyEP

  for (let i = 0; i < maxRounds; i++) {
    const round = resolveCombatRound(playerCS, enemyCS)
    rounds.push(round)

    pEP -= round.playerLoss
    eEP -= round.enemyLoss

    if (round.enemyKilled || eEP <= 0 || pEP <= 0) break
  }

  return rounds
}
