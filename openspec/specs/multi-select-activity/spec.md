# multi-select-activity Specification

## Purpose
TBD - created by archiving change epic-005-activity-types. Update Purpose after archive.
## Requirements
### Requirement: Multi-toggle option selection
The system SHALL use the same image-grid layout as single-select but allow multiple options to be toggled on and off. A selected option SHALL show a brandTeal (#4ECDC4) border and a checkmark; an unselected option SHALL show the default card.

#### Scenario: Toggle selection on and off
- **WHEN** the child taps an unselected option then taps it again
- **THEN** the option becomes selected (teal border + checkmark) and then returns to the default state

### Requirement: Confirm button gating
A full-width "Xong!" confirm button (brandOrange #FF6B35, 56pt height) SHALL appear only after at least one option is selected, and submitting the answer SHALL require pressing it.

#### Scenario: Confirm appears after first selection
- **WHEN** no options are selected
- **THEN** the confirm button is hidden, and it appears once one or more options are selected

### Requirement: Multi-select validation and partial reveal
On confirm the system SHALL compare the selected option ids against `payload.correctAnswers`. If they match the required correct set the outcome is correct; otherwise the correct options SHALL be highlighted green and wrongly selected options soft red before the full correct set is revealed, and a wrong outcome is reported.

#### Scenario: All correct selected
- **WHEN** the selected ids exactly satisfy `correctAnswers` / `minCorrect`
- **THEN** the container is notified of a correct outcome

#### Scenario: Partial / wrong selection
- **WHEN** the selected ids do not satisfy the correct set
- **THEN** correct options flash green and wrong selections flash soft red, the full correct set is revealed, and a wrong outcome is reported

