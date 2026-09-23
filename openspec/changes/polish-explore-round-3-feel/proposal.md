## Why

Đợt 1 (`fix-explore-catalog-round-1`) repaired correctness and the shared play
layer; Đợt 2 (`add-explore-round-2-games`) added Đô Đô's feedback voice, the
`supportLevel` contract and three new games. The catalog now works, but several
core games still *feel* static and cannot use assets that are already built:

- **Lật thẻ tìm cặp** swaps a card's face instantly — there is no flip, so a
  turn reads as a flicker rather than a reveal.

This is Đợt 3's first, lowest-risk slice: make these games feel alive with
presentation-only changes. No generator, validator, params, options, answer or
version changes, so replay-by-seed stays byte-identical and the offline/stateless
boundary is untouched.

## What Changes

- **Lật thẻ**: a real card-flip animation (rotateY / mid-point face swap)
  replacing the instant face swap, on turn-up and on a mismatched pair turning
  back down; matched cards settle without an extra flip.
- Every animation is skipped when the system requests reduced motion, resting in
  a static end state identical to today's; no new seeded fields, so
  `generatorVersion`/`validatorVersion` are unchanged.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-memory-match-game`: adds a card-flip animation requirement (presentation only, reduced-motion aware).

## Impact

- `mobile/src/explore/renderers/MemoryMatchRenderer.tsx`
- kido-server renderer-source spec assertions (`explore.memory-match.spec.ts`) and Explore contract-script source checks, updated to match the new renderer text.
- `docs/AI_CONTEXT.md` Explore implementation map.
- No generator/validator/version change, no pipeline/database/analytics impact, and **no audio regeneration**.
