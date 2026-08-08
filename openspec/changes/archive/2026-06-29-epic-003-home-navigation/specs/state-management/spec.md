## MODIFIED Requirements

### Requirement: authStore includes child progress shape and parentUnlocked flag
The `authStore` SHALL be extended with a `progress` object (currentWeek, currentDay, completedLessons, streakCount) and a `parentUnlocked` boolean. `parentUnlocked` SHALL NOT be persisted to AsyncStorage. `progress` SHALL have sensible defaults and be writable via a `setProgress` action.

#### Scenario: authStore initializes with default progress
- **WHEN** the app starts fresh with no stored state
- **THEN** `authStore.progress` equals `{ currentWeek: 1, currentDay: 1, completedLessons: [], streakCount: 0 }`

#### Scenario: parentUnlocked is false on cold start
- **WHEN** the app launches
- **THEN** `authStore.parentUnlocked` is `false` regardless of previous session

#### Scenario: setParentUnlocked action updates flag
- **WHEN** `authStore.setParentUnlocked(true)` is called
- **THEN** `authStore.parentUnlocked` becomes `true` and a 10-minute reset timer starts

#### Scenario: parentUnlocked is excluded from AsyncStorage persistence
- **WHEN** the persist middleware saves authStore
- **THEN** the persisted payload does NOT include `parentUnlocked`
