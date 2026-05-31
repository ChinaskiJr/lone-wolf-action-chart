import { describe, it, expect, beforeEach } from 'vitest'
import { useSavesStore } from './savesStore'
import { makeKaiChar } from '@/test/fixtures'

beforeEach(() => {
  localStorage.clear()
  useSavesStore.setState({ saves: [] })
})

describe('addSave / getSave', () => {
  it('stores a character and retrieves it by id', () => {
    const char = makeKaiChar({ id: 'char-1' })
    useSavesStore.getState().addSave(char)
    expect(useSavesStore.getState().getSave('char-1')).toEqual(char)
  })

  it('returns undefined for an unknown id', () => {
    expect(useSavesStore.getState().getSave('unknown')).toBeUndefined()
  })

  it('stores multiple saves independently', () => {
    const c1 = makeKaiChar({ id: 'c1', name: 'Alice' })
    const c2 = makeKaiChar({ id: 'c2', name: 'Bob' })
    useSavesStore.getState().addSave(c1)
    useSavesStore.getState().addSave(c2)
    expect(useSavesStore.getState().saves).toHaveLength(2)
  })
})

describe('updateSave', () => {
  it('updates an existing save by id', () => {
    const char = makeKaiChar({ id: 'char-1', notes: '' })
    useSavesStore.getState().addSave(char)
    useSavesStore.getState().updateSave({ ...char, notes: 'updated' })
    expect(useSavesStore.getState().getSave('char-1')?.notes).toBe('updated')
  })

  it('stamps updatedAt on update', () => {
    const char = makeKaiChar({ id: 'char-1', updatedAt: '2020-01-01T00:00:00.000Z' })
    useSavesStore.getState().addSave(char)
    useSavesStore.getState().updateSave(char)
    expect(useSavesStore.getState().getSave('char-1')?.updatedAt).not.toBe('2020-01-01T00:00:00.000Z')
  })

  it('does not affect other saves', () => {
    const c1 = makeKaiChar({ id: 'c1' })
    const c2 = makeKaiChar({ id: 'c2', notes: 'intact' })
    useSavesStore.getState().addSave(c1)
    useSavesStore.getState().addSave(c2)
    useSavesStore.getState().updateSave({ ...c1, notes: 'changed' })
    expect(useSavesStore.getState().getSave('c2')?.notes).toBe('intact')
  })
})

describe('deleteSave', () => {
  it('removes the save with the given id', () => {
    const char = makeKaiChar({ id: 'char-1' })
    useSavesStore.getState().addSave(char)
    useSavesStore.getState().deleteSave('char-1')
    expect(useSavesStore.getState().saves).toHaveLength(0)
  })

  it('does not affect other saves when deleting one', () => {
    const c1 = makeKaiChar({ id: 'c1' })
    const c2 = makeKaiChar({ id: 'c2' })
    useSavesStore.getState().addSave(c1)
    useSavesStore.getState().addSave(c2)
    useSavesStore.getState().deleteSave('c1')
    expect(useSavesStore.getState().saves).toHaveLength(1)
    expect(useSavesStore.getState().getSave('c2')).toBeDefined()
  })

  it('is a no-op for an unknown id', () => {
    const char = makeKaiChar({ id: 'char-1' })
    useSavesStore.getState().addSave(char)
    useSavesStore.getState().deleteSave('unknown')
    expect(useSavesStore.getState().saves).toHaveLength(1)
  })
})
