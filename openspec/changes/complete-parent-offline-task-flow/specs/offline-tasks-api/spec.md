## MODIFIED Requirements

### Requirement: GET /parent/:childId/offline-tasks
The BE SHALL expose `GET /parent/:childId/offline-tasks?week={n}` returning imported Lesson offline-task candidates for the requested week, sorted by lesson day. When `week` is omitted it SHALL default to the child's `currentWeek`. The requested week MUST equal the child's current week or `max(1, currentWeek - 1)`.

Each task SHALL use the imported Lesson as its content source and return:

```json
{
  "week": 2,
  "tasks": [
    {
      "taskId": "w2-d1-toan",
      "day": 1,
      "subject": "toan",
      "title": "Đếm bậc cầu thang",
      "body": "Hãy nhờ bé đếm các bậc cầu thang trong nhà.",
      "safetyNote": "Luôn ở cạnh bé khi lên xuống cầu thang.",
      "lessonCompleted": true,
      "completed": false,
      "completedAt": null
    }
  ]
}
```

`taskId` MUST equal `Lesson.lessonId`; `title`, `body`, and `safetyNote` MUST come from `offlineTaskTitle`, `offlineTaskBody`, and `offlineTaskSafety`. The endpoint SHALL NOT synthesize content from a static fallback table. A Lesson with missing or blank required offline-task fields SHALL be omitted. `lessonCompleted` SHALL reflect server `child.progress.completedLessons`; task completion SHALL come from the child-scoped `offlineTasks` map.

#### Scenario: Current week returns imported lesson candidates
- **WHEN** the child requests its current week and imported Lessons with complete offline-task fields exist
- **THEN** the endpoint returns those tasks sorted by `day` with `taskId` equal to each `lessonId`

#### Scenario: Previous week is allowed
- **WHEN** the child is on week 5 and requests week 4
- **THEN** the endpoint returns week-4 imported Lesson task candidates

#### Scenario: Unsupported week is rejected
- **WHEN** the child is on week 5 and requests week 3, week 6, or another week outside current/previous
- **THEN** the endpoint returns HTTP 400 with a stable offline-task week error

#### Scenario: Unknown child
- **WHEN** `:childId` does not belong to the authenticated household
- **THEN** the endpoint returns HTTP 404

#### Scenario: Incomplete published task is not synthesized
- **WHEN** an imported Lesson has a blank `offlineTaskBody` or another required offline-task field
- **THEN** that Lesson is omitted and no static fallback text is returned

#### Scenario: Server completion flag
- **WHEN** a candidate Lesson id is present in server `completedLessons`
- **THEN** its `lessonCompleted` field is `true`

#### Scenario: Legacy per-day completion key is read compatibly
- **WHEN** no `offlineTasks[lessonId]` record exists but `offlineTasks[w{week}-d{day}]` exists
- **THEN** the task's completion fields are read from the legacy per-day key

### Requirement: PATCH /parent/:childId/offline-tasks/:taskId
The BE SHALL expose `PATCH /parent/:childId/offline-tasks/:taskId` accepting `{ completed: boolean }`. `taskId` MUST resolve to an imported Lesson with complete offline-task fields in the child's current or previous week. The endpoint SHALL persist completion at `child.offlineTasks[lessonId]` and return `{ taskId, completed, completedAt }`.

Server-confirmed lesson completion SHALL NOT be required for this mutation because the task can be unlocked by optimistic same-device lesson completion. Household ownership and Lesson/window validation remain mandatory.

#### Scenario: Mark task completed
- **WHEN** `{ completed: true }` is sent for a valid imported Lesson task
- **THEN** `offlineTasks[lessonId]` is persisted with `completed: true` and an ISO `completedAt`, and HTTP 200 returns the updated record

#### Scenario: Unmark task
- **WHEN** `{ completed: false }` is sent for a previously completed valid task
- **THEN** the lesson-id record is persisted with `completed: false` and `completedAt: null`

#### Scenario: Optimistically completed lesson can be marked
- **WHEN** the task Lesson is current/previous and imported but the server `completedLessons` array has not yet recorded it
- **THEN** the valid completion mutation is still accepted

#### Scenario: Unknown or unpublished task is rejected
- **WHEN** `taskId` does not resolve to an imported Lesson with complete offline-task fields
- **THEN** the endpoint returns HTTP 404 and does not create an arbitrary map key

#### Scenario: Task outside current/previous window is rejected
- **WHEN** `taskId` resolves to a Lesson outside the child's current/previous week
- **THEN** the endpoint returns HTTP 400 and does not change completion state

#### Scenario: Invalid body
- **WHEN** `completed` is missing or not a boolean
- **THEN** the endpoint returns HTTP 400 with a validation error

## REMOVED Requirements

### Requirement: Per-Day Offline Task Table
**Reason**: Imported `Lesson.offlineTaskTitle`, `offlineTaskBody`, and `offlineTaskSafety` are the reviewed source of truth; the 12-week table duplicates and can contradict published curriculum content.

**Migration**: Query imported Lessons and map their offline-task fields. Keep backward-compatible reads of existing `w{week}-d{day}` completion keys, but write all new completion records under `lessonId`.
