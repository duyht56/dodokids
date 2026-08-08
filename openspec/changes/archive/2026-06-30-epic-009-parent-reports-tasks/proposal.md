## Why

EPIC-008 shipped the parent dashboard with placeholder Report and Offline-Tasks screens. Parents currently have no way to see a detailed weekly progress report or work through the full set of at-home activities. EPIC-009 (Parent Module — Reports & Tasks) completes the parent experience by delivering the full weekly report and the weekly offline-tasks list.

## What Changes

- Add a **weekly report API** (`GET /parent/:childId/report?week={n}`) returning a lock state, per-subject progress, templated "strengths" and "growth areas" copy, a 4-week comparison series, and 3 next-week activity suggestions — all derived server-side from the child's progress (no external LLM calls this epic; deterministic templates + a forbidden-language safety filter).
- Add an **offline-tasks API**: `GET /parent/:childId/offline-tasks?week={n}` returning the week's task list (one task per learning day, 5/week) and `PATCH /parent/:childId/offline-tasks/:taskId` to toggle per-task completion.
- Build the full **Weekly Report screen**: locked/blurred preview gated on D5 completion, subject progress bars, AI-style strengths/growth sections, a `victory-native` line chart (Week 2+), numbered suggestions, and a share button that renders the report to an image and opens the native share sheet.
- Build the full **Offline Tasks screen**: per-day task cards (title, instructions + parent script, safety note, day indicator, completion checkbox), "Tuần này / Tuần trước" filter tabs, empty state, and pull-to-refresh.
- Extend the static offline-task table from one task/week to five tasks/week (per learning day) and reshape the per-task completion record. **BREAKING** to the `offlineTask` shape on the existing summary response (single task → keyed-by-taskId map).

## Capabilities

### New Capabilities
- `weekly-report-api`: Backend endpoint serving the gated weekly report — subject progress, templated strengths/growth copy with safety filtering, 4-week comparison series, and next-week suggestions; results cached per child/week.
- `weekly-report-screen`: Parent-facing Weekly Report screen with lock gate, progress bars, AI-style sections, comparison chart, suggestions, and share-to-image.
- `offline-tasks-api`: Backend endpoints for the per-day weekly offline-task list and per-task completion toggle.
- `offline-tasks-screen`: Parent-facing full Offline Tasks screen with per-day cards, week filter tabs, empty state, and pull-to-refresh.

### Modified Capabilities
- `parent-api`: The offline-task model changes from a single task/week to a list of per-day tasks; the summary response `offlineTask` field and `OFFLINE_TASKS` table are reshaped accordingly.

## Impact

- **Backend** (`kido-server`): new `reports` logic and offline-task list endpoints in the `parent` module; reshaped `OFFLINE_TASKS` table and `child.schema` offline-task record; new DTOs; templated report generator + forbidden-language filter.
- **Mobile** (`mobile`): replaces placeholder `ReportScreen.tsx` and `OfflineTasksScreen.tsx`; new `reportApi` / extended `parentApi` service calls; new dependency `victory-native` (charts) and an image-capture/share dependency (`react-native-view-shot` + Expo Sharing).
- **Specs**: new specs for the four capabilities; delta to `parent-api`.
- No changes to auth (still `:childId`-based, no JWT).
