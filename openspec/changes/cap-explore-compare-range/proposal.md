## Why

The Explore compare game "Bên nào nhiều hơn?" (`quantity_compare`) climbs to range 50 over ten levels (`COMPARE_LEVELS` L1→L10, maxCount 5→50). That exceeds the BRD, which specifies a ≤20 range for ages 4–6 (BRD §7.4: L1 range 5, L2 range 10, L3 range 20). Comparing groups of 25–50 identical sprites is not a number-sense task a 4–6 year old can read or count, and it makes runs long and visually crowded. The product owner approved capping the ladder at four levels ending at range 20.

The two readable features the old ladder introduced late — equal cases (L4) and different group arrangements (L5) — must survive the cap, so they are re-homed one level earlier (equal at L3, grouped at L4) instead of being dropped.

## What Changes

- Cap the `quantity_compare` ladder at exactly four levels ending at range 20: L1 range 5 (gap ≥2, scatter), L2 range 10 (gap ≥1, scatter), L3 range 15 (equal enabled, scatter), L4 range 20 (equal enabled, scatter + grouped). Levels L5–L10 (range 25–50) are removed.
- Re-home the equal cases to start at L3 (was L4) and the readable grouped arrangement to start at L4 (was L5) so both survive the ≤20 ladder.
- Point the game's `levels` at a compare-specific 4-entry order (not the shared ten-range order other range games keep).
- Bump the compare `generatorVersion` (v3→v4) because the changed level ranges change the seeded exercise stream; mirror the bump in the kido-server registry's `quantity_compare` branch and cap its `levels` to four.
- Keep the equal mode, the compare sprite pool, the tap-to-count spoken numbers, the mascot, the fairness/validator/config versions and the stateless-play boundary exactly as they are.
- No change to the other range games (`tap_count`, `number_explorer`, `number_line_hop`) or their shared ten-range ladder.
- Add a "bập bênh" (seesaw / balance-beam) presentation for the Explore compare game, layered on top of the capped ladder. It is presentation only: a new Explore-local `SeesawComparisonBoard` reuses the exercise's existing left/right counts, correct side, seeded slots and assets — no seeded field is added and the generator/validator/version stay unchanged (replay byte-identical). Pre-answer the plank rests level (with an optional gentle symmetric idle sway) so it never reveals the answer; only a correct pick tilts the plank down toward the side with MORE (or keeps it level for equal), on the native driver, skipped under reduced motion (static resting tilt). The shared two-column `QuantityComparisonBoard` the lesson `compare_tap` activity depends on is NOT modified.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-quantity-compare-game`: the level ladder is capped at four levels ending at range 20, with equal cases starting at L3 and readable group arrangements starting at L4; and the Explore presentation becomes a seesaw ("bập bênh") that rests level until a correct pick, then tilts toward the side with more as a "more = heavier" reveal.

## Impact

- `mobile/src/explore/games/compareGame.ts` — new `COMPARE_LEVEL_ORDER = [1,2,3,4]`, reshaped `COMPARE_LEVELS` (4 levels, equal at L3, grouped at L4), `COMPARE_GENERATOR_VERSION` v3→v4, `QUANTITY_COMPARE_GAME.levels` points at the new order.
- `mobile/src/explore/variety.ts` — `quantity_compare` `capacityByLevel`/`bucketKeysByLevel` trimmed to four levels (equal bucket on L3–L4).
- `mobile/scripts/verify-explore-compare-contracts.cjs` — equal now expected from L3.
- `kido-server/src/modules/explore/explore.registry.ts` — `quantity_compare` `generatorVersion` mirror v3→v4 and `levels` capped to `[1,2,3,4]`.
- `kido-server/src/modules/explore/explore.quantity-compare.spec.ts` and its snapshot — corpus/levels updated to the 4-level range-20 ladder (range-50/L10 case dropped, range-20 L4 case added, equal re-homed to L3, grouped to L4); renderer-source assertions point at the seesaw board and a fairness test asserts the tilt reveals only on a correct pick and follows the counts.
- `mobile/src/explore/components/SeesawComparisonBoard.tsx` (new, Explore-only) — the seesaw presentation; `mobile/src/explore/renderers/QuantityCompareRenderer.tsx` wires it in place of the shared board while keeping the mascot, tap-to-count spoken numbers and stateless `onAnswer` sink. The shared `mobile/src/components/activities/QuantityComparisonBoard.tsx` is untouched.
- `docs/KIDO_EXPLORE_BRD.md` (§7.4 compare) and one `docs/AI_CONTEXT.md` line.
- No pipeline, database, analytics, audio-asset or lesson-progress impact; the shared ten-range ladder used by the other range games is untouched.
