import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRightLeft, Coins, Plus, Wallet, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { CurrencyHolding } from '@/types/game'
import { useCharacterStore } from '@/store/characterStore'
import {
  ADDABLE_KNOWN_CURRENCIES,
  BELT_POUCH_CAPACITY,
  KNOWN_CURRENCIES,
  resolveCurrency,
} from '@/data/currencies'
import { convertCurrency, getBeltPouchFree, getBeltPouchSpaceUsed } from '@/utils/character'

function formatSpace(n: number): string {
  return Number.isInteger(n) ? String(n) : (Math.round(n * 100) / 100).toString()
}

export function GoldPanel() {
  const { t } = useTranslation()
  const {
    character,
    setGold,
    addCurrency,
    setCurrencyAmount,
    removeCurrency,
    convertCurrencyAction,
  } = useCharacterStore()

  const holdings = useMemo(() => character?.otherCurrencies ?? [], [character])

  // Resolve a label for any currency id ('crown' or a holding).
  const currencyLabel = useMemo(() => {
    return (id: string): string => {
      if (id === 'crown') return t('sheet.currency.crown')
      const h = holdings.find((x) => x.id === id)
      if (!h) return id
      const r = resolveCurrency(h)
      return r.isKnown && r.labelKey ? t(r.labelKey) : (r.name ?? id)
    }
  }, [holdings, t])

  if (!character) return null

  const spaceUsed = getBeltPouchSpaceUsed(character)
  const free = getBeltPouchFree(character)
  const percent = (spaceUsed / BELT_POUCH_CAPACITY) * 100
  const full = free <= 0

  const presentIds = new Set(holdings.map((h) => h.id))
  const addablePredefined = ADDABLE_KNOWN_CURRENCIES.filter((c) => !presentIds.has(c.id))

  return (
    <div className="flex flex-col gap-6">
      {/* Belt Pouch shared capacity */}
      <div className="bg-slate-800/50 rounded-xl p-5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 mb-4">
          <Wallet size={15} />
          {t('sheet.beltPouch')}
        </p>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>
            {formatSpace(spaceUsed)} / {BELT_POUCH_CAPACITY}
          </span>
          <span className={full ? 'text-amber-400' : 'text-slate-500'}>
            {full ? t('sheet.beltPouchFull') : t('sheet.beltPouchFree', { n: Math.floor(free) })}
          </span>
        </div>
        <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>

      {/* Gold Crowns (primary currency) */}
      <CurrencyControl
        label={t('sheet.currency.crown')}
        amount={character.goldCrowns}
        free={free}
        coinsPerSlot={1}
        accent="amber"
        onChange={setGold}
      />

      {/* Other currencies */}
      {holdings.map((h) => {
        const r = resolveCurrency(h)
        const coinsForCrown = r.valueInCrowns > 0 ? Math.round(1 / r.valueInCrowns) : undefined
        const exchange =
          r.valueInCrowns !== 1 && coinsForCrown
            ? `${coinsForCrown} ${
                r.isKnown && r.labelKey ? t(r.labelKey) : (r.name ?? '')
              } = 1 ${t('sheet.currency.crown')}`
            : undefined
        return (
          <CurrencyControl
            key={h.id}
            label={r.isKnown && r.labelKey ? t(r.labelKey) : (r.name ?? h.id)}
            exchange={exchange}
            amount={h.amount}
            free={free}
            coinsPerSlot={r.coinsPerSlot}
            accent="slate"
            onChange={(v) => setCurrencyAmount(h.id, v)}
            onRemove={() => removeCurrency(h.id)}
          />
        )
      })}

      {/* Add a currency */}
      <AddCurrency
        addablePredefined={addablePredefined}
        onAddKnown={(id) => addCurrency({ id, amount: 0 })}
        onAddCustom={(name, valueInCrowns, coinsPerSlot) =>
          addCurrency({ id: uuidv4(), amount: 0, name, valueInCrowns, coinsPerSlot })
        }
      />

      {/* Conversion */}
      <ConvertPanel
        holdings={holdings}
        currencyLabel={currencyLabel}
        onConvert={convertCurrencyAction}
      />

      {character.cycle === 'magnakai' && (
        <div className="text-xs text-slate-500 bg-slate-900/40 rounded p-2 text-center">
          {t('sheet.beltPouchMonastery')}
        </div>
      )}
    </div>
  )
}

function CurrencyControl({
  label,
  exchange,
  amount,
  free,
  coinsPerSlot,
  accent,
  onChange,
  onRemove,
}: {
  label: string
  exchange?: string
  amount: number
  free: number // free Belt Pouch slots
  coinsPerSlot: number
  accent: 'amber' | 'slate'
  onChange: (value: number) => void
  onRemove?: () => void
}) {
  // How many more coins of this currency can be added given the free pouch space.
  const maxAddable = Math.floor(Math.max(0, free) * (coinsPerSlot || 1))
  const valueColor = accent === 'amber' ? 'text-amber-400' : 'text-slate-100'

  return (
    <div className="bg-slate-800/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
          <Coins size={15} className={accent === 'amber' ? 'text-amber-500' : 'text-slate-400'} />
          {label}
        </p>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-slate-500 hover:text-red-400 transition-colors"
            aria-label="remove"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {exchange && <p className="text-xs text-slate-500 mb-3">{exchange}</p>}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => onChange(amount - n)}
              disabled={amount < n}
              className="w-8 h-8 rounded bg-red-900/40 border border-red-900 hover:bg-red-800/60 disabled:opacity-30 text-red-300 text-xs font-bold transition-colors"
            >
              -{n}
            </button>
          ))}
        </div>
        <span className={`text-3xl font-bold ${valueColor} min-w-14 text-center`}>{amount}</span>
        <div className="flex items-center gap-1">
          {[1, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => onChange(amount + n)}
              disabled={n > maxAddable}
              className="w-8 h-8 rounded bg-green-900/40 border border-green-900 hover:bg-green-800/60 disabled:opacity-30 text-green-300 text-xs font-bold transition-colors"
            >
              +{n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AddCurrency({
  addablePredefined,
  onAddKnown,
  onAddCustom,
}: {
  addablePredefined: typeof ADDABLE_KNOWN_CURRENCIES
  onAddKnown: (id: (typeof ADDABLE_KNOWN_CURRENCIES)[number]['id']) => void
  onAddCustom: (name: string, valueInCrowns: number, coinsPerSlot: number) => void
}) {
  const { t } = useTranslation()
  const [customOpen, setCustomOpen] = useState(false)
  const [name, setName] = useState('')
  const [coinsPerCrown, setCoinsPerCrown] = useState('1')
  const [coinsPerSlot, setCoinsPerSlot] = useState('1')

  function submitCustom() {
    const cpc = Math.max(0.0001, Number(coinsPerCrown) || 1)
    const cps = Math.max(1, Math.floor(Number(coinsPerSlot) || 1))
    if (!name.trim()) return
    onAddCustom(name.trim(), 1 / cpc, cps)
    setName('')
    setCoinsPerCrown('1')
    setCoinsPerSlot('1')
    setCustomOpen(false)
  }

  if (addablePredefined.length === 0 && !customOpen) {
    return (
      <button
        onClick={() => setCustomOpen(true)}
        className="flex items-center justify-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 border border-amber-900/40 rounded-lg py-2 transition-colors"
      >
        <Plus size={15} />
        {t('sheet.customCurrency')}
      </button>
    )
  }

  return (
    <div className="bg-slate-800/40 rounded-xl p-4">
      <p className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
        <Plus size={15} />
        {t('sheet.addCurrency')}
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {addablePredefined.map((c) => (
          <button
            key={c.id}
            onClick={() => onAddKnown(c.id)}
            className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 text-xs font-medium transition-colors"
          >
            {t(c.labelKey)}
          </button>
        ))}
        <button
          onClick={() => setCustomOpen((v) => !v)}
          className="px-3 py-1.5 rounded-lg border border-amber-900/40 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
        >
          {t('sheet.customCurrency')}
        </button>
      </div>
      {customOpen && (
        <div className="flex flex-col gap-2 border-t border-slate-700/50 pt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('sheet.currencyName')}
            className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100"
          />
          <label className="flex items-center justify-between gap-2 text-xs text-slate-400">
            {t('sheet.coinsPerCrown')}
            <input
              type="number"
              min="0.01"
              step="any"
              value={coinsPerCrown}
              onChange={(e) => setCoinsPerCrown(e.target.value)}
              className="w-24 bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 text-right"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-xs text-slate-400">
            {t('sheet.coinsPerSlot')}
            <input
              type="number"
              min="1"
              step="1"
              value={coinsPerSlot}
              onChange={(e) => setCoinsPerSlot(e.target.value)}
              className="w-24 bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 text-right"
            />
          </label>
          <button
            onClick={submitCustom}
            disabled={!name.trim()}
            className="mt-1 px-3 py-1.5 rounded-lg bg-amber-700/70 hover:bg-amber-600/70 disabled:opacity-40 text-amber-50 text-sm font-medium transition-colors"
          >
            {t('common.add')}
          </button>
        </div>
      )}
    </div>
  )
}

function ConvertPanel({
  holdings,
  currencyLabel,
  onConvert,
}: {
  holdings: CurrencyHolding[]
  currencyLabel: (id: string) => string
  onConvert: (fromId: string, toId: string, amount: number) => void
}) {
  const { t } = useTranslation()
  const ids = useMemo(() => ['crown', ...holdings.map((h) => h.id)], [holdings])
  const [fromId, setFromId] = useState('crown')
  const [toId, setToId] = useState<string>(holdings[0]?.id ?? 'crown')
  const [amount, setAmount] = useState('')

  // Keep selections valid as holdings change.
  const validFrom = ids.includes(fromId) ? fromId : 'crown'
  const validTo =
    ids.includes(toId) && toId !== validFrom
      ? toId
      : (ids.find((i) => i !== validFrom) ?? validFrom)

  const valueOf = (id: string): number => {
    if (id === 'crown') return KNOWN_CURRENCIES.crown.valueInCrowns
    const h = holdings.find((x) => x.id === id)
    return h ? resolveCurrency(h).valueInCrowns : 1
  }

  const amt = Number(amount) || 0
  const preview =
    amt > 0 && validFrom !== validTo
      ? convertCurrency(amt, valueOf(validFrom), valueOf(validTo))
      : null

  if (ids.length < 2) return null

  return (
    <div className="bg-slate-800/40 rounded-xl p-4">
      <p className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
        <ArrowRightLeft size={15} />
        {t('sheet.convert')}
      </p>
      <div className="flex items-end gap-2 flex-wrap">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          {t('sheet.convertFrom')}
          <select
            value={validFrom}
            onChange={(e) => setFromId(e.target.value)}
            className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100"
          >
            {ids.map((id) => (
              <option key={id} value={id}>
                {currencyLabel(id)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          {t('sheet.convertTo')}
          <select
            value={validTo}
            onChange={(e) => setToId(e.target.value)}
            className="bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100"
          >
            {ids
              .filter((id) => id !== validFrom)
              .map((id) => (
                <option key={id} value={id}>
                  {currencyLabel(id)}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          {t('sheet.convertAmount')}
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-24 bg-slate-900/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 text-right"
          />
        </label>
      </div>
      {preview && (
        <p className="text-xs text-slate-400 mt-3">
          {t('sheet.convertResult')}:{' '}
          <span className="text-amber-400 font-semibold">
            {preview.converted} {currencyLabel(validTo)}
          </span>
          {preview.remainder > 0 && (
            <span className="text-slate-500">
              {' '}
              ({t('sheet.convertRemainder')}: {preview.remainder} {currencyLabel(validFrom)})
            </span>
          )}
        </p>
      )}
      <button
        onClick={() => {
          onConvert(validFrom, validTo, amt)
          setAmount('')
        }}
        disabled={!preview || preview.converted <= 0}
        className="mt-3 w-full px-3 py-1.5 rounded-lg bg-amber-700/70 hover:bg-amber-600/70 disabled:opacity-40 text-amber-50 text-sm font-medium transition-colors"
      >
        {t('sheet.convert')}
      </button>
    </div>
  )
}
