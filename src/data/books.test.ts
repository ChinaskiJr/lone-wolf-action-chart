import { describe, it, expect } from 'vitest'
import { getBook, getCycleForBook, CYCLE_FIRST_BOOK, CYCLE_LAST_BOOK } from './books'

describe('getBook', () => {
  it('returns book 1 with cycle kai', () => {
    const book = getBook(1)
    expect(book).toBeDefined()
    expect(book!.id).toBe(1)
    expect(book!.cycle).toBe('kai')
  })

  it('returns book 6 with cycle magnakai', () => {
    const book = getBook(6)
    expect(book!.cycle).toBe('magnakai')
  })

  it('returns book 13 with cycle grandmaster', () => {
    const book = getBook(13)
    expect(book!.cycle).toBe('grandmaster')
  })

  it('returns book 21 with cycle neworder', () => {
    const book = getBook(21)
    expect(book!.cycle).toBe('neworder')
  })

  it('returns undefined for an unknown book id', () => {
    expect(getBook(999)).toBeUndefined()
  })
})

describe('getCycleForBook', () => {
  it('returns kai for book 1', () => expect(getCycleForBook(1)).toBe('kai'))
  it('returns magnakai for book 6', () => expect(getCycleForBook(6)).toBe('magnakai'))
  it('returns grandmaster for book 13', () => expect(getCycleForBook(13)).toBe('grandmaster'))
  it('returns neworder for book 32', () => expect(getCycleForBook(32)).toBe('neworder'))
  it('returns kai as default for unknown book', () => expect(getCycleForBook(999)).toBe('kai'))
})

describe('CYCLE_FIRST_BOOK / CYCLE_LAST_BOOK', () => {
  it('has correct first books', () => {
    expect(CYCLE_FIRST_BOOK.kai).toBe(1)
    expect(CYCLE_FIRST_BOOK.magnakai).toBe(6)
    expect(CYCLE_FIRST_BOOK.grandmaster).toBe(13)
    expect(CYCLE_FIRST_BOOK.neworder).toBe(21)
  })

  it('has correct last books', () => {
    expect(CYCLE_LAST_BOOK.kai).toBe(5)
    expect(CYCLE_LAST_BOOK.magnakai).toBe(12)
    expect(CYCLE_LAST_BOOK.grandmaster).toBe(20)
    expect(CYCLE_LAST_BOOK.neworder).toBe(32)
  })
})
