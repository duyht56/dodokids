## Why

"Tìm quy luật" (`pattern_finder`) today mixes attributes inside one sequence: a
cycle token is a distinct (shape + colour) pair, so an "AB" run reads as "tròn
cam, vuông xanh, …" — the child sees shape AND colour changing at once and cannot
form a clean mental rule ("the colours repeat" or "the shapes repeat"). The token
pool is also small (4 shape/colour pairs, 5 shared count sprites), so sequences
repeat quickly across a run and feel stale. Finally the game has only one
interaction — complete the missing slot — while "spot the one that breaks the
rule" is a distinct, higher-order pattern skill for ages 4–6 that the game never
practices.

## What Changes

- **Split colour vs shape into distinct, labelled grammar families** so a child
  reads ONE coherent rule at a time:
  - `shape_cycle` — same colour, the pattern is over SHAPES ("quy luật hình").
  - `color_cycle` — same shape, the pattern is over COLOURS ("quy luật màu"),
    drawn from a colour-blind-safe palette so it stays legible.
  - `object_cycle` (emoji), `quantity` (dot groups) and `numeric` (number step)
    are kept unchanged.
- **Bigger, fresher, colour-blind-friendly token pool** owned by the pattern game
  (not shared with `tap_count`): 6 perceptually distinct shapes, 7 Okabe–Ito
  palette colours, 10 single-object emoji.
- **New `fix_error` mode ("tìm chỗ sai")** as a seed-deterministic `mode`
  discriminator alongside the retained `complete` mode: show an otherwise-correct
  sequence with EXACTLY ONE rule-breaking element; the child taps that element and
  it auto-corrects (the simplest one-tap sound interaction). The INDEPENDENT
  validator enumerates every single-cell repair to prove the sequence is currently
  invalid and has exactly one rule-breaking position, equal to the recorded
  `errorIndex`/`correctToken`.
- **Variety buckets** become the families plus `fix_error`, declared per level with
  capacity, so round planning covers every mode and each declared bucket reaches
  ≥20% in one-exercise rounds under the contract.
- **Version bumps**: `generatorVersion` `pattern-finder-v3` → `pattern-finder-v4`
  (the seeded stream changes) and `validatorVersion` `pattern-finder-validator-v2`
  → `pattern-finder-validator-v3` (fix_error validation), config/manifest bumped to
  v5, mirrored in `kido-server/src/modules/explore/explore.registry.ts`. Explore
  stores no play history, so replay-by-seed byte-identity only needs to hold within
  a version.
- **Prompt audio (best-effort)**: add `pattern_next_color`, `pattern_blank_color`
  and `pattern_find_error` to `promptAudio.ts` and the mirrored
  `exploreAudioInventory.ts`, noted for the next audio batch. They are NOT
  synthesized now; a missing clip degrades to silence and the on-screen prompt
  stays authoritative.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-pattern-game`: colour-only and shape-only cycle grammars become
  distinct, coherent families with a larger colour-blind-safe token pool; the game
  gains a `fix_error` mode whose independent validator proves exactly one
  rule-breaking position; round-variety buckets and the versioned
  generator/validator are updated accordingly.

## Impact

- `mobile/src/explore/games/patternGame.ts` — family split (`shape_cycle`/
  `color_cycle`/`object_cycle`/`quantity`/`numeric`), bigger token pool, `mode`
  discriminator, `fix_error` generator + independent single-cell-repair validator;
  `generatorVersion`/`validatorVersion`/config/manifest bumped; own object pool.
- `mobile/src/explore/renderers/PatternFinderRenderer.tsx` — renders the two new
  shapes, and a `PatternFixErrorView` (tap the wrong cell → auto-correct); the
  `complete` interaction is unchanged.
- `mobile/src/explore/variety.ts` — `pattern_finder` buckets are the families +
  `fix_error`, capacity raised; `variantKey`/`bucketKey` handle both modes.
- `mobile/src/explore/promptAudio.ts` + `kido-pipeline/src/explore/exploreAudioInventory.ts`
  — new best-effort prompt keys (next audio batch, not synthesized now).
- `mobile/scripts/verify-explore-pattern-contracts.cjs` — corpus/tamper/round
  checks cover both modes and the new families.
- `kido-server/src/modules/explore/explore.registry.ts` — version mirror bumped.
- `kido-server/src/modules/explore/explore.pattern.spec.ts` — dual-mode corpus,
  fix_error uniqueness, family coherence, version-bump assertions.
- `docs/KIDO_EXPLORE_BRD.md` §7.7 and one `docs/AI_CONTEXT.md` line.
- No pipeline/database/analytics/lesson-progress impact; no audio regeneration.
