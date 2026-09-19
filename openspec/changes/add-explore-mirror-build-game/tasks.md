## 1. Contract codes (all three packages)

- [x] 1.1 Add `mirror_build` to `EXPLORE_GAME_CODES` in `docs/kido-explore-contract.ts`
- [x] 1.2 Add `mirror_build` to `EXPLORE_GAME_CODES` in `mobile/src/types/explore.ts`
- [x] 1.3 Add `mirror_build` to `EXPLORE_GAME_CODES` in
      `kido-server/src/modules/explore/explore.types.ts`

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/mirrorBuildGame.ts`: exercise type, generator/
      validator/config versions, `MIRROR_BUILD_LEVELS` (grid 3×(2·2) → 4×(2·4) and
      the ON-density bounds), the reused `ODD_ONE_OUT_COLORS` / `ODD_ONE_OUT_SHAPES`
      vocabulary, `MIRROR_BUILD_VARIETY`, `MIRROR_BUILD_GAME`
- [x] 2.2 Deterministic seeded generator: one shape + one colour per puzzle, a
      seeded left pattern (density scales with the level), the solution derived as
      the exact left-right reflection, all seeds namespaced by level
- [x] 2.3 INDEPENDENT validator: re-derives the expected reflection from the
      visible left pattern and proves the recorded solution equals it, the puzzle
      is non-trivial (≥1 ON, not all-full), a single vocabulary colour/shape is
      used and the answer is exactly the solution's ON right cells, plus a
      byte-identical replay-by-seed check
- [x] 2.4 `mirrorBuildVariantKey` (level + shape + colour + left pattern),
      `mirrorBuildBucketKey` (`mirror`) and the pure `mirrorBuildSupportCells`
      helper (anchor the next expected-ON cell, dim only expected-OFF cells)

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/MirrorBuildRenderer.tsx`: a grid with a
      centre mirror line, a pre-filled left half and a tappable right half; toggle
      a right cell ON/OFF, "Xong" submit, cheer + pulse on correct, a gentle
      no-mark retry on wrong, `supportLevel` anchors/dims, reduced-motion-aware
      native-driver motion, emoji-free UI (View-drawn shapes)
- [x] 3.2 Map `MIRROR_BUILD_EXERCISE_TYPE` to the renderer in `rendererRegistry.tsx`

## 4. Registration (mobile)

- [x] 4.1 `registry.ts`: `LOCAL_GAMES` / `BUNDLED_OVERRIDES` / `GAME_COPY`,
      progressive classification (`isProgressiveExploreRunGame`), 5-board run size
- [x] 4.2 `variety.ts`: `MIRROR_BUILD_VARIETY` config plus the `variantKey`/
      `bucketKey` switch cases
- [x] 4.3 `thumbnails.ts`: `EXPLORE_FALLBACK_ICONS` vector icon (`rotate-ccw`, no PNG yet)
- [x] 4.4 Place `mirror_build` in the "Sắp xếp và dẫn đường" group in
      `ExploreCatalogScreen.tsx`
- [x] 4.5 Best-effort audio: `mirror_build_reflect` + `game_mirror_build` in
      `promptAudio.ts` (mirrored in
      `kido-pipeline/src/explore/exploreAudioInventory.ts`) and a `mirrorBuildKeys`
      builder

## 5. kido-server

- [x] 5.1 Add `mirror_build` to `PUBLIC_GAMES` and the local bundled `ROUND_2_GAMES`
      map in `explore.registry.ts`
- [x] 5.2 Update the public-catalog count assertion (18 → 19) in
      `explore.service.spec.ts`

## 6. Conformance + spec

- [x] 6.1 `mobile/scripts/verify-explore-mirror-build-contracts.cjs` and a
      `test:explore-mirror-build` npm script; add `mirror_build` to the
      `verify-explore-variety-buckets.cjs` generator map
- [x] 6.2 `kido-server/src/modules/explore/explore.mirror-build.spec.ts`
- [x] 6.3 This capability spec change (`openspec/changes/add-explore-mirror-build-game/`)

## 7. Verification

- [x] 7.1 `cd mobile && npx tsc --noEmit`
- [x] 7.2 eslint on every changed mobile file (clean)
- [x] 7.3 `npm run test:explore-mirror-build` and `npm run test:explore-variety-buckets`
- [x] 7.4 `cd kido-server && npx jest src/modules/explore` (full suite, no regressions)
- [x] 7.5 `openspec validate add-explore-mirror-build-game --strict`

## 8. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 8.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      `mirror_build_reflect` and `game_mirror_build` clips at `pending_review`
- [ ] 8.2 `npm run explore-audio:review` and LISTEN to both
- [ ] 8.3 `npm run explore-audio:approve` (Human Gate; never automatic)
- [ ] 8.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack
