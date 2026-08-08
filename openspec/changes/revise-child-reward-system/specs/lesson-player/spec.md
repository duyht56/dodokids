## MODIFIED Requirements

### Requirement: Real Star Reporting
The Lesson Player SHALL accumulate actual `activityResults` (`activityId`, `attemptCount`, `outcome`) and compute the 8-activity score using `>=6` first-try correct → 3 stars, `>=3` → 2 stars, otherwise 1. For a reward-eligible canonical lesson it SHALL durably enqueue the versioned completion event before navigation, then pass the event/local projection to Lesson Complete. It SHALL use the server-returned current/best stars when the event syncs and MUST NOT call independent incremental reward mutations for that completion.

#### Scenario: Mixed performance reports correct stars
- **WHEN** the child finishes an 8-activity lesson with 3 first-try correct answers
- **THEN** the player projects/sends 2 stars with the actual activity results

#### Scenario: Canonical result is queued before navigation
- **WHEN** the final canonical activity completes
- **THEN** a completion event containing the lesson/content/plan identity and results is persisted before Lesson Complete opens

#### Scenario: Synced snapshot replaces local projection
- **WHEN** the server returns a successful reward snapshot
- **THEN** the player/store uses returned canonical fields instead of calling `completeDay`, `addXp`, `setStreak`, and `setLessonStars` independently

## ADDED Requirements

### Requirement: Player distinguishes canonical and demo completion
The player SHALL use lesson reward context to distinguish canonical completion from stub/mock/demo play. Demo completion MUST NOT enqueue a durable event or advance canonical progress, and the result experience SHALL clearly indicate that it was a practice/demo session.

#### Scenario: Network fails with no cached canonical lesson
- **WHEN** the player falls back to built-in mock content
- **THEN** finishing the mock does not alter canonical lesson, star, streak, XP, sticker, or badge state
