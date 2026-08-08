## ADDED Requirements

### Requirement: Progress Card
`ParentDashboardScreen` SHALL render a Progress Card at the top showing: streak days (`streakCount`), total XP earned (`xp`), lessons completed this week (count from `completedLessons`), and current week number. The card SHALL use a coral gradient background matching `btn_coral` design token.

#### Scenario: Progress data loaded from store
- **WHEN** the screen mounts and `authStore.progress` has `streakCount`, `xp`, `completedLessons`
- **THEN** the card renders streak badge, XP badge, and lesson-count badge without waiting for network

#### Scenario: Server data overrides local
- **WHEN** `GET /parent/summary` resolves successfully
- **THEN** the progress values update in-place (no full re-render flicker) and `SkeletonLoader` placeholders are replaced

### Requirement: Weekly Report Section
The screen SHALL render a Weekly Report section showing D1–D5 completion status for the current week. Each day row SHALL show: day label, subject icon, completed/pending state. The section SHALL be locked (blurred rows + lock overlay) on any day other than Sunday (`getDay() !== 0`).

#### Scenario: Non-Sunday visit
- **WHEN** the user opens the dashboard on a weekday
- **THEN** D1–D5 rows are visible but blurred and a lock icon with label "Xem vào Chủ nhật" is overlaid

#### Scenario: Sunday unlock
- **WHEN** `new Date().getDay() === 0`
- **THEN** all day rows are fully visible and interactive (no blur/lock)

### Requirement: Offline Task Section
The screen SHALL render an `OfflineTaskCard` for the current week's offline task (data from `GET /parent/summary` response field `offlineTask`). While loading, a `SkeletonLoader` SHALL be shown in place.

#### Scenario: Task pending
- **WHEN** `offlineTask.status === 'pending'`
- **THEN** `OfflineTaskCard` renders with "✅ Đã làm" and "⏭ Bỏ qua" action buttons

#### Scenario: Task completed
- **WHEN** `offlineTask.status === 'done'` or `'skipped'`
- **THEN** `OfflineTaskCard` renders in done/skipped state with `completedAt` timestamp; action buttons are hidden

### Requirement: Settings Section
The screen SHALL render a Settings section with three rows: notifications toggle, sound toggle, and subscription management link. Notification and sound toggles SHALL update local state only (no backend call). Subscription management SHALL call `Linking.openURL` to the appropriate App Store / Play Store subscription management URL.

#### Scenario: Toggle sound off
- **WHEN** user taps the sound toggle
- **THEN** toggle switches state immediately (optimistic) and the change persists across app restarts via AsyncStorage

#### Scenario: Manage subscription tap
- **WHEN** user taps "Quản lý đăng ký"
- **THEN** `Linking.openURL` opens the platform subscription management URL (iOS: `itms-apps://...`, Android: `market://...`)

### Requirement: Skeleton Loading State
While `GET /parent/summary` is in-flight, the screen SHALL render `SkeletonLoader` placeholders for the Progress Card and Offline Task Card. The rest of the screen (Weekly Report from local data, Settings) SHALL render immediately without skeletons.

#### Scenario: Slow network
- **WHEN** the API call takes >500ms
- **THEN** skeleton placeholders are visible for the progress card area and offline task area; the user is never shown a blank screen

### Requirement: Tablet Two-Column Layout
On tablet (`useIsTablet() === true`), the screen SHALL render a 2-column layout: left column (40%) shows the Progress Card and a fixed mascot illustration; right column (60%) shows Weekly Report, Offline Task, and Settings in a scroll view.

#### Scenario: Tablet portrait
- **WHEN** `useIsTablet()` returns true
- **THEN** columns are rendered in a `flexDirection: 'row'` container with correct width ratios

### Requirement: Inter Font for Body Text
`ParentDashboardScreen` and all child components rendered within it SHALL use `Inter_600SemiBold` (not Nunito) for body-level text (fontSize 15) to match the calmer parent-facing tone in the design handoff.

#### Scenario: Body text font
- **WHEN** any text with `fontSize >= 13` is rendered inside the dashboard
- **THEN** its `fontFamily` is `Inter_600SemiBold`, not any Nunito variant
