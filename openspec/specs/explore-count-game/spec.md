# explore-count-game

## Purpose

Defines deterministic local tap-and-count interactions, level progression, approved assets, offline declaration and generator/layout conformance.

## Requirements

### Requirement: Tap-and-count interaction
The count game SHALL present a seeded layout of objects, allow each target object to be counted once, then ask the child to select the corresponding number card. Re-tapping an already counted object MUST NOT increment the count.

#### Scenario: Object is tapped twice
- **WHEN** the child taps the same object more than once
- **THEN** it remains counted once and the interaction does not report an inflated count

### Requirement: Count level progression
The game SHALL configure L1 as 1–5 objects in rows, L2 as 1–10 lightly scattered, L3 as 6–15 scattered, L4 as 10–20 grouped, and L5 as two object types while counting only the named target type.

#### Scenario: L5 target is generated
- **WHEN** an L5 exercise includes target and distractor object types
- **THEN** the answer equals only the target identity count and audio unambiguously names that target

### Requirement: Deterministic non-overlapping layout
Layout SHALL derive from the exercise seed, use normalized coordinates, preserve minimum touch-target and separation constraints on supported phone/tablet viewports, and use a deterministic fallback layout if scattering cannot satisfy constraints.

#### Scenario: Dense layout cannot fit
- **WHEN** random placement cannot fit the requested objects within bounded attempts
- **THEN** the engine produces the versioned fallback grouped/grid layout rather than overlapping objects

### Requirement: Countable approved assets
The generator SHALL select target/distractor sprites only from approved pools tagged as single-object, clear, background-free and eligible for counting. All clones of an identity SHALL use the same canonical sprite and size policy.

#### Scenario: Ineligible scene asset is sampled
- **WHEN** a candidate asset has a background or is not countable
- **THEN** the validator rejects the exercise before delivery

### Requirement: Audio-gated offline declaration
The game SHALL remain `offlineCapable=false` while count-word or instruction audio required by its enabled levels is remote or missing. It SHALL become offline-capable only after the approved `0–50` audio pack is bundled and passes offline playback verification.

#### Scenario: Count audio is missing locally
- **WHEN** object generation and layout are local but count-word audio is not bundled
- **THEN** the catalog marks the game online-required and does not claim offline play

### Requirement: Count generator conformance
The generator/validator/layout suite SHALL demonstrate at least 200 valid exercises spanning levels, counts, assets and supported viewport classes, with deterministic replay.

#### Scenario: Conformance corpus runs
- **WHEN** the count-game conformance test executes
- **THEN** at least 200 exercises pass answer, eligibility, non-overlap and replay checks

