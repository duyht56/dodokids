## Purpose

Defines "Cắm nến" (`candle_count`), the offline produce-a-set game in which a
child places EXACTLY N candles into a fixed ten-frame of slots on a cake, then
submits, with a generator and an independent validator that guarantee the drawn N
comes from the reused counting ranges, the slots are exactly the fixed ten-frame
positions, and the recorded answer's placed-candle count equals N.

## ADDED Requirements

### Requirement: Deterministic local candle-count puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the Đô Đô mascot). A puzzle SHALL declare its level, its target candle count N, and its slots — the fixed ten-frame layout the renderer draws candles into. The target N SHALL be drawn from the reused `tap_count` COUNT_LEVELS ranges, capped at ten (N ≤ 10), and the slot positions SHALL be the fixed ten-frame-style layout independent of the seed. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `candle_count` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: The placed-candle count equals N and slots are the fixed ten-frame
Every puzzle SHALL record an answer whose correct placed-candle count equals the drawn N, and N SHALL sit inside the level's target range and never exceed the slot count so the set can always be produced and never overfilled. The slots SHALL be EXACTLY the fixed ten-frame positions — ten slots in a 2×5 grid, each with a stable id and normalized position — and the validator SHALL prove this independently of the generator by re-deriving the layout (`candleSlotLayout` / `candleSlotsAreFixedLayout`) and requiring the declared slots to equal it. The validator SHALL reject an answer whose count does not equal N, an N outside the level range or above the slot count, and any slot that is moved, dropped, added or renamed away from the fixed layout.

#### Scenario: Generated puzzle is validated
- **WHEN** any generated puzzle is checked
- **THEN** the recorded answer count equals the params' N, N is within the level range and at most the slot count, and the declared slots equal the independently re-derived ten-frame

#### Scenario: The answer count is changed
- **WHEN** the answer's placed-candle count is set to a value other than N
- **THEN** the validator rejects the puzzle

#### Scenario: A slot is moved off the ten-frame
- **WHEN** a slot's position, id or membership is changed away from the fixed layout
- **THEN** the validator rejects the puzzle

### Requirement: N reuses the counting ranges and scales across five levels
The game SHALL define five levels whose target N range is derived from the reused `tap_count` COUNT_LEVELS ranges plus a per-level ceiling and floor, with the ceiling never exceeding ten and growing from L1 to L5 so the range scales. The declared round-variety capacity per level SHALL equal the size of that N range. A run SHALL play one board per level from L1 to L5 as a progressive run without streaks, countdowns or a lose state.

#### Scenario: N ranges hold across a corpus
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** every N sits inside the level's range, N never exceeds ten or the slot count, and every N in the range is reachable

#### Scenario: A puzzle is moved to another level
- **WHEN** a puzzle's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the puzzle

### Requirement: Produce-a-set-then-submit feedback that never ends the run
The renderer SHALL let the child add a candle by tapping an empty slot and remove it by tapping a filled slot, with no way to place more candles than the ten slots, and submit with a "Xong" button (disabled until at least one candle is placed). A submit whose placed count equals N SHALL make Đô Đô (`ExploreMascot`) cheer, mark the puzzle solved and report `onAnswer(true)`. A submit whose placed count does not equal N SHALL play a gentle "try again" beat and report `onAnswer(false)` WITHOUT ending the run, filling in the answer, or clearing the candles — the child keeps adjusting. The renderer SHALL read the running total aloud best-effort with the bundled number clips (`numberKey`) as candles are placed. All motion SHALL use the native animation driver and SHALL be skipped when the system requests reduced motion. No emoji SHALL be used as a UI icon or as the mascot (candles and the cake are drawn shapes). The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: Exactly N candles are placed
- **WHEN** the child places exactly N candles and taps Xong
- **THEN** Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: The wrong number is submitted
- **WHEN** the child taps Xong with a placed count that is not N
- **THEN** a gentle retry beat plays, `onAnswer(false)` is called, the candles stay editable and the answer is not filled in

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** taps and submits update state, sound and `onAnswer` as usual without the pop animation

### Requirement: Support anchor that shows the target without producing the set
At support level 1 or higher the renderer SHALL show the target as a dots/ten-frame anchor of N beside the prompt, so the child sees how many to count out while still placing every candle themselves; at support level 0 no anchor SHALL be shown. The anchor SHALL never place candles into the cake for the child.

#### Scenario: Raised support shows the anchor
- **WHEN** the play screen passes `supportLevel` 1 or 2
- **THEN** a dots anchor of N is shown beside the prompt and no candle is placed on the cake automatically

#### Scenario: No support
- **WHEN** the play screen passes `supportLevel` 0
- **THEN** no target anchor is shown

### Requirement: Single-mode variety and best-effort audio
The round-variety bucket of every puzzle SHALL be the single `count_out` mode and its variant identity SHALL be the target N, so two boards with the same N are the same variant. Across chained one-exercise rounds the served bucket SHALL always be the declared `count_out` and more than one N SHALL reach the child. The on-screen prompt SHALL name the specific N ("Cắm cho đủ N ngọn nến lên bánh nhé.") and SHALL be authoritative; the audio SHALL reference the best-effort `candle_count_prompt` / number / `candle_count_suffix` sequence and a missing clip SHALL never block play.

#### Scenario: One-exercise rounds vary N
- **WHEN** chained one-exercise rounds are requested at a level with the play screen's exclusion window, last bucket and rotation
- **THEN** every served puzzle is the `count_out` bucket and more than one N is served across the rounds

#### Scenario: Prompt clip is not bundled
- **WHEN** the `candle_count_prompt` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen naming N and the puzzle is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-candle-count-contracts.cjs` (`npm run test:explore-candle-count`: at least 200 seeds per level, replay equality, the "placed count = N, slots = the fixed ten-frame" rule with independent re-derivation, the reused-range and N ≤ 10 contract, tamper rejection, chained one-exercise rounds and renderer presentation rules) and by `kido-server/src/modules/explore/explore.candle-count.spec.ts` (corpus conformance, tamper rejection, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-candle-count` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.candle-count.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
