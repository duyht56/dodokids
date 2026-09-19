## Context

See proposal.md — Why. Two independent declarations describe the same level: the generator's mode list (`NUMBER_LEVELS[n].modes`, narrowed at runtime by the bundled audio capability) and the round-variety policy's bucket list (`VARIETY_CONFIGS.number_explorer.bucketKeysByLevel`). Round planning rejects any exercise whose bucket is not declared, and rejects silently — so the two drifting apart turns into a total generation failure rather than a warning.

## Goals / Non-Goals

**Goals:**
- Level 1–2 accept the modes they actually generate under both audio-capability profiles.
- Make the drift detectable offline, before it reaches a device.

**Non-Goals:**
- Redesigning bucket declaration into a single derived source (see Decisions).
- Changing level ranges, modes, prompt text, generator/validator versions or the audio pack.
- Any change to difficulty progression, run size or the stateless-play boundary.

## Decisions

**Declare the union of both capability profiles, not the currently-active one.**
Level 1 becomes `['hear_select', 'match_sample']` — the only level whose entire mode list is audio-gated, so it is the only level that degrades to the `match_sample` fallback. Level 2 becomes `['hear_select', 'before_after']`: it keeps a non-audio mode, so it never degrades and its previously declared `match_sample` bucket is unreachable in both profiles and is dropped. Alternative considered: derive bucket lists from `resolveAvailableModes()` at runtime so they always match. Rejected for now — the variety config is a static, reviewable pedagogical declaration, and deriving it would make the round policy depend on device audio state, which is exactly the coupling that produced this failure. The union keeps the policy static and capability-independent; uncovered buckets only cost generation attempts, they never fail a round.

**A bucket that cannot be generated on this device is acceptable; a mode that cannot be bucketed is not.**
`planExploreRound` treats bucket coverage as a stopping heuristic (it breaks early once all buckets are seen) and bucket membership as a hard filter. So over-declaring is safe-but-slower, under-declaring is fatal. The contract check therefore asserts one direction only: every generatable mode ∈ declared buckets.

**Put the guard in the offline contract scripts, not in a runtime assert.**
The repo already verifies Explore contracts with `scripts/verify-explore-*.cjs`. The check enumerates each game's level mode declarations under both an audio-available and an audio-missing profile and compares against the declared buckets, so CI fails on drift instead of a child seeing a retry message.

**Log the failure code at the catch site.**
`ExplorePlayScreen` swallows the thrown error entirely. Recording the code (`EXPLORE_GENERATION_UNAVAILABLE`, `EXPLORE_LOCAL_PROVIDER_UNAVAILABLE`, …) keeps the child-facing copy unchanged while making the next mismatch diagnosable. Only the error code is recorded — no exercise, seed, answer or child identifier — so the stateless-play boundary is preserved.

## Risks / Trade-offs

- **Level 1 declares two buckets but can only produce one on a given device** → Accepted: an unreachable bucket only means `planExploreRound` runs its full attempt budget instead of breaking early (bounded, ≤80 attempts). Both stay declared because which one is reachable depends on the device's bundled pack.
- **The union hides genuine pedagogical drift (a bucket kept long after its mode is gone)** → Mitigated by the one-directional contract check plus review of the variety config when a level's modes change.
- **`hear_select` becomes the primary L1 construct on devices with the pack** → This is the intended behavior of `enable-explore-offline-audio`, not new here; this change only stops it from failing.
