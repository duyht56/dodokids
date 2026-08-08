## MODIFIED Requirements

### Requirement: GET /parent/:childId/summary
The BE SHALL expose `GET /parent/:childId/summary` returning the child's progress summary and a `subjectProgress` object with `math`, `vietnamese`, and `english` integer percentages in the range 0–100. The summary SHALL be derived from the child's progress and SHALL NOT contain the legacy single `offlineTask` field; Parent task surfaces SHALL use `GET /parent/:childId/offline-tasks`.

Response shape:

```json
{
  "streakCount": 5,
  "xp": 120,
  "completedLessons": ["w1-d1-toan", "w1-d2-tieng_viet"],
  "currentWeek": 2,
  "currentDay": 3,
  "subjectProgress": { "math": 80, "vietnamese": 40, "english": 60 }
}
```

#### Scenario: Existing child
- **WHEN** `:childId` belongs to the authenticated household
- **THEN** the endpoint returns HTTP 200 with progress and bounded `subjectProgress` and without `offlineTask`

#### Scenario: Unknown child
- **WHEN** `:childId` does not belong to the authenticated household
- **THEN** the endpoint returns HTTP 404

#### Scenario: Subject progress bounded
- **WHEN** the summary is computed
- **THEN** each `subjectProgress` value is an integer in the range 0–100

## REMOVED Requirements

### Requirement: PATCH /parent/:childId/offline-task
**Reason**: The singular endpoint writes the incompatible legacy `child.offlineTask` record and cannot represent one task per completed Lesson.

**Migration**: Clients use `PATCH /parent/:childId/offline-tasks/:lessonId` with `{ completed: boolean }`. A short deployment compatibility window MAY retain the old handler, but no new product behavior SHALL depend on it.

### Requirement: Offline Task Seeding
**Reason**: Static server seeding duplicates the canonical imported Lesson offline-task fields and ends at week 12.

**Migration**: Parent task and weekly-report suggestion queries use imported Lesson fields for all published weeks.

### Requirement: Stale Task Reset
**Reason**: The legacy single-task record and week-level identity are removed; per-lesson completion is resolved independently by `lessonId`.

**Migration**: Missing per-lesson completion defaults to incomplete. Existing per-day completion keys are read through the compatibility lookup defined by `offline-tasks-api`.
