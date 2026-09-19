## 1. Contract codes (all three packages)

- [x] 1.1 Add `missing_cell` to `EXPLORE_GAME_CODES` in `docs/kido-explore-contract.ts`
- [x] 1.2 Add `missing_cell` to `EXPLORE_GAME_CODES` in `mobile/src/types/explore.ts`
- [x] 1.3 Add `missing_cell` to `EXPLORE_GAME_CODES` in
      `kido-server/src/modules/explore/explore.types.ts`

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/missingCellGame.ts`: exercise type, generator/
      validator/config versions, `MISSING_CELL_LEVELS` (grid size 2×2 → 3×3, the
      allowed token kinds), the colour-blind-safe palette / shapes / dot range,
      `MISSING_CELL_VARIETY`, `MISSING_CELL_GAME`
- [x] 2.2 Deterministic seeded generator: materialise the full Raven matrix (one
      attribute per axis), hide ONE cell, derive the answer, build options only
      from the grid's own row/column vocabulary (a row-sharing and a
      column-sharing distractor), all seeds namespaced by level
- [x] 2.3 INDEPENDENT validator: re-derives the per-row and per-column values from
      the visible grid, proves the matrix is well formed and that EXACTLY ONE
      option satisfies both the blank's row and column rules, options are
      vocabulary-only with the answer among them, plus a byte-identical
      replay-by-seed check
- [x] 2.4 `missingCellVariantKey` (the full grid identity), `missingCellBucketKey`
      (the token kind) and the pure `missingCellSupportOptions` dimming helper

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/MissingCellRenderer.tsx`: a 2×2 / 3×3 grid
      with one blank and a row of options; tap an option to answer, cheer + fill
      on correct, a gentle no-mark retry on wrong, `supportLevel` dims distractor
      options (never the answer), reduced-motion-aware native-driver motion,
      emoji-free UI (View shapes + coloured DotGroup)
- [x] 3.2 Map `MISSING_CELL_EXERCISE_TYPE` to the renderer in `rendererRegistry.tsx`
- [x] 3.3 Extend the shared `DotGroup` primitive with an optional backward-compatible
      `color` prop so a count axis can carry a colour axis

## 4. Registration (mobile)

- [x] 4.1 `registry.ts`: `LOCAL_GAMES` / `BUNDLED_OVERRIDES` / `GAME_COPY`,
      progressive classification (`isProgressiveExploreRunGame`), 5-board run size
- [x] 4.2 `variety.ts`: `MISSING_CELL_VARIETY` config plus the `variantKey`/
      `bucketKey` switch cases
- [x] 4.3 `thumbnails.ts`: `EXPLORE_FALLBACK_ICONS` vector icon (`lightbulb`, no PNG yet)
- [x] 4.4 Place `missing_cell` in the "Quy luật và phân loại" group in
      `ExploreCatalogScreen.tsx`
- [x] 4.5 Best-effort audio: `missing_cell_choose` + `game_missing_cell` in
      `promptAudio.ts` (mirrored in
      `kido-pipeline/src/explore/exploreAudioInventory.ts`) and a `missingCellKeys`
      builder

## 5. kido-server

- [x] 5.1 Add `missing_cell` to `PUBLIC_GAMES` and the local bundled `ROUND_2_GAMES`
      map in `explore.registry.ts`
- [x] 5.2 Update the public-catalog count assertion (15 → 16) in
      `explore.service.spec.ts`

## 6. Conformance + spec

- [x] 6.1 `mobile/scripts/verify-explore-missing-cell-contracts.cjs` and a
      `test:explore-missing-cell` npm script; add `missing_cell` to the
      `verify-explore-variety-buckets.cjs` generator map
- [x] 6.2 `kido-server/src/modules/explore/explore.missing-cell.spec.ts`
- [x] 6.3 This capability spec change (`openspec/changes/add-explore-missing-cell-game/`)

## 7. Verification

- [x] 7.1 `cd mobile && npx tsc --noEmit`
- [x] 7.2 eslint on every changed mobile file (clean)
- [x] 7.3 `npm run test:explore-missing-cell` and `npm run test:explore-variety-buckets`
- [x] 7.4 `cd kido-server && npx jest src/modules/explore` (full suite, no regressions)
- [x] 7.5 `openspec validate add-explore-missing-cell-game --strict`

## 8. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 8.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      `missing_cell_choose` and `game_missing_cell` clips at `pending_review`
- [ ] 8.2 `npm run explore-audio:review` and LISTEN to both
- [ ] 8.3 `npm run explore-audio:approve` (Human Gate; never automatic)
- [ ] 8.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack
