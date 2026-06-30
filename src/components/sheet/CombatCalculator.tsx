import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  Dices,
  Swords,
  SkipForward,
  Footprints,
  HeartPulse,
  Crosshair,
  Flame,
  Skull,
  FlaskConical,
} from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import {
  getTotalCS,
  getTotalEPMax,
  hasDisciplineForModifier,
  isModifierSuperseded,
  getEffectiveModifier,
  getBowBonus,
  canIgnite,
} from '@/utils/character'
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
  const { character, setEnduranceCurrent, useDeliverance: triggerDeliverance } = useCharacterStore()
  const { combatPotionBonus, setCombatPotionBonus } = useUIStore()

  const [enemyCS, setEnemyCS] = useState(15)
  const [enemyEP, setEnemyEP] = useState(20)
  const [enemyCurrentEP, setEnemyCurrentEP] = useState(20)
  const [lastRound, setLastRound] = useState<CombatRound | null>(null)
  const [simulationRounds, setSimulationRounds] = useState<CombatRound[]>([])
  const [showSim, setShowSim] = useState(false)
  const [victory, setVictory] = useState(false)
  const [defeat, setDefeat] = useState(false)
  const [escaped, setEscaped] = useState(false)
  const [evading, setEvading] = useState(false)
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set())
  const [situationalMod, setSituationalMod] = useState(combatPotionBonus ?? 0)
  const [bowActive, setBowActive] = useState(false)
  const [igniteActive, setIgniteActive] = useState(false)
  const [enemyDmgMult, setEnemyDmgMult] = useState<'x2' | 'half' | null>(null)
  const [playerDmgMult, setPlayerDmgMult] = useState<'x2' | 'half' | null>(null)
  const [autoFighting, setAutoFighting] = useState(false)
  const [roundCount, setRoundCount] = useState(0)
  const autoFightRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [surprisedParty, setSurprisedParty] = useState<'hero' | 'enemy' | null>(null)
  const [surpriseRoundsTotal, setSurpriseRoundsTotal] = useState(1)
  const [surpriseRoundsLeft, setSurpriseRoundsLeft] = useState(0)
  const [psychicTarget, setPsychicTarget] = useState<'hero' | 'enemy' | null>(null)
  const [psychicDamagePerRound, setPsychicDamagePerRound] = useState(1)
  const [psychicRoundsTotal, setPsychicRoundsTotal] = useState(1)
  const [psychicRoundsLeft, setPsychicRoundsLeft] = useState(0)
  const [psychicInfinite, setPsychicInfinite] = useState(false)
  const [combatEffectsOpen, setCombatEffectsOpen] = useState(false)

  useEffect(
    () => () => {
      if (autoFightRef.current) clearInterval(autoFightRef.current)
    },
    []
  )

  if (!character) return null

  const basePlayerCS = getTotalCS(character)

  function handleClose() {
    setCombatPotionBonus(null)
    onClose()
  }

  const visibleModifiers = COMBAT_MODIFIERS.filter(
    (m) =>
      m.visibleFor.includes(character.cycle) &&
      !isModifierSuperseded(character, m) &&
      hasDisciplineForModifier(character, m)
  )

  // A surge modifier is locked when current EP is below its minimum.
  function isLocked(mod: (typeof COMBAT_MODIFIERS)[number]): boolean {
    const { minEP } = getEffectiveModifier(character!, mod)
    return minEP > 0 && character!.endurance.current < minEP
  }

  // Only non-locked active modifiers contribute to HC / EP cost.
  const effectiveActiveIds = Array.from(activeModifiers).filter((id) => {
    const mod = COMBAT_MODIFIERS.find((m) => m.id === id)
    return mod ? !isLocked(mod) : false
  })

  const disciplineBonusHC = effectiveActiveIds.reduce((sum, id) => {
    const mod = COMBAT_MODIFIERS.find((m) => m.id === id)
    return sum + (mod ? getEffectiveModifier(character, mod).hcBonus : 0)
  }, 0)
  const playerCS = basePlayerCS + disciplineBonusHC + situationalMod

  const bowBonus = getBowBonus(character)
  const ignitePossible = canIgnite(character)

  const hasDeliverance =
    character.cycle === 'grandmaster' && character.disciplines.includes('deliverance')
  const deliveranceReady =
    hasDeliverance && character.deliveranceAvailable !== false && character.endurance.current <= 8

  function toggleModifier(id: string) {
    const mod = COMBAT_MODIFIERS.find((m) => m.id === id)
    if (!mod) return
    setActiveModifiers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        mod.exclusiveWith?.forEach((eid) => next.delete(eid))
        next.add(id)
      }
      return next
    })
  }

  // Ranged attacks add the bow bonus to the picked number (clamped to 0-9).
  function rollNumber() {
    const rn = rollD10()
    return bowActive && bowBonus > 0 ? Math.max(0, Math.min(9, rn + bowBonus)) : rn
  }

  function handleRoll() {
    const round = resolveCombatRound(playerCS, enemyCS, rollNumber())
    setEvading(false)
    setLastRound(round)
    setShowSim(false)
  }

  function handleEvade() {
    const round = resolveCombatRound(playerCS, enemyCS, rollNumber())
    setEvading(true)
    setLastRound(round)
    setShowSim(false)
  }

  function handleApplyDamage() {
    if (!lastRound) return
    const currentHeroImmune = surprisedParty === 'hero' && surpriseRoundsLeft > 0
    const currentEnemyImmune = surprisedParty === 'enemy' && surpriseRoundsLeft > 0
    if (surpriseRoundsLeft > 0) setSurpriseRoundsLeft((prev) => prev - 1)

    const psychicHeroDmg =
      psychicTarget === 'hero' && (psychicInfinite || psychicRoundsLeft > 0)
        ? psychicDamagePerRound
        : 0
    const psychicEnemyDmg =
      psychicTarget === 'enemy' && (psychicInfinite || psychicRoundsLeft > 0)
        ? psychicDamagePerRound
        : 0
    if (!psychicInfinite && psychicRoundsLeft > 0) setPsychicRoundsLeft((prev) => prev - 1)

    const epCostModifiers = effectiveActiveIds.reduce((sum, id) => {
      const mod = COMBAT_MODIFIERS.find((m) => m.id === id)
      return sum + (mod ? getEffectiveModifier(character!, mod).epCostPerRound : 0)
    }, 0)
    const playerLoss = currentHeroImmune ? 0 : computePlayerLoss(lastRound)
    const newPlayerEP = lastRound.playerKilled
      ? 0
      : Math.max(0, character!.endurance.current - playerLoss - epCostModifiers - psychicHeroDmg)
    setEnduranceCurrent(newPlayerEP)

    if (evading) {
      setLastRound(null)
      setEvading(false)
      setRoundCount((prev) => prev + 1)
      if (newPlayerEP <= 0) {
        setTimeout(() => setDefeat(true), 150)
      } else {
        setTimeout(() => setEscaped(true), 150)
      }
      return
    }

    const finalEnemyLoss = currentEnemyImmune ? 0 : computeEnemyLoss(lastRound)
    const newEnemyEP = lastRound.enemyKilled
      ? 0
      : Math.max(0, enemyCurrentEP - finalEnemyLoss - psychicEnemyDmg)
    setEnemyCurrentEP(newEnemyEP)
    setLastRound(null)
    setRoundCount((prev) => prev + 1)
    if (lastRound.enemyKilled || newEnemyEP <= 0) {
      setTimeout(() => setVictory(true), 150)
    } else if (newPlayerEP <= 0) {
      setTimeout(() => setDefeat(true), 150)
    }
  }

  function handleNewCombat() {
    stopAutoFight()
    setVictory(false)
    setDefeat(false)
    setEscaped(false)
    setEvading(false)
    setEnemyCurrentEP(enemyEP)
    setLastRound(null)
    setSimulationRounds([])
    setShowSim(false)
    setActiveModifiers(new Set())
    setSituationalMod(0)
    setBowActive(false)
    setIgniteActive(false)
    setEnemyDmgMult(null)
    setPlayerDmgMult(null)
    setRoundCount(0)
    setSurprisedParty(null)
    setSurpriseRoundsTotal(1)
    setSurpriseRoundsLeft(0)
    setPsychicTarget(null)
    setPsychicDamagePerRound(1)
    setPsychicRoundsTotal(1)
    setPsychicRoundsLeft(0)
    setPsychicInfinite(false)
    setCombatEffectsOpen(false)
  }

  function handleSimulate() {
    const rounds = simulateCombat(
      playerCS,
      character!.endurance.current,
      enemyCS,
      enemyCurrentEP,
      50,
      surprisedParty,
      surpriseRoundsLeft,
      psychicTarget,
      psychicDamagePerRound,
      psychicInfinite ? 50 : psychicRoundsLeft
    )
    setSimulationRounds(rounds)
    setShowSim(true)
    setLastRound(null)
  }

  function stopAutoFight() {
    if (autoFightRef.current) {
      clearInterval(autoFightRef.current)
      autoFightRef.current = null
    }
    setAutoFighting(false)
  }

  function handleFightToTheDeath() {
    if (autoFighting) return
    setShowSim(false)
    setLastRound(null)
    setEvading(false)
    setAutoFighting(true)

    let currentEnemyEP = enemyCurrentEP
    let currentPlayerEP = character!.endurance.current

    const epCostPerRound = effectiveActiveIds.reduce((sum, id) => {
      const mod = COMBAT_MODIFIERS.find((m) => m.id === id)
      return sum + (mod ? getEffectiveModifier(character!, mod).epCostPerRound : 0)
    }, 0)

    const capturedIgnite = igniteActive
    const capturedIgnitePossible = ignitePossible
    const capturedDmgMult = enemyDmgMult
    const capturedPlayerDmgMult = playerDmgMult
    const capturedSurprisedParty = surprisedParty
    let surpriseLeft = surpriseRoundsLeft
    const capturedPsychicTarget = psychicTarget
    const capturedPsychicDmg = psychicDamagePerRound
    const capturedPsychicInfinite = psychicInfinite
    let psychicLeft = psychicRoundsLeft

    let autoRounds = 0
    autoFightRef.current = setInterval(() => {
      autoRounds++
      setRoundCount(autoRounds)
      const round = resolveCombatRound(playerCS, enemyCS, rollNumber())

      const heroImmune = capturedSurprisedParty === 'hero' && surpriseLeft > 0
      const enemyImmune = capturedSurprisedParty === 'enemy' && surpriseLeft > 0
      if (surpriseLeft > 0) {
        surpriseLeft--
        setSurpriseRoundsLeft(surpriseLeft)
      }

      const psychicHeroDmg =
        capturedPsychicTarget === 'hero' && (capturedPsychicInfinite || psychicLeft > 0)
          ? capturedPsychicDmg
          : 0
      const psychicEnemyDmg =
        capturedPsychicTarget === 'enemy' && (capturedPsychicInfinite || psychicLeft > 0)
          ? capturedPsychicDmg
          : 0
      if (!capturedPsychicInfinite && psychicLeft > 0) {
        psychicLeft--
        setPsychicRoundsLeft(psychicLeft)
      }

      let effectivePlayerLoss = heroImmune ? 0 : round.playerLoss
      if (!heroImmune && !round.playerKilled && effectivePlayerLoss > 0) {
        if (capturedPlayerDmgMult === 'x2') effectivePlayerLoss *= 2
        else if (capturedPlayerDmgMult === 'half')
          effectivePlayerLoss = Math.floor(effectivePlayerLoss / 2)
      }
      const newPlayerEP = round.playerKilled
        ? 0
        : Math.max(0, currentPlayerEP - effectivePlayerLoss - epCostPerRound - psychicHeroDmg)
      setEnduranceCurrent(newPlayerEP)
      currentPlayerEP = newPlayerEP

      const igniteBonus =
        capturedIgnite && capturedIgnitePossible && !round.enemyKilled && round.enemyLoss > 0
          ? 1
          : 0
      let enemyDmgTotal = enemyImmune || round.enemyKilled ? 0 : round.enemyLoss + igniteBonus
      if (!enemyImmune && !round.enemyKilled && enemyDmgTotal > 0) {
        if (capturedDmgMult === 'x2') enemyDmgTotal *= 2
        else if (capturedDmgMult === 'half') enemyDmgTotal = Math.floor(enemyDmgTotal / 2)
      }
      const newEnemyEP = round.enemyKilled
        ? 0
        : Math.max(0, currentEnemyEP - enemyDmgTotal - psychicEnemyDmg)
      setEnemyCurrentEP(newEnemyEP)
      currentEnemyEP = newEnemyEP

      setLastRound(round)

      if (round.enemyKilled || newEnemyEP <= 0) {
        clearInterval(autoFightRef.current!)
        autoFightRef.current = null
        setAutoFighting(false)
        setTimeout(() => setVictory(true), 300)
      } else if (round.playerKilled || newPlayerEP <= 0) {
        clearInterval(autoFightRef.current!)
        autoFightRef.current = null
        setAutoFighting(false)
        setTimeout(() => setDefeat(true), 300)
      }
    }, 600)
  }

  function computeEnemyLoss(round: CombatRound): number {
    if (round.enemyKilled) return 0
    const ignite = igniteActive && ignitePossible && round.enemyLoss > 0 ? 1 : 0
    const base = round.enemyLoss + ignite
    if (enemyDmgMult === 'x2') return base * 2
    if (enemyDmgMult === 'half') return Math.floor(base / 2)
    return base
  }

  function computePlayerLoss(round: CombatRound): number {
    if (round.playerKilled) return 0
    const base = round.playerLoss
    if (playerDmgMult === 'x2') return base * 2
    if (playerDmgMult === 'half') return Math.floor(base / 2)
    return base
  }

  const heroImmune = surprisedParty === 'hero' && surpriseRoundsLeft > 0
  const enemyImmune = surprisedParty === 'enemy' && surpriseRoundsLeft > 0
  const psychicActive = psychicInfinite || psychicRoundsLeft > 0
  const pendingPsychicHeroDmg =
    psychicTarget === 'hero' && psychicActive ? psychicDamagePerRound : 0
  const pendingPsychicEnemyDmg =
    psychicTarget === 'enemy' && psychicActive ? psychicDamagePerRound : 0

  const ratio = playerCS - enemyCS
  const ratioColor = ratio > 0 ? 'text-green-400' : ratio < 0 ? 'text-red-400' : 'text-slate-400'
  const modColor =
    situationalMod > 0 ? 'text-green-400' : situationalMod < 0 ? 'text-red-400' : 'text-slate-400'

  const enemyEPPercent = enemyEP > 0 ? enemyCurrentEP / enemyEP : 0
  const enemyBarColor =
    enemyEPPercent > 0.66 ? 'bg-green-500' : enemyEPPercent > 0.33 ? 'bg-orange-500' : 'bg-red-500'

  const maxPlayerEP = getTotalEPMax(character)
  const playerEPPercent = maxPlayerEP > 0 ? character.endurance.current / maxPlayerEP : 0
  const playerBarColor =
    playerEPPercent > 0.5 ? 'bg-green-500' : playerEPPercent > 0.25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-300 font-serif font-semibold">
            <Swords size={18} />
            {t('combat.title')}
          </div>
          <button
            onClick={handleClose}
            aria-label={t('common.close')}
            className="relative p-1 text-slate-500 hover:text-slate-300 transition-colors before:absolute before:inset-[-8px]"
          >
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
              <div className="text-xl font-serif font-semibold text-amber-100 mb-1">
                {t('combat.victory')}
              </div>
              <div className="text-sm text-slate-400">
                {t('combat.epAfter')} :{' '}
                <span className="text-green-400 font-medium">{character.endurance.current}</span>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {t('combat.roundCount', { count: roundCount })}
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
                onClick={handleClose}
                className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {defeat && (
          <DeathModal onClose={handleClose} onReplay={handleNewCombat} roundCount={roundCount} />
        )}

        {/* Escaped screen */}
        {escaped && (
          <div className="p-8 flex flex-col items-center gap-5 animate-victory">
            <div className="w-16 h-16 rounded-full bg-slate-800/60 border border-slate-600/60 flex items-center justify-center">
              <Footprints size={28} className="text-slate-300" />
            </div>
            <div className="text-center">
              <div className="text-xl font-serif font-semibold text-slate-100 mb-1">
                {t('combat.escaped')}
              </div>
              <div className="text-sm text-slate-400">
                {t('combat.epAfter')} :{' '}
                <span className="text-green-400 font-medium">{character.endurance.current}</span>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {t('combat.roundCount', { count: roundCount })}
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
                onClick={handleClose}
                className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        <div className={`p-5 flex flex-col gap-4 ${victory || defeat || escaped ? 'hidden' : ''}`}>
          {/* Enemy quick-entry */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <div className="text-xs text-slate-500 uppercase tracking-wide text-center">
                {t('combat.enemyCS')}
              </div>
              <input
                type="number"
                value={enemyCS}
                onChange={(e) => setEnemyCS(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg text-center text-3xl font-bold text-cyan-400 focus:outline-none focus:border-amber-600 py-1"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="text-xs text-slate-500 uppercase tracking-wide text-center">
                {t('combat.enemyEP')}
              </div>
              <input
                type="number"
                value={enemyEP}
                onChange={(e) => {
                  const v = Math.max(0, Number(e.target.value))
                  setEnemyEP(v)
                  setEnemyCurrentEP(v)
                }}
                onFocus={(e) => e.target.select()}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg text-center text-3xl font-bold text-slate-100 focus:outline-none focus:border-amber-600 py-1"
              />
            </div>
          </div>

          {/* Combat effects (surprise + psychic damage) */}
          {combatEffectsOpen ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">
                  ⚡ {t('combat.combatEffects')}
                </span>
                <button
                  onClick={() => setCombatEffectsOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={t('common.close')}
                >
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Surprise column */}
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-amber-400/80 uppercase tracking-wide">
                    {t('combat.surprise')}
                  </div>
                  <select
                    value={surprisedParty ?? 'hero'}
                    onChange={(e) => setSurprisedParty(e.target.value as 'hero' | 'enemy')}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-600"
                  >
                    <option value="hero">{t('combat.surprisedHero')}</option>
                    <option value="enemy">{t('combat.surprisedEnemy')}</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={surpriseRoundsTotal}
                      onChange={(e) =>
                        setSurpriseRoundsTotal(Math.max(1, Math.min(10, Number(e.target.value))))
                      }
                      onFocus={(e) => e.target.select()}
                      className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center text-xs text-slate-200 focus:outline-none focus:border-amber-600"
                    />
                    <span className="text-xs text-slate-500">
                      {lang === 'fr' ? 'assaut(s)' : 'round(s)'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSurprisedParty(surprisedParty ?? 'hero')
                      setSurpriseRoundsLeft(surpriseRoundsTotal)
                      setCombatEffectsOpen(false)
                    }}
                    className="px-2 py-1 rounded bg-amber-700 hover:bg-amber-600 text-white text-xs transition-colors w-fit"
                  >
                    {t('combat.activate')}
                  </button>
                </div>
                {/* Psychic damage column */}
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-purple-400/80 uppercase tracking-wide">
                    {t('combat.psychicDamage')}
                  </div>
                  <select
                    value={psychicTarget ?? 'enemy'}
                    onChange={(e) => setPsychicTarget(e.target.value as 'hero' | 'enemy')}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-600"
                  >
                    <option value="hero">{t('combat.surprisedHero')}</option>
                    <option value="enemy">{t('combat.surprisedEnemy')}</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={psychicDamagePerRound}
                      onChange={(e) =>
                        setPsychicDamagePerRound(Math.max(1, Math.min(20, Number(e.target.value))))
                      }
                      onFocus={(e) => e.target.select()}
                      className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center text-xs text-slate-200 focus:outline-none focus:border-purple-600"
                    />
                    <span className="text-xs text-slate-500">PE/r</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={psychicRoundsTotal}
                      disabled={psychicInfinite}
                      onChange={(e) =>
                        setPsychicRoundsTotal(Math.max(1, Math.min(10, Number(e.target.value))))
                      }
                      onFocus={(e) => e.target.select()}
                      className={`w-10 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center text-xs text-slate-200 focus:outline-none focus:border-purple-600 ${psychicInfinite ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                    <span className="text-xs text-slate-500">
                      {lang === 'fr' ? 'assaut(s)' : 'round(s)'}
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={psychicInfinite}
                      onChange={(e) => setPsychicInfinite(e.target.checked)}
                      className="accent-purple-500 w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-xs text-slate-400">{t('combat.psychicInfinite')}</span>
                  </label>
                  <button
                    onClick={() => {
                      setPsychicTarget(psychicTarget ?? 'enemy')
                      setPsychicRoundsLeft(psychicInfinite ? 0 : psychicRoundsTotal)
                      setCombatEffectsOpen(false)
                    }}
                    className="px-2 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white text-xs transition-colors w-fit"
                  >
                    {t('combat.activate')}
                  </button>
                </div>
              </div>
              {/* Damage multiplier */}
              <div className="border-t border-slate-700/50 pt-3 mt-1 flex flex-col gap-3">
                {/* Damage dealt to enemy */}
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-slate-400/80 uppercase tracking-wide">
                    {t('combat.dmgDealt')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEnemyDmgMult(null)}
                      aria-pressed={enemyDmgMult === null}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        enemyDmgMult === null
                          ? 'border-slate-500 bg-slate-700/60 text-slate-200'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('combat.dmgNormal')}
                    </button>
                    <button
                      onClick={() => setEnemyDmgMult((v) => (v === 'x2' ? null : 'x2'))}
                      aria-pressed={enemyDmgMult === 'x2'}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        enemyDmgMult === 'x2'
                          ? 'border-emerald-700 bg-emerald-900/30 text-emerald-200'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('combat.dmgX2')}
                    </button>
                    <button
                      onClick={() => setEnemyDmgMult((v) => (v === 'half' ? null : 'half'))}
                      aria-pressed={enemyDmgMult === 'half'}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        enemyDmgMult === 'half'
                          ? 'border-violet-700 bg-violet-900/30 text-violet-200'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('combat.dmgHalf')}
                    </button>
                  </div>
                </div>
                {/* Damage received by hero */}
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-slate-400/80 uppercase tracking-wide">
                    {t('combat.dmgReceived')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPlayerDmgMult(null)}
                      aria-pressed={playerDmgMult === null}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        playerDmgMult === null
                          ? 'border-slate-500 bg-slate-700/60 text-slate-200'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('combat.dmgNormal')}
                    </button>
                    <button
                      onClick={() => setPlayerDmgMult((v) => (v === 'x2' ? null : 'x2'))}
                      aria-pressed={playerDmgMult === 'x2'}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        playerDmgMult === 'x2'
                          ? 'border-emerald-700 bg-emerald-900/30 text-emerald-200'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('combat.dmgX2')}
                    </button>
                    <button
                      onClick={() => setPlayerDmgMult((v) => (v === 'half' ? null : 'half'))}
                      aria-pressed={playerDmgMult === 'half'}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        playerDmgMult === 'half'
                          ? 'border-violet-700 bg-violet-900/30 text-violet-200'
                          : 'border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('combat.dmgHalf')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {surpriseRoundsLeft > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-700/50 bg-amber-900/20 text-amber-400 text-xs">
                  <span>
                    ⚡{' '}
                    {surprisedParty === 'hero'
                      ? t('combat.surprisedHero')
                      : t('combat.surprisedEnemy')}{' '}
                    — {t('combat.surpriseRoundsLeft', { count: surpriseRoundsLeft })}
                  </span>
                  <button
                    onClick={() => {
                      setSurpriseRoundsLeft(0)
                      setSurprisedParty(null)
                    }}
                    className="text-amber-500 hover:text-amber-300 ml-1 transition-colors"
                    aria-label={t('common.close')}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              {psychicActive && psychicTarget !== null && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-purple-700/50 bg-purple-900/20 text-purple-400 text-xs">
                  <span>
                    ⚡ −{psychicDamagePerRound} PE/r{' '}
                    {psychicTarget === 'hero'
                      ? t('combat.surprisedHero')
                      : t('combat.surprisedEnemy')}{' '}
                    —{' '}
                    {psychicInfinite
                      ? '∞'
                      : t('combat.psychicRoundsLeft', { count: psychicRoundsLeft })}
                  </span>
                  <button
                    onClick={() => {
                      setPsychicRoundsLeft(0)
                      setPsychicTarget(null)
                      setPsychicInfinite(false)
                    }}
                    className="text-purple-500 hover:text-purple-300 ml-1 transition-colors"
                    aria-label={t('common.close')}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              {enemyDmgMult === 'x2' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-700/50 bg-emerald-900/20 text-emerald-400 text-xs">
                  <span>{t('combat.dmgDealtX2')}</span>
                  <button
                    onClick={() => setEnemyDmgMult(null)}
                    className="text-emerald-500 hover:text-emerald-300 ml-1 transition-colors"
                    aria-label={t('common.close')}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              {enemyDmgMult === 'half' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-violet-700/50 bg-violet-900/20 text-violet-400 text-xs">
                  <span>{t('combat.dmgDealtHalf')}</span>
                  <button
                    onClick={() => setEnemyDmgMult(null)}
                    className="text-violet-500 hover:text-violet-300 ml-1 transition-colors"
                    aria-label={t('common.close')}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              {playerDmgMult === 'x2' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-700/50 bg-emerald-900/20 text-emerald-400 text-xs">
                  <span>{t('combat.dmgReceivedX2')}</span>
                  <button
                    onClick={() => setPlayerDmgMult(null)}
                    className="text-emerald-500 hover:text-emerald-300 ml-1 transition-colors"
                    aria-label={t('common.close')}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              {playerDmgMult === 'half' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-violet-700/50 bg-violet-900/20 text-violet-400 text-xs">
                  <span>{t('combat.dmgReceivedHalf')}</span>
                  <button
                    onClick={() => setPlayerDmgMult(null)}
                    className="text-violet-500 hover:text-violet-300 ml-1 transition-colors"
                    aria-label={t('common.close')}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              <button
                onClick={() => setCombatEffectsOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-500 hover:text-amber-400 hover:border-amber-800 text-xs transition-colors"
              >
                ⚡ {t('combat.combatEffects')}
              </button>
            </div>
          )}

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
                onChange={(e) => setSituationalMod(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className={`w-full bg-slate-900 border border-slate-700 rounded-lg text-center text-3xl font-bold focus:outline-none focus:border-amber-600 py-0 ${modColor}`}
              />
              {combatPotionBonus !== null && (
                <div className="flex items-center justify-center gap-1 text-xs text-orange-400 mt-0.5">
                  <FlaskConical size={10} />
                  <span>+{combatPotionBonus}</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Ratio</div>
              <div className={`text-3xl font-bold ${ratioColor}`}>
                {ratio >= 0 ? '+' : ''}
                {ratio}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">{t('combat.enemyCS')}</div>
              <div className="text-3xl font-bold text-cyan-400">{enemyCS}</div>
            </div>
          </div>

          {/* Discipline bonuses */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2">
              {t('combat.disciplineBonuses')}
            </div>
            <div className="flex flex-col gap-1.5">
              {visibleModifiers.map((mod) => {
                const owned = hasDisciplineForModifier(character, mod)
                const eff = getEffectiveModifier(character, mod)
                const locked = isLocked(mod)
                const active = activeModifiers.has(mod.id) && !locked
                const usable = owned && !locked
                const label = lang === 'fr' ? mod.labelFr : mod.labelEn
                const condition = locked
                  ? t('combat.surgeLocked')
                  : eff.epCostPerRound > 0
                    ? lang === 'fr'
                      ? `−${eff.epCostPerRound} PE/round`
                      : `−${eff.epCostPerRound} EP/round`
                    : lang === 'fr'
                      ? mod.conditionFr
                      : mod.conditionEn
                return (
                  <label
                    key={mod.id}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors ${
                      usable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                    } ${active ? 'bg-amber-900/20 border border-amber-800/40' : 'border border-transparent'}`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={!usable}
                      onChange={() => toggleModifier(mod.id)}
                      className="accent-amber-500 w-3.5 h-3.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs font-medium ${active ? 'text-amber-200' : 'text-slate-300'}`}
                        >
                          {label}
                        </span>
                        <span
                          className={`text-xs font-semibold rounded px-1 ${active ? 'text-amber-400 bg-amber-900/40' : 'text-slate-500 bg-slate-700/40'}`}
                        >
                          {eff.hcBonus >= 0 ? '+' : ''}
                          {eff.hcBonus} HC
                        </span>
                      </div>
                      {condition && (
                        <div
                          className={`text-xs mt-0.5 ${locked ? 'text-red-400/80' : active ? 'text-amber-600/80' : 'text-slate-600'}`}
                        >
                          {condition}
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Ranged, burning blade & damage modifier toggles */}
          <div className="flex flex-wrap gap-2">
            {bowBonus > 0 && (
              <button
                onClick={() => setBowActive((v) => !v)}
                aria-pressed={bowActive}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  bowActive
                    ? 'border-amber-700 bg-amber-900/30 text-amber-200'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crosshair size={13} />
                {t('combat.bow')} <span className="font-semibold">+{bowBonus}</span>
              </button>
            )}
            {ignitePossible && (
              <button
                onClick={() => setIgniteActive((v) => !v)}
                aria-pressed={igniteActive}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  igniteActive
                    ? 'border-orange-700 bg-orange-900/30 text-orange-200'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame size={13} />
                {t('combat.ignite')}
              </button>
            )}
          </div>

          {/* Enemy EP */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 shrink-0">{t('combat.enemyEP')}:</span>
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => {
                    setEnemyEP(Number(enemyCS))
                    setEnemyCurrentEP(Number(enemyCS))
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  title={t('combat.reset')}
                >
                  ↺
                </button>
                <input
                  type="number"
                  value={enemyCurrentEP}
                  onChange={(e) => setEnemyCurrentEP(Math.max(0, Number(e.target.value)))}
                  onFocus={(e) => e.target.select()}
                  className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-lg font-bold text-slate-100 focus:outline-none focus:border-amber-600"
                />
                <span className="text-slate-500 text-sm">/</span>
                <span className="text-lg font-bold text-slate-400">{enemyEP}</span>
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
              disabled={autoFighting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              <Dices size={16} />
              {t('combat.roll')}
            </button>
            <button
              onClick={handleEvade}
              disabled={autoFighting}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
              title={t('combat.evade')}
            >
              <Footprints size={16} />
            </button>
            <button
              onClick={handleSimulate}
              disabled={autoFighting}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
              title={t('combat.simulate')}
            >
              <SkipForward size={16} />
            </button>
            <button
              onClick={handleFightToTheDeath}
              disabled={autoFighting}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                autoFighting
                  ? 'border-red-800 bg-red-900/30 text-red-300 animate-pulse cursor-not-allowed'
                  : 'border-slate-600 text-slate-300 hover:border-red-700 hover:text-red-300'
              }`}
              title={t('combat.fightToTheDeath')}
            >
              <Skull size={16} />
            </button>
          </div>

          {/* Player EP bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{t('combat.yourEP')}</span>
              <span className="text-sm font-bold text-slate-200">
                {character.endurance.current}{' '}
                <span className="text-slate-500 font-normal">/ {maxPlayerEP}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${playerBarColor}`}
                style={{ width: `${Math.max(0, Math.min(100, playerEPPercent * 100))}%` }}
              />
            </div>
          </div>

          {/* Deliverance (Grand Master) */}
          {hasDeliverance && (
            <button
              onClick={() => triggerDeliverance()}
              disabled={!deliveranceReady}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
                deliveranceReady
                  ? 'bg-green-800/60 border border-green-700 text-green-200 hover:bg-green-700/60'
                  : 'border border-slate-700 text-slate-600 cursor-not-allowed'
              }`}
            >
              <HeartPulse size={15} />
              {character.deliveranceAvailable === false
                ? t('combat.deliveranceUsed')
                : t('combat.deliverance')}
            </button>
          )}

          {/* Single round result */}
          {lastRound && !showSim && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{t('combat.randomNumber')}:</span>
                <span className="flex items-center gap-2">
                  {bowActive && bowBonus > 0 && (
                    <span className="text-xs text-amber-500/80">
                      {t('combat.bowEffectiveRoll', { n: bowBonus })}
                    </span>
                  )}
                  <span className="text-xl font-bold text-amber-300">{lastRound.randomNumber}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`text-center rounded-lg p-3 ${
                    lastRound.playerKilled
                      ? 'bg-red-950/40 border border-red-900'
                      : heroImmune
                        ? 'bg-amber-950/30 border border-amber-900/50'
                        : lastRound.playerLoss > 0
                          ? 'bg-red-950/40 border border-red-900'
                          : 'bg-green-950/30 border border-green-900'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1">{t('combat.playerLoss')}</div>
                  {lastRound.playerKilled ? (
                    <div className="text-lg font-bold text-red-400">{t('combat.instantKill')}</div>
                  ) : heroImmune ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-2xl font-bold text-slate-500 line-through">
                        -{lastRound.playerLoss}
                      </span>
                      <span className="text-xs font-semibold text-amber-400 bg-amber-900/40 rounded px-1">
                        {t('combat.immunized')}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`text-2xl font-bold ${lastRound.playerLoss > 0 ? 'text-red-400' : 'text-green-400'}`}
                    >
                      -{computePlayerLoss(lastRound)}
                      {playerDmgMult === 'x2' && lastRound.playerLoss > 0 && (
                        <span className="text-xs text-emerald-400 ml-1">(×2)</span>
                      )}
                      {playerDmgMult === 'half' && lastRound.playerLoss > 0 && (
                        <span className="text-xs text-cyan-400 ml-1">(÷2)</span>
                      )}
                    </div>
                  )}
                  {pendingPsychicHeroDmg > 0 && (
                    <div className="text-xs text-purple-400 mt-0.5">
                      ⚡ −{pendingPsychicHeroDmg} PE
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    PE: {character.endurance.current} →{' '}
                    {lastRound.playerKilled
                      ? 0
                      : heroImmune
                        ? Math.max(0, character.endurance.current - pendingPsychicHeroDmg)
                        : Math.max(
                            0,
                            character.endurance.current -
                              computePlayerLoss(lastRound) -
                              pendingPsychicHeroDmg
                          )}
                  </div>
                </div>
                {evading ? (
                  <div className="text-center rounded-lg p-3 bg-slate-800/40 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">{t('combat.enemyLoss')}</div>
                    <div className="text-2xl font-bold text-slate-600 line-through">
                      -{lastRound.enemyLoss}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {t('combat.enemyLossIgnored')}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center rounded-lg p-3 ${
                      lastRound.enemyKilled
                        ? 'bg-green-950/40 border border-green-700'
                        : enemyImmune
                          ? 'bg-amber-950/30 border border-amber-900/50'
                          : 'bg-red-950/30 border border-red-900'
                    }`}
                  >
                    <div className="text-xs text-slate-400 mb-1">{t('combat.enemyLoss')}</div>
                    {lastRound.enemyKilled ? (
                      <div className="text-lg font-bold text-green-400">
                        {t('combat.instantKill')}
                      </div>
                    ) : enemyImmune ? (
                      <>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-2xl font-bold text-slate-500 line-through">
                            -{lastRound.enemyLoss}
                          </span>
                          <span className="text-xs font-semibold text-amber-400 bg-amber-900/40 rounded px-1">
                            {t('combat.immunized')}
                          </span>
                        </div>
                        {pendingPsychicEnemyDmg > 0 && (
                          <div className="text-xs text-purple-400 mt-0.5">
                            ⚡ −{pendingPsychicEnemyDmg} PE
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mt-1">
                          PE: {enemyCurrentEP} →{' '}
                          {Math.max(0, enemyCurrentEP - pendingPsychicEnemyDmg)}
                        </div>
                      </>
                    ) : (
                      (() => {
                        const total = computeEnemyLoss(lastRound)
                        const ignite =
                          igniteActive && ignitePossible && lastRound.enemyLoss > 0 ? 1 : 0
                        return (
                          <>
                            <div className="text-2xl font-bold text-green-400">
                              -{total}
                              {ignite > 0 && (
                                <span className="text-xs text-orange-400 ml-1">
                                  ({t('combat.ignite')} +1)
                                </span>
                              )}
                              {enemyDmgMult === 'x2' && (
                                <span className="text-xs text-emerald-400 ml-1">(×2)</span>
                              )}
                              {enemyDmgMult === 'half' && (
                                <span className="text-xs text-cyan-400 ml-1">(÷2)</span>
                              )}
                            </div>
                            {pendingPsychicEnemyDmg > 0 && (
                              <div className="text-xs text-purple-400 mt-0.5">
                                ⚡ −{pendingPsychicEnemyDmg} PE
                              </div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">
                              PE: {enemyCurrentEP} →{' '}
                              {Math.max(0, enemyCurrentEP - total - pendingPsychicEnemyDmg)}
                            </div>
                          </>
                        )
                      })()
                    )}
                  </div>
                )}
              </div>
              {!autoFighting && (
                <button
                  onClick={handleApplyDamage}
                  className="w-full mt-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
                >
                  {t('combat.applyDamage')}
                </button>
              )}
            </div>
          )}

          {/* Simulation results */}
          {showSim && simulationRounds.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-2">
                {t('combat.roundsResult', { rounds: simulationRounds.length })}
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                {simulationRounds.map((r, i) => {
                  const ep = psychicInfinite ? simulationRounds.length : psychicRoundsLeft
                  const phero = psychicTarget === 'hero' && i < ep ? psychicDamagePerRound : 0
                  const penemy = psychicTarget === 'enemy' && i < ep ? psychicDamagePerRound : 0
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-14 shrink-0">Round {i + 1}:</span>
                      <span className="text-amber-600">
                        {t('combat.die')} {r.randomNumber}
                      </span>
                      <span className="text-red-400">
                        {r.playerKilled ? t('combat.instantKill') : `-${r.playerLoss + phero} PE`}
                      </span>
                      <span className="text-green-400">
                        {r.enemyKilled
                          ? t('combat.killed')
                          : `-${r.enemyLoss + penemy} PE ${t('combat.enemy')}`}
                      </span>
                    </div>
                  )
                })}
              </div>
              {(() => {
                const effectivePsychicRounds = psychicInfinite
                  ? simulationRounds.length
                  : psychicRoundsLeft
                const totalPlayerLoss = simulationRounds.reduce(
                  (s, r, i) =>
                    s +
                    (surprisedParty === 'hero' && i < surpriseRoundsLeft ? 0 : r.playerLoss) +
                    (psychicTarget === 'hero' && i < effectivePsychicRounds
                      ? psychicDamagePerRound
                      : 0),
                  0
                )
                const totalEnemyLoss = simulationRounds.reduce(
                  (s, r, i) =>
                    s +
                    (surprisedParty === 'enemy' && i < surpriseRoundsLeft ? 0 : r.enemyLoss) +
                    (psychicTarget === 'enemy' && i < effectivePsychicRounds
                      ? psychicDamagePerRound
                      : 0),
                  0
                )
                const lastRoundData = simulationRounds[simulationRounds.length - 1]
                const enemyDead = lastRoundData.enemyKilled || totalEnemyLoss >= enemyCurrentEP
                const playerDead =
                  simulationRounds.some((r) => r.playerKilled) ||
                  totalPlayerLoss >= character.endurance.current
                return (
                  <div
                    className={`text-sm font-medium text-center py-2 rounded-lg ${
                      enemyDead && !playerDead
                        ? 'text-green-400 bg-green-950/40'
                        : playerDead
                          ? 'text-red-400 bg-red-950/40'
                          : 'text-yellow-400 bg-yellow-950/40'
                    }`}
                  >
                    {enemyDead && !playerDead
                      ? t('combat.simVictory')
                      : playerDead
                        ? t('combat.simDefeat')
                        : t('combat.simOngoing')}
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
