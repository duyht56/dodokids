## MODIFIED Requirements

### Requirement: Number game modes
The number game SHALL support hear-and-select, match-sample, before-or-after, missing-number and order 3–5 number-card modes. Each exercise SHALL have an answer uniquely derivable from its displayed/audio parameters. An order exercise SHALL deal its cards in a non-ascending arrangement so the task is never already solved, and the validator SHALL reject pre-sorted cards.

#### Scenario: Missing-number exercise
- **WHEN** the generator creates a missing-number sequence
- **THEN** the validator confirms the visible sequence counts up by one, stays in range, and has exactly one valid missing value that is not at either end

#### Scenario: Order cards dealt pre-sorted
- **WHEN** an order exercise is presented whose cards already appear in ascending order
- **THEN** the validator rejects it

### Requirement: Meaningful number distractors
Selection modes SHALL generate unique distractors near the target and within the configured range. Distractors MUST exclude the answer and MUST NOT be arbitrary distant values when closer valid values exist. Distractors MUST NOT leak the answer through elimination: a missing-number exercise SHALL never offer any value already visible in its sequence, and a before-or-after exercise SHALL never offer its reference number. The generator MAY offer the digit-swapped numeral of a two-digit target (for example 12 for 21) as one distractor when that numeral is in range, since it measures reading the numeral rather than guessing by position. The independent validator SHALL enforce the exclusions.

#### Scenario: Target is near range boundary
- **WHEN** target 1 is generated in range 1–5
- **THEN** distractors remain unique and in range without duplicating target

#### Scenario: Missing-number options
- **WHEN** a missing-number exercise shows the sequence 5, 6, ?, 8
- **THEN** none of 5, 6 or 8 appears among the answer options, and every option is in range and unique

#### Scenario: Before-or-after options
- **WHEN** a before-or-after exercise asks which number comes after 7
- **THEN** 7 does not appear among the answer options

#### Scenario: Leaked value is rejected
- **WHEN** an exercise offers a visible sequence value or its reference number as an option
- **THEN** the validator rejects the exercise

#### Scenario: Exclusions stay feasible at every level
- **WHEN** any level generates a selection exercise in its smallest configured range
- **THEN** enough in-range values remain after excluding the target and on-screen numbers to fill the option count, and generation never fails

### Requirement: Number generator conformance
The game generator and independent validator SHALL demonstrate at least 200 valid deterministic exercises for every level and every mode that level can emit under each supported audio-capability profile, including boundary values (targets at the range minimum and maximum, before-or-after references at the range edges, missing-number and order sequences touching both ends), with replay equality for every case. The conformance check SHALL also assert the distractor exclusions, that order cards are never pre-sorted, and that the validator rejects the tampered form of each rule. Chaining one-exercise rounds the way the play screen does, every mode the level can emit under the bundled audio pack SHALL reach the child in at least 20% of rounds.

#### Scenario: Conformance corpus runs
- **WHEN** the number-game property/conformance test runs at a fixed generator version
- **THEN** at least 200 exercises per level and mode validate and reproduce byte-identically from their recorded seeds

#### Scenario: Boundary values are reachable
- **WHEN** the conformance corpus is swept for a level
- **THEN** it observes targets at both range ends, before-or-after references at the edges, and missing-number and order sequences starting at the range minimum and ending at the range maximum

#### Scenario: One-exercise rounds reach every mode
- **WHEN** 300 one-exercise rounds are chained for a level with the replay exclusion window, the last bucket and a rotating bucket order
- **THEN** every mode the level can emit under the bundled pack is served in at least 20% of rounds

## ADDED Requirements

### Requirement: Tapped number feedback
When the child taps a number card, the renderer SHALL ask Đô Đô to read that number aloud through the best-effort feedback audio path (a missing clip never blocks play). In selection modes a wrong card SHALL dim and lock for the rest of the exercise; in the order mode an out-of-order card SHALL be visibly nudged but stay available. The renderer SHALL show the real Đô Đô mascot (never an emoji placeholder) and SHALL NOT carry its own generic replay control, which lives in the play screen's top bar; the hear-and-select mode keeps its large listen button because listening is the task.

#### Scenario: Card tapped
- **WHEN** the child taps the card 7
- **THEN** the feedback audio for the number name 7 is requested and the select cue plays

#### Scenario: Wrong card in a selection mode
- **WHEN** the child taps a card that is not the answer
- **THEN** that card dims and no longer accepts taps for this exercise, the answer is reported as incorrect, and the remaining cards stay tappable

#### Scenario: Out-of-order card in the order mode
- **WHEN** the child taps a card that is not the next number in the sequence
- **THEN** the card is nudged, the answer is reported as incorrect, and the card can still be tapped later in its correct position

#### Scenario: Audio clip missing
- **WHEN** the number-name clip for the tapped card is not bundled
- **THEN** the tap is still accepted and play continues silently
