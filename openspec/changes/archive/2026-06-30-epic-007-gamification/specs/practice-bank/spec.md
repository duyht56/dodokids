## ADDED Requirements

### Requirement: GET /lessons/practice/:childId
The BE SHALL expose `GET /lessons/practice/:childId` returning an array of activities drawn from the child's completed lessons (spaced repetition). It SHALL return at most ~12 shuffled activities and an empty array when the child has no completed lessons.

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
- **WHEN** the practice endpoint returns `[]`
- **THEN** the screen shows an empty state prompting the child to complete lessons, with "Về nhà" visible
