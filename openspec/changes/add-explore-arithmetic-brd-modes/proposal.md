## Why

The Explore arithmetic game (Máy cộng trừ, `arithmetic_machine`) only ever generated `add` and `subtract`, even though the `explore-arithmetic-game` capability and BRD §7.6 describe five modes across a six-level ladder. The visual-math engine, renderer and primitives already carried the machinery for the strategy modes (`count_on`, `make_10`, `tens_ones` operation kinds/representations; three-operand support) but no level's `modes` list ever selected them, so they were unreachable dead code and the level ranges (5/10/20/30/50) did not match the BRD ladder. This change wires the BRD §7.6 modes in so the game actually teaches counting on, making ten, multi-operand addition and place-value within 50 — reusing the existing seeded-generator + independent-validator + visual primitives, with no new engine.

## What Changes

- Extend the seeded `mode` discriminator on the arithmetic generator/validator/params from `add`/`subtract` to the full BRD §7.6 set: `count_on`, `make_10`, `three_operand` and `tens_ones`. Each is generated deterministically within its level's range and re-derived by an INDEPENDENT validator that replays byte-identically from the seed and rejects tampering.
- Re-align the level ladder to BRD §7.6 and extend it to L6: L1 range 5 (add/subtract objects), L2 range 10 (add/subtract, count all), L3 range 10 (+ `count_on` from the larger addend), L4 range 20 (+ `make_10` complete-the-ten), L5 range 20 (+ `three_operand` a+b+c with each operand ≤ 6), L6 = Advanced range 50 (`tens_ones` place value beside the number line). `ARITHMETIC_LEVEL_ORDER` becomes `[1..6]` and the promotion window (5 correct of the last 7) now climbs L1→L6.
- Make the strategy modes reachable by LEVEL, not by an external capability flag: reaching a level (5-of-7 window promotions) is the BRD "stable with two operands / stable at range 20" gate, so `count_on`/`make_10`/`three_operand`/`tens_ones` appear only at their level. The unused `ArithmeticCapabilities`/`gate` machinery is removed; `params.gates.{threeOperands,advanced50}` is now derived from level + mode and validated as such.
- `make_10` completes the ten ("Cần thêm mấy để đủ 10?"): the whole is 10 (the model result) and the answer is the missing second part, shown on a ten-frame filled to the first part so the empty cells are the scaffold (the total is never shown). Every other mode answers the model result.
- Visualise each mode with the EXISTING `VisualMathScene` primitives — the add/subtract machine, the ticked number line (count_on, three_operand, tens_ones number line), the ten-frame (make_10) and `TensOnes` place-value groups (tens_ones) — with `supportLevel` (0/1/2) intact. The renderer's equation panel reads the operation kind (so a `tens_ones` subtraction shows `−`) and shows `first + ? = 10` for make_10. No physics engine, no new renderer.
- Declare each level's modes as `variety.ts` round-variety buckets (`arithmetic:<mode>`) with capacity ≈ the distinct (mode × operands) variants per level, so one-exercise rounds cover every mode (each declared bucket ≥ 20% over chained rounds); `tens_ones` and the other order-bearing modes preserve operand order in the variant key.
- Bump the arithmetic `generatorVersion`/`validatorVersion` (and config/manifest/dependency versions) v3 → v4 because the seeded stream now draws a strategy mode. Explore stores no play history, so replay-by-seed byte-identity only needs to hold within a version; bumping and updating every mirror (mobile config/manifest/dependency + server `explore.registry.ts` including the L6 level list) is the correct coordination.
- Add a best-effort `dem_tiep` ("đếm tiếp") count-on clip mirrored in mobile `promptAudio.ts` and pipeline `exploreAudioInventory.ts`, in the manifest for the NEXT audio batch — NOT synthesized here; a missing clip is skipped and the on-screen prompt stays authoritative. `make_10`, `three_operand` and `tens_ones` reuse existing clips.
- No change to the promotion window size, the stateless-play boundary, the reward-free/offline model, or the shared range-game ladder used by other games.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-arithmetic-game`: The arithmetic modes the BRD describes are now implemented as a seed-deterministic `mode` discriminator across the L1→L6 ladder. `count_on` counts on from the larger addend; `make_10` completes the ten (answer = missing part); `three_operand` adds three small operands; `tens_ones` is the Advanced range-50 place-value branch. Each mode has an independent validator and a declared round-variety bucket, strategy modes are gated by reaching their level rather than an external flag, and changing the seeded mode stream bumps the arithmetic generator/validator version.

## Impact

- `mobile/src/explore/games/arithmeticGame.ts` — `ArithmeticMode` gains `tens_ones`; the L1→L6 `ARITHMETIC_LEVELS` ladder and `ARITHMETIC_LEVEL_ORDER = [1..6]`; per-mode deterministic generation, `make_10` answer = missing part, mode-aware options/typical-errors; `MODE_EXPECTATIONS`-driven validator with derived `gates`; removed `ArithmeticCapabilities`/`gate`; `generatorVersion`/`validatorVersion`/config/manifest/dependency versions v3 → v4.
- `mobile/src/explore/renderers/ArithmeticRenderer.tsx` — equation panel reads the operation kind and shows `first + ? = 10` for make_10; modes and `supportLevel` otherwise unchanged.
- `mobile/src/explore/components/VisualMathPrimitives.tsx` — the make_10 ten-frame fills the first part (empty cells are the scaffold), reusing the existing scenes for every other mode.
- `mobile/src/explore/variety.ts` — `arithmetic_machine` buckets per level (`add`/`subtract`/`count_on`/`make_10`/`three_operand`/`tens_ones`), capacity per level, and `tens_ones` added to the order-preserving variant-key set.
- `mobile/src/explore/promptAudio.ts` + `kido-pipeline/src/explore/exploreAudioInventory.ts` — mirrored `dem_tiep` word and `arithmeticCountOnKeys` / `arithmeticThreeOperandKeys` builders (best-effort, not synthesized here).
- `mobile/scripts/verify-explore-arithmetic-contracts.cjs` — rewritten for the L1→L6 ladder and all modes: per-mode prompt/answer/options, generator emits every declared mode, each mode reaches the child ≥ 20% of one-exercise rounds, validator independence (flipped prompt, zero operand, make_10-whole, collapsed three_operand, re-represented tens_ones), promotion to L6.
- `kido-server/src/modules/explore/explore.registry.ts` — server metadata mirror of the arithmetic versions v3 → v4 and the L6 level list.
- `kido-server/src/modules/explore/explore.number-bond-arithmetic.spec.ts` — mode-aware L1→L6 conformance, strategy-mode shape checks, promotion caps at L6, registration levels `[1..6]`.
- `docs/KIDO_EXPLORE_BRD.md` §7.6 update note and one `docs/AI_CONTEXT.md` line.
- No pipeline synthesis run, database, analytics or lesson-progress impact; missing `dem_tiep` degrades to silence.
- Related: `fix-explore-catalog-round-1` (round-variety rotation covering every mode) and `polish-explore-round-3-feel` (the máy cộng trừ machine + ticked number line these modes render on).
