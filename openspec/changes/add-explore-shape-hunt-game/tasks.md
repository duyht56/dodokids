## 1. Contract codes (all three packages)

- [x] 1.1 Add `shape_hunt` to `EXPLORE_GAME_CODES` in `docs/kido-explore-contract.ts`
- [x] 1.2 Add `shape_hunt` to `EXPLORE_GAME_CODES` in `mobile/src/types/explore.ts`
- [x] 1.3 Add `shape_hunt` to `EXPLORE_GAME_CODES` in
      `kido-server/src/modules/explore/explore.types.ts`

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/shapeHuntGame.ts`: exercise type, generator/
      validator/config versions, `SHAPE_HUNT_LEVELS` (field size + distractor
      variety scaling L1→L5), `SHAPE_HUNT_VARIETY`, `SHAPE_HUNT_GAME`
- [x] 2.2 Deterministic seeded generator reusing the `tap_count` placement engine
      (`createCountLayout` / `placementsFitViewport` / `countObjectSize`) and the
      `odd_one_out` token vocabulary (palette, shapes, memory object pool)
- [x] 2.3 INDEPENDENT validator: re-derives the matching set
      (`shapeHuntMatchingCells`) and proves it equals the recorded answer, plus a
      byte-identical replay-by-seed check
- [x] 2.4 `shapeHuntVariantKey` (position-agnostic multiset) and
      `shapeHuntBucketKey` (the target attribute), and the pure
      `shapeHuntSupportCells` helper (dims only distractors, never a target)

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/ShapeHuntRenderer.tsx`: tap toggles a
      selection check, a "Xong" submit, correct only when the selected set equals
      the target set, reduced-motion-aware native-driver bounce, Đô Đô cheer on
      success, a gentle retry (never a run-ending `onAnswer(false)`) on a wrong
      submit, `supportLevel` distractor dimming, emoji only as puzzle content
- [x] 3.2 Map `SHAPE_HUNT_EXERCISE_TYPE` to the renderer in `rendererRegistry.tsx`

## 4. Registration (mobile)

- [x] 4.1 `registry.ts`: `LOCAL_GAMES` / `BUNDLED_OVERRIDES` / `GAME_COPY`,
      progressive classification (`isProgressiveExploreRunGame`), 5-board run size
- [x] 4.2 `variety.ts`: `SHAPE_HUNT_VARIETY` config plus the `variantKey`/
      `bucketKey` switch cases
- [x] 4.3 `thumbnails.ts`: `EXPLORE_FALLBACK_ICONS` vector icon (no PNG yet)
- [x] 4.4 Place `shape_hunt` in the "Quy luật và phân loại" group in
      `ExploreCatalogScreen.tsx`
- [x] 4.5 Best-effort audio: `shape_hunt_find_all` + `game_shape_hunt` in
      `promptAudio.ts` (mirrored in `kido-pipeline/src/explore/exploreAudioInventory.ts`)
      and a `shapeHuntKeys` builder

## 5. kido-server

- [x] 5.1 Add `shape_hunt` to `PUBLIC_GAMES` and the local bundled `ROUND_2_GAMES`
      map in `explore.registry.ts`
- [x] 5.2 Update the public-catalog count assertion (12 → 13) in
      `explore.service.spec.ts`

## 6. Conformance + spec

- [x] 6.1 `mobile/scripts/verify-explore-shape-hunt-contracts.cjs` and a
      `test:explore-shape-hunt` npm script; add `shape_hunt` to the
      `verify-explore-variety-buckets.cjs` generator map
- [x] 6.2 `kido-server/src/modules/explore/explore.shape-hunt.spec.ts`
- [x] 6.3 This capability spec change (`openspec/changes/add-explore-shape-hunt-game/`)

## 7. Verification

- [x] 7.1 `cd mobile && npx tsc --noEmit`
- [x] 7.2 eslint on every changed mobile file (clean)
- [x] 7.3 `npm run test:explore-shape-hunt` and `npm run test:explore-variety-buckets`
- [x] 7.4 `cd kido-server && npx jest src/modules/explore` (full suite, no regressions)
- [x] 7.5 `openspec validate add-explore-shape-hunt-game --strict`

## 8. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 8.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      `shape_hunt_find_all` and `game_shape_hunt` clips at `pending_review`
- [ ] 8.2 `npm run explore-audio:review` and LISTEN to both
- [ ] 8.3 `npm run explore-audio:approve` (Human Gate; never automatic)
- [ ] 8.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack
