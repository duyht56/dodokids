## MODIFIED Requirements

### Requirement: Quantity comparison modes
The game SHALL support selecting the side with more objects, fewer objects, or recognizing equal quantities. Both sides MUST use the same canonical object sprite, drawn by seed from the game's OWN approved compare sprite pool (8–12 single, background-free, clearly distinct countable objects, separate from the tap_count `count-*` set), and differ only in count and permitted arrangement. The spoken prompt SHALL remain the generic per-mode clip so the pool needs no per-object audio, and the independent validator SHALL accept only a faithful copy of a pool entry.

#### Scenario: More mode
- **WHEN** left count is 3, right count is 5 and mode is `more`
- **THEN** the independently derived correct side is right

#### Scenario: Equal mode
- **WHEN** both counts are equal and equal mode is enabled
- **THEN** the exercise exposes an explicit equal response and validates only that response

#### Scenario: Sprite drawn from the compare pool
- **WHEN** an exercise is generated from a seed
- **THEN** its object sprite is a seeded choice from the compare pool, both sides clone that sprite, `assetRefs` names exactly that asset and `audioRefs` is the generic per-mode prompt clip

#### Scenario: Borrowed or tampered sprite
- **WHEN** an exercise carries a sprite that is not a faithful copy of a compare-pool entry (a tap_count `count-*` sprite, a swapped glyph or label)
- **THEN** validation fails

### Requirement: Comparison generator conformance
The generator/validator SHALL demonstrate at least 200 valid exercises per level spanning modes, boundaries and the whole sprite pool, with byte-identical replay by seed, range/gap/equal rules and pool-membership checks. Because a continuous run asks for ONE exercise at a time, conformance SHALL also chain one-exercise rounds the way the play screen does (replay-exclusion window, last-played bucket, rotation) and require every declared mode bucket of a level — `more`, `less`, and `equal` from L4 — to reach the child in at least 20% of 300 such rounds.

#### Scenario: Conformance corpus runs
- **WHEN** the comparison conformance suite executes
- **THEN** at least 200 exercises per level validate, reproduce byte-identically from versions and seeds, and every pool sprite is reachable

#### Scenario: One-exercise rounds reach every mode
- **WHEN** 300 one-exercise rounds are chained for a level with the exclusion window, the last-played bucket and a rotating bucket order
- **THEN** each declared bucket of that level is served in at least 20% of the rounds

## ADDED Requirements

### Requirement: Tap-to-count spoken numbers
When the child taps a not-yet-counted sprite to count it, the renderer SHALL play the select cue and speak the running count of THAT side through the feedback channel using the bundled number-name clip for that count. Playback is best-effort: a missing clip never blocks counting or answering, and nothing about the count is persisted or transmitted.

#### Scenario: Third sprite counted on the left
- **WHEN** the child taps a third, not-yet-counted sprite on the left side
- **THEN** the left counter shows 3 and the number-name clip for 3 is requested through the feedback channel

#### Scenario: Number clip missing
- **WHEN** the number-name clip for the running count is not bundled
- **THEN** the tap still counts the sprite and play continues silently

### Requirement: Mascot and prompt presentation
The renderer SHALL present the mascot with the shared Đô Đô component (never an emoji placeholder or emoji UI icon), SHALL NOT render its own prompt-replay control because the play screen's global replay button serves every exercise with prompt audio, and both side-pick buttons SHALL share the same colour so colour never hints at an answer.

#### Scenario: Exercise rendered
- **WHEN** a quantity comparison exercise is shown
- **THEN** the mascot is the shared Đô Đô component, no renderer-level replay button is present, and the two "Bên này!" buttons are styled identically
