# parent-api

## Purpose

Defines the backend endpoints serving the parent dashboard — a child progress summary and offline-task status updates. Child is identified by the `:childId` path parameter (no JWT auth in the current codebase; token-based auth is deferred to a future EPIC).

## Requirements

### Requirement: GET /parent/:childId/summary
The BE SHALL expose `GET /parent/:childId/summary` that returns a summary object for the given child. The response SHALL be derived from the child's `progress` document and a static weekly offline-task table, and SHALL include a `subjectProgress` object with per-subject completion percentages (`math`, `vietnamese`, `english`, each 0–100) derived from the child's progress.

Response shape:
```json
{
  "streakCount": 5,
  "xp": 120,
  "completedLessons": ["w1d1", "w1d2"],
  "currentWeek": 2,
  "currentDay": 3,
  "subjectProgress": { "math": 80, "vietnamese": 40, "english": 60 },
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
- **THEN** the endpoint returns HTTP 200 with the summary object including `subjectProgress`

#### Scenario: Unknown child
- **WHEN** `:childId` does not match any child
- **THEN** the endpoint returns HTTP 404

#### Scenario: Subject progress bounded
- **WHEN** the summary is computed
- **THEN** each `subjectProgress` value is an integer in the range 0–100

### Requirement: PATCH /parent/:childId/offline-task
The BE SHALL expose `PATCH /parent/:childId/offline-task` accepting `{ taskId: string, status: 'done' | 'skipped' }`. It SHALL update the child's offline task record and return the updated task object.

#### Scenario: Mark task done
- **WHEN** `{ taskId: "w2-offline", status: "done" }` is sent
- **THEN** the record is updated with `status: "done"` and `completedAt: <ISO timestamp>`, and the endpoint returns HTTP 200 with the updated task

#### Scenario: Invalid status value
- **WHEN** `status` is not `'done'` or `'skipped'`
- **THEN** the endpoint returns HTTP 400 with a validation error message (`class-validator` `@IsIn`)

### Requirement: Offline Task Seeding
The parent module SHALL maintain a static offline-task table providing five tasks per week (one per learning day) for weeks 1–12 minimum, each entry containing `day`, `title`, `body` (instructions + parent script), and `safetyNote`. `GET /parent/:childId/summary` SHALL look up `currentWeek` and `currentDay` in this table to populate the `offlineTask` field with the task for the current day.

#### Scenario: Week in table
- **WHEN** `currentWeek` is 3, `currentDay` is 2, and tasks exist for week 3
- **THEN** the summary's `offlineTask` is week 3 / day 2's task text

#### Scenario: Week beyond table
- **WHEN** `currentWeek` exceeds the table length
- **THEN** the response includes `offlineTask: null` (no crash)

### Requirement: Stale Task Reset
When the stored offline-task records belong to a previous week (their `taskId` week prefix does not match the current week), `GET /parent/:childId/summary` SHALL return the current day's task with `status: "pending"` and `completedAt: null`, rather than carrying over the old status.

#### Scenario: Week advanced since last completion
- **WHEN** the child completed a week-2 task and `currentWeek` is now 3
- **THEN** the summary returns the week-3 task as `pending` (not `done`)

### Requirement: PATCH /parent/:childId/profile
The BE SHALL expose `PATCH /parent/:childId/profile` accepting `{ name?: string, age?: number }` to update the child's profile from the Settings screen. It SHALL validate inputs (`name` non-empty string, `age` within the supported range) and return the updated child profile.

#### Scenario: Update name and age
- **WHEN** `{ name: "Bống", age: 5 }` is sent for an existing child
- **THEN** the child's `name` and `age` are persisted and the endpoint returns HTTP 200 with the updated profile

#### Scenario: Invalid age
- **WHEN** `age` is outside the supported range
- **THEN** the endpoint returns HTTP 400 with a validation error

#### Scenario: Unknown child
- **WHEN** `:childId` does not match any child
- **THEN** the endpoint returns HTTP 404
