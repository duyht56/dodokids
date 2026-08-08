## 1. Backend — Data Model & Offline Task Table

- [x] 1.1 Reshape `OFFLINE_TASKS` in `kido-server/src/modules/parent/offline-tasks.ts` to 5 tasks/week (weeks 1–12), each with `day`, `title` (≤8 words), `body`, `safetyNote`; add a lookup helper by `(week, day)` and by `taskId` (`w{week}-d{day}`)
- [x] 1.2 Update `child.schema.ts` to store per-task completion keyed by `taskId` (`offlineTasks` map/array) replacing the single `offlineTask` sub-document; keep backward-tolerant reads
- [x] 1.3 Update DTOs: reshape `update-offline-task.dto.ts` to `{ completed: boolean }`, add report/list query handling as needed

## 2. Backend — Offline Tasks API

- [x] 2.1 Add `GET /parent/:childId/offline-tasks?week={n}` (default current week) returning the week's task list with per-task `completed` state; empty `tasks` when week out of range; 404 for unknown child
- [x] 2.2 Add `PATCH /parent/:childId/offline-tasks/:taskId` accepting `{ completed }`, persisting `completed` + `completedAt`, returning the updated task; 400 on invalid body
- [x] 2.3 Update `getSummary` to select the current `(week, day)` task from the reshaped table and apply stale-week reset against the keyed store

## 3. Backend — Weekly Report API

- [x] 3.1 Add `reports.ts`: templated strengths/growth generator (top/bottom subject → phrase bank, positive language) + `FORBIDDEN_WORDS` safety filter with safe fallback
- [x] 3.2 Implement lock gate (`completedLessons` includes week's day-5 lesson via `parseLessonId`), comparison series (≤4-week subjectProgress averages), and 3 suggestions weighted to lowest subject
- [x] 3.3 Add `GET /parent/:childId/report?week={n}` (default current week) returning the report shape; `locked: true` omits copy/suggestions; 404 for unknown child
- [x] 3.4 Add in-memory cache keyed by `(childId, week)` invalidated when that week's `completedLessons` changes

## 4. Backend — Verification

- [x] 4.1 Add/extend unit tests for offline-tasks list/toggle, report lock + templated copy + forbidden-language filter + comparison series
- [x] 4.2 Rebuild `dist` (`npm run build` in `kido-server`) and confirm endpoints respond via a smoke check

## 5. Mobile — Dependencies & Services

- [x] 5.1 Add `victory-native`, `react-native-view-shot`, and `expo-sharing` (versions matching Expo SDK per mobile/AGENTS.md)
- [x] 5.2 Extend `mobile/src/services/parentApi.ts` with `getReport(childId, week)`, `getOfflineTasks(childId, week)`, and `setOfflineTaskCompleted(childId, taskId, completed)`

## 6. Mobile — Weekly Report Screen

- [x] 6.1 Replace placeholder `ReportScreen.tsx`: fetch report, render loading/skeleton + error/retry states
- [x] 6.2 Implement locked preview (blurred content + "Hoàn thành ngày 5 để mở khóa")
- [x] 6.3 Implement unlocked content: header `Báo cáo Tuần {X} — {dateRange}`, 3 subject progress bars, ⭐ strengths, 📈 growth, numbered 3-suggestion list
- [x] 6.4 Add `victory-native` line chart for week 2+ (hidden in week 1) from `comparison`
- [x] 6.5 Add share button: capture report card via `react-native-view-shot` and open native share sheet (`expo-sharing`)

## 7. Mobile — Offline Tasks Screen

- [x] 7.1 Replace placeholder `OfflineTasksScreen.tsx`: fetch tasks for selected week, render loading/error + pull-to-refresh
- [x] 7.2 Render task cards (bold title, body + parent script, ⚠️ italic safety note, "Ngày N" indicator, completion checkbox), reusing/extending `OfflineTaskCard.tsx`
- [x] 7.3 Wire checkbox → `PATCH` offline-task and optimistic state update
- [x] 7.4 Add "Tuần này" / "Tuần trước" filter tabs that switch week and re-fetch
- [x] 7.5 Add empty-state illustration + message when no tasks for the week

## 8. Finalize

- [ ] 8.1 Manually verify both screens against the design handoff (locked/unlocked report, chart from week 2, share sheet, task toggle, week filter, empty state)
- [x] 8.2 Commit as a single epic commit: `feat(epic-009): parent reports & tasks`
