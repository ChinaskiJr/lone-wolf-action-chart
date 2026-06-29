import type { CurrencyHolding, KnownCurrencyId } from '@/types/game'

// Belt Pouch capacity, expressed in Gold Crown "slots". Every currency shares it.
export const BELT_POUCH_CAPACITY = 50

export interface CurrencyDef {
  id: KnownCurrencyId
  labelKey: string // i18n key under sheet.currency.*
  valueInCrowns: number // exchange value of one coin, in Gold Crowns
  coinsPerSlot: number // coins that fill one Belt Pouch slot
}

// Exchange rates from the Reader's Handbook Topical Guide ("Currency" table).
// 1 Gold Crown = 1 Ain = 1 Noble = 4 Lune = 10 Kika = 10 Ren.
export const KNOWN_CURRENCIES: Record<KnownCurrencyId, CurrencyDef> = {
  crown: { id: 'crown', labelKey: 'sheet.currency.crown', valueInCrowns: 1, coinsPerSlot: 1 },
  ain: { id: 'ain', labelKey: 'sheet.currency.ain', valueInCrowns: 1, coinsPerSlot: 1 },
  noble: { id: 'noble', labelKey: 'sheet.currency.noble', valueInCrowns: 1, coinsPerSlot: 1 },
  lune: { id: 'lune', labelKey: 'sheet.currency.lune', valueInCrowns: 0.25, coinsPerSlot: 4 },
  kika: { id: 'kika', labelKey: 'sheet.currency.kika', valueInCrowns: 0.1, coinsPerSlot: 10 },
  ren: { id: 'ren', labelKey: 'sheet.currency.ren', valueInCrowns: 0.1, coinsPerSlot: 10 },
}

// Predefined currencies the player can add alongside Gold Crowns (everything but 'crown').
export const ADDABLE_KNOWN_CURRENCIES: CurrencyDef[] = (
  Object.keys(KNOWN_CURRENCIES) as KnownCurrencyId[]
)
  .filter((id) => id !== 'crown')
  .map((id) => KNOWN_CURRENCIES[id])

function isKnownCurrencyId(id: string): id is KnownCurrencyId {
  return id in KNOWN_CURRENCIES
}

export interface ResolvedCurrency {
  id: string
  isKnown: boolean
  labelKey?: string // present for predefined currencies
  name?: string // present for custom currencies
  valueInCrowns: number
  coinsPerSlot: number
}

// Resolves a holding's effective exchange/space data, whether predefined or custom.
export function resolveCurrency(holding: CurrencyHolding): ResolvedCurrency {
  if (isKnownCurrencyId(holding.id)) {
    const def = KNOWN_CURRENCIES[holding.id]
    return {
      id: def.id,
      isKnown: true,
      labelKey: def.labelKey,
      valueInCrowns: def.valueInCrowns,
      coinsPerSlot: def.coinsPerSlot,
    }
  }
  return {
    id: holding.id,
    isKnown: false,
    name: holding.name,
    valueInCrowns: holding.valueInCrowns ?? 1,
    coinsPerSlot: holding.coinsPerSlot ?? 1,
  }
}

// Belt Pouch slots occupied by a single holding (fractional; coins pack per slot).
export function holdingSpace(holding: CurrencyHolding): number {
  const { coinsPerSlot } = resolveCurrency(holding)
  return holding.amount / (coinsPerSlot || 1)
}
