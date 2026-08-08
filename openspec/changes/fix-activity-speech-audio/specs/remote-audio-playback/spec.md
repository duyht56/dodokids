## ADDED Requirements

### Requirement: Play remote audio exclusively with completion status

The speech service SHALL play a public audio URL with `expo-audio` and SHALL return a Promise that settles with `finished`, `cancelled`, `skipped`, or `failed`. At most one playback session may be active.

#### Scenario: Valid URL finishes

- **WHEN** `speak(url)` receives a reachable URL and playback emits `didJustFinish`
- **THEN** the player is released and the Promise resolves `finished`

#### Scenario: New playback cancels the old session

- **WHEN** `speak(newUrl)` is called while another session is loading or playing
- **THEN** the old session is released and resolves `cancelled` before the new session starts

#### Scenario: Stop cancels the active session

- **WHEN** `stop()` is called while a session is loading or playing
- **THEN** the session is released, resolves `cancelled`, and no audio continues

#### Scenario: Stop with no session

- **WHEN** `stop()` is called and no session exists
- **THEN** it is an idempotent no-op

### Requirement: Fail safely and always settle

The speech service SHALL not throw playback failures to lesson UI and SHALL not leave a playback Promise pending indefinitely.

#### Scenario: Missing URL is skipped

- **WHEN** `speak()` receives `undefined` or an empty URL
- **THEN** no player is created and the Promise resolves `skipped`

#### Scenario: Resolve or native playback fails

- **WHEN** cache resolution, player creation, or playback status reports an error
- **THEN** the player is released, a DEV warning is emitted, and the Promise resolves `failed`

#### Scenario: Native completion event never arrives

- **WHEN** a session exceeds the playback safety timeout
- **THEN** the player is released and the Promise resolves `failed`
