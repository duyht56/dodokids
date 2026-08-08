# state-management

## Purpose

Defines requirements for Zustand-based global state management in the Kido app, covering authStore, lessonStore, subscriptionStore, settingsStore, and TypeScript typing rules for all stores.

## Requirements

### Requirement: authStore defined with persistence
The system SHALL have a Zustand `authStore` with `{ child, isOnboarded, parentUnlocked }` persisted to AsyncStorage.

#### Scenario: Child data persists across app restarts
- **WHEN** user sets child name and age then closes and reopens the app
- **THEN** `authStore.child` contains the previously saved data

#### Scenario: parentUnlocked is NOT persisted
- **WHEN** app restarts
- **THEN** `authStore.parentUnlocked` is always `false` (memory-only)

### Requirement: lessonStore defined
The system SHALL have a Zustand `lessonStore` with `{ currentLesson, currentActivity, progress }`. Not persisted (session only).

#### Scenario: lessonStore resets on new session
- **WHEN** app is cold-started
- **THEN** `lessonStore.currentLesson` is `null`

### Requirement: subscriptionStore defined with persistence
The system SHALL have a Zustand `subscriptionStore` with `{ plan, status, trialWeeks, paidWeeks }` persisted to AsyncStorage.

#### Scenario: Plan status persists across restarts
- **WHEN** user purchases annual plan and restarts app
- **THEN** `subscriptionStore.plan` is `'annual'`

### Requirement: settingsStore defined with persistence
The system SHALL have a Zustand `settingsStore` with `{ audioEnabled, notificationsEnabled, volume, weeklyEmailEnabled }` persisted to AsyncStorage. It SHALL expose `setAudioEnabled`, `setNotificationsEnabled`, `setVolume`, and `setWeeklyEmailEnabled` actions. `weeklyEmailEnabled` SHALL default to `true` and back the Settings screen "Email tổng kết tuần" toggle.

#### Scenario: Audio setting persists
- **WHEN** user disables audio and restarts app
- **THEN** `settingsStore.audioEnabled` is `false`

#### Scenario: Notifications setting persists
- **WHEN** user disables notifications and restarts app
- **THEN** `settingsStore.notificationsEnabled` is `false`

#### Scenario: Weekly email setting persists
- **WHEN** user disables "Email tổng kết tuần" and restarts the app
- **THEN** `settingsStore.weeklyEmailEnabled` is `false`

#### Scenario: Legacy persisted settings get default
- **WHEN** the app hydrates settings persisted before `weeklyEmailEnabled` existed
- **THEN** `settingsStore.weeklyEmailEnabled` is `true` (the default), not `undefined`

### Requirement: All stores fully typed with TypeScript
Every store SHALL have TypeScript interfaces for state and actions with no `any` types.

#### Scenario: Store type error caught at compile time
- **WHEN** developer assigns wrong type to store field
- **THEN** TypeScript compiler reports an error

### Requirement: Cluster-of-5 progression via (week, day)
The `progress` object in `useAuthStore` SHALL track progression with `currentWeek` (cluster index, ≥1) and `currentDay` (day within the cluster, 1–5), mirroring the backend model. A cluster = 5 consecutive days. Completing day 5 advances to next week, day 1. A global day index MAY be derived as `(currentWeek - 1) * 5 + currentDay` for display/navigation.

#### Scenario: Completing day 5 advances cluster
- **WHEN** currentDay === 5 and the day is completed
- **THEN** currentWeek increments by 1 and currentDay resets to 1

#### Scenario: Completing mid-cluster day advances within cluster
- **WHEN** currentDay === 2 and the day is completed
- **THEN** currentDay becomes 3, currentWeek unchanged

### Requirement: Progress state includes xp and streak
The `progress` object in `useAuthStore` SHALL include `xp: number` (total XP earned) and `streak: number` (current consecutive day streak), both defaulting to 0.

#### Scenario: Initial state has xp and streak at 0
- **WHEN** authStore initializes with no persisted data
- **THEN** progress.xp === 0 and progress.streak === 0

### Requirement: addXp action updates total XP
The authStore SHALL expose `addXp(amount: number)` that adds to `progress.xp`.

#### Scenario: addXp increments correctly
- **WHEN** addXp(100) called with progress.xp = 50
- **THEN** progress.xp === 150

### Requirement: setStreak action updates streak
The authStore SHALL expose `setStreak(days: number)` that sets `progress.streak`.

#### Scenario: setStreak updates correctly
- **WHEN** setStreak(7) called
- **THEN** progress.streak === 7

### Requirement: Lesson Stars In Auth Store
The `authStore.progress` shape SHALL include `lessonStars: Record<string, number>` (default `{}`), persisted via the store's persist config. A `setLessonStars(lessonId, stars)` action SHALL update an entry only when the new value exceeds the stored one (local best-score mirror). The persist `merge` SHALL deep-merge `progress` so state persisted before `lessonStars` existed still receives the current defaults instead of `undefined`.

#### Scenario: Best-score local mirror
- **WHEN** `setLessonStars('w1d1', 1)` is called while the store already holds 3 for `w1d1`
- **THEN** the stored value remains 3

#### Scenario: Higher score updates
- **WHEN** `setLessonStars('w1d2', 2)` is called and no value exists
- **THEN** the store records 2 for `w1d2`

#### Scenario: Legacy persisted progress gets defaults
- **WHEN** the app hydrates `progress` persisted before `lessonStars` existed
- **THEN** `progress.lessonStars` is `{}` (not `undefined`) after merge

### Requirement: Day sequential lock — incomplete day blocks next day
Progression is strictly sequential. The child can only enter the lesson at `(currentWeek, currentDay)`. Days/clusters beyond the current position SHALL remain locked until reached. An incomplete day does not advance `currentDay`, so re-entry resumes the same day.

#### Scenario: Future cluster locked
- **WHEN** currentWeek = 2 and the map shows week 3
- **THEN** the week 3 node is LOCKED

#### Scenario: Completed day advances position
- **WHEN** the day at (currentWeek=1, currentDay=3) is completed
- **THEN** currentDay advances to 4 and that becomes the new active lesson

### Requirement: Incomplete lesson restarts from activity 0
If a lesson session is started but not completed (user exits before last activity), the next session for that day SHALL start from activity index 0.

#### Scenario: Partial progress discarded on re-entry
- **WHEN** user completed 4 of 8 activities then navigated away
- **THEN** re-entering the lesson starts at activity index 0 (no partial save)

### Requirement: authStore offlineTask field
The `authStore` SHALL include an `offlineTask` field alongside `progress`, `child`, `parentUnlocked`, and `isOnboarded`, shaped as `{ taskId: string | null; status: 'pending' | 'done' | 'skipped'; completedAt: string | null } | null` (ISO 8601 timestamp), defaulting to `null`. `offlineTask` SHALL be persisted to AsyncStorage. The store SHALL expose `setOfflineTask(task)` that replaces the field atomically.

#### Scenario: Initial store state
- **WHEN** the app is launched fresh with no AsyncStorage data
- **THEN** `authStore.offlineTask` is `null`

#### Scenario: Hydration from storage
- **WHEN** the app restarts and AsyncStorage contains a serialized `offlineTask`
- **THEN** `authStore.offlineTask` is populated with the stored value on first render

#### Scenario: Optimistic update on done
- **WHEN** the user taps "✅ Đã làm" and `setOfflineTask({ taskId, status: 'done', completedAt: new Date().toISOString() })` is called
- **THEN** `authStore.offlineTask.status` immediately reflects `'done'` before the BE `PATCH` resolves

### Requirement: subscriptionStore startTrial action
The `useSubscriptionStore` SHALL expose `startTrial()` that sets `status: 'trial'` and `trialWeeks: 4` (first 4 weeks/clusters free during trial), and records `trialStartDate: string` (ISO date).

#### Scenario: startTrial sets correct state
- **WHEN** startTrial() called
- **THEN** status === 'trial', trialWeeks === 4, trialStartDate is today's ISO date string
