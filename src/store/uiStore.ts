import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'fr' | 'en'
type ActiveSection = 'stats' | 'disciplines' | 'equipment' | 'gold' | 'notes'

interface UIState {
  language: Language
  setLanguage: (lang: Language) => void
  activeSection: ActiveSection
  setActiveSection: (section: ActiveSection) => void
  combatModalOpen: boolean
  setCombatModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (language) => set({ language }),
      activeSection: 'stats',
      setActiveSection: (activeSection) => set({ activeSection }),
      combatModalOpen: false,
      setCombatModalOpen: (combatModalOpen) => set({ combatModalOpen }),
    }),
    { name: 'lonewolf_ui', partialize: (s) => ({ language: s.language }) }
  )
)
