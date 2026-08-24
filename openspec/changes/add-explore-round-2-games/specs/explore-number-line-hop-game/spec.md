## Purpose

Defines the offline number-line game "Đô Đô nhảy lò cò" (`number_line_hop`) in which a child taps a stone on a labelled 0..max line so Đô Đô hops there stone by stone, counting aloud, to locate a named number or count on/back a given number of steps — without any persisted play history.

## ADDED Requirements

### Requirement: Hop modes and level ladder
The game SHALL generate each exercise locally and deterministically from a versioned generator and a random seed, on a number line of stones `0..max` where every stone is labelled at every level. Each exercise SHALL declare one mode: `locate` (Đô Đô starts on 0 and must reach a named target ≥ 1), `add` (Đô Đô starts on a stone ≥ 1 and must hop forward K steps) or `subtract` (Đô Đô starts on a stone ≥ 1 and must hop back K steps). The target SHALL always lie inside `[0, max]`, differ from the start, and for add/subtract equal `start ± K` with `1 ≤ K ≤ maxSteps`. The five levels SHALL be: L1 `0–5` locate with the target card always shown; L2 `0–10` locate; L3 `0–10` locate/add with K ≤ 4; L4 `0–15` locate/add/subtract with K ≤ 5; L5 `0–20` add/subtract with K ≤ 5. The game SHALL run as a continuous range run (one exercise per correct answer, range label = the level's `max`) with the play screen's in-memory promotion and demotion, and SHALL require no network response or remote asset.

#### Scenario: L4 subtract exercise is generated
- **WHEN** the generator receives level 4 and a seed that selects `subtract`
- **THEN** the exercise has `max` 15, a start stone in `1..15`, a step count `K` in `1..5`, target `start − K ≥ 0`, the on-screen prompt "Đô Đô nhảy bớt K bước nhé." and audio refs `hop_steps · bớt · K · hop_steps_suffix`

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both exercises are byte-identical after stripping `variantKey`/`bucketKey`, and the independent validator accepts them

#### Scenario: Exercise is played in airplane mode
- **WHEN** the child opens `number_line_hop` with no connectivity
- **THEN** a fresh exercise is generated, validated and shown from bundled code and the bundled Đô Đô asset without an API request

### Requirement: Stone-by-stone hop with counting aloud
When the child taps a stone, Đô Đô SHALL hop to it one stone at a time (a short parabola with squash/stretch, about 240 ms per stone, on the native animation driver). On EVERY landing the renderer SHALL request the bundled number-name clip of that stone through the feedback-audio channel, paced one clip per landing and never faster than 220 ms apart, so the child hears the line counted on (or back). Stones SHALL be tappable targets of at least 48 pt; lines longer than the viewport SHALL scroll horizontally and follow Đô Đô so the current stone stays visible. While Đô Đô is hopping, further taps SHALL be ignored. When the system requests reduced motion, Đô Đô SHALL step from stone to stone at the same pace without the hop motion, and the counting voice SHALL keep its rhythm. A missing number clip SHALL never block play.

#### Scenario: Child taps stone 6 from stone 3
- **WHEN** Đô Đô stands on 3 and the child taps stone 6
- **THEN** Đô Đô hops 3→4→5→6 and the clips for 4, 5 and 6 are requested in that order, one per landing

#### Scenario: Child taps a stone while Đô Đô is mid-hop
- **WHEN** a hop sequence is still running
- **THEN** the new tap is ignored and the current sequence completes unchanged

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion and the child taps a stone
- **THEN** Đô Đô appears on each intermediate stone in turn at the normal pace with no translate animation, and each landing is still counted aloud

### Requirement: Off-target landing is not a wrong answer
Landing on the target stone SHALL complete the exercise as correct (Đô Đô cheers briefly, the last number is spoken, then the play screen is notified). Landing on any other stone SHALL NOT be reported as a wrong answer and SHALL NOT create a "lose" state: Đô Đô stays on that stone, the renderer shows and speaks "Đây là số N." (text and audio keys built from the same source), and the child taps again. For add/subtract the task SHALL remain relative to the ORIGINAL start stone, which SHALL stay marked with a pin so the child can count from it. Off-target landings SHALL be counted only in component memory to raise visual support and SHALL never be persisted or transmitted.

#### Scenario: Child lands on the wrong stone in add mode
- **WHEN** the task is "start 3, thêm 2" and the child taps stone 6
- **THEN** Đô Đô hops to 6, "Đây là số 6." is shown and spoken, the target stays 5, the pin stays on stone 3 and no `onAnswer(false)` is sent

#### Scenario: Child then taps the target
- **WHEN** Đô Đô stands on 6 and the child taps stone 5
- **THEN** Đô Đô hops back to 5, the clip for 5 is spoken, Đô Đô cheers and the exercise is reported correct

#### Scenario: Exercise is left mid-way
- **WHEN** the child exits while Đô Đô stands on an off-target stone
- **THEN** no position, miss count or outcome survives the unmount

### Requirement: Visible target fallback and support levels
The target SHALL never be carried by audio alone. The renderer SHALL show the target visually — a number card for `locate`, or a "+K"/"−K" chip with K dots for add/subtract — whenever ANY of the following holds: the level's `showTargetCard` flag is set (L1), the exercise's prompt clips are not all bundled in the supported local audio pack, or the effective support level is at least 1. The effective support level SHALL be the greater of the play screen's `supportLevel` and `min(2, ⌊misses / 2⌋)`. Support level 1 SHALL pulse the target card and, for add/subtract, the start stone; support level 2 SHALL additionally pulse the target stone gently. Support SHALL never auto-solve the exercise, and under reduced motion the pulse SHALL be replaced by a static highlight.

#### Scenario: Prompt clips are not bundled
- **WHEN** the audio pack does not contain every key of the exercise's `audioRefs`
- **THEN** the number card or "+K"/"−K" chip is shown at every level, and the on-screen prompt still names the target or step count

#### Scenario: Two off-target landings at L3
- **WHEN** the child has landed off-target twice and the play screen's support level is 0
- **THEN** the effective support level is 1, the card/chip is visible and pulsing, and in add mode the start stone pulses

#### Scenario: Support reaches level 2
- **WHEN** the effective support level becomes 2
- **THEN** the target stone pulses gently while remaining an ordinary tappable stone

### Requirement: Conformance and variety contract
Every generated exercise SHALL pass the independent validator, which SHALL check the level contract (max, allowed modes, start/steps/target rules, the `showTargetCard` flag), the on-screen prompt and audio key sequence, and a byte-identical seed replay. Tampering with the target, mode, steps, start, card flag, prompt or audio SHALL be rejected. The round-variety policy SHALL declare exactly the level's modes as buckets, and across chained one-exercise rounds (exclusion window, last bucket, rotation) every declared bucket of a multi-mode level SHALL reach the child in at least 20% of rounds. A mobile contract script (`npm run test:explore-number-line-hop`, ≥ 200 seeds per level, 300 chained rounds per level) and a server spec (`explore.number-line-hop.spec.ts`, with registry assertions that the game is enabled, offline, local and present on both catalogs) SHALL enforce this.

#### Scenario: Target is incremented
- **WHEN** a valid exercise's `answer.target` is replaced by `target + 1`
- **THEN** the validator rejects it

#### Scenario: Chained L4 rounds
- **WHEN** 300 one-exercise rounds are requested at L4 through the local provider with the play screen's options
- **THEN** `locate`, `add` and `subtract` each account for at least 20% of the rounds
