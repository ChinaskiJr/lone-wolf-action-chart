import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HerbPouchContent } from './HerbPouchContent'
import type { BackpackItem } from '@/types/game'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const onAdd = vi.fn()
const onRemove = vi.fn()
const onUpdate = vi.fn()

const defaultProps = {
  herbPouch: [] as BackpackItem[],
  onAdd,
  onRemove,
  onUpdate,
}

beforeEach(() => {
  vi.clearAllMocks()
})

function herb(overrides: Partial<BackpackItem> = {}): BackpackItem {
  return { id: '1', name: 'Laumspur', ...overrides }
}

describe('HerbPouchContent — dose counter display', () => {
  it('shows no dose badge or decrement button when maxDoses is not set', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb()]} />)
    expect(screen.queryByText(/sheet\.doses/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'sheet.consumeDose' })).not.toBeInTheDocument()
  })

  it('shows dose badge and decrement button when maxDoses is set', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb({ maxDoses: 3 })]} />)
    expect(screen.getByText(/3/)).toBeInTheDocument()
    expect(screen.getByText(/sheet\.doses/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'sheet.consumeDose' })).toBeInTheDocument()
  })

  it('shows dose badge on EP potion with maxDoses', () => {
    render(
      <HerbPouchContent {...defaultProps} herbPouch={[herb({ epRestore: 5, maxDoses: 2 })]} />
    )
    expect(screen.getByText(/sheet\.doses/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'sheet.consumeDose' })).toBeInTheDocument()
  })

  it('shows dose badge on combat potion with maxDoses', () => {
    render(
      <HerbPouchContent {...defaultProps} herbPouch={[herb({ csBonus: 2, maxDoses: 1 })]} />
    )
    expect(screen.getByText(/sheet\.doses/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'sheet.consumeDose' })).toBeInTheDocument()
  })
})

describe('HerbPouchContent — consumeDose', () => {
  it('calls onUpdate with maxDoses decremented when doses > 1', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb({ maxDoses: 3 })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'sheet.consumeDose' }))
    expect(onUpdate).toHaveBeenCalledOnce()
    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({ maxDoses: 2 }))
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('calls onRemove when maxDoses reaches 0 (was 1)', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb({ maxDoses: 1 })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'sheet.consumeDose' }))
    expect(onRemove).toHaveBeenCalledOnce()
    expect(onRemove).toHaveBeenCalledWith('1')
    expect(onUpdate).not.toHaveBeenCalled()
  })
})

describe('HerbPouchContent — add form with maxDoses', () => {
  it('calls onAdd with maxDoses when doses field is filled', () => {
    render(<HerbPouchContent {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('sheet.addHerb'), {
      target: { value: 'Laumspur' },
    })
    fireEvent.change(screen.getByTitle('sheet.maxDoses'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: 'sheet.addHerb' }))
    expect(onAdd).toHaveBeenCalledOnce()
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ name: 'Laumspur', maxDoses: 4 }))
  })

  it('calls onAdd without maxDoses when doses field is left blank', () => {
    render(<HerbPouchContent {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('sheet.addHerb'), {
      target: { value: 'Sommerlund Herb' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'sheet.addHerb' }))
    expect(onAdd).toHaveBeenCalledOnce()
    const call = onAdd.mock.calls[0][0] as BackpackItem
    expect(call.maxDoses).toBeUndefined()
  })

  it('resets doses field after adding an item', () => {
    render(<HerbPouchContent {...defaultProps} />)
    const dosesInput = screen.getByTitle('sheet.maxDoses') as HTMLInputElement
    fireEvent.change(screen.getByPlaceholderText('sheet.addHerb'), { target: { value: 'Herb' } })
    fireEvent.change(dosesInput, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'sheet.addHerb' }))
    expect(dosesInput.value).toBe('')
  })
})

describe('HerbPouchContent — edit form with maxDoses', () => {
  // When the edit form is open, the add form is also visible — two inputs share the same title.
  // The edit form input appears first in the DOM (inside the item list).
  function getEditDosesInput() {
    return screen.getAllByTitle('sheet.maxDoses')[0] as HTMLInputElement
  }

  it('pre-populates doses field from existing item', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb({ maxDoses: 5 })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'sheet.editItem' }))
    expect(getEditDosesInput().value).toBe('5')
  })

  it('leaves doses field empty for items without maxDoses', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb()]} />)
    fireEvent.click(screen.getByRole('button', { name: 'sheet.editItem' }))
    expect(getEditDosesInput().value).toBe('')
  })

  it('calls onUpdate with updated maxDoses when confirmed', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb({ maxDoses: 3 })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'sheet.editItem' }))
    fireEvent.change(getEditDosesInput(), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'common.confirm' }))
    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({ maxDoses: 7 }))
  })

  it('calls onUpdate with maxDoses undefined when doses field is cleared', () => {
    render(<HerbPouchContent {...defaultProps} herbPouch={[herb({ maxDoses: 3 })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'sheet.editItem' }))
    fireEvent.change(getEditDosesInput(), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'common.confirm' }))
    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({ maxDoses: undefined }))
  })
})
