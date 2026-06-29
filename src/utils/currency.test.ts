import { describe, it, expect } from 'vitest'
import { convertCurrency, getBeltPouchSpaceUsed, getBeltPouchFree } from './character'
import { KNOWN_CURRENCIES, holdingSpace, resolveCurrency } from '@/data/currencies'

describe('getBeltPouchSpaceUsed', () => {
  it('counts Gold Crowns as one slot each', () => {
    expect(getBeltPouchSpaceUsed({ goldCrowns: 30 })).toBe(30)
  })

  it('packs lesser coins per the coinsPerSlot rule (4 Lune = 1 slot)', () => {
    // 200 Lune fill exactly the 50-slot pouch, no Crowns.
    const used = getBeltPouchSpaceUsed({
      goldCrowns: 0,
      otherCurrencies: [{ id: 'lune', amount: 200 }],
    })
    expect(used).toBe(50)
  })

  it('sums Gold Crowns and other currencies (10 Kika = 1 slot)', () => {
    const used = getBeltPouchSpaceUsed({
      goldCrowns: 10,
      otherCurrencies: [
        { id: 'lune', amount: 4 }, // 1 slot
        { id: 'kika', amount: 10 }, // 1 slot
      ],
    })
    expect(used).toBe(12)
  })

  it('free slots never go negative', () => {
    expect(
      getBeltPouchFree({ goldCrowns: 0, otherCurrencies: [{ id: 'lune', amount: 1000 }] })
    ).toBe(0)
  })
})

describe('holdingSpace', () => {
  it('uses the resolved coinsPerSlot for known currencies', () => {
    expect(holdingSpace({ id: 'ren', amount: 10 })).toBe(1)
    expect(holdingSpace({ id: 'noble', amount: 3 })).toBe(3)
  })

  it('defaults custom currencies to 1 coin per slot', () => {
    expect(holdingSpace({ id: 'custom-x', amount: 5, name: 'Shek' })).toBe(5)
  })
})

describe('convertCurrency', () => {
  it('converts 8 Lune into 2 Gold Crowns with no remainder', () => {
    const lune = KNOWN_CURRENCIES.lune.valueInCrowns
    const crown = KNOWN_CURRENCIES.crown.valueInCrowns
    expect(convertCurrency(8, lune, crown)).toEqual({ converted: 2, remainder: 0 })
  })

  it('keeps the indivisible remainder in source coins', () => {
    const lune = KNOWN_CURRENCIES.lune.valueInCrowns
    const crown = KNOWN_CURRENCIES.crown.valueInCrowns
    // 9 Lune = 2 Crowns (8 Lune) + 1 Lune left over.
    expect(convertCurrency(9, lune, crown)).toEqual({ converted: 2, remainder: 1 })
  })

  it('converts Gold Crowns into Lune (1 Crown = 4 Lune)', () => {
    const lune = KNOWN_CURRENCIES.lune.valueInCrowns
    const crown = KNOWN_CURRENCIES.crown.valueInCrowns
    expect(convertCurrency(3, crown, lune)).toEqual({ converted: 12, remainder: 0 })
  })

  it('returns nothing converted for non-positive amounts', () => {
    expect(convertCurrency(0, 1, 1)).toEqual({ converted: 0, remainder: 0 })
  })
})

describe('resolveCurrency', () => {
  it('resolves a known currency from the data table', () => {
    const r = resolveCurrency({ id: 'lune', amount: 4 })
    expect(r.isKnown).toBe(true)
    expect(r.valueInCrowns).toBe(0.25)
    expect(r.coinsPerSlot).toBe(4)
  })

  it('resolves a custom currency from its own fields', () => {
    const r = resolveCurrency({
      id: 'x',
      amount: 1,
      name: 'Shek',
      valueInCrowns: 2,
      coinsPerSlot: 1,
    })
    expect(r.isKnown).toBe(false)
    expect(r.name).toBe('Shek')
    expect(r.valueInCrowns).toBe(2)
  })
})
