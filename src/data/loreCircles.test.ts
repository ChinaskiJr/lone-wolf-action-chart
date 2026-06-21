import { describe, it, expect } from 'vitest'
import { getCompletedCircles, computeLoreCircleBonuses } from './loreCircles'

// Fire: weaponmastery + huntmastery → CS+1, EP+2
// Light: animalControl + curing → CS+0, EP+3
// Solaris: invisibility + huntmastery + pathsmanship → CS+1, EP+3
// Spirit: psiSurge + psiScreen + nexus + divination → CS+3, EP+3

describe('getCompletedCircles', () => {
  it('returns no circles for empty disciplines', () => {
    expect(getCompletedCircles([])).toHaveLength(0)
  })

  it('returns no circles when a circle is only partially satisfied', () => {
    // Fire requires weaponmastery AND huntmastery
    expect(getCompletedCircles(['weaponmastery'])).toHaveLength(0)
  })

  it('returns Fire circle when both disciplines are present', () => {
    const circles = getCompletedCircles(['weaponmastery', 'huntmastery'])
    expect(circles).toHaveLength(1)
    expect(circles[0].id).toBe('fire')
  })

  it('returns Light circle when both disciplines are present', () => {
    const circles = getCompletedCircles(['animalControl', 'curing'])
    expect(circles[0].id).toBe('light')
  })

  it('returns Solaris circle when all three disciplines are present', () => {
    const circles = getCompletedCircles(['invisibility', 'huntmastery', 'pathsmanship'])
    expect(circles[0].id).toBe('solaris')
  })

  it('returns Spirit circle when all four disciplines are present', () => {
    const circles = getCompletedCircles(['psiSurge', 'psiScreen', 'nexus', 'divination'])
    expect(circles[0].id).toBe('spirit')
  })

  it('returns all four circles when all required disciplines are present', () => {
    const all = [
      'weaponmastery',
      'huntmastery', // Fire
      'animalControl',
      'curing', // Light
      'invisibility',
      'pathsmanship', // Solaris (huntmastery already included)
      'psiSurge',
      'psiScreen',
      'nexus',
      'divination', // Spirit
    ]
    expect(getCompletedCircles(all)).toHaveLength(4)
  })
})

describe('computeLoreCircleBonuses', () => {
  it('returns zero bonuses for empty disciplines', () => {
    expect(computeLoreCircleBonuses([])).toEqual({ bonusCS: 0, bonusEP: 0 })
  })

  it('returns Fire circle bonuses (CS+1, EP+2)', () => {
    expect(computeLoreCircleBonuses(['weaponmastery', 'huntmastery'])).toEqual({
      bonusCS: 1,
      bonusEP: 2,
    })
  })

  it('returns Light circle bonuses (CS+0, EP+3)', () => {
    expect(computeLoreCircleBonuses(['animalControl', 'curing'])).toEqual({
      bonusCS: 0,
      bonusEP: 3,
    })
  })

  it('accumulates bonuses from all four circles (CS+5, EP+11)', () => {
    const all = [
      'weaponmastery',
      'huntmastery',
      'animalControl',
      'curing',
      'invisibility',
      'pathsmanship',
      'psiSurge',
      'psiScreen',
      'nexus',
      'divination',
    ]
    expect(computeLoreCircleBonuses(all)).toEqual({ bonusCS: 5, bonusEP: 11 })
  })
})
