## Why

The Parent area currently has two incompatible offline-task flows: the Dashboard uses a legacy single-task record while the Hoạt động tab uses a separate per-day list backed by a 12-week static table. This causes status drift, bypasses the reviewed `Lesson.offlineTask*` content already published to the runtime server, and leaves the 48-week parent experience incomplete.

## What Changes

- Make imported `Lesson.offlineTaskTitle`, `Lesson.offlineTaskBody`, and `Lesson.offlineTaskSafety` the only source of offline-task content.
- Retain the current one-task-per-Lesson content contract (five candidate tasks per published learning week) while parent feedback is evaluated; task frequency/schema optionality is not changed here.
- Show an offline task only after its corresponding lesson has been completed. On the current device, visibility uses the union of server-confirmed and optimistic local `completedLessons` so a locally completed lesson unlocks its task immediately.
- Use `lessonId` as the task identity and store completion in the existing child-scoped `offlineTasks` map.
- Make the Dashboard a projection of the same per-lesson task data used by the Hoạt động tab, selecting the most recently completed lesson in the current week.
- Keep completion binary (`pending` or `completed`) and remove the legacy `skipped` state.
- Keep task completion online-only: a failed mutation is reverted and surfaced to the parent; no offline mutation queue or background replay is added.
- Restrict the task list to the current and previous child week, with an unlock-specific empty state when no completed lesson has an imported offline task.
- **BREAKING** Remove the legacy `PATCH /parent/:childId/offline-task` contract, the legacy `child.offlineTask`/mobile `authStore.offlineTask` flow, and the static 12-week offline-task content table after compatibility handling for existing `w{week}-d{day}` completion keys.
- Preserve the existing Parent Gate and `DeviceSessionGuard` behavior; this change does not add a server-side parent grant.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `offline-tasks-api`: Source tasks from imported lessons, gate visibility on lesson completion, use `lessonId` identity, validate mutations, and define online-only completion behavior.
- `offline-tasks-screen`: Render only unlocked tasks, handle week-one/empty/error states, and keep online mutations deterministic.
- `parent-api`: Remove the legacy single-task update contract and remove the legacy `offlineTask` field from the summary response; Dashboard task data comes from the canonical list endpoint.
- `parent-dashboard`: Show the most recently unlocked current-week task from the canonical flow and remove skip behavior.
- `offline-task-card`: Replace four-state done/skipped rendering with a binary pending/completed/empty contract.
- `state-management`: Remove the persisted legacy `authStore.offlineTask` record while retaining local `completedLessons` for same-device unlock reconciliation.
- `weekly-report-api`: Draw next-week suggestions from imported Lesson offline-task content instead of the retired static table.

## Impact

- **Server:** `kido-server/src/modules/parent`, the parent module's lesson-model dependency, weekly-report suggestion inputs, child offline-task compatibility reads, endpoint validation, and parent tests.
- **Mobile:** `OfflineTasksScreen`, `DashboardScreen`, `OfflineTaskCard`, `parentApi`, `authStore`, and focused Parent navigation/screen tests.
- **API/data:** Offline-task IDs change from synthetic `w{week}-d{day}` or `w{week}-offline` values to `lessonId`; legacy completion keys require backward-tolerant reads during rollout.
- **Content pipeline:** No schema or publish change. The existing reviewed lesson offline-task fields become the runtime source of truth.
- **Out of scope:** Parent Gate server hardening, persistent offline task caching, offline completion queues, and general lesson-progress synchronization.
