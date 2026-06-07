import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'
import { useCharacterStore } from '@/store/characterStore'
import { getTotalCS, getTotalEPMax, computeRank, getItemsCSBonus, getItemsEPBonus, getWeaponsCSBonus } from '@/utils/character'
import { KAI_RANKS, MAGNAKAI_RANKS, GRAND_MASTER_RANKS, NEW_ORDER_RANKS } from '@/data/ranks'

export function StatsPanel() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, setCombatSkillBonus } = useCharacterStore()
  if (!character) return null

  const totalCS = getTotalCS(character)
  const maxEP = getTotalEPMax(character)
  const itemsHC = getItemsCSBonus(character)
  const weaponsHC = getWeaponsCSBonus(character)
  const itemsPE = getItemsEPBonus(character)
  const rankKey = computeRank(character)

  const ranks =
    character.cycle === 'kai' ? KAI_RANKS :
    character.cycle === 'magnakai' ? MAGNAKAI_RANKS :
    character.cycle === 'grandmaster' ? GRAND_MASTER_RANKS :
    NEW_ORDER_RANKS
  const rankInfo = ranks.find(r => r.rank === rankKey)
  const rankLabel = rankInfo ? (lang === 'fr' ? rankInfo.fr : rankInfo.en) : rankKey

  const epPercent = Math.max(0, Math.min(100, (character.endurance.current / maxEP) * 100))
  const epBarColor = epPercent > 50 ? 'bg-green-600' : epPercent > 25 ? 'bg-yellow-600' : 'bg-red-600'
  const epTextColor = epPercent > 50 ? 'text-green-400' : epPercent > 25 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex flex-col gap-6">

      {/* Rank */}
      <div className="flex items-center gap-2 text-sm text-amber-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <span>{t('sheet.rank')} :</span>
        <span className="font-semibold">{rankLabel}</span>
      </div>

      {/* Combat Skill */}
      <div className="bg-slate-800/50 border border-amber-900/25 rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-300 mb-4">{t('sheet.combatSkill')}</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-900/60 rounded-lg p-3 flex flex-col items-center justify-center">
            <div className="text-3xl md:text-5xl font-bold text-slate-200 tabular-nums">{character.combatSkill.base}</div>
            <div className="text-xs text-slate-500 mt-1">{t('sheet.base')}</div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3">
            <div className="text-3xl font-bold text-blue-400 tabular-nums">
              {character.combatSkill.bonus >= 0 ? '+' : ''}{character.combatSkill.bonus}
            </div>
            <div className="text-xs text-slate-500 mt-1">{t('sheet.bonus')}</div>
            <div className="flex gap-1 mt-2 justify-center">
              <button
                onClick={() => setCombatSkillBonus(character.combatSkill.bonus - 1)}
                aria-label="Réduire le bonus HC"
                className="relative w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors before:absolute before:inset-[-6px]"
              >
                <Minus size={10} />
              </button>
              <button
                onClick={() => setCombatSkillBonus(character.combatSkill.bonus + 1)}
                aria-label="Augmenter le bonus HC"
                className="relative w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors before:absolute before:inset-[-6px]"
              >
                <Plus size={10} />
              </button>
            </div>
            {weaponsHC > 0 && (
              <div className="mt-2 text-xs text-slate-500 leading-tight">
                {totalCS - itemsHC - weaponsHC} <span className="text-blue-400 font-semibold">+{weaponsHC}</span>
                <div className="text-slate-600">{t('sheet.weaponBonus')}</div>
              </div>
            )}
            {itemsHC !== 0 && (
              <div className="mt-1 text-xs text-slate-500 leading-tight">
                {totalCS - itemsHC} <span className={`font-semibold ${itemsHC > 0 ? 'text-blue-400' : 'text-red-400'}`}>{itemsHC > 0 ? `+${itemsHC}` : itemsHC}</span>
                <div className="text-slate-600">{t('sheet.itemBonus')}</div>
              </div>
            )}
          </div>
          <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-3 flex flex-col items-center justify-center">
            <div className="text-3xl md:text-5xl font-bold text-amber-400 tabular-nums">{totalCS}</div>
            <div className="text-xs text-amber-600/80 mt-1">{t('sheet.csTotal')}</div>
          </div>
        </div>
      </div>

      {/* Endurance Points — display only; ±1 controls live in the persistent bar */}
      <div className="bg-slate-800/50 border border-amber-900/25 rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-300 mb-4">{t('sheet.endurance')}</p>
        <div className="flex items-end justify-between mb-3">
          <span className={`text-5xl font-bold tabular-nums leading-none ${epTextColor}`}>
            {character.endurance.current}
          </span>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-0.5">{t('sheet.epMax')}</div>
            <div className="text-xl font-semibold text-slate-400 tabular-nums">{maxEP}</div>
            {itemsPE !== 0 && (
              <div className="mt-1 text-xs text-slate-600 leading-tight">
                {maxEP - itemsPE} <span className={`font-semibold ${itemsPE > 0 ? 'text-green-400/80' : 'text-red-400'}`}>{itemsPE > 0 ? `+${itemsPE}` : itemsPE}</span>
                <div className="text-slate-700">{t('sheet.itemBonus')}</div>
              </div>
            )}
          </div>
        </div>
        <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${epBarColor}`}
            style={{ width: `${epPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1.5">
          <span>0</span>
          <span>{Math.round(epPercent)}%</span>
        </div>
      </div>
    </div>
  )
}
