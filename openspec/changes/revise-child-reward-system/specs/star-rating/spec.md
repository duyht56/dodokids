## MODIFIED Requirements

### Requirement: Star Calculation From First-Try Correctness
The system SHALL compute lesson stars for the canonical 8-activity lesson from the count of activities answered correctly on the first attempt (`correctFirstTry`): `>= 6` → 3 stars, `>= 3` → 2 stars, otherwise 1 star. Stars SHALL never be 0; a completed lesson always receives at least 1 star. The same thresholds SHALL be covered by mobile and server tests.

#### Scenario: Six correct first-try
- **WHEN** 6 of 8 activities have `attemptCount === 1 && outcome === 'correct'`
- **THEN** the lesson is awarded 3 stars

#### Scenario: Three correct first-try
- **WHEN** exactly 3 of 8 activities are correct on the first try
- **THEN** the lesson is awarded 2 stars

#### Scenario: Two correct first-try
- **WHEN** only 2 of 8 activities are correct on the first try
- **THEN** the lesson is awarded 1 star

### Requirement: Best-Score Persistence
The system SHALL persist per-lesson stars in `progress.lessonStars` (lessonId → 1|2|3) and SHALL keep the maximum. Replaying a canonical lesson with a lower score MUST NOT lower the stored stars, and replay MUST NOT re-award XP, streak, position, or sticker effects.

#### Scenario: Replay cannot lower stars
- **WHEN** a lesson previously stored 3 stars is replayed and scored 1 star
- **THEN** `lessonStars[lessonId]` remains 3

#### Scenario: Replay can raise stars without re-awarding completion rewards
- **WHEN** a previously completed canonical lesson is replayed with a higher star score
- **THEN** `lessonStars[lessonId]` is updated to the higher value AND XP/streak/position/stickers remain unchanged

### Requirement: Server-Side Star Verification
On canonical completion sync, the server SHALL ignore the client-submitted aggregate `stars` as an authority, verify that reported activity IDs belong to the referenced imported lesson/content version, and recompute stars from `activityResults`. An invalid or incomplete canonical result set SHALL be rejected rather than rewarded.

#### Scenario: Client sends inflated stars
- **WHEN** the client sends `stars: 3` but canonical `activityResults` justify 1
- **THEN** the stored and returned stars are 1

#### Scenario: Result contains foreign activity
- **WHEN** an event includes an activity ID that is not part of the referenced lesson version
- **THEN** the server rejects the event and applies no durable reward state

### Requirement: Stars Surfaced To UI
Canonical completion sync SHALL return resolved current and best stars. Lesson Complete SHALL display the current event score, while persistent surfaces such as the Adventure Map SHALL continue using stored best-score semantics. Mock/demo scores MAY be shown for the current session but MUST NOT be written to `lessonStars` or badges.

#### Scenario: Canonical lesson shows earned stars
- **WHEN** a canonical lesson event resolves to 2 stars
- **THEN** Lesson Complete renders 2 earned stars and the best-score store is at least 2

#### Scenario: Demo lesson finishes
- **WHEN** a mock/demo lesson resolves locally to 3 session stars
- **THEN** the result may show 3 stars but no persistent star entry or badge progress is created
