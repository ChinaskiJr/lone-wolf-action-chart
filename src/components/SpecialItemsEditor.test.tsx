import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SpecialItemsEditor } from './SpecialItemsEditor'
import type { SpecialItem } from '@/types/game'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const defaultProps = {
  items: [] as SpecialItem[],
  onAdd: vi.fn(),
  onRemove: vi.fn(),
  onUpdate: vi.fn(),
  hasHerbPouch: false,
  herbPouch: [],
  showHerbPouch: false,
  onToggleHerbPouch: vi.fn(),
  onOpenHerbPouch: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SpecialItemsEditor — weightless', () => {
  it('shows the weightless label on a weightless item', () => {
    // Fill 12 slots so the add form is hidden — only the item display can produce the label
    const fillers: SpecialItem[] = Array.from({ length: 11 }, (_, i) => ({
      id: String(i + 2),
      name: `Item ${i + 2}`,
    }))
    render(
      <SpecialItemsEditor
        {...defaultProps}
        items={[{ id: '1', name: 'Anneau de Pierre', weightless: true }, ...fillers]}
      />
    )
    expect(screen.getByText('sheet.weightlessItem')).toBeInTheDocument()
  })

  it('does not show the weightless label on a regular item', () => {
    // Fill 12 slots so the add form is hidden — no label should appear
    const fillers: SpecialItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      name: `Item ${i + 1}`,
    }))
    render(<SpecialItemsEditor {...defaultProps} items={fillers} />)
    expect(screen.queryByText('sheet.weightlessItem')).not.toBeInTheDocument()
  })

  it('add form contains a weightless checkbox', () => {
    render(<SpecialItemsEditor {...defaultProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    // equip checkbox does not appear (no items), so only the weightless checkbox is present
    expect(checkboxes.length).toBeGreaterThanOrEqual(1)
    const weightlessLabel = screen.getByText('sheet.weightlessItem')
    expect(weightlessLabel).toBeInTheDocument()
  })

  it('calls onAdd with weightless: true when checkbox is checked before submit', () => {
    render(<SpecialItemsEditor {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('sheet.addSpecialItem')
    fireEvent.change(nameInput, { target: { value: 'Talisman de Valour' } })

    const weightlessCheckbox = screen.getByRole('checkbox', { name: 'sheet.weightlessItem' })
    fireEvent.click(weightlessCheckbox)

    const addButton = screen.getByRole('button', { name: 'sheet.addSpecialItem' })
    fireEvent.click(addButton)

    expect(defaultProps.onAdd).toHaveBeenCalledOnce()
    expect(defaultProps.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Talisman de Valour', weightless: true })
    )
  })

  it('calls onAdd without weightless when checkbox is left unchecked', () => {
    render(<SpecialItemsEditor {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('sheet.addSpecialItem')
    fireEvent.change(nameInput, { target: { value: 'Bouclier Kaï' } })

    const addButton = screen.getByRole('button', { name: 'sheet.addSpecialItem' })
    fireEvent.click(addButton)

    expect(defaultProps.onAdd).toHaveBeenCalledOnce()
    const call = defaultProps.onAdd.mock.calls[0][0] as SpecialItem
    expect(call.weightless).toBeUndefined()
  })

  it('edit form pre-populates weightless state from existing item', () => {
    render(
      <SpecialItemsEditor
        {...defaultProps}
        items={[{ id: '1', name: 'Anneau de Pierre', weightless: true }]}
      />
    )

    const editButton = screen.getByRole('button', { name: 'sheet.editItem' })
    fireEvent.click(editButton)

    const checkboxes = screen.getAllByRole('checkbox')
    const weightlessCheckbox = checkboxes.find((cb) =>
      cb.closest('label')?.textContent?.includes('sheet.weightlessItem')
    ) as HTMLInputElement
    expect(weightlessCheckbox.checked).toBe(true)
  })

  it('edit form calls onUpdate with weightless: true', () => {
    render(<SpecialItemsEditor {...defaultProps} items={[{ id: '1', name: 'Anneau de Pierre' }]} />)

    const editButton = screen.getByRole('button', { name: 'sheet.editItem' })
    fireEvent.click(editButton)

    const checkboxes = screen.getAllByRole('checkbox')
    const weightlessCheckbox = checkboxes.find((cb) =>
      cb.closest('label')?.textContent?.includes('sheet.weightlessItem')
    ) as HTMLInputElement
    fireEvent.click(weightlessCheckbox)

    const confirmButton = screen.getByRole('button', { name: 'common.confirm' })
    fireEvent.click(confirmButton)

    expect(defaultProps.onUpdate).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ weightless: true })
    )
  })
})
