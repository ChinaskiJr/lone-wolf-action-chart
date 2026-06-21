import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from './useAutoSave'
import { useCharacterStore } from '@/store/characterStore'
import { makeKaiChar } from '@/test/fixtures'

beforeEach(() => {
  vi.useFakeTimers()
  useCharacterStore.setState({ character: null })
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllTimers()
})

describe('useAutoSave', () => {
  it('does not call save before 1500ms have elapsed', () => {
    const mockSave = vi.fn()
    useCharacterStore.setState({ character: makeKaiChar(), save: mockSave } as any)

    renderHook(() => useAutoSave())

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('calls save exactly once after 1500ms', () => {
    const mockSave = vi.fn()
    useCharacterStore.setState({ character: makeKaiChar(), save: mockSave } as any)

    renderHook(() => useAutoSave())

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  it('resets the debounce timer on rapid character changes', () => {
    const mockSave = vi.fn()
    const char = makeKaiChar()
    useCharacterStore.setState({ character: char, save: mockSave } as any)

    renderHook(() => useAutoSave())

    // Advance 1000ms — timer running but not fired
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(mockSave).not.toHaveBeenCalled()

    // Character changes → timer resets
    act(() => {
      useCharacterStore.setState({
        character: { ...char, notes: 'mid-change' },
        save: mockSave,
      } as any)
    })

    // 1000ms more — still within new 1500ms window
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(mockSave).not.toHaveBeenCalled()

    // Final 500ms — timer fires
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  it('does not call save when character is null', () => {
    const mockSave = vi.fn()
    useCharacterStore.setState({ character: null, save: mockSave } as any)

    renderHook(() => useAutoSave())

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(mockSave).not.toHaveBeenCalled()
  })
})
