## MODIFIED Requirements

### Requirement: Supported pattern grammars
The game SHALL support distinct, coherent grammar FAMILIES — `shape_cycle` (a repeating cycle over shapes with a single fixed colour), `color_cycle` (a repeating cycle over colours with a single fixed shape), `object_cycle` (a repeating cycle over distinct emoji objects), `quantity` (increasing/decreasing dot groups) and `numeric` (numeric sequences with step 1 or 2) — with the AB, AAB, ABB and ABC cycle templates. Every exercise SHALL identify a versioned grammar, its family, and a materialized sequence, and SHALL declare a `mode` discriminator that is either `complete` (a hidden slot to fill) or `fix_error` (one rule-breaking element to spot). The versioned generator and validator SHALL be `pattern-finder-v5` and `pattern-finder-validator-v4`, mirrored in the kido-server explore registry; Explore stores no play history, so byte-identical replay-by-seed need hold only within a version.

#### Scenario: AB pattern is materialized
- **WHEN** two tokens of a family and an AB grammar are selected
- **THEN** the visible sequence follows alternating A/B positions except for the single hidden slot (or the one rule-breaking slot in `fix_error`)

#### Scenario: Colour rule is materialized
- **WHEN** a `color_cycle` grammar with template AB is selected
- **THEN** every token is the same shape and the visible sequence alternates between two colours except for the single hidden slot (or the one rule-breaking slot in `fix_error`)

#### Scenario: Shape rule is materialized
- **WHEN** a `shape_cycle` grammar with template AB is selected
- **THEN** every token is the same colour and the visible sequence alternates between two shapes except for the single hidden slot (or the one rule-breaking slot in `fix_error`)

#### Scenario: Version is bumped
- **WHEN** the bundled and server registry describe `pattern_finder`
- **THEN** both report `generatorVersion` `pattern-finder-v4` and `validatorVersion` `pattern-finder-validator-v3`

### Requirement: Unique missing answer
The generator SHALL never deliver an ambiguous or zero-answer exercise, and the INDEPENDENT validator SHALL prove uniqueness for the exercise's mode. In `complete` mode the hidden slot SHALL have sufficient leading context and the validator SHALL enumerate the permitted candidate pool to prove exactly one valid completion, equal to the recorded answer. In `fix_error` mode uniqueness SHALL be GLOBAL across the family's grammars, not just the exercise's own: the shown sequence SHALL be a valid pattern under NONE of the family's recognized grammars (AB/AAB/ABB/ABC for a cycle family, every taught step for a progression), and the validator SHALL enumerate every single-cell change to prove EXACTLY ONE change makes the sequence valid under SOME family grammar, at the recorded `errorIndex` with the recorded `correctToken`. A sequence one edit from two different valid rules (e.g. one edit from an AAB rule and a different edit from an ABB rule) has two defensible errors and SHALL be rejected; when a materialized sequence yields no globally-unique repair the generator SHALL fall back to a `complete` puzzle for that seed.

#### Scenario: Sequence is ambiguous
- **WHEN** more than one allowed token can complete the hidden position under the declared grammar
- **THEN** validation fails

#### Scenario: Fix-error sequence has more than one broken position
- **WHEN** a `fix_error` sequence admits more than one single-cell repair, or admits none because it is already correct
- **THEN** validation fails

#### Scenario: Recorded correction is not the unique repair
- **WHEN** a `fix_error` exercise records an `errorIndex` or `correctToken` that is not the unique single-cell repair proven by enumeration
- **THEN** validation fails

### Requirement: Level-bounded attributes
Each exercise SHALL read exactly ONE attribute so the child forms one coherent rule: a `shape_cycle` varies shapes over a single colour, a `color_cycle` varies colours over a single shape, an `object_cycle` varies distinct sprites, and progressions vary a number/quantity. Distinct token identities within an exercise SHALL be visually distinct on that attribute, and the colour palette SHALL be colour-blind-friendly so a colour rule stays legible. Background, absolute position and incidental size MUST NOT act as answer clues; all tokens SHALL render at one uniform size.

#### Scenario: Colour rule keeps one shape
- **WHEN** a `color_cycle` exercise is generated
- **THEN** every token (sequence and options) shares one shape, the distinct identities use distinct colours from the colour-blind-safe palette, and no token carries a size or position clue

#### Scenario: Unintended size difference
- **WHEN** equivalent grammar tokens render at different sizes without size being the tested attribute
- **THEN** the exercise fails presentation validation

### Requirement: Pattern conformance
The grammar/materializer/validator SHALL demonstrate a large deterministic corpus (at least 200 exercises per level) spanning families, both modes, hidden/error positions and token vocabularies, with deterministic replay and mode-appropriate uniqueness checks. Every declared round-variety bucket — each level's families plus `fix_error` — SHALL be reachable and, in chained one-exercise rounds, reach at least 20% of served exercises.

#### Scenario: Conformance corpus runs
- **WHEN** the pattern conformance suite executes
- **THEN** at least 200 exercises per level generate, validate and replay identically, both `complete` and `fix_error` are reached, and each is proven to have a unique answer for its mode

#### Scenario: One-exercise rounds cover every bucket
- **WHEN** single-exercise rounds are chained with the replay-exclusion window and bucket rotation
- **THEN** every declared bucket (families + `fix_error`) reaches at least 20% of the served rounds at each level

## ADDED Requirements

### Requirement: Fix-error mode
The game SHALL offer a `fix_error` mode ("tìm chỗ sai") that shows a fully materialized sequence — no hidden slot — in which exactly one element breaks the declared grammar while every other position follows it. The rule-breaking token SHALL be a plausible token drawn from the same vocabulary (cycle) or in-range value set (progression), placed at a position with sufficient leading context. The child SHALL identify the wrong element with a single tap; a correct tap SHALL auto-correct that slot to the token it should be (`correctToken`) and report success, and a wrong tap SHALL give gentle, non-losing feedback and settle before the next attempt. The mode SHALL persist nothing and SHALL run offline from bundled code; its prompt/audio is best-effort and a missing clip SHALL never block play.

#### Scenario: Child taps the rule-breaking element
- **WHEN** a `fix_error` exercise is shown and the child taps the token at `errorIndex`
- **THEN** the slot is corrected to `correctToken`, the exercise is reported correct, and nothing is persisted

#### Scenario: Child taps a correct element
- **WHEN** the child taps a token that follows the rule
- **THEN** the exercise is not reported correct, the tap gives gentle feedback with no "lose" state, and the child may tap again

#### Scenario: Fix-error runs offline without the audio pack
- **WHEN** a `fix_error` exercise is generated with the colour/fix_error prompt clips absent from the bundled pack
- **THEN** the exercise is still generated, validated and playable, the on-screen prompt remains authoritative, and the missing clip degrades to silence
