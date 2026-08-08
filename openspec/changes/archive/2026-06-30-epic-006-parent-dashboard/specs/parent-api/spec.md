## ADDED Requirements

### Requirement: GET /parent/:childId/summary
The BE SHALL expose `GET /parent/:childId/summary` that returns a summary object for the given child. The response SHALL be derived from the child's `progress` document and a static weekly offline-task table.

> Note: This codebase has no JWT/auth infrastructure; the child is identified by the `:childId` path parameter, matching the existing `ProgressController` convention. Adding token-based auth + ownership enforcement is deferred to a future auth EPIC.

Response shape:
```json
{
  "streakCount": 5,
  "xp": 120,
  "completedLessons": ["w1d1", "w1d2"],
  "currentWeek": 2,
  "currentDay": 3,
  "offlineTask": {
    "taskId": "w2-offline",
    "week": "Tuần 2",
    "lesson": "Bài 2",
    "subject": "Toán",
    "task": "Hãy nhờ bé đếm các bậc cầu thang trong nhà cùng bạn.",
    "status": "pending",
    "completedAt": null
  }
}
```

#### Scenario: Existing child
- **WHEN** `:childId` matches an existing child
- **THEN** the endpoint returns HTTP 200 with the summary object

#### Scenario: Unknown child
- **WHEN** `:childId` does not match any child
- **THEN** the endpoint returns HTTP 404

### Requirement: PATCH /parent/:childId/offline-task
The BE SHALL expose `PATCH /parent/:childId/offline-task` accepting `{ taskId: string, status: 'done' | 'skipped' }`. It SHALL update the child's offline task record and return the updated task object.

#### Scenario: Mark task done
- **WHEN** `{ taskId: "w2-offline", status: "done" }` is sent
- **THEN** the record is updated with `status: "done"` and `completedAt: <ISO timestamp>`, and the endpoint returns HTTP 200 with the updated task

#### Scenario: Invalid status value
- **WHEN** `status` is not `'done'` or `'skipped'`
- **THEN** the endpoint returns HTTP 400 with a validation error message (`class-validator` `@IsIn`)

### Requirement: Offline Task Seeding
The parent module SHALL maintain a static `OFFLINE_TASKS` table keyed by week number (weeks 1–12 minimum), each entry containing `lesson`, `subject`, and `task` text. `GET /parent/:childId/summary` SHALL look up `currentWeek` in this table to populate the `offlineTask.task` field.

#### Scenario: Week in table
- **WHEN** `currentWeek` is 3 and a task exists for week 3
- **THEN** the response includes that week's task text

#### Scenario: Week beyond table
- **WHEN** `currentWeek` exceeds the table length
- **THEN** the response includes `offlineTask: null` (no crash)

### Requirement: Stale Task Reset
When the stored `offlineTask.taskId` belongs to a previous week (does not match the current week's task id), `GET /parent/:childId/summary` SHALL return the new week's task with `status: "pending"` and `completedAt: null`, rather than carrying over the old status.

#### Scenario: Week advanced since last completion
- **WHEN** the child completed week 2's task and `currentWeek` is now 3
- **THEN** the summary returns week 3's task as `pending` (not `done`)
