## 1. Mobile generator + config

- [x] 1.1 Add `COMPARE_LEVEL_ORDER = [1,2,3,4]` in `mobile/src/explore/games/compareGame.ts` and reshape `COMPARE_LEVELS` to exactly four levels: L1 maxCount 5 / minGap 2 / scatter / equal off, L2 maxCount 10 / minGap 1 / scatter / equal off, L3 maxCount 15 / minGap 1 / scatter / equal on, L4 maxCount 20 / minGap 1 / scatter+grouped / equal on.
- [x] 1.2 Bump `COMPARE_GENERATOR_VERSION` v3→v4 (changed seeded stream) and point `QUANTITY_COMPARE_GAME.levels` at `COMPARE_LEVEL_ORDER`; leave the validator, fairness and config versions and the compare sprite pool unchanged.

## 2. Mobile variety policy

- [x] 2.1 Trim `variety.ts` `quantity_compare` `capacityByLevel`/`bucketKeysByLevel` to the four levels, keeping the `equal` bucket on L3–L4 so every declared bucket still reaches ≥20% in one-exercise rounds.

## 3. Server registry mirror

- [x] 3.1 In `kido-server/src/modules/explore/explore.registry.ts` (`quantity_compare` branch only) mirror `generatorVersion` v3→v4 and cap `levels` to `[1,2,3,4]`.

## 4. Server spec + snapshot

- [x] 4.1 Update `explore.quantity-compare.spec.ts`: iterate the four-level order, expect no equal below L3, expect equal from L3, exercise both arrangements at L4, and assert server/mobile `levels` are `[1,2,3,4]`.
- [x] 4.2 Reshape the layout-descriptor snapshot test to the range-20 ladder (drop the range-50/L10 case, add a range-20 L4 case, re-home the equal case to L3 and grouped to L4) and regenerate the snapshot.

## 5. Docs

- [x] 5.1 Update `docs/KIDO_EXPLORE_BRD.md` §7.4 (compare) to the four-level range-20 ladder and update one `docs/AI_CONTEXT.md` line.

## 6. Verify

- [x] 6.1 `cd mobile && npx tsc --noEmit`; eslint on changed files; `npm run test:explore-compare`; `npm run test:explore-variety-buckets`.
- [x] 6.2 `cd kido-server && npx jest src/modules/explore/explore.quantity-compare.spec.ts`.
- [x] 6.3 `openspec validate cap-explore-compare-range --strict`.

## 7. Seesaw ("bập bênh") presentation (presentation only)

- [x] 7.1 Add `mobile/src/explore/components/SeesawComparisonBoard.tsx` — an Explore-only seesaw board (fulcrum + plank + two pans) reusing the exercise's existing left/right counts, correct side, seeded slots and assets; no seeded field, no generator/validator/version change. Keep the tap-to-count scaffold (counters, numbered badges, `onCountSprite`) and the `revealCounts`/`pulseSide` support hooks.
- [x] 7.2 Enforce the fairness rule: the plank rests level pre-answer (optional gentle SYMMETRIC idle sway) and tilts only after a correct pick, toward the side with MORE (derived from counts, never `correctSide`), or stays level for equal; a wrong pick never tilts. Native driver; under reduced motion skip the tilt animation and idle sway and show the correct resting tilt statically.
- [x] 7.3 Fit a 375-pt phone without horizontal overflow and keep the Đô Đô mascot and spoken tap-to-count numbers; wire `SeesawComparisonBoard` from `QuantityCompareRenderer.tsx` in place of the shared board. Do NOT modify the shared `mobile/src/components/activities/QuantityComparisonBoard.tsx`.
- [x] 7.4 Update `kido-server/src/modules/explore/explore.quantity-compare.spec.ts` renderer-source assertions to the seesaw board and add a fairness test (tilt reveals only on a correct pick and follows the counts); leave `mobile/scripts/verify-explore-compare-contracts.cjs` passing (renderer keeps the mascot, `onCountSprite={countSprite}`, `numberKey`, `onAnswer`).
- [x] 7.5 Add the seesaw `## ADDED Requirements` to the `explore-quantity-compare-game` spec delta and one `docs/AI_CONTEXT.md` line; keep `openspec validate cap-explore-compare-range --strict` passing.
