## MODIFIED Requirements

### Requirement: Tap-and-count interaction
The count game SHALL present a seeded layout of objects and declare an interaction `mode` on its params. In `count_all` mode it SHALL allow each target object to be counted once and then ask the child to select the corresponding number card; re-tapping an already counted object MUST NOT increment the count. In `count_target` mode it SHALL present a single-asset set strictly larger than the target N and ask the child to tap exactly N objects and submit; tapping toggles an object in or out of the selection and shows a running count, and the submission is accepted only when exactly N distinct objects are selected. Neither mode SHALL reveal or mark the answer for the child before it is produced.

#### Scenario: Object is tapped twice
- **WHEN** the child taps the same object more than once in `count_all` mode
- **THEN** it remains counted once and the interaction does not report an inflated count

#### Scenario: Child submits a set in count_target
- **WHEN** the child taps objects in `count_target` mode and submits
- **THEN** the submission is accepted only when exactly N distinct objects are selected, and the screen never marks which objects to pick nor reveals N beyond the prompt

### Requirement: Count generator conformance
The generator/validator/layout suite SHALL demonstrate at least 200 valid exercises per level and per interaction mode, spanning counts, assets and supported viewport classes, with deterministic replay, and SHALL reach both interaction modes at every level.

#### Scenario: Conformance corpus runs
- **WHEN** the count-game conformance test executes
- **THEN** at least 200 exercises per level and per mode pass answer, eligibility, non-overlap and replay checks, and both `count_all` and `count_target` are produced at every level

## ADDED Requirements

### Requirement: Count interaction modes
The count game SHALL choose its interaction `mode` deterministically from the exercise seed, with two modes: `count_all` (count every target object, then select the number card) and `count_target` (tap exactly N of a strictly larger single-asset set and submit). The `count_all` target SHALL be drawn across the full level range; the `count_target` target N — a small produce-a-set (one-to-one correspondence) skill that `count_all` does not cover — SHALL be capped at 10 and drawn from `[2, min(level max, 10)]` (lower bound clamped so it never exceeds the upper), so a high level never asks a young child to tap dozens of objects. In `count_target` the independent validator SHALL require the object set to be strictly larger than N, with no distractors and no number cards, so building a set of exactly N is a genuine choice. Each level SHALL declare both modes as round-variety buckets so round planning covers both, and the level ladder SHALL cover 1–20 (L1 1–5 through L4 1–20) and extend to 1–50.

#### Scenario: count_target offers a strictly larger set
- **WHEN** a `count_target` exercise is generated
- **THEN** the object set is strictly larger than N, contains no distractors and no number cards, and the validator rejects the same exercise when its set is trimmed to exactly N

#### Scenario: count_target keeps N small
- **WHEN** a `count_target` exercise is generated at any level
- **THEN** N is drawn from `[2, min(level max, 10)]` and never exceeds 10, while `count_all` still spans the full level range up to 1–50

#### Scenario: Both modes are declared buckets and reach the child
- **WHEN** conformance checks compare each level's generated modes against its declared round-variety buckets across chained one-exercise rounds
- **THEN** both `count_all` and `count_target` are declared for every level and each reaches the child

#### Scenario: The ladder covers 1–20
- **WHEN** the count level ladder is inspected
- **THEN** L1 spans 1–5 and L4 spans 1–20, confirming BRD §7.3, with the ladder extending to 1–50 at L10

### Requirement: Count generator version tracks the interaction mode set
Changing which interaction modes the seeded stream can produce SHALL bump the count `generatorVersion` and `validatorVersion`, and replay-by-seed SHALL remain byte-identical within a version. Explore persists no play history, so a version bump with every mirror updated is the only coordination needed when the seeded stream changes.

#### Scenario: The seeded mode stream changes
- **WHEN** the set of interaction modes the generator can produce from a seed is changed
- **THEN** the count `generatorVersion` and `validatorVersion` are bumped and every mirror (mobile config/manifest/dependency versions and server metadata) is updated

#### Scenario: Replay within a version
- **WHEN** the same seed and level are generated twice under one `generatorVersion`
- **THEN** the two exercises are byte-identical
