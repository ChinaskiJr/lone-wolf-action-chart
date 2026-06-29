import { create } from 'zustand'
import type {
  Character,
  GrandMasterCharacter,
  MagnakaiCharacter,
  NewOrderCharacter,
} from '@/types/character'
import type {
  BackpackItem,
  ConfiscatedEquipment,
  CurrencyHolding,
  MonasteryStorage,
  SpecialItem,
  Weapon,
} from '@/types/game'
import { BELT_POUCH_CAPACITY, resolveCurrency } from '@/data/currencies'
import { getBeltPouchSpaceUsed, convertCurrency } from '@/utils/character'
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
  equipWeapon: (index: number) => void

  // Backpack
  addBackpackItem: (item: BackpackItem) => void
  removeBackpackItem: (id: string) => void
  updateBackpackItem: (id: string, item: BackpackItem) => void
  usePotion: (id: string) => void

  // Special items
  addSpecialItem: (item: SpecialItem) => void
  removeSpecialItem: (id: string) => void
  updateSpecialItem: (id: string, updates: Partial<SpecialItem>) => void

  // Herb pouch (Magnakai+)
  toggleHerbPouch: () => void
  addHerbItem: (item: BackpackItem) => void
  removeHerbItem: (id: string) => void
  updateHerbItem: (id: string, item: BackpackItem) => void
  useHerbPotion: (id: string) => void

  // Confiscation (inventory seized for a period, then recovered)
  confiscateEquipment: () => void
  confiscateSelected: (selection: ConfiscatedEquipment) => void
  recoverEquipment: (selection: ConfiscatedEquipment) => void

  // Monastery (store/retrieve items at the Kai Monastery between books, book 6+)
  syncMonastery: (
    newInventory: {
      weapons: Weapon[]
      goldCrowns: number
      otherCurrencies?: CurrencyHolding[]
      backpack: BackpackItem[]
      specialItems: SpecialItem[]
      meals: number
    },
    newMonastery: MonasteryStorage
  ) => void

  // Gold & other currencies (shared Belt Pouch capacity)
  setGold: (amount: number) => void
  addCurrency: (holding: CurrencyHolding) => void
  setCurrencyAmount: (id: string, amount: number) => void
  removeCurrency: (id: string) => void
  convertCurrencyAction: (fromId: string, toId: string, amount: number) => void

  // Meals
  setMeals: (count: number) => void
  eatMeal: () => void

  // Quiver & arrows
  toggleQuiver: () => void
  setArrows: (count: number) => void

  // Deliverance (Grand Master)
  useDeliverance: () => void

  // Notes
  setNotes: (notes: string) => void

  // Book progress
  setCurrentBook: (bookId: number) => void
  completeBook: (bookId: number) => void

  // Kai-specific
  setWeaponskillWeapon: (weapon: string) => void

  // Magnakai / GM / NO weapon mastery
  addWeaponmasteryWeapon: (weapon: string) => void
  removeWeaponmasteryWeapon: (weapon: string) => void

  // Save to persistent store
  save: () => void
}

// Total EP bonus contributed by currently-equipped special items.
function equippedPeBonus(items: SpecialItem[]): number {
  return items.reduce((s, i) => s + (i.equipped !== false ? (i.peBonus ?? 0) : 0), 0)
}

function updateChar(
  get: () => CharacterState,
  updater: (c: Character) => Partial<Character>
): { character: Character | null } {
  const char = get().character
  if (!char) return { character: null }
  return {
    character: { ...char, ...updater(char), updatedAt: new Date().toISOString() } as Character,
  }
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  character: null,

  setCharacter: (char) => set({ character: char }),
  clearCharacter: () => set({ character: null }),

  setEnduranceCurrent: (value) =>
    set(updateChar(get, (c) => ({ endurance: { ...c.endurance, current: Math.max(0, value) } }))),

  setEnduranceMax: (value) =>
    set(updateChar(get, (c) => ({ endurance: { ...c.endurance, max: value } }))),

  setCombatSkillBonus: (bonus) =>
    set(updateChar(get, (c) => ({ combatSkill: { ...c.combatSkill, bonus } }))),

  addDiscipline: (discipline) =>
    set(
      updateChar(get, (c) => {
        const disciplines = c.disciplines as string[]
        if (disciplines.includes(discipline)) return {}
        return { disciplines: [...disciplines, discipline] } as Partial<Character>
      })
    ),

  removeDiscipline: (discipline) =>
    set(
      updateChar(
        get,
        (c) =>
          ({
            disciplines: (c.disciplines as string[]).filter((d) => d !== discipline),
          }) as Partial<Character>
      )
    ),

  addWeapon: (weapon) =>
    set(
      updateChar(get, (c) => {
        if (c.weapons.length >= 2) return {}
        const hasEquipped = c.weapons.some((w) => w.equipped !== false)
        const newWeapon = hasEquipped ? { ...weapon, equipped: false } : weapon
        return { weapons: [...c.weapons, newWeapon] }
      })
    ),

  updateWeapon: (index, weapon) =>
    set(
      updateChar(get, (c) => ({
        weapons: c.weapons.map((w, i) => (i === index ? weapon : w)),
      }))
    ),

  removeWeapon: (index) =>
    set(
      updateChar(get, (c) => ({
        weapons: c.weapons.filter((_, i) => i !== index),
      }))
    ),

  equipWeapon: (index) =>
    set(
      updateChar(get, (c) => {
        const alreadyEquipped = c.weapons[index]?.equipped !== false
        return {
          weapons: c.weapons.map((w, i) =>
            alreadyEquipped
              ? { ...w, equipped: i === index ? false : w.equipped }
              : { ...w, equipped: i === index }
          ),
        }
      })
    ),

  addBackpackItem: (item) =>
    set(
      updateChar(get, (c) => {
        const maxSlots = c.cycle === 'kai' || c.cycle === 'magnakai' ? 8 : 10
        const usedSlots = c.backpack.reduce((sum, i) => sum + (i.slots ?? 1), 0) + c.meals
        if (usedSlots + (item.slots ?? 1) > maxSlots) return {}
        return { backpack: [...c.backpack, item] }
      })
    ),

  removeBackpackItem: (id) =>
    set(
      updateChar(get, (c) => ({
        backpack: c.backpack.filter((i) => i.id !== id),
      }))
    ),

  updateBackpackItem: (id, item) =>
    set(
      updateChar(get, (c) => ({
        backpack: c.backpack.map((i) => (i.id === id ? item : i)),
      }))
    ),

  usePotion: (id) =>
    set(
      updateChar(get, (c) => {
        const potion = c.backpack.find((i) => i.id === id)
        if (!potion?.epRestore) return {}
        const maxEP = c.endurance.max
        const newEP = Math.min(maxEP, c.endurance.current + potion.epRestore)
        return {
          backpack: c.backpack.filter((i) => i.id !== id),
          endurance: { ...c.endurance, current: newEP },
        }
      })
    ),

  addSpecialItem: (item) =>
    set(
      updateChar(get, (c) => {
        if (c.specialItems.length >= 12) return {}
        const peDelta = item.equipped !== false ? (item.peBonus ?? 0) : 0
        return {
          specialItems: [...c.specialItems, item],
          endurance: { ...c.endurance, current: c.endurance.current + peDelta },
        }
      })
    ),

  removeSpecialItem: (id) =>
    set(
      updateChar(get, (c) => {
        const item = c.specialItems.find((i) => i.id === id)
        const peDelta = item && item.equipped !== false ? (item.peBonus ?? 0) : 0
        return {
          specialItems: c.specialItems.filter((i) => i.id !== id),
          endurance: { ...c.endurance, current: Math.max(0, c.endurance.current - peDelta) },
        }
      })
    ),

  updateSpecialItem: (id, updates) =>
    set(
      updateChar(get, (c) => {
        const prev = c.specialItems.find((i) => i.id === id)
        const next = prev ? { ...prev, ...updates } : undefined
        let peDelta = 0
        if (prev && next && 'equipped' in updates) {
          const wasEquipped = prev.equipped !== false
          const nowEquipped = next.equipped !== false
          if (!wasEquipped && nowEquipped) peDelta = prev.peBonus ?? 0
          if (wasEquipped && !nowEquipped) peDelta = -(prev.peBonus ?? 0)
        }
        return {
          specialItems: c.specialItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
          endurance: { ...c.endurance, current: Math.max(0, c.endurance.current + peDelta) },
        }
      })
    ),

  toggleHerbPouch: () =>
    set(
      updateChar(get, (c) => {
        if (c.hasHerbPouch) return { hasHerbPouch: false, herbPouch: [] }
        return { hasHerbPouch: true, herbPouch: c.herbPouch ?? [] }
      })
    ),

  addHerbItem: (item) =>
    set(
      updateChar(get, (c) => {
        if ((c.herbPouch ?? []).length >= 6) return {}
        return { herbPouch: [...(c.herbPouch ?? []), item] }
      })
    ),

  removeHerbItem: (id) =>
    set(
      updateChar(get, (c) => ({
        herbPouch: (c.herbPouch ?? []).filter((i) => i.id !== id),
      }))
    ),

  updateHerbItem: (id, item) =>
    set(
      updateChar(get, (c) => ({
        herbPouch: (c.herbPouch ?? []).map((i) => (i.id === id ? item : i)),
      }))
    ),

  useHerbPotion: (id) =>
    set(
      updateChar(get, (c) => {
        const potion = (c.herbPouch ?? []).find((i) => i.id === id)
        if (!potion?.epRestore) return {}
        const newEP = Math.min(c.endurance.max, c.endurance.current + potion.epRestore)
        return {
          herbPouch: (c.herbPouch ?? []).filter((i) => i.id !== id),
          endurance: { ...c.endurance, current: newEP },
        }
      })
    ),

  confiscateEquipment: () =>
    set(
      updateChar(get, (c) => {
        if (c.confiscated) return {}
        // Equipped special items contributed EP; remove that while seized.
        const peDelta = equippedPeBonus(c.specialItems)
        return {
          confiscated: {
            weapons: c.weapons,
            goldCrowns: c.goldCrowns,
            otherCurrencies: c.otherCurrencies ?? [],
            meals: c.meals,
            backpack: c.backpack,
            specialItems: c.specialItems,
            hasHerbPouch: c.hasHerbPouch,
            herbPouch: c.herbPouch ?? [],
          },
          weapons: [],
          goldCrowns: 0,
          otherCurrencies: [],
          meals: 0,
          backpack: [],
          specialItems: [],
          hasHerbPouch: false,
          herbPouch: [],
          endurance: { ...c.endurance, current: Math.max(0, c.endurance.current - peDelta) },
        } as Partial<Character>
      })
    ),

  confiscateSelected: (selection) =>
    set(
      updateChar(get, (c) => {
        if (c.confiscated) return {}
        const peDelta = equippedPeBonus(selection.specialItems)
        const selBpIds = new Set(selection.backpack.map((i) => i.id))
        const selSpecIds = new Set(selection.specialItems.map((i) => i.id))
        const selWeaponNames = new Set(selection.weapons.map((w) => w.name))
        const seizedById = new Map((selection.otherCurrencies ?? []).map((h) => [h.id, h.amount]))
        return {
          confiscated: { ...selection },
          weapons: c.weapons.filter((w) => !selWeaponNames.has(w.name)),
          goldCrowns: c.goldCrowns - selection.goldCrowns,
          otherCurrencies: (c.otherCurrencies ?? [])
            .map((h) => ({ ...h, amount: h.amount - (seizedById.get(h.id) ?? 0) }))
            .filter((h) => h.amount > 0),
          meals: c.meals - selection.meals,
          backpack: c.backpack.filter((i) => !selBpIds.has(i.id)),
          specialItems: c.specialItems.filter((i) => !selSpecIds.has(i.id)),
          endurance: { ...c.endurance, current: Math.max(0, c.endurance.current - peDelta) },
        } as Partial<Character>
      })
    ),

  recoverEquipment: (selection) =>
    set(
      updateChar(get, (c) => {
        // Current special items already contribute their EP; reconcile to the selection.
        const peDelta = equippedPeBonus(selection.specialItems) - equippedPeBonus(c.specialItems)
        return {
          weapons: selection.weapons,
          goldCrowns: Math.max(0, Math.min(BELT_POUCH_CAPACITY, selection.goldCrowns)),
          // Currencies move wholesale: restore from the snapshot (full seize) or keep
          // what stayed on the character (selective seize). Never silently dropped.
          otherCurrencies:
            selection.otherCurrencies ?? c.confiscated?.otherCurrencies ?? c.otherCurrencies ?? [],
          meals: Math.max(0, selection.meals),
          backpack: selection.backpack,
          specialItems: selection.specialItems,
          hasHerbPouch: selection.hasHerbPouch ?? false,
          herbPouch: selection.herbPouch ?? [],
          endurance: { ...c.endurance, current: Math.max(0, c.endurance.current + peDelta) },
          confiscated: undefined,
        } as Partial<Character>
      })
    ),

  syncMonastery: (newInventory, newMonastery) =>
    set(
      updateChar(get, (c) => {
        const peDelta = equippedPeBonus(newInventory.specialItems) - equippedPeBonus(c.specialItems)
        return {
          weapons: newInventory.weapons,
          goldCrowns: Math.max(0, Math.min(BELT_POUCH_CAPACITY, newInventory.goldCrowns)),
          otherCurrencies: newInventory.otherCurrencies ?? c.otherCurrencies ?? [],
          meals: Math.max(0, newInventory.meals),
          backpack: newInventory.backpack,
          specialItems: newInventory.specialItems,
          monastery: newMonastery,
          endurance: { ...c.endurance, current: Math.max(0, c.endurance.current + peDelta) },
        } as Partial<Character>
      })
    ),

  setGold: (amount) =>
    set(
      updateChar(get, (c) => {
        // Gold shares the 50-slot Belt Pouch with every other currency (1 GC = 1 slot).
        const othersSpace = getBeltPouchSpaceUsed({
          goldCrowns: 0,
          otherCurrencies: c.otherCurrencies,
        })
        const maxGold = Math.max(0, Math.floor(BELT_POUCH_CAPACITY - othersSpace))
        return { goldCrowns: Math.max(0, Math.min(maxGold, amount)) }
      })
    ),

  addCurrency: (holding) =>
    set(
      updateChar(get, (c) => {
        const holdings = c.otherCurrencies ?? []
        if (holdings.some((h) => h.id === holding.id)) return {}
        return {
          otherCurrencies: [...holdings, { ...holding, amount: Math.max(0, holding.amount || 0) }],
        }
      })
    ),

  setCurrencyAmount: (id, amount) =>
    set(
      updateChar(get, (c) => {
        const holdings = c.otherCurrencies ?? []
        const holding = holdings.find((h) => h.id === id)
        if (!holding) return {}
        const { coinsPerSlot } = resolveCurrency(holding)
        const usedExcept = getBeltPouchSpaceUsed({
          goldCrowns: c.goldCrowns,
          otherCurrencies: holdings.filter((h) => h.id !== id),
        })
        const freeSlots = Math.max(0, BELT_POUCH_CAPACITY - usedExcept)
        const maxAmount = Math.floor(freeSlots * (coinsPerSlot || 1))
        const clamped = Math.max(0, Math.min(amount, maxAmount))
        return {
          otherCurrencies: holdings.map((h) => (h.id === id ? { ...h, amount: clamped } : h)),
        }
      })
    ),

  removeCurrency: (id) =>
    set(
      updateChar(get, (c) => ({
        otherCurrencies: (c.otherCurrencies ?? []).filter((h) => h.id !== id),
      }))
    ),

  convertCurrencyAction: (fromId, toId, amount) =>
    set(
      updateChar(get, (c) => {
        if (fromId === toId || amount <= 0) return {}
        const holdings = c.otherCurrencies ?? []
        // Source/target must already exist (Gold Crowns always do).
        const info = (id: string) => {
          if (id === 'crown') return { valueInCrowns: 1, amount: c.goldCrowns }
          const h = holdings.find((x) => x.id === id)
          if (!h) return null
          return { valueInCrowns: resolveCurrency(h).valueInCrowns, amount: h.amount }
        }
        const from = info(fromId)
        const to = info(toId)
        if (!from || !to) return {}
        const usable = Math.min(amount, from.amount)
        if (usable <= 0) return {}
        const { converted, remainder } = convertCurrency(
          usable,
          from.valueInCrowns,
          to.valueInCrowns
        )
        if (converted <= 0) return {}
        const spent = usable - remainder // source coins actually exchanged

        let goldCrowns = c.goldCrowns
        let next = holdings.map((h) => ({ ...h }))
        const apply = (id: string, value: number) => {
          if (id === 'crown') goldCrowns = value
          else next = next.map((h) => (h.id === id ? { ...h, amount: value } : h))
        }
        apply(fromId, from.amount - spent)
        apply(toId, to.amount + converted)
        return { goldCrowns, otherCurrencies: next }
      })
    ),

  setMeals: (count) => set(updateChar(get, (_c) => ({ meals: Math.max(0, count) }))),

  eatMeal: () =>
    set(
      updateChar(get, (c) => {
        // Eating consumes a meal; if no food is available, lose 3 EP.
        if (c.meals > 0) return { meals: c.meals - 1 }
        return { endurance: { ...c.endurance, current: Math.max(0, c.endurance.current - 3) } }
      })
    ),

  toggleQuiver: () => set(updateChar(get, (c) => ({ hasQuiver: !(c.hasQuiver ?? false) }))),

  setArrows: (count) => set(updateChar(get, (_c) => ({ arrows: Math.max(0, count) }))),

  useDeliverance: () =>
    set(
      updateChar(get, (c) => {
        if (c.cycle !== 'grandmaster') return {}
        if (!c.disciplines.includes('deliverance')) return {}
        if (c.deliveranceAvailable === false) return {}
        if (c.endurance.current > 8) return {}
        const newEP = Math.min(c.endurance.max, c.endurance.current + 20)
        return {
          endurance: { ...c.endurance, current: newEP },
          deliveranceAvailable: false,
        } as Partial<Character>
      })
    ),

  setNotes: (notes) => set(updateChar(get, (_c) => ({ notes }))),

  setCurrentBook: (bookId) => set(updateChar(get, (_c) => ({ currentBook: bookId }))),

  completeBook: (bookId) =>
    set(
      updateChar(get, (c) => {
        const booksCompleted = c.booksCompleted.includes(bookId)
          ? c.booksCompleted
          : [...c.booksCompleted, bookId]
        // A new book spans well over 20 in-game days: Deliverance recharges.
        if (c.cycle === 'grandmaster') {
          return { booksCompleted, deliveranceAvailable: true } as Partial<Character>
        }
        return { booksCompleted }
      })
    ),

  setWeaponskillWeapon: (weapon) =>
    set(
      updateChar(get, (c) => {
        if (c.cycle !== 'kai') return {}
        return { weaponskillWeapon: weapon } as Partial<Character>
      })
    ),

  addWeaponmasteryWeapon: (weapon) =>
    set(
      updateChar(get, (c) => {
        if (c.cycle === 'kai') return {}
        const current =
          (c as MagnakaiCharacter | GrandMasterCharacter | NewOrderCharacter)
            .weaponmasteryWeapons ?? []
        if (current.includes(weapon)) return {}
        return { weaponmasteryWeapons: [...current, weapon] } as Partial<Character>
      })
    ),

  removeWeaponmasteryWeapon: (weapon) =>
    set(
      updateChar(get, (c) => {
        if (c.cycle === 'kai') return {}
        const current =
          (c as MagnakaiCharacter | GrandMasterCharacter | NewOrderCharacter)
            .weaponmasteryWeapons ?? []
        return { weaponmasteryWeapons: current.filter((w) => w !== weapon) } as Partial<Character>
      })
    ),

  save: () => {
    const char = get().character
    if (!char) return
    const { saves, addSave, updateSave } = useSavesStore.getState()
    if (saves.some((s) => s.id === char.id)) {
      updateSave(char)
    } else {
      addSave(char)
    }
  },
}))
