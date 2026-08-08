## ADDED Requirements

### Requirement: Settings exposes parent security and recovery controls

The parent settings screen SHALL show the anonymous household's device/recovery status, allow a PIN-verified parent to change the parent PIN, show the locally secured recovery code, regenerate the recovery code, and explain that both recovery code and PIN are needed on a replacement device. It SHALL never display the device secret.

#### Scenario: Parent opens security settings while unlocked

- **WHEN** a PIN-verified parent opens the security section
- **THEN** the app shows recovery availability and permitted controls
- **AND** does not expose the bearer credential or device secret

#### Scenario: Recovery code is unavailable locally

- **WHEN** the current device does not hold the one-time recovery code
- **THEN** the screen offers PIN-verified code regeneration
- **AND** does not claim that the old plaintext code can be fetched from the server

### Requirement: Settings locks with parent mode

Security, subscription, child profile mutation, and recovery settings SHALL be inaccessible when the local parent unlock expires or the app backgrounds.

#### Scenario: App backgrounds on a protected settings screen

- **WHEN** the app enters the background while protected settings are visible
- **THEN** parent mode locks
- **AND** returning to the app requires the PIN challenge before protected content is shown

