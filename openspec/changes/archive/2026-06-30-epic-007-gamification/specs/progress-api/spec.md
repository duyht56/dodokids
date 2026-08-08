## MODIFIED Requirements

### Requirement: Complete Lesson Persists Stars
`PATCH /progress/:childId/complete-lesson` SHALL persist the resolved star score into `progress.lessonStars` using best-score semantics, and SHALL include `stars` in its response. XP, streak, and day advancement remain awarded only on the first completion of a lesson (idempotent), but the star score MAY still be raised on replay.

#### Scenario: First completion stores stars and XP
- **WHEN** a lesson is completed for the first time with 3 stars
- **THEN** `lessonStars[lessonId]` becomes 3, XP is awarded once, and the response includes `stars: 3`

#### Scenario: Replay raises stars only
- **WHEN** an already-completed lesson is replayed with a higher star score
- **THEN** `lessonStars[lessonId]` is raised, the response includes the new `stars`, and `xpEarned` is 0
