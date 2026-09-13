# Smara

*Remember it. Get it later.*

A mobile-first personal shopping *memory* app. It is not a to-do list — it exists
to solve one problem: **you remember something you need, but forget it again by
the time you're actually shopping.** Capture it in two seconds, forget about it,
and let the app surface it when you're in the right buying context.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run lint     # oxlint
```

No backend, no accounts — everything is stored in `localStorage` on the device
(see `src/lib/storage.ts`). First run seeds realistic sample data
(`src/lib/sampleData.ts`) so the UI is never empty; delete the `buylater:v1` key
in devtools to reset.

## Core ideas

- **One item, many buying contexts.** An item like Shampoo can be tagged
  `quick_commerce` *and* `online`. It's a single record (`src/types.ts`); it just
  renders in both sections. Buying it from either place marks the same record
  bought — nothing is duplicated.
- **Capture is never blocked.** Adding an item only ever requires a name.
  Category and buying location are inferred (`src/lib/inference.ts`) from a small
  keyword table; if nothing matches, the item is simply left unsorted rather than
  refused.
- **Corrections are remembered.** Whenever you set/change an item's category or
  location, `learnFromCorrection` remembers the exact name and nudges per-word
  scores, so similar future items get better suggestions. It's a small local
  heuristic layer — `inferItem()` is the single seam where this could later be
  swapped for a real model/API without touching the rest of the app.
- **"I'm Here"** (`src/components/ImHere.tsx`) shows only what's buyable at your
  current context, full-screen, with the same swipe-to-buy interaction.
- **Swipe to buy** (`src/hooks/useSwipeToBuy.ts`) is the primary completion
  gesture everywhere items appear; a leading checkbox is the accessible/secondary
  fallback that does the same thing.

## Structure

```
src/
  types.ts              Item / Aspiration / Corrections shapes
  lib/                  inference, learning, storage, sample data, formatting
  store/AppStore.tsx     React context + reducer, persisted on every change
  hooks/useSwipeToBuy.ts pointer-based swipe gesture
  components/            reusable UI (sheets, rows, nav, cards, toast)
  pages/                 Buy, Someday, Aspirations, History
```

State management is deliberately a single `useReducer` + context — no external
state library, no routing library (four tabs are plain conditional rendering).
The data model has a clear seam (`AppState` in `types.ts`) if this ever needs to
grow into cloud sync later.
