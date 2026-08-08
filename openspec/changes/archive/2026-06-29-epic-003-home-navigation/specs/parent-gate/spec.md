## ADDED Requirements

### Requirement: ParentGateModal challenges with a math question before granting parent access
The ParentGateModal SHALL present a random addition question (A + B, where A and B are each 1–9) with a custom number pad. It SHALL allow 3 attempts before locking for 60 seconds.

#### Scenario: Modal presents math challenge on open
- **WHEN** the parent taps the 👨‍👩‍👧 icon
- **THEN** a modal appears with a math question (e.g., "3 + 5 = ?"), a custom number pad (digits 0–9 + delete), and a 30-second countdown timer

#### Scenario: Correct answer grants access
- **WHEN** the parent enters the correct answer
- **THEN** `authStore.parentUnlocked` is set to `true`, the modal closes, and the app navigates to ParentDashboardScreen (stub)

#### Scenario: Wrong answer shows shake and decrements attempts
- **WHEN** the parent enters a wrong answer
- **THEN** the input field shows a shake animation, displays "Thử lại nhé!", and remaining attempts decrement. The question resets to a new random question.

#### Scenario: 3 failed attempts locks the gate for 60 seconds
- **WHEN** the parent fails 3 times in a row
- **THEN** the number pad is disabled and a countdown shows "Thử lại sau {X} giây"

#### Scenario: 30-second timeout auto-dismisses the modal
- **WHEN** 30 seconds pass with no correct answer
- **THEN** the modal automatically dismisses

### Requirement: parentUnlocked resets after 10 minutes of inactivity
The system SHALL automatically set `authStore.parentUnlocked = false` 10 minutes after it was set to `true`, guarding against leaving the parent section unattended.

#### Scenario: parentUnlocked auto-expires after 10 minutes
- **WHEN** `parentUnlocked` has been `true` for 10 minutes without the parent actively resetting the timer
- **THEN** `parentUnlocked` is set back to `false`
