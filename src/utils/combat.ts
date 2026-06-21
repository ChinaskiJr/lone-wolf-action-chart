import { lookupCombatResult, K } from '@/data/combatTable'
import { rollD10 } from './rng'

export interface CombatRound {
  randomNumber: number
  playerLoss: number
  enemyLoss: number
  enemyKilled: boolean
  playerKilled: boolean
}

export function resolveCombatRound(playerCS: number, enemyCS: number, rn?: number): CombatRound {
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
  maxRounds = 50,
  surprisedParty: 'hero' | 'enemy' | null = null,
  surpriseRounds = 0,
  psychicTarget: 'hero' | 'enemy' | null = null,
  psychicDmgPerRound = 0,
  psychicRounds = 0
): CombatRound[] {
  const rounds: CombatRound[] = []
  let pEP = playerEP
  let eEP = enemyEP

  for (let i = 0; i < maxRounds; i++) {
    const round = resolveCombatRound(playerCS, enemyCS)
    rounds.push(round)

    const heroImmune = surprisedParty === 'hero' && i < surpriseRounds
    const enemyImmune = surprisedParty === 'enemy' && i < surpriseRounds
    const psychicHero = psychicTarget === 'hero' && i < psychicRounds ? psychicDmgPerRound : 0
    const psychicEnemy = psychicTarget === 'enemy' && i < psychicRounds ? psychicDmgPerRound : 0

    if (round.playerKilled) {
      pEP = 0
    } else {
      pEP -= (heroImmune ? 0 : round.playerLoss) + psychicHero
    }
    if (round.enemyKilled) {
      eEP = 0
    } else {
      eEP -= (enemyImmune ? 0 : round.enemyLoss) + psychicEnemy
    }

    if (eEP <= 0 || pEP <= 0) break
  }

  return rounds
}
