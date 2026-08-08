## ADDED Requirements

### Requirement: Parent creates a server-verified PIN

The system SHALL allow an authenticated household to create a 4-6 digit parent PIN. It SHALL store only a salted password hash, SHALL reject weak invalid formats, and SHALL require the current PIN before replacement after one has been set.

#### Scenario: Parent sets the first valid PIN

- **WHEN** an authenticated household without a PIN submits a valid PIN and confirmation
- **THEN** the server stores a salted hash
- **AND** the household becomes eligible to issue a recovery code

#### Scenario: Caller replaces an existing PIN without the current PIN

- **WHEN** a caller attempts to replace an existing PIN without proving the current PIN
- **THEN** the server rejects the change

### Requirement: PIN verification resists repeated guessing

The system SHALL verify the PIN server-side, return generic failure responses, track failed attempts, and temporarily lock verification and recovery after the configured failure threshold.

#### Scenario: Correct PIN is verified

- **WHEN** an authenticated household submits the correct PIN outside a lockout window
- **THEN** verification succeeds
- **AND** prior failed-attempt state is cleared

#### Scenario: Failure threshold is reached

- **WHEN** incorrect PIN attempts reach the configured threshold
- **THEN** further verification is temporarily locked
- **AND** the response does not reveal the correct PIN or recovery state

### Requirement: Parent navigation has a bounded local unlock

The mobile app SHALL require successful PIN verification before entering the parent stack, showing or regenerating recovery material, or initiating a purchase flow. The unlock SHALL expire after five minutes of foreground activity and immediately when the app moves to the background.

#### Scenario: Child opens parent mode while locked

- **WHEN** parent mode is selected and no valid local unlock exists
- **THEN** the app displays the parent PIN challenge instead of parent content

#### Scenario: Valid unlock expires or app backgrounds

- **WHEN** five minutes elapse or the app moves to the background
- **THEN** parent mode is locked again

### Requirement: Missing parent PIN is handled as setup

The mobile app SHALL direct an authenticated household without a parent PIN through PIN setup before allowing parent-only actions, and SHALL present the newly issued recovery code for explicit acknowledgement.

#### Scenario: Parent mode is opened before PIN setup

- **WHEN** an authenticated household has not configured a parent PIN
- **THEN** the app asks the parent to create and confirm a PIN
- **AND** displays the one-time recovery code after successful setup

