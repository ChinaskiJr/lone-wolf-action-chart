import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { getTotalCS, getTotalEPMax, computeRank } from '@/utils/character'
import { KAI_RANKS, MAGNAKAI_RANKS, GRAND_MASTER_RANKS, NEW_ORDER_RANKS } from '@/data/ranks'
import { DeathModal } from './DeathModal'

export function StatsPanel() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, setEnduranceCurrent, setCombatSkillBonus } = useCharacterStore()
  const [showDeathModal, setShowDeathModal] = useState(false)
  if (!character) return null

  const totalCS = getTotalCS(character)
  const maxEP = getTotalEPMax(character)
  const rankKey = computeRank(character)

  const ranks =
    character.cycle === 'kai' ? KAI_RANKS :
    character.cycle === 'magnakai' ? MAGNAKAI_RANKS :
    character.cycle === 'grandmaster' ? GRAND_MASTER_RANKS :
    NEW_ORDER_RANKS
  const rankInfo = ranks.find(r => r.rank === rankKey)
  const rankLabel = rankInfo ? (lang === 'fr' ? rankInfo.fr : rankInfo.en) : rankKey

  const epPercent = Math.max(0, Math.min(100, (character.endurance.current / maxEP) * 100))
  const epColor = epPercent > 50 ? 'bg-green-600' : epPercent > 25 ? 'bg-yellow-600' : 'bg-red-600'

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        {t('sheet.rank')}: <span className="font-semibold">{rankLabel}</span>
      </div>

      {/* Combat Skill */}
      <div className="bg-slate-800/50 rounded-xl p-5">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">{t('sheet.combatSkill')}</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-3xl font-bold text-slate-200">{character.combatSkill.base}</div>
            <div className="text-xs text-slate-500 mt-1">{t('sheet.base')}</div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-3xl font-bold text-blue-400">
              {character.combatSkill.bonus >= 0 ? '+' : ''}{character.combatSkill.bonus}
            </div>
            <div className="text-xs text-slate-500 mt-1">{t('sheet.bonus')}</div>
            <div className="flex gap-1 mt-1 justify-center">
              <button
                onClick={() => setCombatSkillBonus(character.combatSkill.bonus - 1)}
                className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
              >
                <Minus size={10} />
              </button>
              <button
                onClick={() => setCombatSkillBonus(character.combatSkill.bonus + 1)}
                className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
              >
                <Plus size={10} />
              </button>
            </div>
          </div>
          <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-3">
            <div className="text-3xl font-bold text-amber-400">{totalCS}</div>
            <div className="text-xs text-amber-600/80 mt-1">{t('sheet.csTotal')}</div>
          </div>
        </div>
      </div>

      {/* Endurance Points */}
      <div className="bg-slate-800/50 rounded-xl p-5">
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">{t('sheet.endurance')}</div>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{t('sheet.epCurrent')}</span>
            <span>{character.endurance.current} / {maxEP}</span>
          </div>
          <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${epColor}`}
              style={{ width: `${epPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const next = character.endurance.current - 1
              setEnduranceCurrent(next)
              if (next <= 0) setTimeout(() => setShowDeathModal(true), 150)
            }}
            className="w-9 h-9 rounded-full bg-red-900/50 border border-red-800 hover:bg-red-800/70 text-red-300 flex items-center justify-center text-lg font-bold transition-colors"
          >
            −
          </button>
          <span className="text-4xl font-bold text-red-400 w-16 text-center">
            {character.endurance.current}
          </span>
          <button
            onClick={() => setEnduranceCurrent(Math.min(maxEP, character.endurance.current + 1))}
            className="w-9 h-9 rounded-full bg-green-900/50 border border-green-800 hover:bg-green-800/70 text-green-300 flex items-center justify-center text-lg font-bold transition-colors"
          >
            +
          </button>
        </div>
        <div className="text-center text-xs text-slate-500 mt-2">{t('sheet.epMax')}: {maxEP}</div>
      </div>
    </div>
    {showDeathModal && (
      <DeathModal onClose={() => setShowDeathModal(false)} />
    )}
    </>
  )
}
