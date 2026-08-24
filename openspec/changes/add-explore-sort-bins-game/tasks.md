## 1. Contract codes (all three packages)

- [x] 1.1 Add `sort_bins` to `EXPLORE_GAME_CODES` in `docs/kido-explore-contract.ts`
- [x] 1.2 Add `sort_bins` to `EXPLORE_GAME_CODES` in `mobile/src/types/explore.ts`
- [x] 1.3 Add `sort_bins` to `EXPLORE_GAME_CODES` in
      `kido-server/src/modules/explore/explore.types.ts`

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/sortBinsGame.ts`: exercise type, generator/
      validator/config versions, `SORT_BINS_LEVELS` (item count 4→8, bin count 2→3,
      category subtlety scaling L1→L5), `SORT_BINS_VARIETY`, `SORT_BINS_GAME`
- [x] 2.2 Deterministic seeded generator reusing the `odd_one_out` dimensions and
      value helper (`oddOneOutValueOn`), the colour trio, the shapes with the
      square/diamond rule and the bundled memory object pool; a colour sort keeps
      ONE shape and a shape sort keeps ONE colour so no item is ambiguous
- [x] 2.3 INDEPENDENT validator: re-derives each item's true category, proves every
      category has >= 1 item, the bins are EXACTLY the present categories and the
      "sorted" solution assigns each item to its true category, plus a
      byte-identical replay-by-seed check
- [x] 2.4 `sortBinsVariantKey` (position-agnostic multiset) and `sortBinsBucketKey`
      (the sort dimension), and the pure `sortBinsSupportCue` helper (level 1 names
      the category, level 2 points at the correct bin)

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/SortBinsRenderer.tsx`: one item at a time,
      tap the bin it belongs to; a correct tap drops the item in and advances, the
      last one makes Đô Đô cheer and `onAnswer(true)`; a wrong tap shakes the item,
      Đô Đô thinks, `onTryAgainSound` and `onAnswer(false)` WITHOUT ending the run
      or revealing anything; reduced-motion-aware native-driver motion;
      `supportLevel` naming/highlight cue; emoji only as puzzle content
- [x] 3.2 Map `SORT_BINS_EXERCISE_TYPE` to the renderer in `rendererRegistry.tsx`

## 4. Registration (mobile)

- [x] 4.1 `registry.ts`: `LOCAL_GAMES` / `BUNDLED_OVERRIDES` / `GAME_COPY`,
      progressive classification (`isProgressiveExploreRunGame`), 5-board run size
- [x] 4.2 `variety.ts`: `SORT_BINS_VARIETY` config plus the `variantKey`/`bucketKey`
      switch cases
- [x] 4.3 `thumbnails.ts`: `EXPLORE_FALLBACK_ICONS` vector icon (`clipboard-list`,
      no PNG yet)
- [x] 4.4 Place `sort_bins` in the "Quy luật và phân loại" group in
      `ExploreCatalogScreen.tsx`
- [x] 4.5 Best-effort audio: `sort_bins_sort` + `game_sort_bins` in `promptAudio.ts`
      (mirrored in `kido-pipeline/src/explore/exploreAudioInventory.ts`) and a
      `sortBinsKeys` builder

## 5. kido-server

- [x] 5.1 Add `sort_bins` to `PUBLIC_GAMES` and the local bundled `ROUND_2_GAMES`
      map in `explore.registry.ts`
- [x] 5.2 Update the public-catalog count assertion (14 → 15) in
      `explore.service.spec.ts`

## 6. Conformance + spec

- [x] 6.1 `mobile/scripts/verify-explore-sort-bins-contracts.cjs` and a
      `test:explore-sort-bins` npm script; add `sort_bins` to the
      `verify-explore-variety-buckets.cjs` generator map
- [x] 6.2 `kido-server/src/modules/explore/explore.sort-bins.spec.ts`
- [x] 6.3 This capability spec change (`openspec/changes/add-explore-sort-bins-game/`)

## 7. Verification

- [x] 7.1 `cd mobile && npx tsc --noEmit`
- [x] 7.2 eslint on every changed mobile file (clean)
- [x] 7.3 `npm run test:explore-sort-bins` and `npm run test:explore-variety-buckets`
- [x] 7.4 `cd kido-server && npx jest src/modules/explore` (full suite, no regressions)
- [x] 7.5 `openspec validate add-explore-sort-bins-game --strict`

## 8. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 8.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      `sort_bins_sort` and `game_sort_bins` clips at `pending_review`
- [ ] 8.2 `npm run explore-audio:review` and LISTEN to both
- [ ] 8.3 `npm run explore-audio:approve` (Human Gate; never automatic)
- [ ] 8.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack
