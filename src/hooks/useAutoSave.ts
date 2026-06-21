import { useEffect, useRef } from 'react'
import { useCharacterStore } from '@/store/characterStore'

const AUTOSAVE_DELAY_MS = 1500

export function useAutoSave() {
  const character = useCharacterStore((s) => s.character)
  const save = useCharacterStore((s) => s.save)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!character) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      save()
    }, AUTOSAVE_DELAY_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [character, save])
}
