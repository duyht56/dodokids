## Why

Đợt 1 (`fix-explore-catalog-round-1`) repaired correctness and the shared play
layer; Đợt 2 (`add-explore-round-2-games`) added Đô Đô's feedback voice, the
`supportLevel` contract and three new games. The catalog now works, but several
core games still *feel* static and cannot use assets that are already built:

- **Lật thẻ tìm cặp** swaps a card's face instantly — there is no flip, so a
  turn reads as a flicker rather than a reveal.
- **Ngôi nhà tách gộp** moves leaves between the pool and the "Bé thêm" box with
  no motion, and stays silent on add/remove even though the number-bond feedback
  clips (`numberBondFeedbackKeys`) were authored in the Đợt 2 audio batch.
- **Máy cộng trừ** shows a correct picture but no "máy" (machine) actually doing
  the adding or taking-away, and its number line has no tick marks.

This is Đợt 3's first, lowest-risk slice: make these three games feel alive with
presentation-only changes. No generator, validator, params, options, answer or
version changes, so replay-by-seed stays byte-identical and the offline/stateless
boundary is untouched.

## What Changes

- **Lật thẻ**: a real card-flip animation (rotateY / mid-point face swap)
  replacing the instant face swap, on turn-up and on a mismatched pair turning
  back down; matched cards settle without an extra flip.
- **Tách gộp**: leaves slide into the "Bé thêm" box when added and slide out when
  removed, with a gentle merge/settle on "Gộp lại"; the already-bundled
  number-bond feedback clips are spoken best-effort on add/remove (missing clip
  never blocks play).
- **Máy cộng trừ**: a "machine" animation (operand groups feed in → the result
  comes out) and a properly ticked number line for add/subtract, built on the
  Đợt 2 semantic-animation primitives (`SemanticAnimationView`, `addGroup`,
  `removeGroup`, `NumberLine.hopProgress`); `supportLevel` visuals unchanged.
- Every animation is skipped when the system requests reduced motion, resting in
  a static end state identical to today's; no new seeded fields, so
  `generatorVersion`/`validatorVersion` are unchanged.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-memory-match-game`: adds a card-flip animation requirement (presentation only, reduced-motion aware).
- `explore-number-bond-game`: adds a compose/decompose animation and best-effort spoken feedback on add/remove.
- `explore-arithmetic-game`: adds a machine animation and a ticked number line, presentation only.

## Impact

- `mobile/src/explore/renderers/MemoryMatchRenderer.tsx`
- `mobile/src/explore/renderers/NumberBondRenderer.tsx`
- `mobile/src/explore/renderers/ArithmeticRenderer.tsx`, `mobile/src/explore/games/VisualMathPrimitives.tsx`
- kido-server renderer-source spec assertions (`explore.memory-match.spec.ts`, `explore.number-bond-arithmetic.spec.ts`) and Explore contract-script source checks, updated to match the new renderer text.
- `docs/AI_CONTEXT.md` Explore implementation map.
- No generator/validator/version change, no pipeline/database/analytics impact, and **no audio regeneration** (the number-bond feedback clips are already bundled).
