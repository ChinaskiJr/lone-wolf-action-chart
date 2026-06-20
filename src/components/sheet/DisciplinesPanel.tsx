import { useTranslation } from 'react-i18next'
import { Plus, Gem } from 'lucide-react'
import { DisciplineGrid } from '@/components/disciplines/DisciplineGrid'
import { WeaponmasterySelector } from '@/components/disciplines/WeaponmasterySelector'
import { useCharacterStore } from '@/store/characterStore'
import {
  MAGNAKAI_DISCIPLINES,
  KAI_WEAPONS,
  getDisciplineMap,
} from '@/data/disciplines'
import { BOOKS } from '@/data/books'
import { LORE_CIRCLES, getCompletedCircles } from '@/data/loreCircles'

export function DisciplinesPanel() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const { character, addDiscipline, setWeaponskillWeapon, addWeaponmasteryWeapon, removeWeaponmasteryWeapon } = useCharacterStore()

  if (!character) return null

  const disciplines = Object.values(getDisciplineMap(character.cycle))
  const selected = character.disciplines as string[]

  const currentBook = BOOKS.find(b => b.id === character.currentBook)
  const maxDisciplines = currentBook?.maxDisciplines ?? selected.length
  const canAdd = selected.length < maxDisciplines
  const slotsLeft = maxDisciplines - selected.length

  function handlePickDiscipline(key: string) {
    if (!canAdd || selected.includes(key)) return
    if (character!.cycle === 'kai' && key === 'weaponskill') {
      const idx = Math.floor(Math.random() * KAI_WEAPONS.length)
      addDiscipline('weaponskill')
      setWeaponskillWeapon(KAI_WEAPONS[idx].key)
      return
    }
    addDiscipline(key)
  }

  const completedCircles = character.cycle === 'magnakai'
    ? getCompletedCircles(selected)
    : []

  return (
    <div className="flex flex-col gap-5">
      {/* New discipline available banner */}
      {canAdd && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-950/30 border border-amber-800/50 rounded-lg text-sm text-amber-300">
          <Plus size={14} className="shrink-0" />
          <span>
            {lang === 'fr'
              ? `Vous pouvez apprendre ${slotsLeft} nouvelle${slotsLeft > 1 ? 's' : ''} discipline${slotsLeft > 1 ? 's' : ''} — cliquez sur une discipline ci-dessous`
              : `You can learn ${slotsLeft} new discipline${slotsLeft > 1 ? 's' : ''} — click one below`}
          </span>
        </div>
      )}

      {/* Main disciplines list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">{t('sheet.disciplines')}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${canAdd ? 'text-amber-400 bg-amber-950/40 border border-amber-800/50' : 'text-slate-500'}`}>
            {selected.length} / {maxDisciplines}
          </span>
        </div>
        <DisciplineGrid
          disciplines={disciplines}
          lang={lang}
          getState={key => selected.includes(key) ? 'owned' : canAdd ? 'available' : 'disabled'}
          onPick={handlePickDiscipline}
        />
      </div>

      {/* Weaponskill weapon (Kai) */}
      {character.cycle === 'kai' && selected.includes('weaponskill') && (
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 text-sm">
          <span className="text-slate-400">{lang === 'fr' ? 'Arme maîtrisée' : 'Mastered weapon'} : </span>
          <span className="text-blue-300 font-medium">
            {(() => {
              const w = KAI_WEAPONS.find(ww => ww.key === (character as any).weaponskillWeapon)
              return w ? (lang === 'fr' ? w.fr : w.en) : (character as any).weaponskillWeapon
            })()}
          </span>
          <span className="text-slate-500 ml-2 text-xs">(+2 HC {lang === 'fr' ? 'si portée' : 'if carried'})</span>
        </div>
      )}

      {/* Weaponmastery weapons (Magnakai / GM / NO) */}
      {(character.cycle === 'magnakai' || character.cycle === 'grandmaster' || character.cycle === 'neworder') &&
        selected.includes(character.cycle === 'magnakai' ? 'weaponmastery' : 'grandWeaponmastery') && (() => {
          const owned: string[] = (character as any).weaponmasteryWeapons ?? []
          const max = character.cycle === 'magnakai' ? character.currentBook - 3 : character.currentBook - 12
          const hcBonus = character.cycle === 'magnakai' ? 3 : 5
          return (
            <WeaponmasterySelector
              owned={owned}
              max={max}
              hcBonus={hcBonus}
              lang={lang}
              onAdd={addWeaponmasteryWeapon}
              onRemove={removeWeaponmasteryWeapon}
            />
          )
        })()
      }

      {/* Lore circles (Magnakai) */}
      {character.cycle === 'magnakai' && (
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">{t('sheet.loreCircles')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LORE_CIRCLES.map(circle => {
              const isComplete = completedCircles.some(c => c.id === circle.id)
              const ownedCount = circle.disciplines.filter(d => selected.includes(d)).length
              return (
                <div key={circle.id} className={`rounded-lg border p-3 ${isComplete ? 'border-green-700 bg-green-950/20' : 'border-slate-800 bg-slate-800/20'}`}>
                  <div className={`font-medium text-sm ${isComplete ? 'text-green-300' : 'text-slate-400'}`}>
                    {isComplete && '✓ '}{lang === 'fr' ? circle.fr : circle.en}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {ownedCount}/{circle.disciplines.length} disciplines
                    {isComplete && <span className="text-green-500 ml-2">+{circle.bonusCS} HC +{circle.bonusEP} PE</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lorestones (Magnakai) */}
      {character.cycle === 'magnakai' && (
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">{t('sheet.lorestones')}</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(n => {
              const owned = n <= (character.currentBook - 6)
              return (
                <div
                  key={n}
                  title={`${t('sheet.lorestones')} ${n}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    owned
                      ? 'text-emerald-400 bg-emerald-900/30 border border-emerald-700/60'
                      : 'text-slate-700 bg-slate-800/40 border border-slate-700/40'
                  }`}
                >
                  <Gem size={18} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Previous cycle disciplines (GM/NO) */}
      {(character.cycle === 'grandmaster') && (character as any).magnakaiDisciplines?.length > 0 && (
        <div className="bg-green-950/10 border border-green-900/30 rounded-lg p-3">
          <div className="text-xs text-green-600 font-medium mb-1.5">Disciplines Magnakaï conservées</div>
          <div className="flex flex-wrap gap-1.5">
            {((character as any).magnakaiDisciplines as string[]).map(dk => {
              const d = MAGNAKAI_DISCIPLINES[dk as keyof typeof MAGNAKAI_DISCIPLINES]
              return d ? (
                <span key={dk} className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-900/50">
                  {lang === 'fr' ? d.fr : d.en}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
