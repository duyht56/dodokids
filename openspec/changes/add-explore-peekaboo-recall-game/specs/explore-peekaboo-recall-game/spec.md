## Purpose

Defines "Ú òa" (`peekaboo_recall`), the offline working-memory game in which a
small set of distinct objects is shown in slots for a ~3s look window beside a
numeral-free sand timer, Đô Đô covers them (peekaboo), ONE object is taken away,
the cover lifts to reveal the
remaining objects plus one empty slot, and the child taps, from an options row,
which object is now missing. A generator and an independent validator guarantee
the original set is distinct real objects, that exactly one was removed, and that
the options include the true missing object among only-foreign distractors.

## ADDED Requirements

### Requirement: Deterministic local peekaboo-recall board
The game SHALL generate every board locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the memory object pool and the Đô Đô mascot). A board SHALL declare its level, its set size, the original object arrangement (`slots`), the removed slot index, the missing object id and the answer options. Every seeded draw SHALL be namespaced by the level so two levels of the same set size never produce the same board. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Board starts in airplane mode
- **WHEN** the child opens `peekaboo_recall` with no connectivity
- **THEN** a fresh board is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: An original set with exactly one object removed
The original set SHALL be `slots`: `setSize` distinct, real objects from the bundled memory pool (each single, recognisable and background-free). EXACTLY ONE object SHALL be taken away: the missing object SHALL equal `slots[removedSlotIndex]`, the remaining set SHALL be the original minus that object (its size SHALL be `setSize − 1`) and the missing object SHALL NOT be among the remaining. The validator SHALL re-derive the remaining set from the visible slots, independently of the generator, and SHALL reject a board whose set is not distinct real objects, whose removed slot is out of range, whose recorded missing object is not the removed slot's object, or whose remaining set still contains the missing object.

#### Scenario: Generated board is validated
- **WHEN** any generated board is checked
- **THEN** the set is distinct real objects, exactly one object is removed and the remaining set is the original minus the missing object

#### Scenario: A duplicated object in the set
- **WHEN** two slots hold the same object so the set is no longer distinct
- **THEN** the validator rejects the board

#### Scenario: The removed slot is moved
- **WHEN** the removed slot index is changed without updating the missing object
- **THEN** the validator rejects the board

### Requirement: Options include the missing object among foreign distractors
The answer options SHALL be `optionCount` distinct real objects that INCLUDE the true missing object, and every distractor SHALL be FOREIGN to the original set — so exactly one option belonged to the recalled set and it is the missing object, which is the recorded answer. The option order SHALL be a seeded shuffle so the answer is never at a fixed position, reproduced by the byte-identical replay. The validator SHALL reject options that are not distinct, that omit the missing object, whose recorded answer is not the missing object, or that include a second object drawn from the original set.

#### Scenario: A distractor is actually still in the set
- **WHEN** a distractor is replaced by an object that is still in the original set
- **THEN** the validator rejects the board because two options now belong to the set

#### Scenario: The answer points at a distractor
- **WHEN** the recorded answer is changed to an option that is not the missing object
- **THEN** the validator rejects the board

#### Scenario: The answer position is not fixed
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** the missing object appears at more than one option position across the corpus

### Requirement: Five levels scaling set size and options
The game SHALL define five levels whose set size scales from 2 to 5 objects and whose option count grows, never shrinking with level. The round-variety bucket of a board SHALL be its set size and every declared bucket SHALL be reachable at its level, and the declared round-variety capacity per level SHALL be reachable. A run SHALL play one board per level from L1 to L5 as a progressive run without streaks, an answer time limit or a lose state.

#### Scenario: Set size scales across the ladder
- **WHEN** the levels are inspected
- **THEN** the set size scales from 2 objects at L1 to 5 objects at L4–L5 and never shrinks with level

#### Scenario: A board is moved to another level
- **WHEN** a board's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the board

#### Scenario: The served bucket is always declared
- **WHEN** chained one-exercise rounds are requested at a level
- **THEN** every served board's bucket is the declared set-size bucket and more than one variant reaches the child

### Requirement: A sand-timed look, then a peekaboo cover
The renderer SHALL play a peekaboo sequence: a look window of about three seconds on the full set, then Đô Đô (`ExploreMascot`) covers the slots, playing peekaboo, then the cover lifts to reveal the remaining objects plus one empty slot. While a look window runs — the first look and the level-2 memory-aid re-show — the renderer SHALL show the shared sand timer (an hourglass glyph beside a bar that drains linearly) and SHALL NOT show any numeral ticking down. The sand timer SHALL only measure how long the set stays visible: it SHALL NOT limit the time to answer, and running out SHALL NOT fail, lock or end anything. All motion SHALL use the native animation driver; when the system requests reduced motion the cover and pop SHALL appear without animation, while the sand timer SHALL still drain because it is a progress indicator, not decoration. Objects SHALL be drawn from the memory-asset glyph data and NO emoji SHALL be used as a UI icon or as the mascot.

#### Scenario: The look window is timed without numerals
- **WHEN** a board starts
- **THEN** the full set stays visible for about three seconds beside a draining sand timer, no numeral is shown, and Đô Đô covers the slots when the sand runs out

#### Scenario: Running out of sand fails nothing
- **WHEN** the sand timer runs out
- **THEN** the set is covered, then revealed with one empty slot, and the options can be tapped with no time limit

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** the look window, sand timer, cover and reveal still happen, but without the cover/pop animation

### Requirement: Tap-an-option feedback that never ends the run
The renderer SHALL let the child tap an answer option once the set is revealed: an option equal to the answer SHALL pop the missing object back into its slot, make Đô Đô cheer, mark the board solved and report `onAnswer(true)`. A wrong option SHALL play a gentle "try again" shake, make Đô Đô think, emit the `onTryAgainSound` cue and report `onAnswer(false)` WITHOUT ending the run, filling in the missing object, or locking the option — the child simply tries another. The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: The correct option is tapped
- **WHEN** the child taps the object that is missing
- **THEN** it pops back into its empty slot, Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: A wrong option is tapped
- **WHEN** the child taps an option that is not the missing object
- **THEN** a gentle shake plays, `onAnswer(false)` is called, nothing locks and the missing object is not filled in

### Requirement: Support dims distractors without revealing the answer
At support level 1 or higher the renderer SHALL dim one or more distractor options, and it SHALL never dim the answer and SHALL always leave at least one distractor live beside the answer, so support narrows the choice without handing the answer over. At support level 2 the renderer SHALL also show the full set once more for one sand-timed look window as a memory aid, with the options disabled meanwhile. At support level 0 no option SHALL be dimmed.

#### Scenario: Raised support dims a distractor
- **WHEN** the play screen passes `supportLevel` 1 or 2
- **THEN** one or more distractor options are dimmed, the answer is never dimmed and at least one distractor stays live

#### Scenario: No support
- **WHEN** the play screen passes `supportLevel` 0
- **THEN** no option is dimmed

### Requirement: Best-effort audio and authoritative board
The on-screen prompt SHALL be shown and, together with the board itself, SHALL be authoritative; the audio SHALL reference the best-effort `peekaboo_recall_which` clip and a missing clip SHALL never block play. The variant identity of a board SHALL be its set size, its slot arrangement, the removed slot and the option order, and its bucket SHALL be the set size.

#### Scenario: Prompt clip is not bundled
- **WHEN** the `peekaboo_recall_which` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen and the board is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-peekaboo-contracts.cjs` (`npm run test:explore-peekaboo`: at least 200 seeds per level, replay equality, an independent re-derivation of the original set, the exactly-one-removed and only-foreign-distractor rules, the answer-position-not-fixed rule, tamper rejection, chained one-exercise rounds and renderer presentation rules, including the at-least-three-second look window and the shared sand timer) and by `kido-server/src/modules/explore/explore.peekaboo-recall.spec.ts` (corpus conformance with an independent what's-missing proof, tamper rejection, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-peekaboo` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.peekaboo-recall.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
