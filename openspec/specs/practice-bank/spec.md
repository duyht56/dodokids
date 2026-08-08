# practice-bank

## Purpose

Defines the Practice Bank — recycled activities from completed lessons (spaced repetition) — covering the backend endpoint, the screen, and offline behavior.

## Requirements

### Requirement: GET /lessons/practice/:childId
The BE SHALL expose `GET /lessons/practice/:childId` returning an array of activities drawn from the child's completed lessons. It SHALL return at most ~12 shuffled activities and an empty array when the child has no completed lessons.

#### Scenario: Child with completed lessons
- **WHEN** a child has completed lessons containing activities
- **THEN** the endpoint returns up to 12 shuffled `Activity` objects from those lessons

#### Scenario: No completed lessons
- **WHEN** `completedLessons` is empty
- **THEN** the endpoint returns `[]` with HTTP 200 (no error)

### Requirement: Practice Bank Screen
The Practice Bank screen SHALL render fetched activities one at a time via the existing `ActivityContainer`, advancing on each result. It SHALL NOT call `completeLesson` (no XP, streak, stars, or content unlock) and SHALL always show a "Về nhà" exit affordance.

#### Scenario: Practice does not affect progression
- **WHEN** the child answers activities in Practice Bank
- **THEN** no XP is granted, the streak is unchanged, and no new content is unlocked

#### Scenario: Empty practice state
- **WHEN** there are no practice activities and no completed lessons
- **THEN** the screen shows an empty state prompting the child to complete lessons, with "Về nhà" visible

### Requirement: Offline Practice Fallback
When the backend returns no activities but the child has completed lessons locally, the screen SHALL recycle activities from those completed weeks (local mock build) so practice still works offline. The empty state appears only when there are genuinely no completed lessons.

#### Scenario: Offline with completed lessons
- **WHEN** the backend is unreachable and the child has completed at least one lesson
- **THEN** the screen presents recycled practice activities rather than the empty state
