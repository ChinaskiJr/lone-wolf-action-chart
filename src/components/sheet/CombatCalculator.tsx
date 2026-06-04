import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Dices, Swords, SkipForward } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { getTotalCS, hasDisciplineForModifier } from '@/utils/character'
import { DeathModal } from './DeathModal'
import { resolveCombatRound, simulateCombat, type CombatRound } from '@/utils/combat'
import { rollD10 } from '@/utils/rng'
import { COMBAT_MODIFIERS } from '@/data/combatModifiers'

interface Props {
  onClose: () => void
}

export function CombatCalculator({ onClose }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, setEnduranceCurrent } = useCharacterStore()
  if (!character) return null

  const basePlayerCS = getTotalCS(character)
  const [enemyCS, setEnemyCS] = useState(15)
  const [enemyEP, setEnemyEP] = useState(20)
  const [enemyCurrentEP, setEnemyCurrentEP] = useState(20)
  const [lastRound, setLastRound] = useState<CombatRound | null>(null)
  const [simulationRounds, setSimulationRounds] = useState<CombatRound[]>([])
  const [showSim, setShowSim] = useState(false)
  const [victory, setVictory] = useState(false)
  const [defeat, setDefeat] = useState(false)
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set())
  const [situationalMod, setSituationalMod] = useState(0)

  const visibleModifiers = COMBAT_MODIFIERS.filter(m => m.visibleFor.includes(character.cycle))

  const disciplineBonusHC = Array.from(activeModifiers).reduce((sum, id) => {
    const mod = COMBAT_MODIFIERS.find(m => m.id === id)
    return sum + (mod?.hcBonus ?? 0)
  }, 0)
  const playerCS = basePlayerCS + disciplineBonusHC + situationalMod

  function toggleModifier(id: string) {
    const mod = COMBAT_MODIFIERS.find(m => m.id === id)
    if (!mod) return
    setActiveModifiers(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        mod.exclusiveWith?.forEach(eid => next.delete(eid))
        next.add(id)
      }
      return next
    })
  }

  function handleRoll() {
    const rn = rollD10()
    const round = resolveCombatRound(playerCS, enemyCS, rn)
    setLastRound(round)
    setShowSim(false)
  }

  function handleApplyDamage() {
    if (!lastRound) return
    const epCostModifiers = Array.from(activeModifiers).reduce((sum, id) => {
      const mod = COMBAT_MODIFIERS.find(m => m.id === id)
      return sum + (mod?.epCostPerRound ?? 0)
    }, 0)
    const newPlayerEP = lastRound.playerKilled
      ? 0
      : Math.max(0, character!.endurance.current - lastRound.playerLoss - epCostModifiers)
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
    setActiveModifiers(new Set())
    setSituationalMod(0)
  }

  function handleSimulate() {
    const rounds = simulateCombat(playerCS, character!.endurance.current, enemyCS, enemyCurrentEP)
    setSimulationRounds(rounds)
    setShowSim(true)
    setLastRound(null)
  }

  const ratio = playerCS - enemyCS
  const ratioColor = ratio > 0 ? 'text-green-400' : ratio < 0 ? 'text-red-400' : 'text-slate-400'
  const modColor = situationalMod > 0 ? 'text-green-400' : situationalMod < 0 ? 'text-red-400' : 'text-slate-400'

  const enemyEPPercent = enemyEP > 0 ? enemyCurrentEP / enemyEP : 0
  const enemyBarColor =
    enemyEPPercent > 0.66 ? 'bg-green-500' :
    enemyEPPercent > 0.33 ? 'bg-orange-500' :
    'bg-red-500'

  const playerEPPercent = character.endurance.max > 0 ? character.endurance.current / character.endurance.max : 0
  const playerBarColor =
    playerEPPercent > 0.66 ? 'bg-green-500' :
    playerEPPercent > 0.33 ? 'bg-orange-500' :
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
          <button onClick={onClose} aria-label={t('common.close')} className="relative p-1 text-slate-500 hover:text-slate-300 transition-colors before:absolute before:inset-[-8px]">
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
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {defeat && (
          <DeathModal onClose={onClose} onReplay={handleNewCombat} />
        )}

        <div className={`p-5 flex flex-col gap-4 ${victory || defeat ? 'hidden' : ''}`}>
          {/* CS display */}
          <div className="grid grid-cols-4 gap-2 text-center bg-slate-800/40 rounded-xl p-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">{t('combat.playerCS')}</div>
              <div className="text-3xl font-bold text-amber-400">{playerCS}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">{t('combat.modifier')}</div>
              <input
                type="number"
                value={situationalMod}
                onChange={e => setSituationalMod(Number(e.target.value))}
                onFocus={e => e.target.select()}
                className={`w-full bg-slate-900 border border-slate-700 rounded-lg text-center text-3xl font-bold focus:outline-none focus:border-amber-600 py-0 ${modColor}`}
              />
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

          {/* Discipline bonuses */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2">{t('combat.disciplineBonuses')}</div>
            <div className="flex flex-col gap-1.5">
              {visibleModifiers.map(mod => {
                const owned = hasDisciplineForModifier(character, mod)
                const active = activeModifiers.has(mod.id)
                const label = lang === 'fr' ? mod.labelFr : mod.labelEn
                const condition = lang === 'fr' ? mod.conditionFr : mod.conditionEn
                return (
                  <label
                    key={mod.id}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors ${
                      owned ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                    } ${active ? 'bg-amber-900/20 border border-amber-800/40' : 'border border-transparent'}`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={!owned}
                      onChange={() => toggleModifier(mod.id)}
                      className="accent-amber-500 w-3.5 h-3.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-medium ${active ? 'text-amber-200' : 'text-slate-300'}`}>{label}</span>
                        <span className={`text-xs font-semibold rounded px-1 ${active ? 'text-amber-400 bg-amber-900/40' : 'text-slate-500 bg-slate-700/40'}`}>
                          +{mod.hcBonus} HC
                        </span>
                      </div>
                      {condition && (
                        <div className={`text-xs mt-0.5 ${active ? 'text-amber-600/80' : 'text-slate-600'}`}>{condition}</div>
                      )}
                    </div>
                  </label>
                )
              })}
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
                  title={t('combat.reset')}
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

          {/* Player EP bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t('combat.yourEP')}</span>
              <span className="text-sm font-bold text-slate-200">
                {character.endurance.current} <span className="text-slate-500 font-normal">/ {character.endurance.max}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${playerBarColor}`}
                style={{ width: `${Math.max(0, Math.min(100, playerEPPercent * 100))}%` }}
              />
            </div>
          </div>

          {/* Single round result */}
          {lastRound && !showSim && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{t('combat.randomNumber')}:</span>
                <span className="text-xl font-bold text-amber-300">{lastRound.randomNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`text-center rounded-lg p-3 ${lastRound.playerLoss > 0 || lastRound.playerKilled ? 'bg-red-950/40 border border-red-900' : 'bg-green-950/30 border border-green-900'}`}>
                  <div className="text-xs text-slate-400 mb-1">{t('combat.playerLoss')}</div>
                  {lastRound.playerKilled ? (
                    <div className="text-lg font-bold text-red-400">{t('combat.instantKill')}</div>
                  ) : (
                    <div className={`text-2xl font-bold ${lastRound.playerLoss > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      -{lastRound.playerLoss}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    PE: {character.endurance.current} → {lastRound.playerKilled ? 0 : Math.max(0, character.endurance.current - lastRound.playerLoss)}
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
                    <span className="text-amber-600">{t('combat.die')} {r.randomNumber}</span>
                    <span className="text-red-400">{r.playerKilled ? t('combat.instantKill') : `-${r.playerLoss} PE`}</span>
                    <span className="text-green-400">{r.enemyKilled ? t('combat.killed') : `-${r.enemyLoss} PE ${t('combat.enemy')}`}</span>
                  </div>
                ))}
              </div>
              {(() => {
                const totalPlayerLoss = simulationRounds.reduce((s, r) => s + r.playerLoss, 0)
                const lastRoundData = simulationRounds[simulationRounds.length - 1]
                const enemyDead = lastRoundData.enemyKilled || simulationRounds.reduce((s, r) => s + r.enemyLoss, 0) >= enemyCurrentEP
                const playerDead = simulationRounds.some(r => r.playerKilled) || totalPlayerLoss >= character.endurance.current
                return (
                  <div className={`text-sm font-medium text-center py-2 rounded-lg ${
                    enemyDead && !playerDead ? 'text-green-400 bg-green-950/40' :
                    playerDead ? 'text-red-400 bg-red-950/40' :
                    'text-yellow-400 bg-yellow-950/40'
                  }`}>
                    {enemyDead && !playerDead ? t('combat.simVictory') : playerDead ? t('combat.simDefeat') : t('combat.simOngoing')}
                  </div>
                )
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
