import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CombatCalculator } from './CombatCalculator'
import { useCharacterStore } from '@/store/characterStore'
import { makeKaiChar } from '@/test/fixtures'

beforeEach(() => {
  useCharacterStore.setState({ character: null })
})

describe('CombatCalculator — player EP bar', () => {
  it('displays maxEP including equipped special item peBonus', () => {
    useCharacterStore.setState({
      character: makeKaiChar({
        endurance: { current: 20, max: 20 },
        specialItems: [{ id: 'ring', name: 'Anneau de Force', peBonus: 5 }],
      }),
    })
    render(<CombatCalculator onClose={() => {}} />)
    // Base max is 20; item adds 5 → displayed max must be 25, not 20
    expect(screen.getByText('/ 25')).toBeInTheDocument()
  })

  it('displays base maxEP when no special items are present', () => {
    useCharacterStore.setState({
      character: makeKaiChar({ endurance: { current: 22, max: 22 } }),
    })
    render(<CombatCalculator onClose={() => {}} />)
    expect(screen.getByText('/ 22')).toBeInTheDocument()
  })

  it('excludes peBonus of unequipped special items from maxEP', () => {
    useCharacterStore.setState({
      character: makeKaiChar({
        endurance: { current: 20, max: 20 },
        specialItems: [{ id: 'ring', name: 'Anneau de Force', peBonus: 5, equipped: false }],
      }),
    })
    render(<CombatCalculator onClose={() => {}} />)
    expect(screen.getByText('/ 20')).toBeInTheDocument()
  })
})
