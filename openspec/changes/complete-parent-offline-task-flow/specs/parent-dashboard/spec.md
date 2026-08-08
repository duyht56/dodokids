## MODIFIED Requirements

### Requirement: Offline Task Section
The Dashboard SHALL fetch the canonical current-week task candidates from `GET /parent/:childId/offline-tasks`, apply the same unlock rule as OfflineTasksScreen, and render the highest-day unlocked task as the most recently completed lesson's at-home activity. It SHALL NOT read the legacy summary `offlineTask` field or expose a skipped action.

The card SHALL show pending/completed state from the canonical per-lesson completion record and provide a way to open the Hoạt động tab for the full unlocked list.

#### Scenario: Most recently unlocked task is shown
- **WHEN** current-week day-1 and day-2 tasks are unlocked
- **THEN** Dashboard renders the day-2 task

#### Scenario: No task unlocked
- **WHEN** no current-week candidate is unlocked
- **THEN** the section shows “Hoàn thành một bài học để mở hoạt động ở nhà.”

#### Scenario: Dashboard uses canonical completion
- **WHEN** a task was completed in the Hoạt động tab and Dashboard regains focus
- **THEN** Dashboard re-fetches and renders that task as completed

#### Scenario: Dashboard opens full task list
- **WHEN** the parent activates the card's “Xem tất cả” action
- **THEN** the Parent navigator focuses the Hoạt động tab

### Requirement: Skeleton Loading State
While the progress summary or current-week offline-task request is in flight without existing data, the screen SHALL render `SkeletonLoader` placeholders for the corresponding Progress Card or Offline Task section. Weekly Report and other locally available content SHALL render without waiting for both requests.

#### Scenario: Slow task request
- **WHEN** the summary is ready but the offline-task request remains in flight
- **THEN** the progress card renders normally and only the offline-task section shows a skeleton

#### Scenario: Refresh retains existing task
- **WHEN** Dashboard already has task data and performs a focus refresh
- **THEN** the existing card remains visible rather than being replaced by a blank skeleton
