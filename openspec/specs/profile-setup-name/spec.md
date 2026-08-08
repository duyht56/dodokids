# Spec: Profile Setup — Name

## Purpose

Step 1 of the 3-step profile setup flow, where the parent enters the child's name before proceeding to age and avatar selection.

## Requirements

### Requirement: Step 1 collects child's name with validation
The system SHALL display a text input for child's name (max 20 chars), with a step indicator showing 3 steps, mascot hint bubble, and inline validation.

#### Scenario: Valid name shows confirmation
- **WHEN** user types a name with 2+ characters
- **THEN** "✓ Tên hợp lệ" appears in sky color (`#4ECDC4`) below input

#### Scenario: Empty name disables CTA
- **WHEN** name input is empty
- **THEN** "Tiếp theo" CTA is disabled (opacity 0.5, not pressable)

### Requirement: Step indicator shows 3 steps
The system SHALL show step indicator: "Tên bé" | "Tuổi & Lớp" | "Avatar" — active = coral, completed = sky, pending = `#D1D5DB`.

#### Scenario: Step 1 is active on mount
- **WHEN** ProfileSetup screen mounts
- **THEN** "Tên bé" step is coral, "Tuổi & Lớp" and "Avatar" are `#D1D5DB`

### Requirement: Input does not get hidden by keyboard
The system SHALL use `KeyboardAvoidingView` with `behavior='padding'` (iOS) / `'height'` (Android) so the CTA button remains visible above the keyboard.

#### Scenario: CTA visible when keyboard open
- **WHEN** user focuses the name input and keyboard appears
- **THEN** "Tiếp theo" button is still fully visible above keyboard

### Requirement: Mascot hint bubble displays contextual message
The system SHALL show Đô Đô hint bubble: "Đô Đô muốn biết tên bạn mới!" with lavender bg `#F0EBFF`, border-radius 16px, visible on step 1.

#### Scenario: Hint bubble visible on step 1
- **WHEN** step 1 is active
- **THEN** hint bubble with lavender background is displayed
