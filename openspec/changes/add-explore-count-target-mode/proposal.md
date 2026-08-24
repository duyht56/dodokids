## Why

The Explore count game (Chạm và đếm, `tap_count`) has a single interaction: count every target object on screen, then pick the matching number card (`count_all`). That practices one-to-one correspondence in one direction only — reading a quantity off a set. The complementary skill, PRODUCING a quantity ("give me exactly N"), is never exercised. A second mode where the child taps exactly N objects out of a larger set trains counting-out and cardinality, is well within a 4–5 year old's reach, and reuses the same seeded layout + independent-validator machinery. The BRD §7.3 ladder also needs confirming to reach 1–20; the code already does (L1 1–5 → L4 1–20 → L10 1–50), so this records and locks that.

## What Changes

- Add a seed-deterministic `mode` discriminator (`count_all` | `count_target`) to the count generator, validator and params. `count_all` is the existing mode, unchanged in behavior. `count_target` ("chạm đúng N") presents a single-asset set STRICTLY larger than N (no distractors, no number cards); the child taps exactly N objects and submits, and the answer is the set they build (N drawn from the seed within the level range).
- The independent validator branches on `mode`: `count_all` keeps its distractor/number-card/per-level-layout rules; `count_target` requires no distractors, an empty `answerOptions`, a grouped grid, and `placements.length > targetCount` (so producing a set of exactly N is a real choice), all placements the countable target. Shared placement geometry (unique ids, in-bounds, viewport-fit at phone/tablet, non-overlap) applies to both.
- Bump the count `generatorVersion`/`validatorVersion` (and config/manifest/dependency versions) from v3 to v4 because the seeded stream now first draws the mode. Explore stores no play history, so replay-by-seed byte-identity only needs to hold within a version; bumping and updating every mirror is correct and safe.
- Update `TapCountRenderer` so `count_target` is a tap-to-select-N interaction: tapping toggles a selection highlight and a running count, a **Xong** submit control checks exactly N distinct objects were selected, the screen never marks the answer or reveals N beyond the prompt, and reduced motion disables the animations.
- Declare both modes as `variety.ts` `tap_count` round-variety buckets (`count_all`/`count_target`) at every level with a capacity ≈ 2 × range.max; `variantKey` becomes `count:<mode>:<targetCount>` and `bucketKey` is the mode, so round planning covers both modes and the mode/bucket coverage contract stays green.
- Add `count_target` prompt-audio keys `count_target_prompt` / `count_target_suffix` ("Bé hãy chạm đúng [N] vật nhé.") mirrored in mobile `promptAudio.ts` and pipeline `exploreAudioInventory.ts`, best-effort/silent — NOT regenerated in this change (next audio batch).
- No change to level ranges, the level ladder, the promotion window, the stateless-play boundary, or `count_all` playback.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-count-game`: The tap-and-count interaction gains a second mode. The game declares a `mode` discriminator (`count_all` | `count_target`); `count_target` asks the child to tap exactly N of a strictly larger single-asset set and submit, checked by the independent validator and renderer; both modes are declared round-variety buckets covering every level; and changing the seeded mode stream bumps the count generator/validator version.

## Impact

- `mobile/src/explore/games/countGame.ts` — `CountGameMode`, `mode` on `CountExerciseParams`, split generator (`generateCountAllExercise` / `generateCountTargetExercise`) with a `:count-mode` sub-seed, mode-branched `validateCountExercise`, `generatorVersion`/`validatorVersion`/config/manifest/dependency versions v3 → v4.
- `mobile/src/explore/renderers/TapCountRenderer.tsx` — `count_target` tap-to-select-N interaction with a submit control, running-count badge, reduced-motion support; `count_all` unchanged.
- `mobile/src/explore/variety.ts` — `tap_count` `bucketKeysByLevel` = `['count_all','count_target']` per level, `capacityByLevel` ≈ 2 × range.max, `variantKey` `count:<mode>:<targetCount>`, `bucketKey` = mode.
- `mobile/src/explore/promptAudio.ts` + `kido-pipeline/src/explore/exploreAudioInventory.ts` — mirrored `count_target_prompt`/`count_target_suffix` phrases and `countTargetKeys` builder (best-effort, not synthesized here).
- `mobile/scripts/verify-explore-count-contracts.cjs` (new) + `mobile/package.json` `test:explore-count` — per-level/per-mode conformance, boundaries, structure, validator tampering, 1–20 ladder.
- `kido-server/src/modules/explore/explore.registry.ts` — server metadata mirror of the count versions bumped to v4.
- `kido-server/src/modules/explore/explore.number-count.spec.ts` — mode-aware corpus, both-modes-reachable + count_target tamper tests, config version v4, representative snapshot records `mode`.
- `docs/KIDO_EXPLORE_BRD.md` §7.3 (modes + 1–20 ladder) and one `docs/AI_CONTEXT.md` line.
- No pipeline synthesis run, database, analytics or lesson-progress impact; missing `count_target` clips degrade to silence.
- Related: `fix-explore-catalog-round-1` (count renderer that never hands over the total) and `enable-explore-offline-audio` (the bundled number pack `count_target` reuses for N).
