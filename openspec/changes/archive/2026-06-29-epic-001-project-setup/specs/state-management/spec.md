## ADDED Requirements

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
The system SHALL have a Zustand `settingsStore` with `{ audioEnabled, volume }` persisted to AsyncStorage.

#### Scenario: Audio setting persists
- **WHEN** user disables audio and restarts app
- **THEN** `settingsStore.audioEnabled` is `false`

### Requirement: All stores fully typed with TypeScript
Every store SHALL have TypeScript interfaces for state and actions with no `any` types.

#### Scenario: Store type error caught at compile time
- **WHEN** developer assigns wrong type to store field
- **THEN** TypeScript compiler reports an error
