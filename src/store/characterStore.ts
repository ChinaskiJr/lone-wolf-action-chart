import { create } from 'zustand'
import type { Character } from '@/types/character'
import type { BackpackItem, KaiDiscipline, MagnakaiDiscipline, GrandMasterDiscipline, NewOrderDiscipline, SpecialItem, Weapon } from '@/types/game'
import { useSavesStore } from './savesStore'

interface CharacterState {
  character: Character | null
  setCharacter: (char: Character) => void
  clearCharacter: () => void

  // Stats
  setEnduranceCurrent: (value: number) => void
  setEnduranceMax: (value: number) => void
  setCombatSkillBonus: (bonus: number) => void

  // Disciplines (generic via any cast, type narrowing happens in components)
  addDiscipline: (discipline: string) => void
  removeDiscipline: (discipline: string) => void

  // Weapons
  addWeapon: (weapon: Weapon) => void
  updateWeapon: (index: number, weapon: Weapon) => void
  removeWeapon: (index: number) => void

  // Backpack
  addBackpackItem: (item: BackpackItem) => void
  removeBackpackItem: (id: string) => void
  updateBackpackItem: (id: string, item: BackpackItem) => void

  // Special items
  addSpecialItem: (item: SpecialItem) => void
  removeSpecialItem: (id: string) => void

  // Gold
  setGold: (amount: number) => void

  // Meals
  setMeals: (count: number) => void

  // Notes
  setNotes: (notes: string) => void

  // Book progress
  setCurrentBook: (bookId: number) => void
  completeBook: (bookId: number) => void

  // Kai-specific
  setWeaponskillWeapon: (weapon: string) => void

  // Save to persistent store
  save: () => void
}

function updateChar(get: () => CharacterState, updater: (c: Character) => Partial<Character>): { character: Character | null } {
  const char = get().character
  if (!char) return { character: null }
  return { character: { ...char, ...updater(char), updatedAt: new Date().toISOString() } }
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  character: null,

  setCharacter: (char) => set({ character: char }),
  clearCharacter: () => set({ character: null }),

  setEnduranceCurrent: (value) =>
    set(updateChar(get, c => ({ endurance: { ...c.endurance, current: Math.max(0, value) } }))),

  setEnduranceMax: (value) =>
    set(updateChar(get, c => ({ endurance: { ...c.endurance, max: value } }))),

  setCombatSkillBonus: (bonus) =>
    set(updateChar(get, c => ({ combatSkill: { ...c.combatSkill, bonus } }))),

  addDiscipline: (discipline) =>
    set(updateChar(get, c => {
      const disciplines = (c.disciplines as string[])
      if (disciplines.includes(discipline)) return {}
      return { disciplines: [...disciplines, discipline] } as Partial<Character>
    })),

  removeDiscipline: (discipline) =>
    set(updateChar(get, c => ({
      disciplines: (c.disciplines as string[]).filter(d => d !== discipline),
    } as Partial<Character>))),

  addWeapon: (weapon) =>
    set(updateChar(get, c => {
      if (c.weapons.length >= 2) return {}
      return { weapons: [...c.weapons, weapon] }
    })),

  updateWeapon: (index, weapon) =>
    set(updateChar(get, c => ({
      weapons: c.weapons.map((w, i) => (i === index ? weapon : w)),
    }))),

  removeWeapon: (index) =>
    set(updateChar(get, c => ({
      weapons: c.weapons.filter((_, i) => i !== index),
    }))),

  addBackpackItem: (item) =>
    set(updateChar(get, c => {
      const maxSlots = c.cycle === 'kai' || c.cycle === 'magnakai' ? 8 : 10
      if (c.backpack.length + c.meals >= maxSlots) return {}
      return { backpack: [...c.backpack, item] }
    })),

  removeBackpackItem: (id) =>
    set(updateChar(get, c => ({
      backpack: c.backpack.filter(i => i.id !== id),
    }))),

  updateBackpackItem: (id, item) =>
    set(updateChar(get, c => ({
      backpack: c.backpack.map(i => (i.id === id ? item : i)),
    }))),

  addSpecialItem: (item) =>
    set(updateChar(get, c => {
      if (c.specialItems.length >= 12) return {}
      return { specialItems: [...c.specialItems, item] }
    })),

  removeSpecialItem: (id) =>
    set(updateChar(get, c => ({
      specialItems: c.specialItems.filter(i => i.id !== id),
    }))),

  setGold: (amount) =>
    set(updateChar(get, _c => ({ goldCrowns: Math.max(0, Math.min(50, amount)) }))),

  setMeals: (count) =>
    set(updateChar(get, _c => ({ meals: Math.max(0, count) }))),

  setNotes: (notes) =>
    set(updateChar(get, _c => ({ notes }))),

  setCurrentBook: (bookId) =>
    set(updateChar(get, _c => ({ currentBook: bookId }))),

  completeBook: (bookId) =>
    set(updateChar(get, c => ({
      booksCompleted: c.booksCompleted.includes(bookId)
        ? c.booksCompleted
        : [...c.booksCompleted, bookId],
    }))),

  setWeaponskillWeapon: (weapon) =>
    set(updateChar(get, c => {
      if (c.cycle !== 'kai') return {}
      return { weaponskillWeapon: weapon } as Partial<Character>
    })),

  save: () => {
    const char = get().character
    if (!char) return
    const { saves, addSave, updateSave } = useSavesStore.getState()
    if (saves.some(s => s.id === char.id)) {
      updateSave(char)
    } else {
      addSave(char)
    }
  },
}))
