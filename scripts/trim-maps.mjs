import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const inputDir = join(__dirname, '../src/assets/maps')
const outputDir = join(__dirname, '../src/assets/maps/trimmed')

if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

const BG_THRESHOLD  = 210  // luminance <= this = dark pixel
const DENSITY_RATIO = 0.50 // first candidate: row with ≥50% dark pixels
const WHITE_MAX     = 30   // a row is "white" if dark count < this (handles noisy scan gaps)
const CONTENT_MIN   = 20   // min dark pixels for bottom/side detection
const GAP_CONTENT   = 60   // min dark pixels when searching content after a gap

// After finding the first candidate row, check if a white gap appears within
// the next MAX_GAP rows. If so, the candidate was the map-title line; skip to
// the first content row after the gap (= actual map frame/content).
const MAX_GAP_SEARCH = 30

async function findMapBounds(inputPath) {
  const img = sharp(inputPath).flatten({ background: '#ffffff' })
  const { width, height } = await img.metadata()

  const { data } = await img.clone()
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const minDark   = Math.floor(width * DENSITY_RATIO)
  const scanStart = Math.floor(height * 0.15)

  function darkCount(y) {
    let n = 0
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] <= BG_THRESHOLD) n++
    }
    return n
  }

  // Find first candidate from top with density ≥ threshold
  function firstCandidate() {
    for (let y = scanStart; y < height; y++) {
      if (darkCount(y) >= minDark) return y
    }
    return scanStart
  }

  // Given a candidate row, check if the next MAX_GAP_SEARCH rows contain a
  // white gap. If they do, return the first content row after that gap
  // (= the true map start). If no gap, return the candidate itself.
  function skipTitleGap(candidate) {
    // Scan forward looking for a white row within MAX_GAP_SEARCH rows
    for (let dy = 1; dy <= MAX_GAP_SEARCH; dy++) {
      const y = candidate + dy
      if (y >= height) break
      if (darkCount(y) < WHITE_MAX) {
        // Found a white gap. Now find the first substantial content row after it.
        for (let y2 = y + 1; y2 < y + MAX_GAP_SEARCH; y2++) {
          if (y2 >= height) break
          if (darkCount(y2) >= GAP_CONTENT) return y2
        }
      }
    }
    return candidate  // no gap → candidate was already the map frame
  }

  const candidate = firstCandidate()
  let top = candidate
  let prev
  do {
    prev = top
    top = skipTitleGap(top)
  } while (top !== prev)

  // Bottom: last row with any content
  let bottom = height - 1
  for (let y = height - 1; y >= top; y--) {
    if (darkCount(y) >= CONTENT_MIN) { bottom = y; break }
  }

  // Left / right within top–bottom band
  let left = 0
  outer: for (let x = 0; x < width; x++) {
    for (let y = top; y <= bottom; y++) {
      if (data[y * width + x] <= BG_THRESHOLD) { left = x; break outer }
    }
  }
  let right = width - 1
  outer: for (let x = width - 1; x >= 0; x--) {
    for (let y = top; y <= bottom; y++) {
      if (data[y * width + x] <= BG_THRESHOLD) { right = x; break outer }
    }
  }

  const pad = 4
  return {
    top,
    left:   Math.max(0, left - pad),
    bottom: Math.min(height - 1, bottom + pad),
    right:  Math.min(width - 1, right + pad),
  }
}

for (let i = 1; i <= 30; i++) {
  const input  = join(inputDir, `${i}.png`)
  const output = join(outputDir, `${i}.png`)

  if (!existsSync(input)) { console.log(`Skipping ${i}.png`); continue }

  try {
    const { top, left, bottom, right } = await findMapBounds(input)
    const w = right - left + 1
    const h = bottom - top + 1

    await sharp(input)
      .flatten({ background: '#ffffff' })
      .extract({ top, left, width: w, height: h })
      .toFile(output)

    console.log(`Book ${i}: ${w}x${h}  (top=${top})`)
  } catch (err) {
    console.error(`Book ${i}: ERROR — ${err.message}`)
  }
}
