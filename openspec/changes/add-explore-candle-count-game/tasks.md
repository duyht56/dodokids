## 1. Contract codes (all three packages)

- [x] 1.1 Add `candle_count` to `EXPLORE_GAME_CODES` in `docs/kido-explore-contract.ts`
- [x] 1.2 Add `candle_count` to `EXPLORE_GAME_CODES` in `mobile/src/types/explore.ts`
- [x] 1.3 Add `candle_count` to `EXPLORE_GAME_CODES` in
      `kido-server/src/modules/explore/explore.types.ts`

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/candleCountGame.ts`: exercise type, generator/
      validator/config versions, `CANDLE_LEVEL_SPECS` + `candleTargetRange`
      (reuses `COUNT_LEVELS` ranges, capped at N ≤ 10, scaling L1→L5),
      `CANDLE_COUNT_VARIETY`, `CANDLE_COUNT_GAME`
- [x] 2.2 Deterministic seeded generator: N drawn from the reused COUNT_LEVELS
      range; the fixed ten-frame slot layout `candleSlotLayout` (ten slots in a
      2×5 grid) for the candle positions
- [x] 2.3 INDEPENDENT validator: re-derives the fixed slots
      (`candleSlotsAreFixedLayout`), proves the answer's placed count equals N and
      N fits the range and the slot count, plus a byte-identical replay-by-seed check
- [x] 2.4 `candleCountVariantKey` (the target N) and `candleCountBucketKey`
      (`count_out`)

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/CandleCountRenderer.tsx`: tap a slot to add
      a candle, tap again to remove (no overfill), a "Xong" submit, correct only
      when the placed count equals N, the running total read aloud with
      `numberKey`, a dots anchor at raised support, reduced-motion-aware
      native-driver pop, Đô Đô cheer on success, a gentle retry (never a
      run-ending reveal) on a wrong submit, emoji-free UI
- [x] 3.2 Map `CANDLE_COUNT_EXERCISE_TYPE` to the renderer in `rendererRegistry.tsx`

## 4. Registration (mobile)

- [x] 4.1 `registry.ts`: `LOCAL_GAMES` / `BUNDLED_OVERRIDES` / `GAME_COPY`,
      progressive classification (`isProgressiveExploreRunGame`), 5-board run size
- [x] 4.2 `variety.ts`: `CANDLE_COUNT_VARIETY` config plus the `variantKey`/
      `bucketKey` switch cases
- [x] 4.3 `thumbnails.ts`: `EXPLORE_FALLBACK_ICONS` vector icon (`flame`, no PNG yet)
- [x] 4.4 Place `candle_count` in the "Đếm và số" group in `ExploreCatalogScreen.tsx`
- [x] 4.5 Best-effort audio: `candle_count_prompt` / `candle_count_suffix` +
      `game_candle_count` in `promptAudio.ts` (mirrored in
      `kido-pipeline/src/explore/exploreAudioInventory.ts`) and a `candleCountKeys`
      builder

## 5. kido-server

- [x] 5.1 Add `candle_count` to `PUBLIC_GAMES` and the local bundled `ROUND_2_GAMES`
      map in `explore.registry.ts`
- [x] 5.2 Update the public-catalog count assertion (13 → 14) in
      `explore.service.spec.ts`

## 6. Conformance + spec

- [x] 6.1 `mobile/scripts/verify-explore-candle-count-contracts.cjs` and a
      `test:explore-candle-count` npm script; add `candle_count` to the
      `verify-explore-variety-buckets.cjs` generator map
- [x] 6.2 `kido-server/src/modules/explore/explore.candle-count.spec.ts`
- [x] 6.3 This capability spec change (`openspec/changes/add-explore-candle-count-game/`)

## 7. Verification

- [x] 7.1 `cd mobile && npx tsc --noEmit`
- [x] 7.2 eslint on every changed mobile file (clean)
- [x] 7.3 `npm run test:explore-candle-count` and `npm run test:explore-variety-buckets`
- [x] 7.4 `cd kido-server && npx jest src/modules/explore` (full suite, no regressions)
- [x] 7.5 `openspec validate add-explore-candle-count-game --strict`

## 8. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 8.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      `candle_count_prompt`, `candle_count_suffix` and `game_candle_count` clips at
      `pending_review`
- [ ] 8.2 `npm run explore-audio:review` and LISTEN to all three
- [ ] 8.3 `npm run explore-audio:approve` (Human Gate; never automatic)
- [ ] 8.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack
