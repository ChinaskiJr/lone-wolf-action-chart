import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dices } from 'lucide-react'
import type { Character } from '@/types/character'
import { rollCombatSkill, rollEndurance } from '@/utils/character'
import { rollD10 } from '@/utils/rng'

interface Props {
  character: Character
  onNext: (char: Character) => void
  onBack: () => void
}

export function StepStats({ character, onNext, onBack }: Props) {
  const { t } = useTranslation()
  const [cs, setCS] = useState(character.combatSkill.base)
  const [ep, setEP] = useState(character.endurance.max)
  const [name, setName] = useState(character.name)
  const [kaiName, setKaiName] = useState(character.cycle === 'neworder' ? (character as any).kaiName ?? '' : '')
  const [lastRN, setLastRN] = useState<{ cs?: number; ep?: number }>({})

  const csBase = character.cycle === 'kai' || character.cycle === 'magnakai' ? 10 : 25
  const epBase = character.cycle === 'kai' || character.cycle === 'magnakai' ? 20 : 30

  const KAI_NAME_PREFIXES = ['Swift', 'Sun', 'True', 'Bold', 'Moon', 'Sword', 'Wise', 'Storm', 'Rune', 'Brave']
  const KAI_NAME_SUFFIXES = ['Blade', 'Fire', 'Hawk', 'Heart', 'Friend', 'Star', 'Dancer', 'Helm', 'Strider', 'Shield']

  function rollCS() {
    const rn = rollD10()
    setLastRN(prev => ({ ...prev, cs: rn }))
    setCS(rn + csBase)
  }

  function rollEP() {
    const rn = rollD10()
    setLastRN(prev => ({ ...prev, ep: rn }))
    setEP(rn + epBase)
  }

  function generateKaiName() {
    const prefix = KAI_NAME_PREFIXES[Math.floor(Math.random() * KAI_NAME_PREFIXES.length)]
    const suffix = KAI_NAME_SUFFIXES[Math.floor(Math.random() * KAI_NAME_SUFFIXES.length)]
    setKaiName(`${prefix}${suffix}`)
  }

  function handleNext() {
    const updated: Character = {
      ...character,
      name: name || (character.cycle === 'kai' ? 'Loup Solitaire' : name),
      combatSkill: { ...character.combatSkill, base: cs },
      endurance: { current: ep, max: ep },
      ...(character.cycle === 'neworder' ? { kaiName } : {}),
    } as Character
    onNext(updated)
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-serif font-semibold text-amber-100">{t('creation.step2')}</h2>

      {/* Character name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('creation.characterName')}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Loup Solitaire"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
        />
      </div>

      {/* Kai Name for New Order */}
      {character.cycle === 'neworder' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('creation.kaiNamePrefix')} + {t('creation.kaiNameSuffix')}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={kaiName}
              onChange={e => setKaiName(e.target.value)}
              placeholder="SwiftBlade"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={generateKaiName}
              className="px-3 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-amber-600 hover:text-amber-300 text-sm transition-colors"
            >
              {t('creation.kaiNameGenerate')}
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {KAI_NAME_PREFIXES.map(p => (
              <button key={p} onClick={() => {
                const suffix = kaiName.replace(/^[A-Z][a-z]+/, '') || KAI_NAME_SUFFIXES[0]
                setKaiName(p + suffix)
              }} className="text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Combat Skill */}
      <div className="bg-slate-800/60 rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-300 mb-1">{t('sheet.combatSkill')} (HC)</div>
          <div className="text-xs text-slate-500">R10 + {csBase}</div>
          {lastRN.cs !== undefined && (
            <div className="text-xs text-amber-600 mt-1">Dé : {lastRN.cs} + {csBase} = {cs}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={cs}
            onChange={e => setCS(Math.max(1, Number(e.target.value)))}
            min={csBase}
            max={csBase + 9}
            className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-2xl font-bold text-amber-400 focus:outline-none focus:border-amber-600"
          />
          <button
            onClick={rollCS}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors"
          >
            <Dices size={16} />
            {t('creation.rollCS')}
          </button>
        </div>
      </div>

      {/* Endurance */}
      <div className="bg-slate-800/60 rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-300 mb-1">{t('sheet.endurance')} (PE)</div>
          <div className="text-xs text-slate-500">R10 + {epBase}</div>
          {lastRN.ep !== undefined && (
            <div className="text-xs text-amber-600 mt-1">Dé : {lastRN.ep} + {epBase} = {ep}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={ep}
            onChange={e => setEP(Math.max(1, Number(e.target.value)))}
            min={epBase}
            max={epBase + 9}
            className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-2xl font-bold text-red-400 focus:outline-none focus:border-amber-600"
          />
          <button
            onClick={rollEP}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors"
          >
            <Dices size={16} />
            {t('creation.rollEP')}
          </button>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-5 py-2 rounded border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-sm">
          {t('creation.back')}
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
        >
          {t('creation.next')}
        </button>
      </div>
    </div>
  )
}
