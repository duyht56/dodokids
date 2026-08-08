## ADDED Requirements

### Requirement: GET /parent/:childId/offline-tasks
The BE SHALL expose `GET /parent/:childId/offline-tasks?week={n}` returning the list of offline tasks for the given week (one task per learning day, 5 per week). When `week` is omitted it SHALL default to the child's `currentWeek`. Each task SHALL carry its stored completion status for that child.

Response shape:
```json
{
  "week": 2,
  "tasks": [
    {
      "taskId": "w2-d1",
      "day": 1,
      "title": "Đếm bậc cầu thang",
      "body": "Hãy nhờ bé đếm các bậc cầu thang trong nhà cùng bạn.",
      "safetyNote": "Luôn ở cạnh bé khi lên xuống cầu thang.",
      "completed": false
    }
  ]
}
```

#### Scenario: Existing child, week with tasks
- **WHEN** `:childId` matches an existing child and the week exists in the table
- **THEN** the endpoint returns HTTP 200 with up to 5 tasks, each including `completed`

#### Scenario: Unknown child
- **WHEN** `:childId` does not match any child
- **THEN** the endpoint returns HTTP 404

#### Scenario: Week beyond table
- **WHEN** the requested week has no entry in the table
- **THEN** the endpoint returns HTTP 200 with an empty `tasks` array

### Requirement: PATCH /parent/:childId/offline-tasks/:taskId
The BE SHALL expose `PATCH /parent/:childId/offline-tasks/:taskId` accepting `{ completed: boolean }` to toggle completion of a single offline task. It SHALL persist the state keyed by `taskId` and return the updated task record.

#### Scenario: Mark task completed
- **WHEN** `{ completed: true }` is sent for a valid `taskId`
- **THEN** the record is persisted with `completed: true` and `completedAt: <ISO timestamp>`, and the endpoint returns HTTP 200

#### Scenario: Unmark task
- **WHEN** `{ completed: false }` is sent for a previously completed task
- **THEN** the record is persisted with `completed: false` and `completedAt: null`

#### Scenario: Invalid body
- **WHEN** `completed` is missing or not a boolean
- **THEN** the endpoint returns HTTP 400 with a validation error

### Requirement: Per-Day Offline Task Table
The parent module SHALL maintain a static offline-task table providing 5 tasks per week (one per learning day) for weeks 1–12 minimum, each entry containing `day`, `title` (≤8 words), `body` (instructions + parent script), and `safetyNote`. Task ids SHALL follow the `w{week}-d{day}` format.

#### Scenario: Five tasks per week
- **WHEN** the table is queried for a week within range
- **THEN** exactly 5 tasks are returned with ids `w{n}-d1` … `w{n}-d5`
