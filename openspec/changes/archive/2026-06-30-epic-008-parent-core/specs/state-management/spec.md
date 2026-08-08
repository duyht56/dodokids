## MODIFIED Requirements

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
