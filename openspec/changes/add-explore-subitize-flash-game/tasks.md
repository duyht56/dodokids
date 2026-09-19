## 1. Contract codes (all three packages)

- [x] 1.1 Add `subitize_flash` to `EXPLORE_GAME_CODES` in `docs/kido-explore-contract.ts`
- [x] 1.2 Add `subitize_flash` to `EXPLORE_GAME_CODES` in `mobile/src/types/explore.ts`
- [x] 1.3 Add `subitize_flash` to `EXPLORE_GAME_CODES` in
      `kido-server/src/modules/explore/explore.types.ts`

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/subitizeFlashGame.ts`: exercise type, generator/
      validator/config versions, `SUBITIZE_FLASH_LEVELS` (N range 1–6 + arrangement),
      `subitizeTargetRange` (reuses the `tap_count` COUNT_LEVELS ranges, capped at
      `SUBITIZE_MAX_N` = 6), `SUBITIZE_FLASH_VARIETY`, `SUBITIZE_FLASH_GAME`
- [x] 2.2 Deterministic seeded generator: draw N in the level range, the arrangement
      (paired ten-frame vs scattered), the display kind (dots vs a countable object),
      the group of exactly N items and the number options via `buildNearTargetOptions`,
      every seed namespaced by level
- [x] 2.3 INDEPENDENT validator: N is in range (1–6), the group is exactly N re-derived
      items, the arrangement is one the level allows, an objects board carries an
      approved countable glyph, the options are distinct in-range numbers including N
      with the answer recorded, plus a byte-identical replay-by-seed check
- [x] 2.4 `subitizeFlashVariantKey` (the full board identity), `subitizeFlashBucketKey`
      (the arrangement) and the pure `subitizeFlashSupportReveal` helper (auto_hide /
      re_peek / stay_open — never touches the options)

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/SubitizeFlashRenderer.tsx`: brief flash →
      Đô Đô auto-hide cover (native driver, ~1s, instant under reduced motion) → tap a
      number; the cover lifts + cheer on correct, a gentle no-mark retry on wrong,
      `supportLevel` re-peeks (1) or keeps the group open (2) via the pure helper,
      reuses `DotGroup` / `ObjectGroup` / `TenFrame`, emoji-free UI (objects drawn from
      the countable glyph data), NO countdown clock / timer numeral
- [x] 3.2 Map `SUBITIZE_FLASH_EXERCISE_TYPE` to the renderer in `rendererRegistry.tsx`

## 4. Registration (mobile)

- [x] 4.1 `registry.ts`: `LOCAL_GAMES` / `BUNDLED_OVERRIDES` / `GAME_COPY`,
      progressive classification (`isProgressiveExploreRunGame`), 5-board run size
- [x] 4.2 `variety.ts`: `SUBITIZE_FLASH_VARIETY` config plus the `variantKey`/
      `bucketKey` switch cases
- [x] 4.3 `thumbnails.ts`: `EXPLORE_FALLBACK_ICONS` vector icon (`star`, no PNG yet)
- [x] 4.4 Place `subitize_flash` in the "Đếm và số" group in `ExploreCatalogScreen.tsx`
- [x] 4.5 Best-effort audio: `subitize_flash_how_many` + `game_subitize_flash` in
      `promptAudio.ts` (mirrored in
      `kido-pipeline/src/explore/exploreAudioInventory.ts`) and a `subitizeFlashKeys`
      builder

## 5. kido-server

- [x] 5.1 Add `subitize_flash` to `PUBLIC_GAMES` and the local bundled `ROUND_2_GAMES`
      map in `explore.registry.ts`
- [x] 5.2 Update the public-catalog count assertion (17 → 18) in
      `explore.service.spec.ts`

## 6. Conformance + spec

- [x] 6.1 `mobile/scripts/verify-explore-subitize-flash-contracts.cjs` and a
      `test:explore-subitize-flash` npm script; add `subitize_flash` to the
      `verify-explore-variety-buckets.cjs` generator map
- [x] 6.2 `kido-server/src/modules/explore/explore.subitize-flash.spec.ts`
- [x] 6.3 This capability spec change (`openspec/changes/add-explore-subitize-flash-game/`)

## 7. Verification

- [x] 7.1 `cd mobile && npx tsc --noEmit`
- [x] 7.2 eslint on every changed mobile file (clean)
- [x] 7.3 `npm run test:explore-subitize-flash` and `npm run test:explore-variety-buckets`
- [x] 7.4 `cd kido-server && npx jest src/modules/explore` (full suite, no regressions)
- [x] 7.5 `openspec validate add-explore-subitize-flash-game --strict`

## 8. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 8.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      `subitize_flash_how_many` and `game_subitize_flash` clips at `pending_review`
- [ ] 8.2 `npm run explore-audio:review` and LISTEN to both
- [ ] 8.3 `npm run explore-audio:approve` (Human Gate; never automatic)
- [ ] 8.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack
