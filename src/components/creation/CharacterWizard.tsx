import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Character } from '@/types/character'
import type { Cycle } from '@/types/game'
import { useCharacterStore } from '@/store/characterStore'
import { useSavesStore } from '@/store/savesStore'
import {
  createNewKaiCharacter,
  createNewMagnakaiCharacter,
  createNewGrandMasterCharacter,
  createNewOrderCharacter,
} from '@/utils/character'
import { StepCycleBook } from './StepCycleBook'
import { StepStats } from './StepStats'
import { StepDisciplines } from './StepDisciplines'
import { StepEquipment } from './StepEquipment'

export function CharacterWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setCharacter } = useCharacterStore()
  const { addSave } = useSavesStore()

  const [step, setStep] = useState(1)
  const [cycle, setCycle] = useState<Cycle>('kai')
  const [startBook, setStartBook] = useState(1)
  const [character, setLocalCharacter] = useState<Character>(() => createNewKaiCharacter())

  function handleCycleBookNext(selectedCycle: Cycle, selectedBook: number) {
    setCycle(selectedCycle)
    setStartBook(selectedBook)
    let fresh: Character
    if (selectedCycle === 'kai') fresh = createNewKaiCharacter({ currentBook: selectedBook })
    else if (selectedCycle === 'magnakai') fresh = createNewMagnakaiCharacter()
    else if (selectedCycle === 'grandmaster') fresh = createNewGrandMasterCharacter()
    else fresh = createNewOrderCharacter()
    setLocalCharacter({ ...fresh, currentBook: selectedBook })
    setStep(2)
  }

  function handleStatsNext(updated: Character) {
    setLocalCharacter(updated)
    setStep(3)
  }

  function handleDisciplinesNext(updated: Character) {
    setLocalCharacter(updated)
    setStep(4)
  }

  function handleEquipmentFinish(updated: Character) {
    addSave(updated)
    setCharacter(updated)
    navigate(`/sheet/${updated.id}`)
  }

  const steps = [
    t('creation.step1'),
    t('creation.step2'),
    t('creation.step3'),
    t('creation.step4'),
  ]

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      {/* Progress steps */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                ${i + 1 === step ? 'border-amber-500 bg-amber-600 text-white' :
                  i + 1 < step ? 'border-green-600 bg-green-700 text-white' :
                  'border-slate-700 bg-slate-800 text-slate-500'}`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-amber-300' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i + 1 < step ? 'bg-green-700' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        {step === 1 && (
          <StepCycleBook
            initialCycle={cycle}
            initialBook={startBook}
            onNext={handleCycleBookNext}
          />
        )}
        {step === 2 && (
          <StepStats
            character={character}
            onNext={handleStatsNext}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepDisciplines
            character={character}
            onNext={handleDisciplinesNext}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepEquipment
            character={character}
            onFinish={handleEquipmentFinish}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  )
}
