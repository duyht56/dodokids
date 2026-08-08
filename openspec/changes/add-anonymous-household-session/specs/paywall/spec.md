## ADDED Requirements

### Requirement: Purchase flow requires parent PIN verification

The paywall MAY display non-transactional subscription information while parent mode is unlocked, but starting a Google Play purchase or restore operation SHALL require a current parent PIN unlock and an authenticated anonymous household. The app SHALL NOT use a development child ID fallback in a release build.

#### Scenario: Locked user presses subscribe

- **WHEN** the local parent unlock is absent or expired and subscribe is requested
- **THEN** the app presents the parent PIN challenge
- **AND** does not invoke the Google Play purchase sheet

#### Scenario: Unauthenticated session reaches paywall

- **WHEN** no valid anonymous household session exists
- **THEN** purchase and restore actions remain disabled
- **AND** the app routes through session bootstrap or recovery

#### Scenario: Verified parent starts purchase

- **WHEN** the household session is valid and the parent unlock is current
- **THEN** the app may invoke Google Play Billing
- **AND** sends verification to the server under the authenticated household
