## ADDED Requirements

### Requirement: PatternMatrixActivity renders pattern rows and answer options
The system SHALL render a `pattern_matrix` activity with a compact question area showing pattern rows and a clean answer grid, replacing the "Hoạt động này chưa hỗ trợ" fallback.

#### Scenario: Pattern rows display at appropriate size
- **WHEN** a `pattern_matrix` activity is loaded
- **THEN** the question container height is at most 180dp on mobile, cells are 36×36dp, and the "?" placeholder cell is visually distinct

#### Scenario: Answer options render without excessive nesting
- **WHEN** answer options are displayed
- **THEN** each answer card has exactly one background layer (white card), no nested colored backgrounds, and a uniform size of ~120×120dp

#### Scenario: Correct answer selection advances activity
- **WHEN** child taps the answer option at `correctIndex`
- **THEN** `onResult('correct')` is called

#### Scenario: Wrong answer selection triggers hint cycle
- **WHEN** child taps a wrong answer option
- **THEN** `onResult('wrong')` is called and the card briefly highlights red before resetting

### Requirement: PatternMatrix type guard and routing
`ActivityContainer` SHALL route `pattern_matrix` activities to `PatternMatrixActivity` via the `isPatternMatrix` type guard.

#### Scenario: pattern_matrix activity is routed correctly
- **WHEN** an activity with `type === 'pattern_matrix'` enters ActivityContainer
- **THEN** `PatternMatrixActivity` renders (not the "Hoạt động này chưa hỗ trợ" fallback)
