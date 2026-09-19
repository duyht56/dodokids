## 1. Add the mode discriminator to the generator

- [x] 1.1 Add `CountGameMode = 'count_all' | 'count_target'` and a `mode` field on `CountExerciseParams` in `mobile/src/explore/games/countGame.ts`
- [x] 1.2 Split `generateCountExercise` into a `:count-mode` sub-seed draw dispatching to `generateCountAllExercise` (the existing body, unchanged) and `generateCountTargetExercise`
- [x] 1.3 `generateCountTargetExercise`: draw N within the level range, build a single-asset set strictly larger than N (small seed-drawn surplus capped at the viewport-proven ceiling), grouped grid, no distractors, empty `answerOptions`, prompt "Bé hãy chạm đúng N …", `audioRefs = countTargetKeys(N)`
- [x] 1.4 Bump `generatorVersion`/`validatorVersion` (and config/manifest/dependency versions) v3 → v4 in the envelopes and `TAP_COUNT_GAME`

## 2. Branch the independent validator

- [x] 2.1 Add `params.mode` acceptance and shared checks (asset approved, target in range, answer matches) to `validateCountExercise`
- [x] 2.2 `count_all` structure helper keeps the distractor/number-card/per-level-layout rules
- [x] 2.3 `count_target` structure helper requires no distractors, empty `answerOptions`, grouped layout, `placements.length > targetCount`, every placement the countable target
- [x] 2.4 Keep the shared placement geometry (unique ids, in-bounds, viewport-fit phone/tablet, non-overlap) for both modes

## 3. Renderer supports tap-to-select-N

- [x] 3.1 In `TapCountRenderer.tsx`, branch on `params.mode`; `count_all` is unchanged
- [x] 3.2 `count_target`: tapping toggles a selection highlight + running count (objects stay live to deselect); a **Xong** submit control checks exactly N distinct selected → `onAnswer(true)`, else a gentle miss `onAnswer(false)` with the selection kept editable
- [x] 3.3 Never mark the answer or reveal N beyond the prompt; support reduced motion (reuse the existing `reduceMotion` gate on bounce/shake)

## 4. Variety buckets, capacity and round planning

- [x] 4.1 `variety.ts` `tap_count.bucketKeysByLevel` = `['count_all','count_target']` for L1–L10
- [x] 4.2 `capacityByLevel` raised to ≈ 2 × range.max per level (both modes each draw a target in range)
- [x] 4.3 `variantKey` → `count:<mode>:<targetCount>`, `bucketKey` → `params.mode`; the mode/bucket coverage + one-exercise-round reach contracts stay green for both modes

## 5. Prompt audio (best-effort, not regenerated)

- [x] 5.1 Add `count_target_prompt` / `count_target_suffix` phrases and `countTargetKeys(N)` to `mobile/src/explore/promptAudio.ts`
- [x] 5.2 Mirror both phrases verbatim in `kido-pipeline/src/explore/exploreAudioInventory.ts`
- [x] 5.3 Keep them best-effort/silent — no synthesis run in this change (followup: next audio batch)

## 6. Mirror the version bump and lock the behavior

- [x] 6.1 Bump the count server metadata (generator/validator/config/manifest/dependency versions) to v4 in `kido-server/src/modules/explore/explore.registry.ts`, touching only the `tap_count` branches
- [x] 6.2 Make `explore.number-count.spec.ts` mode-aware: corpus branches per mode, both modes reachable per level, a `count_target` tamper test, config version v4, snapshot records `mode`
- [x] 6.3 Add the mobile `verify-explore-count-contracts.cjs` + `test:explore-count` script

## 7. Docs

- [x] 7.1 Update `docs/KIDO_EXPLORE_BRD.md` §7.3 with the two modes and the confirmed 1–20 ladder
- [x] 7.2 Add one `docs/AI_CONTEXT.md` line recording the mode, buckets and the version bump

## 8. Verification

- [x] 8.1 `cd mobile && npx tsc --noEmit` and `npx eslint` on the changed files
- [x] 8.2 `npm run test:explore-count` and `npm run test:explore-variety-buckets`
- [x] 8.3 `cd kido-server && npx jest src/modules/explore/explore.number-count.spec.ts`
- [x] 8.4 `openspec validate add-explore-count-target-mode --strict`
