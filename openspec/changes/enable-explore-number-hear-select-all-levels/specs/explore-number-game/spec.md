## MODIFIED Requirements

### Requirement: Number level progression
The game SHALL configure ten ranges L1–L10 (1–5, 1–10, 1–15, 1–20, 1–25, 1–30, 1–35, 1–40, 1–45, 1–50), with longer ordered/missing sequences at the higher levels. A level SHALL only select modes enabled for that level. Every level SHALL offer the audio-first `hear_select` mode whenever the bundled audio pack covers that level's range, in addition to the level's visual modes; when no supported audio pack is bundled, the level SHALL fall back to its visual modes only, and a level whose only enabled mode is audio-gated SHALL degrade to the `match_sample` visual. Each level SHALL declare round-variety buckets that cover every mode it can generate under every supported audio-capability profile.

#### Scenario: hear_select is offered on every level with the pack
- **WHEN** the bundled audio pack covers a level's range and exercises are requested across L1–L10
- **THEN** each level can generate a valid `hear_select` exercise whose target is spoken only in audio, and that mode is a declared round-variety bucket for the level

#### Scenario: A higher level without a bundled audio pack
- **WHEN** no supported audio pack is bundled and an L3–L10 round is requested
- **THEN** the level generates only its visual modes and never emits `hear_select`, and those exercises are accepted by the round-variety policy

#### Scenario: L1 is generated
- **WHEN** an L1 number exercise is requested
- **THEN** all numbers and answers are within 1–5 and no higher-level-only mode is used

#### Scenario: A level declares a mode its buckets omit
- **WHEN** conformance checks compare each level's generatable modes against its declared round-variety buckets under both audio-capability profiles
- **THEN** any mode reachable under some profile but absent from the declared buckets fails the check

## ADDED Requirements

### Requirement: Number generator version tracks the per-level mode set
Changing which modes a level can generate SHALL bump the number `generatorVersion`, and replay-by-seed SHALL remain byte-identical within a `generatorVersion`. Explore persists no play history, so a version bump with every mirror updated is the only coordination needed when the seeded stream changes.

#### Scenario: Per-level modes change
- **WHEN** the set of modes a level can generate is changed
- **THEN** the number `generatorVersion` is bumped and every mirror of it (mobile config, validator gate, server metadata) is updated to the new version

#### Scenario: Replay within a version
- **WHEN** the same seed and level are generated twice under one `generatorVersion`
- **THEN** the two exercises are byte-identical
