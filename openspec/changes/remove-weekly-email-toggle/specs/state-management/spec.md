## ADDED Requirements

### Requirement: settingsStore persists sound and notification settings
The system SHALL have a Zustand `settingsStore` with `{ audioEnabled, notificationsEnabled, volume }` persisted to AsyncStorage. It SHALL expose `setAudioEnabled`, `setNotificationsEnabled`, and `setVolume` actions.

#### Scenario: Audio setting persists
- **WHEN** user disables audio and restarts app
- **THEN** `settingsStore.audioEnabled` is `false`

#### Scenario: Notifications setting persists
- **WHEN** user disables notifications and restarts app
- **THEN** `settingsStore.notificationsEnabled` is `false`

## REMOVED Requirements

### Requirement: settingsStore defined with persistence
**Reason**: Replaced by "settingsStore persists sound and notification settings". The new requirement drops `weeklyEmailEnabled`, `setWeeklyEmailEnabled`, and the "Weekly email setting persists" and "Legacy persisted settings get default" scenarios. OpenSpec does not let a MODIFIED block drop scenarios, so the requirement is removed here and re-added under a new name.

**Migration**: No storage migration. Installs that already saved the flag keep an unused `weeklyEmailEnabled` key in the `kido-settings` AsyncStorage entry. Nothing reads it.
