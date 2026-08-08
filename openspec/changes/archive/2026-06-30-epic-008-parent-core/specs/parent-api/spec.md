## MODIFIED Requirements

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

## ADDED Requirements

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
