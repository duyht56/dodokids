## Purpose

Defines "Nhìn nhanh" (`subitize_flash`), the offline subitizing game in which a
small group of dots/objects (N in the subitizing range 1–6) is flashed for about a
second, Đô Đô covers the group (an approved ~1s auto-hide — subitizing, NOT a
countdown), and the child taps N from a small number-options row. A generator and
an independent validator guarantee N is in the level's range, the shown group has
exactly N items, and the number options include N among near-value distractors.

## ADDED Requirements

### Requirement: Deterministic local subitize-flash board
The game SHALL generate every board locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the shared visual-math primitives, the countable emoji-content pool and the Đô Đô mascot). A board SHALL declare its level, the flashed quantity N, the arrangement, the display kind (dots or a countable object, with the object glyph when applicable), the group `items` and the number `options`. Every seeded draw SHALL be namespaced by the level so moving a board to another level is replay-detectable. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Board starts in airplane mode
- **WHEN** the child opens `subitize_flash` with no connectivity
- **THEN** a fresh board is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: A flashed group of exactly N in the subitizing range
The flashed quantity N SHALL be drawn from the level's range, which SHALL always fall inside the subitizing range 1–6 (the `tap_count` COUNT_LEVELS ranges reused for N, capped at `SUBITIZE_MAX_N` = 6). The board SHALL carry a group `items` array whose length is EXACTLY N, and the recorded answer SHALL be N. The validator SHALL re-derive the group of exactly N items and the level's N range independently of the generator, and SHALL reject a board whose N is out of range, whose group does not have exactly N items, or whose recorded answer is not N.

#### Scenario: Generated board is validated
- **WHEN** any generated board is checked
- **THEN** N is inside the level's range within 1–6 and the group has exactly N items

#### Scenario: The group size does not match N
- **WHEN** an item is added to or removed from the group so its length is no longer N
- **THEN** the validator rejects the board

#### Scenario: N leaves the subitizing range
- **WHEN** N is changed to a value above 6
- **THEN** the validator rejects the board

### Requirement: Number options include N among near-value distractors
The number `options` SHALL be `optionCount` distinct numbers in the subitizing range that INCLUDE N, built from `buildNearTargetOptions` so the distractors are near-value and the target's position is a seeded shuffle — the answer SHALL never be at a fixed position. N SHALL be the recorded answer. The validator SHALL reject options that are not distinct, that are out of range, that omit N, or whose recorded answer is not N.

#### Scenario: The answer position is not fixed
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** N appears at more than one option position across the corpus

#### Scenario: The answer points at a distractor
- **WHEN** the recorded answer is changed to an option that is not N
- **THEN** the validator rejects the board

#### Scenario: The options no longer contain N
- **WHEN** N is removed from the options
- **THEN** the validator rejects the board

### Requirement: Five levels scaling the N range and arrangement
The game SHALL define five levels whose N range scales within 1–6 (the ceiling never shrinks with level) and whose arrangement scales from paired ten-frame to scattered. The round-variety bucket of a board SHALL be its arrangement, every declared bucket SHALL be reachable at its level, and the declared round-variety capacity per level SHALL be reachable. A run SHALL play one board per level from L1 to L5 as a progressive run without streaks, countdowns or a lose state.

#### Scenario: The N ceiling scales across the ladder
- **WHEN** the levels are inspected
- **THEN** the N range stays within 1–6, the ceiling never shrinks with level and the top level reaches N = 6

#### Scenario: A board is moved to another level
- **WHEN** a board's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the board

#### Scenario: The served bucket is always declared
- **WHEN** chained one-exercise rounds are requested at a level
- **THEN** every served board's bucket is a declared arrangement bucket and more than one variant reaches the child

### Requirement: An auto-hide cover, not a countdown
The renderer SHALL flash the full group for about a second, then Đô Đô (`ExploreMascot`) SHALL cover the group. The cover SHALL be Đô Đô playing peekaboo and SHALL NOT show any countdown clock or timer numeral ticking down. The quantity SHALL be drawn with the shared `DotGroup` / `ObjectGroup` / `TenFrame` primitives, and objects SHALL be drawn from the countable glyph data so NO emoji is used as a UI icon or as the mascot. All motion SHALL use the native animation driver and SHALL be instant when the system requests reduced motion.

#### Scenario: The cover is Đô Đô, never a timer
- **WHEN** the group is covered after the flash
- **THEN** Đô Đô plays peekaboo over the group and no countdown numeral is shown

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** the flash and cover still happen but without the cover animation

### Requirement: Tap-a-number feedback that never ends the run
The renderer SHALL let the child tap a number option: the option equal to N SHALL lift the cover to reveal the group, make Đô Đô cheer, mark the board solved and report `onAnswer(true)`. A wrong option SHALL play a gentle shake, make Đô Đô think, emit the `onTryAgainSound` cue and report `onAnswer(false)` WITHOUT ending the run, filling in the answer, or locking the option — the child simply tries another number. The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: The correct number is tapped
- **WHEN** the child taps N
- **THEN** the cover lifts to reveal the group, Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: A wrong number is tapped
- **WHEN** the child taps an option that is not N
- **THEN** a gentle shake plays, `onAnswer(false)` is called, nothing locks and the answer is not filled in

### Requirement: Support keeps the group visible longer without marking the answer
Support SHALL be answer-preserving and SHALL only change how long the quantity is visible: at support level 1 Đô Đô SHALL re-peek the group briefly, and at support level 2 the group SHALL STAY OPEN with no auto-hide so a struggling child can count it out. Support SHALL NOT dim, reorder, remove or otherwise mark any number option. At support level 0 the board SHALL flash and auto-hide.

#### Scenario: Raised support keeps the quantity visible
- **WHEN** the play screen passes `supportLevel` 1 or 2
- **THEN** the group is re-peeked (level 1) or stays open (level 2) and the number options are unchanged

#### Scenario: No support
- **WHEN** the play screen passes `supportLevel` 0
- **THEN** the group is flashed and auto-hidden

### Requirement: Best-effort audio and authoritative board
The on-screen prompt SHALL be shown and, together with the number cards, SHALL be authoritative; the audio SHALL reference the best-effort `subitize_flash_how_many` clip and a missing clip SHALL never block play. The variant identity of a board SHALL be its N, arrangement, display kind, object glyph and the set of option numbers, and its bucket SHALL be the arrangement.

#### Scenario: Prompt clip is not bundled
- **WHEN** the `subitize_flash_how_many` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen and the board is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-subitize-flash-contracts.cjs` (`npm run test:explore-subitize-flash`: at least 200 seeds per level, replay equality, an independent re-derivation of the N range and the exactly-N group, the include-N-among-near-distractors rule, the answer-position-not-fixed rule, tamper rejection, the answer-preserving support helper, chained one-exercise rounds and renderer presentation rules) and by `kido-server/src/modules/explore/explore.subitize-flash.spec.ts` (corpus conformance with an independent subitizing proof, tamper rejection, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-subitize-flash` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.subitize-flash.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
