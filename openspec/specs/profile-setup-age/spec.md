# Spec: Profile Setup — Age

## Purpose

Step 2 of the profile setup flow, where the parent selects the child's age (4, 5, or 6 years old) before proceeding to avatar selection.

## Requirements

### Requirement: Step 2 displays 3 age selection cards
The system SHALL show 3 large tappable cards: "4 tuổi", "5 tuổi", "6 tuổi". Only one can be selected at a time.

#### Scenario: Age card selected state
- **WHEN** user taps "5 tuổi" card
- **THEN** card shows coral border and `rgba(255,107,53,0.12)` background; previously selected card reverts to default

#### Scenario: Age selection enables CTA
- **WHEN** user selects any age
- **THEN** "Tiếp theo" CTA becomes active (full opacity, pressable)

### Requirement: Step indicator updates to step 2
The system SHALL update step indicator: "Tên bé" = sky (completed), "Tuổi & Lớp" = coral (active), "Avatar" = `#D1D5DB`.

#### Scenario: Indicator correct on step 2
- **WHEN** user advances from step 1 to step 2
- **THEN** step 1 indicator becomes sky, step 2 becomes coral

### Requirement: Selected age persisted to authStore
The system SHALL store `child.age` as `4 | 5 | 6` in `authStore` when user taps "Tiếp theo" on step 2.

#### Scenario: Age stored on advance
- **WHEN** user selects "6 tuổi" and taps "Tiếp theo"
- **THEN** `authStore.child.age === 6`
