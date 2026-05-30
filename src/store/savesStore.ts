import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character } from '@/types/character'

const STORAGE_KEY = 'lonewolf_saves'

interface SavesState {
  saves: Character[]
  addSave: (char: Character) => void
  updateSave: (char: Character) => void
  deleteSave: (id: string) => void
  getSave: (id: string) => Character | undefined
}

export const useSavesStore = create<SavesState>()(
  persist(
    (set, get) => ({
      saves: [],

      addSave: (char) => set(state => ({ saves: [...state.saves, char] })),

      updateSave: (char) =>
        set(state => ({
          saves: state.saves.map(s =>
            s.id === char.id ? { ...char, updatedAt: new Date().toISOString() } : s
          ),
        })),

      deleteSave: (id) => set(state => ({ saves: state.saves.filter(s => s.id !== id) })),

      getSave: (id) => get().saves.find(s => s.id === id),
    }),
    { name: STORAGE_KEY }
  )
)
