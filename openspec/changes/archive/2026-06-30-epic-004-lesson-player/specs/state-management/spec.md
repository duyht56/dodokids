## ADDED Requirements

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

### Requirement: subscriptionStore startTrial action
The `useSubscriptionStore` SHALL expose `startTrial()` that sets `status: 'trial'` and `trialWeeks: 4` (first 4 weeks/clusters free during trial), and records `trialStartDate: string` (ISO date).

#### Scenario: startTrial sets correct state
- **WHEN** startTrial() called
- **THEN** status === 'trial', trialWeeks === 4, trialStartDate is today's ISO date string
