## ADDED Requirements

### Requirement: Stable pedagogical variant identity
Every enabled Explore game SHALL define and validate a deterministic `variantKey` derived from learning-relevant content. The key MUST ignore the random seed and presentation-only variation that does not change what the child practices.

#### Scenario: Cosmetic presentation changes
- **WHEN** two generated exercises differ only by option order, board position or other declared presentation-only fields
- **THEN** they produce the same pedagogical variant key

#### Scenario: Learning target changes
- **WHEN** the target item, construct, mode or normalized problem content changes according to the game policy
- **THEN** the exercises produce different pedagogical variant keys

### Requirement: Without-replacement round planning
The Explore provider SHALL select distinct pedagogical variant keys within a round whenever the eligible level contains at least the requested number of variants.

#### Scenario: Pool can fill a round
- **WHEN** a five-interaction round is requested from a level with at least five eligible variants
- **THEN** all five returned exercises have distinct validated variant keys

### Requirement: Game-authored mode and category coverage
Each enabled game SHALL declare the learning modes or categories that its selected level can expose. The round planner SHALL cover available distinct buckets before repeating a bucket when the requested round size permits.

#### Scenario: Multiple buckets are enabled
- **WHEN** a level exposes three eligible mode/category buckets and requests five interactions
- **THEN** the round contains at least one valid exercise from each bucket before any bucket is selected a third time

### Requirement: Immediate replay diversity
While the Explore play route remains mounted, a newly requested round SHALL exclude variant keys served by the immediately preceding round whenever sufficient unseen eligible variants remain.

#### Scenario: Child presses play again with sufficient unseen content
- **WHEN** the completed round contains five keys and the selected level has at least five other eligible keys
- **THEN** the next round contains none of the immediately preceding keys

### Requirement: Bounded pool exhaustion
Variety planning SHALL use bounded work and SHALL continue to return valid exercises when the eligible pool is smaller than the round plus replay exclusion window. Repetition SHALL begin only after the applicable eligible pool has been exhausted.

#### Scenario: Finite pool is exhausted
- **WHEN** fewer unseen eligible variants remain than the number of open round slots
- **THEN** the planner fills unseen variants first, then allows validated repeats without failing the round

### Requirement: Stateless server variety
Server-runtime generation SHALL return unique variant keys within each batch when capacity permits. Mobile MUST NOT send previously served variant keys, prior seeds, outcomes or a replay cursor to obtain variety.

#### Scenario: Server replay needs more unseen candidates
- **WHEN** route-local filtering removes candidates from a stateless server batch
- **THEN** mobile may perform a bounded additional clean generation request containing only `gameCode`, `level` and `count`

### Requirement: Variety without progression
The variety planner SHALL use only the static parent-selected level and game-authored content policy. It MUST NOT infer mastery, mutate difficulty, unlock content or select a level from answers, tries, hints, completion or previously served keys.

#### Scenario: Multiple rounds are completed
- **WHEN** a child completes and replays several rounds on the same mounted route
- **THEN** content keys vary but the selected level and all lesson/progress state remain unchanged

### Requirement: Variety conformance coverage
Every enabled Explore game SHALL have tests for stable key equivalence, within-round uniqueness, bucket coverage, immediate replay exclusion, exhaustion fallback and deterministic validator compatibility.

#### Scenario: Enabled game lacks a variety contract
- **WHEN** registry conformance runs for an enabled game without a valid key or bucket policy
- **THEN** registration or the conformance test fails before the game is released
