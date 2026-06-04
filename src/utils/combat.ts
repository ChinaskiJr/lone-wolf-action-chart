import { lookupCombatResult, K } from '@/data/combatTable'
import { rollD10 } from './rng'

export interface CombatRound {
  randomNumber: number
  playerLoss: number
  enemyLoss: number
  enemyKilled: boolean
  playerKilled: boolean
}

export function resolveCombatRound(
  playerCS: number,
  enemyCS: number,
  rn?: number
): CombatRound {
  const randomNumber = rn ?? rollD10()
  const [rawEnemyLoss, rawPlayerLoss] = lookupCombatResult(playerCS, enemyCS, randomNumber)
  const playerKilled = rawPlayerLoss === K
  const enemyKilled = rawEnemyLoss === K
  return {
    randomNumber,
    playerLoss: playerKilled ? 0 : rawPlayerLoss,
    enemyLoss: enemyKilled ? 0 : rawEnemyLoss,
    enemyKilled,
    playerKilled,
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

    if (round.playerKilled) { pEP = 0 } else { pEP -= round.playerLoss }
    if (round.enemyKilled)  { eEP = 0 } else { eEP -= round.enemyLoss }

    if (eEP <= 0 || pEP <= 0) break
  }

  return rounds
}
