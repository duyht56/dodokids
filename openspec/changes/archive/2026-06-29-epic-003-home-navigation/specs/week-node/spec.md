## ADDED Requirements

### Requirement: WeekNode renders correctly for each of 4 states
The WeekNode component SHALL accept a `state` prop of `COMPLETED | CURRENT | LOCKED | PAYWALL` and render distinct visual treatment per state. All nodes SHALL be 88px diameter circular buttons.

#### Scenario: COMPLETED node shows teal fill and stars
- **WHEN** a WeekNode has state `COMPLETED`
- **THEN** it renders with brandTeal (#4ECDC4) fill, a checkmark icon, and a star count (1–3) displayed below the node

#### Scenario: CURRENT node shows animated pulse and Đô Đô icon
- **WHEN** a WeekNode has state `CURRENT`
- **THEN** it renders with a pulsing glow animation (Reanimated), brandOrange (#FF6B35) border, and a small Đô Đô mascot icon sitting on the node

#### Scenario: LOCKED node is not tappable
- **WHEN** a WeekNode has state `LOCKED`
- **THEN** it renders with gray (#A0AEC0) fill, a lock icon, and does NOT respond to touch events

#### Scenario: PAYWALL node navigates to Paywall on tap
- **WHEN** a WeekNode has state `PAYWALL` and the user taps it
- **THEN** the app navigates to the PaywallScreen

### Requirement: Tapping a CURRENT node navigates to LessonPlayer
The WeekNode SHALL be tappable when in CURRENT state.

#### Scenario: CURRENT node tap triggers lesson navigation
- **WHEN** the child taps a node in CURRENT state
- **THEN** the app navigates to LessonPlayerScreen with the week number as a parameter
