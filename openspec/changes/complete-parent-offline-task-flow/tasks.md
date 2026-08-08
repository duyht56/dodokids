## 1. Server Lesson-Backed Task Contract

- [x] 1.1 Register the runtime Lesson model in the parent module and add a typed mapper from imported Lesson fields to the offline-task API shape, omitting blank required task content.
- [x] 1.2 Implement the current/previous-week validator and query imported Lessons sorted by day, returning `taskId = lessonId` plus server `lessonCompleted`, `completed`, and `completedAt` fields.
- [x] 1.3 Add backward-compatible completion lookup (`lessonId` first, then `w{week}-d{day}`) without mutating or deleting legacy map keys.
- [x] 1.4 Harden `PATCH /parent/:childId/offline-tasks/:taskId` to validate household child, imported Lesson/content, and current/previous week, then write only `offlineTasks[lessonId]` without requiring server-confirmed lesson completion.
- [x] 1.5 Return stable 400/404 errors for unsupported weeks, out-of-window tasks, unknown/unpublished tasks, and invalid completion bodies.

## 2. Weekly Report Lesson-Task Integration

- [x] 2.1 Refactor `buildSuggestions` to accept reviewed Lesson task inputs rather than importing the static offline-task table.
- [x] 2.2 Load imported week-N+1 Lesson tasks for an unlocked report, fall back to week N, prefer the lowest-scoring subject, and fill safely to exactly three suggestions.
- [x] 2.3 Extend report cache validation with a deterministic suggestion-source Lesson/content fingerprint so offline-task republish/hotfix invalidates cached suggestions.

## 3. Retire Legacy Server Paths

- [x] 3.1 Remove the legacy `offlineTask` field from `GET /parent/:childId/summary` while preserving progress and subject-progress behavior.
- [x] 3.2 Deprecate/remove `PATCH /parent/:childId/offline-task`, `UpdateOfflineTaskDto`, and legacy single-task service logic according to the chosen deployment compatibility window.
- [x] 3.3 Stop reading/writing the legacy `child.offlineTask` schema property; leave existing MongoDB data untouched and document that it is not backfilled.
- [x] 3.4 Remove the 12-week static offline-task corpus and obsolete helper paths after both Parent task APIs and weekly-report suggestions use imported Lessons.

## 4. Mobile Contract and Shared Unlock Selection

- [x] 4.1 Update `parentApi` task types for Lesson identity, `lessonCompleted`, boolean completion, `completedAt`, and stable server errors; remove singular task API/types.
- [x] 4.2 Add a shared selector/helper that unlocks candidates from server completion, local `progress.completedLessons`, or an existing completion record and returns tasks sorted by day.
- [x] 4.3 Add shared current-week loading/refetch behavior for Dashboard and Hoạt động, including focus refresh and stale-response protection without adding a persistent cache dependency.
- [x] 4.4 Remove `authStore.offlineTask`, `setOfflineTask`, the legacy TypeScript interface, and its AsyncStorage partialization while keeping local `progress.completedLessons` persistence intact.

## 5. Parent UI Unification

- [x] 5.1 Refactor `OfflineTaskCard` to `pending | completed | empty`, remove skipped visuals/callbacks, add busy-state duplicate protection, and support the Dashboard “Xem tất cả” action.
- [x] 5.2 Update `OfflineTasksScreen` to render only unlocked candidates, show the lesson-completion empty state, refetch on focus/pull, and prevent stale week responses.
- [x] 5.3 Implement one-in-flight optimistic completion per task; commit the server response or revert with a visible retry message, with no offline outbox/background replay.
- [x] 5.4 Disable/hide “Tuần trước” at week 1 and preserve already-visible in-memory data when refresh fails.
- [x] 5.5 Update Dashboard to select the highest-day unlocked current-week task from the canonical list, reflect tab completion after focus refresh, and navigate “Xem tất cả” to the Hoạt động tab.

## 6. Automated Verification

- [x] 6.1 Add server tests for imported-Lesson mapping/order, blank task omission, current/previous window validation, household ownership, and server completion flags.
- [x] 6.2 Add server mutation tests for lesson-id writes, legacy per-day compatibility reads, mark/unmark timestamps, optimistic-local allowance, arbitrary task rejection, and out-of-window rejection.
- [x] 6.3 Add weekly-report tests for next-week/current-week Lesson fallback, lowest-subject ordering, safe fill-to-three behavior, and cache invalidation after task-content revision.
- [x] 6.4 Add mobile tests for the unlock union, incomplete-task hiding, highest-day Dashboard selection, week-1 filter behavior, stale fetch suppression, focus synchronization, and failure rollback/no-outbox behavior.
- [ ] 6.5 Run focused server tests and `npm run build` in `kido-server`; run focused mobile tests, TypeScript/lint for changed files, and report unrelated baseline failures separately.
  - Verification note (2026-08-03): server tests 28/28, mobile contract test, and scoped server/mobile TypeScript checks pass. `npm run build` is blocked by generated `dist` cleanup (`ENOTEMPTY ... dist/modules/children`) and the no-clean retry did not complete within 300s. Scoped ESLint also did not complete within 300s and emitted no diagnostics.

## 7. Manual Review and Finalization

- [ ] 7.1 Smoke test Parent Gate → Dashboard → Hoạt động with zero, one, and multiple completed lessons across current/previous week.
- [ ] 7.2 Verify same-device optimistic lesson completion unlocks its imported task, task completion requires network, failed completion reverts visibly, and a later successful retry synchronizes both surfaces.
- [ ] 7.3 Verify incomplete/unpublished Lesson task fields produce the intentional empty/update state and never fall back to static prose.
- [ ] 7.4 Verify weekly report still returns exactly three reviewed/safe suggestions and refreshes them after an offline-task content hotfix.
- [x] 7.5 Run strict OpenSpec validation, review compatibility-window cleanup, and update canonical operational docs only if implementation changes a documented API/runbook.

Runtime smoke note (2026-08-03): no ADB device is attached and no local API is listening on port 3000/3001; only Metro is listening on 8081. Tasks 7.1–7.4 remain intentionally unchecked.
