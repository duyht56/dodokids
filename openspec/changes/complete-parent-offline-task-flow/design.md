## Context

The current Parent implementation has two task identities and two persistence paths. `GET /parent/:childId/summary` plus `PATCH /parent/:childId/offline-task` use the legacy `child.offlineTask` record (`w{week}-offline`, `pending|done|skipped`), while the Hoạt động tab uses `GET /parent/:childId/offline-tasks` plus `PATCH /parent/:childId/offline-tasks/:taskId` and the `child.offlineTasks` map (`w{week}-d{day}`, boolean completion). The two paths do not synchronize.

Offline-task content is also duplicated. The parent module owns a 12-week static table, but the canonical published Lesson already carries `offlineTaskTitle`, `offlineTaskBody`, and `offlineTaskSafety` through Human Gate and pipeline-to-server publish. Weekly report suggestions also read the static table, so removing that table requires a coordinated report change.

Lesson completion has two views: the server persists `child.progress.completedLessons`, and mobile optimistically persists the same lesson id locally even when the completion PATCH fails. There is no progress replay queue. Parent Gate PIN verification remains online and UI-scoped by explicit product decision.

## Goals / Non-Goals

**Goals:**

- Establish imported Lesson offline-task fields as the sole runtime content source.
- Present a task only after its lesson is completed, including same-device optimistic completion.
- Give Dashboard and the Hoạt động tab one task identity, one completion record, and one API surface.
- Keep completion mutations online-only and deterministic under failure or repeated taps.
- Preserve compatible reads of existing per-day `w{week}-d{day}` completion records.
- Keep weekly report suggestions functional without a second offline-task corpus.
- Add service/controller/mobile coverage for the end-to-end rules that the old helper-only tests do not cover.

**Non-Goals:**

- Server-side Parent Gate grants or authorization changes beyond the existing `DeviceSessionGuard` and household ownership checks.
- Persistent task-list caching, offline completion outbox, or background mutation replay.
- General lesson-progress replay/synchronization across devices.
- Lesson schema, seed schema, Human Gate, or publish-payload changes.
- Backfilling the legacy single `child.offlineTask` record into per-lesson completion.

## Decisions

### D1 — Imported Lesson is the only task-content source

`ParentService` will depend on the runtime Lesson model and query `lessonStatus: 'imported'` lessons for the selected week, sorted by day. Each candidate maps:

- `taskId` = `lesson.lessonId`
- `day`, `subject` = Lesson metadata
- `title`, `body`, `safetyNote` = `offlineTaskTitle`, `offlineTaskBody`, `offlineTaskSafety`

A lesson with a missing or blank required offline-task field is not synthesized from fallback prose and is omitted from the task response. This keeps reviewed Lesson content authoritative and makes incomplete publishing visible as a content gap.

The existing Lesson/publish contract still requires these fields on every one of the five weekly Lessons, so this change retains five candidate tasks per fully published week. Reducing frequency or making the fields optional is deferred until parent feedback is available.

**Alternative considered:** extend the static table to 48 weeks. Rejected because it duplicates reviewed lesson content, can drift from lesson subject/skill, and preserves a second authoring path.

### D2 — API returns candidate tasks; mobile owns the same-device unlock union

`GET /parent/:childId/offline-tasks?week={n}` returns imported candidate tasks for the requested allowed week and includes `lessonCompleted`, derived from server `child.progress.completedLessons`, plus the child-scoped task `completed` and `completedAt` fields.

Mobile renders a candidate only when:

```text
task.lessonCompleted
OR localProgress.completedLessons contains task.taskId
OR task.completed is already true
```

The third condition preserves an already-recorded task if historical progress data is incomplete. The server cannot evaluate the local optimistic branch without adding a progress replay protocol, so the display gate intentionally remains a mobile rule. Candidate task content is still limited to the current or previous week.

**Alternative considered:** return only server-completed lessons. Rejected because a lesson completed optimistically on the current device could remain permanently hidden after a failed progress PATCH, since no replay queue exists.

### D3 — Current/previous week is the complete query window

When `week` is omitted, the API defaults to `child.progress.currentWeek`. Explicit `week` is accepted only when it equals the current week or `max(1, currentWeek - 1)`; unsupported weeks return a stable 400 error. At week 1, mobile disables or hides the previous-week tab rather than issuing a duplicate week-1 request.

This matches the existing Parent UX and prevents accidental preview of future lesson tasks without turning Parent Gate into a server authorization boundary.

### D4 — `lessonId` is the canonical task and completion identity

New completion writes use `child.offlineTasks[lessonId]`. For backward compatibility, reads resolve completion in this order:

1. `child.offlineTasks[lessonId]`
2. legacy `child.offlineTasks[w{week}-d{day}]`
3. default incomplete

Writes update only the `lessonId` key and leave legacy keys untouched. The legacy single `child.offlineTask` record is not migrated because it cannot reliably identify one of five lesson tasks.

### D5 — Completion stays online-only and binary

The canonical PATCH remains `PATCH /parent/:childId/offline-tasks/:taskId` with `{ completed: boolean }`. The server validates that:

- the child belongs to the authenticated household;
- `taskId` resolves to an imported Lesson with complete offline-task fields;
- the lesson week is current or previous for that child.

The PATCH does not require server-confirmed lesson completion because the task may have been unlocked by same-device optimistic lesson completion. Mobile permits only one in-flight mutation per task, applies an optimistic checkbox update, commits the server response, and reverts with a visible retry message on failure. It stores no pending mutation for later replay.

`skipped` is removed. Optional at-home work remains pending until marked completed, and completion can be unchecked.

### D6 — Dashboard reads the canonical list instead of summary task data

`GET /parent/:childId/summary` stops returning the legacy `offlineTask` field, and the legacy singular PATCH is removed. Dashboard and OfflineTasksScreen use the same parent API contract and shared mobile task-selection helper/hook.

For the current week, Dashboard selects the highest-day unlocked task. Sequential lesson progression makes this the most recently completed lesson task. The card shows pending or completed state and offers a route/action to the Hoạt động tab; it has no skip action.

The shared client helper discards stale fetch results after a week/child change and screens refetch on focus so a completion made in the other surface becomes visible.

### D7 — Empty and degraded states explain the unlock rule

When no candidate is unlocked, the current-week screen shows “Hoàn thành một bài học để mở hoạt động ở nhà.” A missing/blank imported task is not replaced with generic content. If a refresh fails after data is already displayed, the in-memory list remains visible with an error/retry affordance; without existing data the normal load-error state is shown.

No task list or mutation queue is persisted for offline use. Parent Gate and the initial task fetch therefore remain online-dependent.

### D8 — Weekly report suggestions consume Lesson tasks

`buildSuggestions` becomes a deterministic selector over lesson-task inputs supplied by `ParentService`, rather than importing the static table. For a report at week N, the service loads imported tasks from week N+1; if none exist it falls back to week N. It prefers the lowest-scoring subject and fills to exactly three strings with the existing safe generic fallback when fewer than three reviewed tasks are available.

Because report output now depends on published lesson content, its cache fingerprint includes both the completed-day fingerprint and a deterministic fingerprint of the suggestion-source lessons (lesson id plus generated/imported revision and offline-task text). A republish that changes task content therefore invalidates the cached report.

### D9 — Parent Gate behavior is intentionally unchanged

The existing online PIN setup/verification, memory-only five-minute `parentUnlocked` window, `DeviceSessionGuard`, and household-scoped child lookup remain intact. This change does not mint a parent access token or require parent proof on Parent APIs.

## Risks / Trade-offs

- [Candidate responses contain current/previous tasks not yet displayed] → Keep the server window limited to current/previous week and enforce the completed-only rule in a tested shared mobile selector.
- [Local-only lesson completion is visible on one device but not another] → Accept as the existing optimistic-progress limitation; server-confirmed completion remains the cross-device path and progress replay is explicitly out of scope.
- [Published lessons are partial or have blank offline-task fields] → Omit invalid candidates and show the unlock/update empty state; do not resurrect unreviewed static fallback content.
- [Legacy completion exists under a synthetic id] → Read `lessonId` first and `w{week}-d{day}` second; write only the new key so rollout is non-destructive.
- [Old mobile versions still call the singular endpoint] → Coordinate mobile/server release or retain the deprecated handler for a short compatibility window before removal; do not write new product behavior through it.
- [Weekly report cache serves stale suggestions after content hotfix] → Include the Lesson suggestion-source fingerprint in cache validation.
- [Rapid checkbox taps reorder PATCH writes] → Allow one in-flight mutation per task and render the control busy/disabled until it settles.

## Migration Plan

1. Add the Lesson model to the parent module and implement a shared Lesson-to-offline-task mapper plus compatibility completion lookup.
2. Update list/PATCH behavior and weekly report suggestion inputs while keeping existing child data intact.
3. Ship the mobile canonical task selector, Hoạt động screen, Dashboard projection, and binary card contract.
4. Stop reading/writing `authStore.offlineTask`, `child.offlineTask`, the singular endpoint, and the static table; remove deprecated code after the compatible rollout window if required.
5. Validate focused server and mobile tests, then manually smoke test Parent Gate → Dashboard → Hoạt động for current/previous week, unlock, toggle, failure, and focus-refresh behavior.

Rollback restores the legacy code paths. New `offlineTasks[lessonId]` records are additive and can remain in MongoDB; no destructive data rollback is required.

## Open Questions

None. Product decisions for content source, completion visibility, offline mutation behavior, and Parent Gate scope are resolved in this change.
