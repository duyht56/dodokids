## 1. Contract codes (all three packages)

- [x] 1.1 Add `peekaboo_recall` to `EXPLORE_GAME_CODES` in `docs/kido-explore-contract.ts`
- [x] 1.2 Add `peekaboo_recall` to `EXPLORE_GAME_CODES` in `mobile/src/types/explore.ts`
- [x] 1.3 Add `peekaboo_recall` to `EXPLORE_GAME_CODES` in
      `kido-server/src/modules/explore/explore.types.ts`

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/peekabooRecallGame.ts`: exercise type, generator/
      validator/config versions, `PEEKABOO_RECALL_LEVELS` (set size 2 → 5, option
      count), `PEEKABOO_RECALL_VARIETY`, `PEEKABOO_RECALL_GAME`
- [x] 2.2 Deterministic seeded generator: select a compatible set from the memory
      object pool, take ONE object away, build options from the missing object plus
      foreign (not-in-set) distractors, all seeds namespaced by level
- [x] 2.3 INDEPENDENT validator: the original set is distinct real objects, exactly
      one object was removed (remaining = original minus that one), options are
      distinct real objects with only-foreign distractors and the missing object
      recorded, plus a byte-identical replay-by-seed check
- [x] 2.4 `peekabooRecallVariantKey` (the full board identity), `peekabooRecallBucketKey`
      (the set size) and the pure `peekabooRecallSupportOptions` dimming helper

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/PeekabooRecallRenderer.tsx`: brief show →
      Đô Đô peekaboo cover (native driver, instant under reduced motion) →
      reveal-with-gap → tap an option; the missing object pops back + cheer on
      correct, a gentle no-mark retry on wrong, `supportLevel` dims distractor
      options (never the answer) and flashes the set at level 2, emoji-free UI
      (objects drawn from the memory-asset glyph data), NO timer numeral
- [x] 3.2 Map `PEEKABOO_RECALL_EXERCISE_TYPE` to the renderer in `rendererRegistry.tsx`

## 4. Registration (mobile)

- [x] 4.1 `registry.ts`: `LOCAL_GAMES` / `BUNDLED_OVERRIDES` / `GAME_COPY`,
      progressive classification (`isProgressiveExploreRunGame`), 5-board run size
- [x] 4.2 `variety.ts`: `PEEKABOO_RECALL_VARIETY` config plus the `variantKey`/
      `bucketKey` switch cases
- [x] 4.3 `thumbnails.ts`: `EXPLORE_FALLBACK_ICONS` vector icon (`sparkles`, no PNG yet)
- [x] 4.4 Place `peekaboo_recall` in the "Quy luật và phân loại" group in
      `ExploreCatalogScreen.tsx`
- [x] 4.5 Best-effort audio: `peekaboo_recall_which` + `game_peekaboo_recall` in
      `promptAudio.ts` (mirrored in
      `kido-pipeline/src/explore/exploreAudioInventory.ts`) and a `peekabooRecallKeys`
      builder

## 5. kido-server

- [x] 5.1 Add `peekaboo_recall` to `PUBLIC_GAMES` and the local bundled `ROUND_2_GAMES`
      map in `explore.registry.ts`
- [x] 5.2 Update the public-catalog count assertion (16 → 17) in
      `explore.service.spec.ts`

## 6. Conformance + spec

- [x] 6.1 `mobile/scripts/verify-explore-peekaboo-contracts.cjs` and a
      `test:explore-peekaboo` npm script; add `peekaboo_recall` to the
      `verify-explore-variety-buckets.cjs` generator map
- [x] 6.2 `kido-server/src/modules/explore/explore.peekaboo-recall.spec.ts`
- [x] 6.3 This capability spec change (`openspec/changes/add-explore-peekaboo-recall-game/`)

## 7. Verification

- [x] 7.1 `cd mobile && npx tsc --noEmit`
- [x] 7.2 eslint on every changed mobile file (clean)
- [x] 7.3 `npm run test:explore-peekaboo` and `npm run test:explore-variety-buckets`
- [x] 7.4 `cd kido-server && npx jest src/modules/explore` (full suite, no regressions)
- [x] 7.5 `openspec validate add-explore-peekaboo-recall-game --strict`

## 8. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 8.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      `peekaboo_recall_which` and `game_peekaboo_recall` clips at `pending_review`
- [ ] 8.2 `npm run explore-audio:review` and LISTEN to both
- [ ] 8.3 `npm run explore-audio:approve` (Human Gate; never automatic)
- [ ] 8.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack

## 9. Look-window tune (2026-09-13, product owner)

- [x] 9.1 `PeekabooRecallRenderer`: `SHOW_MS` 1500 → 3000 (too fast for 4–6 year
      olds, the same call as `subitize_flash`); the level-2 memory-aid re-show
      `PEEK_MS` (was 1100) follows it
- [x] 9.2 The numeral-free sand timer, extracted from `subitize_flash` into the
      shared `mobile/src/explore/components/SandTimer.tsx`, sits above the board
      during both look windows; its row stays laid out (invisible) the rest of the
      time so the board never jumps; answering stays untimed. Presentation only —
      no generator/validator/version change
- [x] 9.3 Contract script asserts the ≥3 s look window and the sand timer; spec,
      proposal, `docs/KIDO_EXPLORE_BRD.md` §6.2/§7.12 and `docs/AI_CONTEXT.md`
      reworded
- [ ] 9.4 Owner: claim C-27 check — the same open item as
      `add-explore-subitize-flash-game` 9.5
- [x] 9.5 Verification: eslint on changed files, `npx tsc --noEmit`,
      `npm run test:explore-peekaboo` + `npm run test:explore-subitize-flash`,
      `npx jest src/modules/explore/explore.peekaboo-recall.spec.ts`,
      `openspec validate add-explore-peekaboo-recall-game --strict`, simulator check
