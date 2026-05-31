import { describe, it, expect } from 'vitest'
import { computeKaiRank, computeMagnakaiRank, computeGrandMasterRank, computeNewOrderRank } from './ranks'

describe('computeKaiRank', () => {
  it('0 disciplines → novice', () => expect(computeKaiRank(0)).toBe('novice'))
  it('1 discipline → intuite', () => expect(computeKaiRank(1)).toBe('intuite'))
  it('5 disciplines → aspirant', () => expect(computeKaiRank(5)).toBe('aspirant'))
  it('8 disciplines → savant', () => expect(computeKaiRank(8)).toBe('savant'))
  it('9 disciplines → master', () => expect(computeKaiRank(9)).toBe('master'))
  it('10 disciplines → master (past max)', () => expect(computeKaiRank(10)).toBe('master'))
})

describe('computeMagnakaiRank', () => {
  it('0 disciplines → kaiMaster', () => expect(computeMagnakaiRank(0)).toBe('kaiMaster'))
  it('3 disciplines → primate', () => expect(computeMagnakaiRank(3)).toBe('primate'))
  it('5 disciplines → principalin', () => expect(computeMagnakaiRank(5)).toBe('principalin'))
  // minDisciplines jumps from 8 to 10 — 9 stays at archmaster
  it('8 disciplines → archmaster', () => expect(computeMagnakaiRank(8)).toBe('archmaster'))
  it('9 disciplines → archmaster (gap before grandMasterKai)', () => expect(computeMagnakaiRank(9)).toBe('archmaster'))
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
