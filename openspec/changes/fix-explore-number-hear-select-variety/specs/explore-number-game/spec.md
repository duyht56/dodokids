## MODIFIED Requirements

### Requirement: Number level progression
The game SHALL configure L1 as 1–5, L2 as 1–10, L3 as 1–20, L4 as before/after/missing/order within 20, and L5 as 1–50 with longer sequences. A level SHALL only select modes enabled for that level. Each level SHALL declare round-variety buckets that cover every mode that level can generate under any supported audio-capability profile, including both the audio-dependent mode and its offline visual fallback for levels that lead with `hear_select`.

#### Scenario: L1 is generated
- **WHEN** an L1 number exercise is requested
- **THEN** all numbers and answers are within 1–5 and no L4/L5-only mode is used

#### Scenario: L1 with the approved audio pack bundled
- **WHEN** the bundled audio capability covers the L1 range and an L1 round is requested
- **THEN** a valid `hear_select` exercise is planned and accepted by the round-variety policy

#### Scenario: L1 without a bundled audio pack
- **WHEN** no supported audio pack is bundled and an L1 round is requested
- **THEN** the level degrades to its visual `match_sample` fallback and that exercise is accepted by the round-variety policy

#### Scenario: A level declares a mode its buckets omit
- **WHEN** conformance checks compare each level's generatable modes against its declared round-variety buckets
- **THEN** any mode reachable under some audio-capability profile but absent from the declared buckets fails the check

## ADDED Requirements

### Requirement: Run creation under every capability profile
Every configured number level SHALL yield a valid run under every supported audio-capability profile. A capability change that enables or disables an audio-dependent mode MUST NOT make a level unplayable.

#### Scenario: Audio pack becomes available
- **WHEN** an approved audio pack is bundled that enables an audio-dependent mode on a level that previously used its visual fallback
- **THEN** that level still returns a valid run and the child is not shown a run-creation error

#### Scenario: Run creation fails
- **WHEN** a run cannot be created for a requested game and level
- **THEN** the child sees the neutral retry message and the underlying failure reason is recorded for diagnosis without persisting or transmitting any child play state
