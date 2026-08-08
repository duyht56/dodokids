# offline-tasks-screen

## Purpose

Defines the parent-facing Offline Tasks screen (Screen 14) — the mobile UI that fetches the per-day weekly offline-task list and renders task cards with completion checkboxes, week filter tabs, an empty state, and pull-to-refresh.

## Requirements

### Requirement: Offline Tasks Screen Host
The mobile app SHALL replace the placeholder `OfflineTasksScreen` with a full screen that fetches `GET /parent/:childId/offline-tasks` for the selected week and renders the task list. It SHALL support pull-to-refresh and show loading and error states.

#### Scenario: Pull to refresh
- **WHEN** the parent pulls down on the list
- **THEN** the task list re-fetches from the API

### Requirement: Task Cards
Each task SHALL render a card showing: the title (bold, ≤8 words); the body text (full instructions + parent script); a safety note as italic text prefixed with ⚠️; a day indicator ("Ngày 1", "Ngày 2", …); and a completion checkbox reflecting the task's `completed` state.

#### Scenario: Card content
- **WHEN** a task is rendered
- **THEN** its title, body, safety note, day indicator, and checkbox are all shown

#### Scenario: Toggle completion
- **WHEN** the parent taps a task's checkbox
- **THEN** the app calls `PATCH /parent/:childId/offline-tasks/:taskId` with the new `completed` value and updates the checkbox state

### Requirement: Week Filter Tabs
The screen SHALL provide "Tuần này" and "Tuần trước" filter tabs that switch the displayed week and re-fetch the corresponding task list.

#### Scenario: Switch to previous week
- **WHEN** the parent taps "Tuần trước"
- **THEN** the previous week's tasks are fetched and displayed

### Requirement: Empty State
When the selected week has no tasks, the screen SHALL display a friendly illustration and message instead of an empty list.

#### Scenario: No tasks for week
- **WHEN** the API returns an empty `tasks` array
- **THEN** the screen shows the empty-state illustration and message
