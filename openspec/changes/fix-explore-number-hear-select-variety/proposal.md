## Why

Since the approved Vietnamese audio pack (`explore-audio-vi-v1`, 89 clips) was bundled, entering Khám phá → Khám phá số always fails with "Chưa thể tạo lượt chơi mới". The audio capability now enables `hear_select` at level 1, but the round-variety policy still declares level 1's only bucket as `match_sample` (the audio-less fallback), so every generated exercise is rejected as off-policy and round planning throws `EXPLORE_GENERATION_UNAVAILABLE`. The game is 100% unplayable because a continuous range run always starts at level 1.

## What Changes

- Declare the number game's round-variety buckets for levels 1–2 to cover every mode the level can generate under **either** audio-capability profile (`hear_select` when the approved pack is bundled, `match_sample` when it is not), so run planning accepts the exercises the generator legitimately produces.
- Make the mode/bucket agreement a verified contract: an enabled game's declared buckets for a level MUST cover every mode that level can generate under any capability profile, checked by an offline contract script rather than only at runtime.
- Surface the underlying failure code when a run cannot be created, so a policy/generator mismatch is diagnosable instead of collapsing into one generic child-facing message.
- No change to level ranges, modes, prompts, generator/validator versions, audio keys, difficulty progression or the stateless-play boundary.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-number-game`: Level mode declaration is extended to require that the level's declared round-variety buckets cover its generatable modes under every audio-capability profile, and that a capability-available level never fails run creation.

## Impact

- `mobile/src/explore/variety.ts` — `VARIETY_CONFIGS.number_explorer.bucketKeysByLevel` levels 1–2.
- `mobile/src/screens/child/ExplorePlayScreen.tsx` — empty `catch {}` around `createExploreRunBatch` loses the error code.
- `mobile/scripts/verify-explore-offline-audio-contracts.cjs` (or a sibling verify script) — new mode/bucket coverage assertion.
- No server, pipeline, database, analytics or lesson-progress impact; no audio asset regeneration.
- Related pending changes: `enable-explore-offline-audio` (which enabled `hear_select` generation) and `ensure-explore-round-variety` (which defines bucket planning).
