# Lone Wolf — Interactive Adventure Sheet

A web-based adventure sheet for **Lone Wolf** gamebooks by Joe Dever, republished by [Holmgaard Press](https://shop-magnamund.com/). Designed to chain all 32 books from a single instance, with persistent saves, assisted cycle transitions, and a built-in combat calculator.

> Unlike existing sheets (one per book), this app manages complete character progression across all 4 cycles and 32 books in the series.

---

## Features

### Character management
- **4 cycles** covered: Kai (1–5), Magnakai (6–12), Grand Master (13–20), New Order (21–32)
- Guided character creation wizard (4 steps) for each cycle
- Automatic rank calculation based on mastered disciplines
- Endurance Points tracking with interactive bar and ±1 buttons

### Adventure sheet
- **Characteristics**: Combat Skill (base + bonus + total) and Endurance Points
- **Disciplines**: filtered list by cycle, displayed effects, Magnakai lore circles, lorestones
- **Equipment**: weapons (max 2), backpack (8 or 10 slots), special items (max 12)
- **Gold & Rations**: counter with quick ±1/±5/±10 controls
- **Notes**: free text area for section numbers and annotations

### Saves
- Unlimited saves stored in **localStorage**
- JSON export / import (external backup, sharing)
- Auto-save 1.5s after each modification
- Sorted by last session date

### Combat calculator
- Official Lone Wolf combat results table (ratios −11 to +11, die 0–9)
- Built-in random number generator
- One-click damage application (player and enemy)
- **Fight to the Death** mode: automatic simulation until combat ends

### Cycle transitions
- **Kai → Magnakai**: Kai disciplines carried over, new disciplines selected
- **Magnakai → Grand Master**: optional stat recalculation, permanent lore circle bonuses, checklist of 10 items allowed for transfer
- **Grand Master → New Order**: new character creation, Kai Name generator

### Interface
- Dark theme, accent color per cycle
- **Bilingual FR / EN** — toggle on the fly
- Responsive (desktop and tablet)

---

## Cycles and books

| Cycle | Books | Character | Disciplines |
|---|---|---|---|
| Kai | 1–5 | Lone Wolf | 10 Kai disciplines |
| Magnakai | 6–12 | Lone Wolf | 10 Magnakai disciplines + lore circles |
| Grand Master | 13–20 | Lone Wolf | 12 Grand Master Disciplines |
| New Order | 21–32 | New Kai Grand Master | 16 Grand Master Disciplines |

---

## Tech stack

| Tool | Role |
|---|---|
| [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) | UI framework + strict typing |
| [Vite 8](https://vite.dev) | Build & dev server |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility styles |
| [Zustand](https://zustand-demo.pmnd.rs) | Global state |
| [React Router v7](https://reactrouter.com) | Navigation |
| [react-i18next](https://react.i18next.com) | FR/EN internationalisation |
| [Vitest](https://vitest.dev) | Unit tests |

---

## Getting started

### Prerequisites

- Node.js ≥ 18 (tested on Node 22)
- npm ≥ 10

> **WSL2 users**: work from the Linux filesystem (`~/...`), not from `/mnt/c/`. The Windows filesystem does not support the Unix permissions required by npm.

### Installation

```bash
git clone git@github.com:ChinaskiJr/lone-wolf-action-chart.git
cd lone-wolf-action-chart
npm install
```

### Development

```bash
npm run dev
# → http://localhost:5173
```

### Production build

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test          # run once
npm run test:watch  # watch mode
```

---

## Project structure

```
src/
├── components/
│   ├── layout/       # AppShell, Header, LanguageSwitcher
│   ├── home/         # Home screen, save cards
│   ├── creation/     # Creation wizard (4 steps)
│   ├── sheet/        # Adventure sheet and its panels
│   └── transition/   # Cycle transition wizard
├── data/             # Static game data (books, disciplines, ranks, combat table)
├── store/            # Zustand stores (character, saves, ui)
├── types/            # TypeScript types (Character union type per cycle)
├── utils/            # Business logic (combat, ranks, character creation)
├── hooks/            # useAutoSave
└── locales/          # Translations fr.json / en.json
```

The central data model is a **discriminated union type** by cycle:

```typescript
type Character = KaiCharacter | MagnakaiCharacter | GrandMasterCharacter | NewOrderCharacter
```

Each cycle has its own fields (disciplines, lorestones, kaiName, etc.) while sharing a common base (stats, equipment, gold, notes).

---

## Game data

Data is sourced from **[Holmgaard Press](https://shop-magnamund.com/)** editions and the [Project Aon](https://www.projectaon.org) project for English reference rules:

- Official book titles from Holmgaard Press editions
- Official discipline names (Kai, Magnakai, Grand Master Disciplines)
- Official ranks for all 4 cycles with correct discipline thresholds
- Official combat results table (ratios −11 to +11)
- Cycle transition rules (Magnakai→GM carry-over: 10 items allowed)

---

## Roadmap

### Done
- [x] Unit tests (combat table, rank calculation, transitions — 112 tests)
- [x] Backpack: optional description and 2-slot items
- [x] Magnakai → Grand Master carry-over: faithful item transfer with bonuses
- [x] Current book map display on the adventure sheet (books 1–30)
- [x] D10 roll: permanent strip on the sheet, morph animation
- [x] Combat: ×2 / ÷2 manual damage modifier toggles
- [x] Combat: fight-to-the-death auto-roll (rounds play out automatically until one side falls)
- [x] Lorestone tracking: Gem icons auto-derived from book progression (Magnakai)
- [x] Weapon Mastery: selection at creation + chips display on sheet (Magnakai up to 3, GM/NO grows per book)

### Upcoming
- [ ] PWA / offline mode
- [ ] Import from existing Project Aon sheets

---

## License

Personal use. *Lone Wolf* books and their contents are the property of Joe Dever / [Holmgaard Press](https://shop-magnamund.com/).
