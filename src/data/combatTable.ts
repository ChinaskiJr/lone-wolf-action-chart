// Official Lone Wolf Combat Results Table (all books)
// Format per cell: [enemyLoss, playerLoss] — K = -1 means instant kill
// Columns (13 ratio buckets): ≤-11, -10/-9, -8/-7, -6/-5, -4/-3, -2/-1, 0, +1/+2, +3/+4, +5/+6, +7/+8, +9/+10, ≥+11
// Rows: indexed by random number 0-9

export const K = -1

export const COMBAT_TABLE: [number, number][][] = [
  // RN 0
  [
    [6, 0],
    [7, 0],
    [8, 0],
    [9, 0],
    [10, 0],
    [11, 0],
    [12, 0],
    [14, 0],
    [16, 0],
    [18, 0],
    [K, 0],
    [K, 0],
    [K, 0],
  ],
  // RN 1
  [
    [0, K],
    [0, K],
    [0, 8],
    [0, 6],
    [1, 6],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 4],
    [6, 4],
    [7, 4],
    [8, 3],
    [9, 3],
  ],
  // RN 2
  [
    [0, K],
    [0, 8],
    [0, 7],
    [1, 6],
    [2, 5],
    [3, 5],
    [4, 4],
    [5, 4],
    [6, 4],
    [7, 4],
    [8, 3],
    [9, 3],
    [10, 2],
  ],
  // RN 3
  [
    [0, 8],
    [0, 7],
    [1, 6],
    [2, 5],
    [3, 5],
    [4, 4],
    [5, 4],
    [6, 3],
    [7, 3],
    [8, 2],
    [9, 2],
    [10, 2],
    [11, 2],
  ],
  // RN 4
  [
    [0, 8],
    [1, 7],
    [2, 6],
    [3, 5],
    [4, 4],
    [5, 4],
    [6, 3],
    [7, 3],
    [8, 2],
    [9, 2],
    [10, 2],
    [11, 2],
    [12, 2],
  ],
  // RN 5
  [
    [1, 7],
    [2, 6],
    [3, 5],
    [4, 4],
    [5, 4],
    [6, 3],
    [7, 2],
    [8, 2],
    [9, 2],
    [10, 2],
    [11, 1],
    [12, 1],
    [14, 1],
  ],
  // RN 6
  [
    [2, 6],
    [3, 6],
    [4, 5],
    [5, 4],
    [6, 3],
    [7, 2],
    [8, 2],
    [9, 2],
    [10, 2],
    [11, 1],
    [12, 1],
    [14, 1],
    [16, 1],
  ],
  // RN 7
  [
    [3, 5],
    [4, 5],
    [5, 4],
    [6, 3],
    [7, 2],
    [8, 2],
    [9, 1],
    [10, 1],
    [11, 1],
    [12, 0],
    [14, 0],
    [16, 0],
    [18, 0],
  ],
  // RN 8
  [
    [4, 4],
    [5, 4],
    [6, 3],
    [7, 2],
    [8, 1],
    [9, 1],
    [10, 0],
    [11, 0],
    [12, 0],
    [14, 0],
    [16, 0],
    [18, 0],
    [K, 0],
  ],
  // RN 9
  [
    [5, 3],
    [6, 3],
    [7, 2],
    [8, 0],
    [9, 0],
    [10, 0],
    [11, 0],
    [12, 0],
    [14, 0],
    [16, 0],
    [18, 0],
    [K, 0],
    [K, 0],
  ],
]

function ratioBucket(ratio: number): number {
  if (ratio <= -11) return 0
  if (ratio <= -9) return 1
  if (ratio <= -7) return 2
  if (ratio <= -5) return 3
  if (ratio <= -3) return 4
  if (ratio <= -1) return 5
  if (ratio === 0) return 6
  if (ratio <= 2) return 7
  if (ratio <= 4) return 8
  if (ratio <= 6) return 9
  if (ratio <= 8) return 10
  if (ratio <= 10) return 11
  return 12
}

// Returns [enemyLoss, playerLoss]; K (-1) means instant kill
export function lookupCombatResult(
  playerCS: number,
  enemyCS: number,
  randomNumber: number
): [number, number] {
  const bucket = ratioBucket(playerCS - enemyCS)
  const rn = Math.max(0, Math.min(9, randomNumber))
  return COMBAT_TABLE[rn][bucket]
}
