# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.
- Update the README.md if needed before each commit.

## Commands

```bash
# Dev server (must run from Linux filesystem, not /mnt/c)
cd /home/chinaski/lonewolf && npm run dev

# Type-check + production build
npm run build

# Lint
npm run lint

# Tests (single run)
npm test

# Tests (watch mode)
npm run test:watch
```

Path alias `@/` resolves to `src/`.

## Architecture

**React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Zustand + react-i18next (FR/EN)**

### Routing (`src/App.tsx`)

Four routes:
- `/` — HomePage (save list)
- `/new` — CharacterWizard (4-step creation)
- `/sheet/:id` — AdventureSheet (main play view)
- `/transition/:id` — CycleTransitionWizard (cycle progression)

### State management (`src/store/`)

Three Zustand stores:
- `characterStore` — active character in memory; mutations call `updateChar()` which stamps `updatedAt` on every write
- `savesStore` — all saves in `localStorage` via `zustand/middleware/persist` (key: `lonewolf_saves`)
- `uiStore` — transient UI state (toasts, modals, etc.)

Auto-save: `useAutoSave` hook debounces 1500 ms after any `character` change, then calls `characterStore.save()` which upserts into `savesStore`.

### Data model (`src/types/`)

`Character` is a discriminated union on `cycle: 'kai' | 'magnakai' | 'grandmaster' | 'neworder'`. Each variant extends `BaseCharacter` with cycle-specific fields (disciplines, ranks, lore circles, lorestones). Always narrow on `character.cycle` before accessing cycle-specific fields.

Static game data lives in `src/data/` (books, disciplines, ranks, combat table, lore circles, carry-over items).

### Components (`src/components/`)

| Directory | Purpose |
|-----------|---------|
| `home/` | Save list, import/export |
| `creation/` | 4-step wizard (cycle/book, stats, disciplines, equipment) |
| `sheet/` | Adventure sheet panels + combat calculator + modals |
| `layout/` | AppShell, Header, LanguageSwitcher, Toast, WolfIcon |
| `transition/` | Cycle transition wizard |

### Localisation

`src/i18n.ts` + `src/locales/{fr,en}.json`. FR is the primary locale. Add keys to both files when adding UI text.

## Product context

Dark-themed immersive tool for Lone Wolf gamebook players (Joe Dever, 32 books across 4 cycles). Brand: epic, immersive, faithful to the rules. Anti-references: generic SaaS UI, aggressive gamification, D&D Beyond overload. WCAG AA contrast required on all functional text. Full spec in `PRODUCT.md`.

## Testing

Vitest + jsdom + Testing Library. Setup in `src/test/setup.ts` (imports `@testing-library/jest-dom`). Run a single test file: `npm test -- src/path/to/file.test.ts`.
