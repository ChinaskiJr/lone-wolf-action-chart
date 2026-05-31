import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload } from 'lucide-react'
import { useSavesStore } from '@/store/savesStore'
import { useCharacterStore } from '@/store/characterStore'
import { SaveCard } from './SaveCard'
import { Toast } from '@/components/layout/Toast'
import type { Character } from '@/types/character'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { saves, addSave, deleteSave } = useSavesStore()
  const { setCharacter } = useCharacterStore()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleContinue(char: Character) {
    setCharacter(char)
    navigate(`/sheet/${char.id}`)
  }

  function handleExport(char: Character) {
    const json = JSON.stringify(char, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lonewolf_${char.name.replace(/\s+/g, '_')}_book${char.currentBook}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const char = JSON.parse(ev.target?.result as string) as Character
          if (!char.id || !char.cycle) throw new Error('Invalid save file')
          addSave(char)
        } catch {
          setErrorMsg('Fichier invalide — les champs id ou cycle sont manquants.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <>
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-semibold text-amber-100">{t('home.title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-slate-600 text-slate-300 hover:border-amber-600 hover:text-amber-300 transition-colors"
          >
            <Upload size={14} />
            {t('home.import')}
          </button>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
          >
            <Plus size={15} />
            {t('home.startNew')}
          </button>
        </div>
      </div>

      {saves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <div className="text-5xl mb-4 opacity-30">⚔</div>
          <p className="mb-6">{t('home.noSaves')}</p>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
          >
            <Plus size={16} />
            {t('home.startNew')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saves
            .slice()
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map(char => (
              <SaveCard
                key={char.id}
                character={char}
                onContinue={() => handleContinue(char)}
                onExport={() => handleExport(char)}
                onDelete={() => deleteSave(char.id)}
              />
            ))}
        </div>
      )}
    </div>

    {errorMsg && (
      <Toast
        message={errorMsg}
        variant="error"
        onDismiss={() => setErrorMsg(null)}
        duration={6000}
      />
    )}
    </>
  )
}
