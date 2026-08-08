## Why

Explore currently creates each five-exercise round by independently sampling with replacement. Fresh seeds make generation nondeterministically different, but there is no pedagogical identity, batch deduplication or immediate-replay exclusion, so a child can repeatedly receive content that feels identical and may fail to encounter the rest of the selected level's content pool.

## What Changes

- Add a game-owned pedagogical `variantKey` contract so providers can distinguish genuinely new content from cosmetic changes such as option order or board layout.
- Plan each round without replacement across variant keys and, where applicable, stratify slots across the level's modes/categories instead of making five unrelated random draws.
- Keep a bounded set of served variant keys only while the Explore play route remains mounted, so pressing play again avoids the immediately preceding round until the available pool is exhausted.
- Define deterministic exhaustion behavior: finish broad pool coverage before reshuffling; never fail a round merely because the finite pool is smaller than the exclusion window.
- Preserve the existing privacy boundary: no variant key, prior exercise, seed, outcome, completion, cursor or rotation state is persisted, transmitted, logged, reported or linked to a child/device/account.
- Preserve static parent-selected difficulty. This change improves breadth within the selected level; it does not infer mastery or automatically unlock/advance levels from play behavior.

## Capabilities

### New Capabilities

- `explore-round-variety`: Defines pedagogical variant identity, without-replacement batch planning, immediate-replay diversity, pool exhaustion and conformance coverage for every enabled Explore game.

### Modified Capabilities

- `explore-session-runtime`: Requires a fresh round to be internally diverse and allows only route-local, bounded exclusion state for consecutive replay while preserving discard-on-unmount behavior.

## Impact

- Mobile Explore provider/registry contracts, `ExplorePlayScreen`, local generators and generator tests for all enabled games.
- Server Explore registry/service batch generation for current and future server-runtime games.
- Explore privacy and runtime conformance tests; no database, analytics, report or lesson-progress changes.
- Existing generator/validator versions may need a coordinated version bump where variant identity changes validated envelope semantics.
