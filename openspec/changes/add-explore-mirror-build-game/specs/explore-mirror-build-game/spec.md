## Purpose

Defines "Soi gương" (`mirror_build`), the offline left-right symmetry game in
which a grid is split by a vertical mirror line down the middle, the LEFT half is
pre-filled with a seeded pattern and the child taps RIGHT-half cells to build the
exact left-right reflection. A generator and an independent validator guarantee
the recorded solution is the EXACT mirror of the pre-filled left half and that the
puzzle is non-trivial.

## ADDED Requirements

### Requirement: Deterministic local symmetry puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the drawn-shape primitives and the Đô Đô mascot). A puzzle SHALL declare its level, its rows R and columns-per-side C (the whole grid is R × (2·C)), the single shape and single colour every ON cell uses, the pre-filled LEFT half (row-major over R × C, `true` = ON), the RIGHT-half solution (row-major over R × C) and the answer's ON right-cell ids. Every seeded draw SHALL be namespaced by the level so two levels of the same grid size never produce the same puzzle. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `mirror_build` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: The right half is the exact reflection of the left half
The recorded RIGHT-half solution SHALL be the exact left-right mirror of the pre-filled LEFT half: the right cell at column (C + 1 + k) SHALL reflect the left cell at column (C − k) — equivalently, right column c SHALL equal left column (C − 1 − c) — matching ON/OFF. The validator SHALL re-derive that expected reflection from the VISIBLE left half alone, independently of the generator, and SHALL prove the recorded solution equals it exactly and that the recorded answer is exactly the solution's ON right cells in row-major order. The validator SHALL reject any solution that is not the exact reflection and any answer that is not the solution's ON right cells.

#### Scenario: Generated puzzle is validated
- **WHEN** any generated puzzle is checked
- **THEN** the recorded right-half solution equals the exact left-right reflection re-derived from the visible left half, and the answer is exactly the solution's ON right cells

#### Scenario: The reflection is broken
- **WHEN** a single solution cell is flipped so the right half is no longer the exact mirror of the left half
- **THEN** the validator rejects the puzzle

#### Scenario: The answer omits a cell
- **WHEN** an ON right cell is dropped from the recorded answer
- **THEN** the validator rejects the puzzle

### Requirement: Non-trivial puzzles with a single vocabulary colour and shape
Every puzzle's left half SHALL have at least one ON cell and at least one OFF cell (never all-empty and never all-full), and the ON-count SHALL stay within the level's density bounds. Every ON cell SHALL use ONE shape and ONE colour drawn from the shared colour-blind-safe vocabulary (`ODD_ONE_OUT_SHAPES` / `ODD_ONE_OUT_COLORS`). The validator SHALL reject an all-empty or all-full left half, a colour or shape outside the shared vocabulary, and an ON-count outside the level's bounds.

#### Scenario: A trivial board is offered
- **WHEN** the left half is all-empty or all-full
- **THEN** the validator rejects the puzzle

#### Scenario: A foreign colour or shape is used
- **WHEN** an ON cell uses a colour or shape that is not in the shared vocabulary
- **THEN** the validator rejects the puzzle

### Requirement: Five levels scaling grid size and density
The game SHALL define five levels whose grid scales from 3 × (2·2) at L1 to 4 × (2·4) at L5 and whose pattern density grows with the level, and whose left-half cell count never shrinks with the level. The round-variety bucket of every puzzle SHALL be `mirror` and it SHALL be the only declared bucket at each level. The declared round-variety capacity per level SHALL be reachable. A run SHALL play one board per level from L1 to L5 as a progressive run without streaks, countdowns or a lose state.

#### Scenario: Grid scales across the ladder
- **WHEN** the levels are inspected
- **THEN** the grid is 3 × (2·2) at L1 and 4 × (2·4) at L5 and the left-half cell count never shrinks with the level

#### Scenario: A puzzle is moved to another level
- **WHEN** a puzzle's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the puzzle

#### Scenario: Only the mirror bucket is served
- **WHEN** chained one-exercise rounds are requested at any level
- **THEN** every served puzzle's bucket is `mirror` and more than one variant reaches the child

### Requirement: Tap-to-toggle build with a submit that never ends the run
The renderer SHALL pre-fill the LEFT half (not interactive) and let the child tap a RIGHT-half cell to toggle it ON (and tap again to turn it OFF), then submit "Xong". Tap-only, no drag. A submit whose right half equals the exact reflection SHALL make Đô Đô (`ExploreMascot`) cheer, animate the completed symmetric picture and report `onAnswer(true)`. A wrong submit SHALL play a gentle "try again" beat and report `onAnswer(false)` WITHOUT ending the run, filling the answer in, or marking anything — the selection stays fully editable so the child adjusts. All motion SHALL use the native animation driver and SHALL be skipped (resting in the static end state) when the system requests reduced motion. No emoji SHALL be used as a UI icon or as the mascot. The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: The mirror is completed correctly
- **WHEN** the child builds the right half so it exactly mirrors the left half and submits "Xong"
- **THEN** the picture animates, Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: A wrong submit
- **WHEN** the child submits "Xong" with a right half that is not the exact mirror
- **THEN** a gentle try-again beat plays, `onAnswer(false)` is called, nothing is marked and the selection stays editable

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** taps and submit update state, sound and `onAnswer` as usual without the pop/pulse animation

### Requirement: Support anchors and dims without auto-filling
At support level 1 the renderer SHALL highlight the next expected mirror cell (a subtle anchor on an expected-ON right cell the child has not placed yet) and SHALL NOT dim any cell. At support level 2 the renderer SHALL additionally dim impossible cells — right cells whose left mirror-partner is OFF (expected-OFF cells) — which MAY be turned OFF but not ON. Support SHALL NEVER auto-fill the answer: the anchor SHALL always be an expected-ON cell and the dimmed set SHALL always be a subset of the expected-OFF cells, so no cell the child needs is ever hidden. At support level 0 no anchor SHALL be shown and no cell SHALL be dimmed.

#### Scenario: Level 1 anchors the next cell
- **WHEN** the play screen passes `supportLevel` 1
- **THEN** the next expected-ON right cell not yet placed is anchored and no cell is dimmed

#### Scenario: Level 2 dims impossible cells only
- **WHEN** the play screen passes `supportLevel` 2
- **THEN** every dimmed cell is an expected-OFF cell, no expected-ON cell is dimmed and the answer is not filled in

#### Scenario: No support
- **WHEN** the play screen passes `supportLevel` 0
- **THEN** no anchor is shown and no cell is dimmed

### Requirement: Best-effort audio and authoritative board
The on-screen prompt SHALL be shown and, together with the pre-filled left half, SHALL be authoritative; the audio SHALL reference the best-effort `mirror_build_reflect` clip and a missing clip SHALL never block play. The variant identity of a puzzle SHALL be its level, shape, colour and exact left pattern, and its bucket SHALL be `mirror`.

#### Scenario: Prompt clip is not bundled
- **WHEN** the `mirror_build_reflect` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen and the puzzle is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-mirror-build-contracts.cjs` (`npm run test:explore-mirror-build`: at least 200 seeds per level, replay equality, an independent re-derivation of the left-right reflection, the non-trivial and single-vocabulary rules, capacity reachability, tamper rejection, chained one-exercise rounds, the support-never-auto-fills rule and renderer presentation rules) and by `kido-server/src/modules/explore/explore.mirror-build.spec.ts` (corpus conformance with an independent reflection proof, tamper rejection, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-mirror-build` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.mirror-build.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
