import { describe, it, expect } from 'vitest'
import { computeKaiRank, computeMagnakaiRank, computeGrandMasterRank, computeNewOrderRank } from './ranks'

// Official Kai numbering: rank position = discipline count (1-10).
describe('computeKaiRank', () => {
  it('0 disciplines → novice (fallback)', () => expect(computeKaiRank(0)).toBe('novice'))
  it('1 discipline → novice', () => expect(computeKaiRank(1)).toBe('novice'))
  it('2 disciplines → intuite', () => expect(computeKaiRank(2)).toBe('intuite'))
  it('5 disciplines → initiate', () => expect(computeKaiRank(5)).toBe('initiate'))
  it('9 disciplines → savant', () => expect(computeKaiRank(9)).toBe('savant'))
  it('10 disciplines → master', () => expect(computeKaiRank(10)).toBe('master'))
})

// Official Magnakai numbering: rank position = discipline count (1-10).
describe('computeMagnakaiRank', () => {
  it('0 disciplines → kaiMaster (fallback)', () => expect(computeMagnakaiRank(0)).toBe('kaiMaster'))
  it('3 disciplines → kaiMasterSuperior', () => expect(computeMagnakaiRank(3)).toBe('kaiMasterSuperior'))
  it('5 disciplines → tutelary', () => expect(computeMagnakaiRank(5)).toBe('tutelary'))
  it('8 disciplines → scionMaster', () => expect(computeMagnakaiRank(8)).toBe('scionMaster'))
  it('9 disciplines → archmaster', () => expect(computeMagnakaiRank(9)).toBe('archmaster'))
  it('10 disciplines → grandMasterKai', () => expect(computeMagnakaiRank(10)).toBe('grandMasterKai'))
})

describe('computeGrandMasterRank', () => {
  it('0 disciplines → kaiGrandMasterSenior', () => expect(computeGrandMasterRank(0)).toBe('kaiGrandMasterSenior'))
  it('2 disciplines → kaiGrandSentinel', () => expect(computeGrandMasterRank(2)).toBe('kaiGrandSentinel'))
  // minDisciplines jumps from 2 to 4 — 3 stays at kaiGrandSentinel
  it('3 disciplines → kaiGrandSentinel (gap before kaiGrandDefender)', () => expect(computeGrandMasterRank(3)).toBe('kaiGrandSentinel'))
  it('4 disciplines → kaiGrandDefender', () => expect(computeGrandMasterRank(4)).toBe('kaiGrandDefender'))
  it('9 disciplines → grandThane', () => expect(computeGrandMasterRank(9)).toBe('grandThane'))
  it('12 disciplines → kaiSupremeMaster', () => expect(computeGrandMasterRank(12)).toBe('kaiSupremeMaster'))
})

describe('computeNewOrderRank', () => {
  // New Order starts at minDisciplines=4; below 4 → default
  it('0 disciplines → kaiGrandMasterSenior (default)', () => expect(computeNewOrderRank(0)).toBe('kaiGrandMasterSenior'))
  it('3 disciplines → kaiGrandMasterSenior (below threshold)', () => expect(computeNewOrderRank(3)).toBe('kaiGrandMasterSenior'))
  it('4 disciplines → kaiGrandMasterSenior', () => expect(computeNewOrderRank(4)).toBe('kaiGrandMasterSenior'))
  it('7 disciplines → kaiGrandDefender', () => expect(computeNewOrderRank(7)).toBe('kaiGrandDefender'))
  it('15 disciplines → kaiSupremeMaster', () => expect(computeNewOrderRank(15)).toBe('kaiSupremeMaster'))
  it('16 disciplines → kaiSupremeMaster (past max)', () => expect(computeNewOrderRank(16)).toBe('kaiSupremeMaster'))
})
