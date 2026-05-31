import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Dices, Swords, SkipForward } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { getTotalCS } from '@/utils/character'
import { DeathModal } from './DeathModal'
import { resolveCombatRound, simulateCombat, type CombatRound } from '@/utils/combat'
import { rollD10 } from '@/utils/rng'

interface Props {
  onClose: () => void
}

export function CombatCalculator({ onClose }: Props) {
  const { t } = useTranslation()
  const { character, setEnduranceCurrent } = useCharacterStore()
  if (!character) return null

  const playerCS = getTotalCS(character)
  const [enemyCS, setEnemyCS] = useState(15)
  const [enemyEP, setEnemyEP] = useState(20)
  const [enemyCurrentEP, setEnemyCurrentEP] = useState(20)
  const [lastRound, setLastRound] = useState<CombatRound | null>(null)
  const [simulationRounds, setSimulationRounds] = useState<CombatRound[]>([])
  const [showSim, setShowSim] = useState(false)
  const [victory, setVictory] = useState(false)
  const [defeat, setDefeat] = useState(false)

  function handleRoll() {
    const rn = rollD10()
    const round = resolveCombatRound(playerCS, enemyCS, rn)
    setLastRound(round)
    setShowSim(false)
  }

  function handleApplyDamage() {
    if (!lastRound) return
    const newPlayerEP = Math.max(0, character!.endurance.current - lastRound.playerLoss)
    const newEnemyEP = lastRound.enemyKilled ? 0 : Math.max(0, enemyCurrentEP - lastRound.enemyLoss)
    setEnduranceCurrent(newPlayerEP)
    setEnemyCurrentEP(newEnemyEP)
    setLastRound(null)
    if (lastRound.enemyKilled || newEnemyEP <= 0) {
      setTimeout(() => setVictory(true), 150)
    } else if (newPlayerEP <= 0) {
      setTimeout(() => setDefeat(true), 150)
    }
  }

  function handleNewCombat() {
    setVictory(false)
    setDefeat(false)
    setEnemyCurrentEP(enemyEP)
    setLastRound(null)
    setSimulationRounds([])
    setShowSim(false)
  }

  function handleSimulate() {
    const rounds = simulateCombat(playerCS, character!.endurance.current, enemyCS, enemyCurrentEP)
    setSimulationRounds(rounds)
    setShowSim(true)
    setLastRound(null)
  }

  const ratio = playerCS - enemyCS
  const ratioColor = ratio > 0 ? 'text-green-400' : ratio < 0 ? 'text-red-400' : 'text-slate-400'

  const enemyEPPercent = enemyEP > 0 ? enemyCurrentEP / enemyEP : 0
  const enemyBarColor =
    enemyEPPercent > 0.66 ? 'bg-green-500' :
    enemyEPPercent > 0.33 ? 'bg-orange-500' :
    'bg-red-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-300 font-serif font-semibold">
            <Swords size={18} />
            {t('combat.title')}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Victory screen */}
        {victory && (
          <div className="p-8 flex flex-col items-center gap-5 animate-victory">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-amber-500/10 animate-ping-slow" />
              <div className="w-16 h-16 rounded-full bg-amber-900/40 border border-amber-700/60 flex items-center justify-center">
                <Swords size={28} className="text-amber-400" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-serif font-semibold text-amber-100 mb-1">{t('combat.victory')}</div>
              <div className="text-sm text-slate-400">
                {t('combat.epAfter')} : <span className="text-green-400 font-medium">{character.endurance.current}</span>
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleNewCombat}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-sm transition-colors"
              >
                {t('combat.newCombat')}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {defeat && (
          <DeathModal onClose={onClose} onReplay={handleNewCombat} />
        )}

        <div className={`p-5 flex flex-col gap-4 ${victory || defeat ? 'hidden' : ''}`}>
          {/* CS display */}
          <div className="grid grid-cols-3 gap-3 text-center bg-slate-800/40 rounded-xl p-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">{t('combat.playerCS')}</div>
              <div className="text-3xl font-bold text-amber-400">{playerCS}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Ratio</div>
              <div className={`text-3xl font-bold ${ratioColor}`}>
                {ratio >= 0 ? '+' : ''}{ratio}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">{t('combat.enemyCS')}</div>
              <input
                type="number"
                value={enemyCS}
                onChange={e => setEnemyCS(Number(e.target.value))}
                onFocus={e => e.target.select()}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg text-center text-3xl font-bold text-red-400 focus:outline-none focus:border-amber-600 py-0"
              />
            </div>
          </div>

          {/* Enemy EP */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 shrink-0">{t('combat.enemyEP')}:</span>
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => { setEnemyEP(Number(enemyCS)); setEnemyCurrentEP(Number(enemyCS)) }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  title="Réinitialiser"
                >↺</button>
                <input
                  type="number"
                  value={enemyCurrentEP}
                  onChange={e => setEnemyCurrentEP(Math.max(0, Number(e.target.value)))}
                  onFocus={e => e.target.select()}
                  className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-lg font-bold text-slate-100 focus:outline-none focus:border-amber-600"
                />
                <span className="text-slate-500 text-sm">/</span>
                <input
                  type="number"
                  value={enemyEP}
                  onChange={e => { setEnemyEP(Number(e.target.value)); setEnemyCurrentEP(Number(e.target.value)) }}
                  onFocus={e => e.target.select()}
                  className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-lg font-bold text-slate-400 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${enemyBarColor}`}
                style={{ width: `${Math.max(0, Math.min(100, enemyEPPercent * 100))}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRoll}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors"
            >
              <Dices size={16} />
              {t('combat.roll')}
            </button>
            <button
              onClick={handleSimulate}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-sm transition-colors"
              title={t('combat.simulate')}
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Single round result */}
          {lastRound && !showSim && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{t('combat.randomNumber')}:</span>
                <span className="text-xl font-bold text-amber-300">{lastRound.randomNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`text-center rounded-lg p-3 ${lastRound.playerLoss > 0 ? 'bg-red-950/40 border border-red-900' : 'bg-green-950/30 border border-green-900'}`}>
                  <div className="text-xs text-slate-400 mb-1">{t('combat.playerLoss')}</div>
                  <div className={`text-2xl font-bold ${lastRound.playerLoss > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    -{lastRound.playerLoss}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    PE: {character.endurance.current} → {Math.max(0, character.endurance.current - lastRound.playerLoss)}
                  </div>
                </div>
                <div className={`text-center rounded-lg p-3 ${lastRound.enemyKilled ? 'bg-green-950/40 border border-green-700' : 'bg-red-950/30 border border-red-900'}`}>
                  <div className="text-xs text-slate-400 mb-1">{t('combat.enemyLoss')}</div>
                  {lastRound.enemyKilled ? (
                    <div className="text-lg font-bold text-green-400">{t('combat.instantKill')}</div>
                  ) : (
                    <div className="text-2xl font-bold text-green-400">-{lastRound.enemyLoss}</div>
                  )}
                  {!lastRound.enemyKilled && (
                    <div className="text-xs text-slate-500 mt-1">
                      PE: {enemyCurrentEP} → {Math.max(0, enemyCurrentEP - lastRound.enemyLoss)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleApplyDamage}
                className="w-full mt-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
              >
                {t('combat.applyDamage')}
              </button>
            </div>
          )}

          {/* Simulation results */}
          {showSim && simulationRounds.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-2">
                {t('combat.roundsResult', { rounds: simulationRounds.length })}
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                {simulationRounds.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 w-14 shrink-0">Round {i + 1}:</span>
                    <span className="text-amber-600">Dé {r.randomNumber}</span>
                    <span className="text-red-400">-{r.playerLoss} PE</span>
                    <span className="text-green-400">{r.enemyKilled ? '⚔ Tué' : `-${r.enemyLoss} PE enn.`}</span>
                  </div>
                ))}
              </div>
              {(() => {
                const totalPlayerLoss = simulationRounds.reduce((s, r) => s + r.playerLoss, 0)
                const lastRoundData = simulationRounds[simulationRounds.length - 1]
                const enemyDead = lastRoundData.enemyKilled || simulationRounds.reduce((s, r) => s + r.enemyLoss, 0) >= enemyCurrentEP
                const playerDead = totalPlayerLoss >= character.endurance.current
                return (
                  <div className={`text-sm font-medium text-center py-2 rounded-lg ${
                    enemyDead && !playerDead ? 'text-green-400 bg-green-950/40' :
                    playerDead ? 'text-red-400 bg-red-950/40' :
                    'text-yellow-400 bg-yellow-950/40'
                  }`}>
                    {enemyDead && !playerDead ? '⚔ Victoire !' : playerDead ? '☠ Défaite' : '🛡 Combat non conclu'}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Current EP summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-800">
            <span>Vos PE actuels: <span className="text-slate-300 font-medium">{character.endurance.current}</span></span>
            <span>PE ennemi: <span className="text-slate-300 font-medium">{enemyCurrentEP}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
