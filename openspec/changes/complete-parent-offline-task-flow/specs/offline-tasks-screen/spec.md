## MODIFIED Requirements

### Requirement: Offline Tasks Screen Host
The mobile app SHALL fetch `GET /parent/:childId/offline-tasks` for the selected current/previous week and render only unlocked task candidates. A task is unlocked when `lessonCompleted` is true, local `progress.completedLessons` contains its `taskId`, or it already has `completed: true`.

The screen SHALL support pull-to-refresh, refetch on focus, discard stale responses after child/week changes, and show loading and error states. It SHALL NOT persist a task-list cache or an offline mutation queue.

#### Scenario: Server-completed task is displayed
- **WHEN** a candidate has `lessonCompleted: true`
- **THEN** its task card is rendered

#### Scenario: Same-device optimistic completion is displayed
- **WHEN** `lessonCompleted` is false but local `progress.completedLessons` contains the candidate `taskId`
- **THEN** its task card is rendered on that device

#### Scenario: Incomplete lesson task is hidden
- **WHEN** a candidate is not server-completed, not locally completed, and has no existing task completion
- **THEN** the candidate is not rendered

#### Scenario: Pull to refresh
- **WHEN** the parent pulls down on the list
- **THEN** the task candidates and completion states are re-fetched from the API

#### Scenario: Focus refresh synchronizes surfaces
- **WHEN** the parent returns to the Hoạt động tab after changing completion on Dashboard
- **THEN** the screen re-fetches and shows the same completion state

#### Scenario: Stale response is ignored
- **WHEN** a slow request for one week resolves after the parent has switched to another week
- **THEN** the old response does not replace the active week's task list

### Requirement: Task Cards
Each unlocked task SHALL render a card showing its title, full body, safety note prefixed with ⚠️, day indicator, subject, and a checkbox reflecting `completed`. Only `pending` and `completed` task states are supported; no skipped action or skipped state SHALL be shown.

Tapping the checkbox SHALL call `PATCH /parent/:childId/offline-tasks/:taskId` with the new boolean value. The app SHALL permit at most one in-flight mutation per task, optimistically update the checkbox, commit the server response, and revert with a visible retry message when the request fails. Failed mutations SHALL NOT be queued for background replay.

#### Scenario: Card content
- **WHEN** an unlocked task is rendered
- **THEN** its title, body, safety note, day, subject, and completion checkbox are visible

#### Scenario: Successful toggle
- **WHEN** the parent toggles a pending task and the PATCH succeeds
- **THEN** the card remains completed using the server response

#### Scenario: Failed toggle is reverted
- **WHEN** the PATCH fails because the network or server is unavailable
- **THEN** the checkbox returns to its prior state, a retry message is shown, and no pending mutation is stored

#### Scenario: Rapid second tap is blocked
- **WHEN** a task completion PATCH is still in flight
- **THEN** the task checkbox is busy/disabled and another mutation is not started

### Requirement: Week Filter Tabs
The screen SHALL provide “Tuần này” and “Tuần trước” filters. Switching filters SHALL request the corresponding allowed week. When the child is on week 1, the previous-week filter SHALL be hidden or disabled and SHALL NOT issue a duplicate week-1 request.

#### Scenario: Switch to previous week
- **WHEN** the child is beyond week 1 and the parent taps “Tuần trước”
- **THEN** the previous week's candidates are fetched and its unlocked tasks are displayed

#### Scenario: Week one has no duplicate previous request
- **WHEN** the child's current week is 1
- **THEN** “Tuần trước” cannot trigger another request for week 1

### Requirement: Empty State
When the selected week has no unlocked task, the screen SHALL display a friendly unlock-specific empty state rather than implying that the 48-week task corpus does not exist.

#### Scenario: No completed lesson task
- **WHEN** no imported candidate is unlocked for the selected week
- **THEN** the screen shows “Hoàn thành một bài học để mở hoạt động ở nhà.”

#### Scenario: Refresh fails with existing data
- **WHEN** visible in-memory task data exists and a refresh fails
- **THEN** the existing list remains visible with an error/retry affordance

#### Scenario: Initial request fails
- **WHEN** no task data has loaded and the request fails
- **THEN** the screen shows its load-error state and retry control
