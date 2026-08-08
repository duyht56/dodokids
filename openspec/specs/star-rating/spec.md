# star-rating

## Purpose

Defines how lesson stars are computed from first-try correctness, persisted with best-score semantics, surfaced on the Adventure Map, and protected against client tampering.

## Requirements

### Requirement: Star Calculation From First-Try Correctness
The system SHALL compute lesson stars from the count of activities answered correctly on the first attempt (`correctFirstTry`): `>= 5` → 3 stars, `>= 3` → 2 stars, otherwise 1 star. Stars SHALL never be 0 — a completed lesson always awards at least 1 star.

#### Scenario: Five correct first-try
- **WHEN** 5 of 6 activities have `attemptCount === 1 && outcome === 'correct'`
- **THEN** the lesson is awarded 3 stars

#### Scenario: Two correct first-try
- **WHEN** only 2 activities are correct on first try
- **THEN** the lesson is awarded 1 star (never 0)

### Requirement: Best-Score Persistence
The system SHALL persist per-lesson stars in `progress.lessonStars` (lessonId → 1|2|3) and SHALL keep the maximum: replaying a lesson with a lower score MUST NOT lower the stored stars.

#### Scenario: Replay cannot lower stars
- **WHEN** a lesson previously stored 3 stars is replayed and scored 1 star
- **THEN** `lessonStars[lessonId]` remains 3

#### Scenario: Replay can raise stars without re-awarding XP
- **WHEN** a previously completed lesson is replayed with a higher star score
- **THEN** `lessonStars[lessonId]` is updated to the higher value AND no additional XP is granted AND streak/day are unchanged

### Requirement: Server-Side Star Verification
On `completeLesson`, the BE SHALL recompute stars from `activityResults` and treat that as authoritative so a client can neither under-report nor inflate beyond what the results justify. The client value is used only as a fallback when no results are supplied.

#### Scenario: Client sends inflated stars
- **WHEN** the client sends `stars: 3` but `activityResults` only justify 1
- **THEN** the stored stars reflect the server computation (1), not the inflated client value

### Requirement: Stars Surfaced To UI
`completeLesson` SHALL return the resolved `stars` value, and the Adventure Map week node SHALL display the stored stars for each completed lesson. Lesson-id matching across formats (`w01-d1`, `w1-d1`, `mock-w1-d1`) SHALL be tolerant so stars and completion render correctly offline.

#### Scenario: Map shows earned stars
- **WHEN** a lesson stored 2 stars and the child views the map
- **THEN** that week node renders 2 star icons

#### Scenario: Completed week shows at least one star
- **WHEN** a week is COMPLETED but stars have not yet synced
- **THEN** the node shows at least 1 star (never 0)
