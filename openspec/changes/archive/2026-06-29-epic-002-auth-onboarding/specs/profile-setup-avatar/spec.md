## ADDED Requirements

### Requirement: Step 3 displays 3×3 avatar grid
The system SHALL display 9 avatar options in a 3×3 grid (phase 1: emoji — 🐵 🐱 🐶 🦊 🐼 🐸 🦁 🐯 🐰), each minimum 88×88px hit area.

#### Scenario: Avatar grid renders 9 options
- **WHEN** step 3 is active
- **THEN** 9 avatar options are displayed in a 3×3 grid

#### Scenario: Selected avatar shows active state
- **WHEN** user taps an avatar
- **THEN** selected avatar shows coral border and scale 1.1, previously selected reverts to default

### Requirement: CTA completes onboarding on step 3
The system SHALL show "Bắt đầu với Đô Đô!" CTA. On tap, it SHALL: save `child.avatarId` to `authStore`, call `POST /api/children`, set `isOnboarded: true`, navigate to Home.

#### Scenario: Completing setup navigates to Home
- **WHEN** user selects avatar and taps "Bắt đầu với Đô Đô!"
- **THEN** `authStore.isOnboarded` becomes `true` and app navigates to ChildStack/Home

#### Scenario: API failure shows error but does not block
- **WHEN** `POST /api/children` fails (network error)
- **THEN** app still sets `isOnboarded: true` and navigates to Home (offline-first)

### Requirement: Avatar selection persisted to authStore
The system SHALL store `child.avatarId` (string emoji or asset key) in `authStore` when setup completes.

#### Scenario: AvatarId stored on completion
- **WHEN** user selects 🐵 and completes setup
- **THEN** `authStore.child.avatarId === '🐵'`
