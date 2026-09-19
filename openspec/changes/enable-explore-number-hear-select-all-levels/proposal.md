## Why

`hear_select` (the audio-first "nghe rồi chọn số" mode, where the target number is spoken ONLY in audio) is the mode that best exercises number-name recognition, but today it is reachable only at the two lowest levels. The generator's `NUMBER_LEVELS` declares `hear_select` for L1–L2 only, and `variety.ts` `number_explorer.bucketKeysByLevel` declares it as a round-variety bucket for L1–L2 only. From L3 up, a child who has the approved audio pack bundled never hears the listening task again, even though the pack covers number names 0–50 (every level's range). The audio-first channel is the app's primary instruction channel, so dropping it after L2 wastes the bundled audio and weakens the number-recognition practice at exactly the ranges where it matters most.

## What Changes

- Allow the number generator to produce `hear_select` at **every** level (L1–L10): add `hear_select` to `NUMBER_LEVELS[3..10].modes`. The existing audio-aware filter (`resolveAvailableModes`) keeps `hear_select` only when the bundled pack covers the level's range, so each level keeps its existing non-audio modes for the audio-missing profile (the seeded stream under the audio-missing profile is unchanged; only the audio-available stream gains the mode).
- Extend `variety.ts` `number_explorer.bucketKeysByLevel` for L3–L10 to declare `hear_select` alongside the existing modes (union), and update `capacityByLevel` to the richer reachable variant count so round planning still balances across the larger mode set.
- Preserve the P0 mode/bucket coverage invariant: every level's declared buckets still cover every mode generatable under BOTH audio-capability profiles, asserted by the offline coverage contract.
- Bump the number `generatorVersion` from `number-explorer-v3` to `number-explorer-v4` because the per-level mode set changes the seeded mode-selection stream under the audio-available profile. Explore stores no play history, so replay-by-seed byte-identity only needs to hold within a version; bumping and updating every mirror is correct and safe.
- No change to level ranges, prompts, audio keys, the validator version, config/manifest versions, the renderer (it already renders `hear_select` by `params.mode`, not by level), difficulty progression, or the stateless-play boundary.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-number-game`: Level mode declaration is extended so that every level offers the audio-first `hear_select` mode when the bundled pack covers its range, while keeping each level's visual modes for the audio-missing profile, and the per-level declared round-variety buckets cover the enlarged generatable mode set under every audio-capability profile.

## Impact

- `mobile/src/explore/games/numberGame.ts` — `NUMBER_LEVELS[3..10].modes` gain `hear_select`; `generatorVersion` `number-explorer-v3` → `number-explorer-v4` (envelopes, validator gate, game config).
- `mobile/src/explore/variety.ts` — `VARIETY_CONFIGS.number_explorer.bucketKeysByLevel` L3–L10 add `hear_select`; `capacityByLevel` L3–L10 raised to the reachable variant count.
- `mobile/scripts/verify-explore-number-contracts.cjs` — header comment documents the every-level `hear_select` invariant (the checks already auto-track the audio-aware reachable mode set).
- `kido-server/src/modules/explore/explore.registry.ts` — server metadata mirror of the number `generatorVersion` bumped to `number-explorer-v4`.
- `kido-server/src/modules/explore/explore.number-count.spec.ts` — new assertion that `hear_select` is reachable on every level under the bundled pack.
- `docs/KIDO_EXPLORE_BRD.md` §7.2 and one `docs/AI_CONTEXT.md` line.
- No pipeline, database, analytics or lesson-progress impact; no audio asset regeneration (pack unchanged, `NumberExplorerRenderer` unchanged).
- Related changes: `fix-explore-number-hear-select-variety` (declared L1–L2 buckets for both profiles) and `enable-explore-offline-audio` (bundled the pack that gates `hear_select`).
