# match-pair-activity Specification

## Purpose
TBD - created by archiving change epic-005-activity-types. Update Purpose after archive.
## Requirements
### Requirement: Two-column matching layout
The system SHALL render `payload.leftItems` (2–4) in a left column and `payload.rightItems` (2–4, shuffled) in a right column, each item showing its image at a minimum of 88×88pt with a connection dot on the facing edge, plus a "x/total cặp" progress label.

#### Scenario: Columns rendered with connection dots
- **WHEN** a match-pair activity mounts
- **THEN** left and right items render in two columns with connection dots, and the pair counter shows `0/<total> cặp`

### Requirement: Tap-to-connect interaction
The system SHALL connect items by tapping a left item to select it (brandOrange border + pulsing dot) then tapping a right item to form a pair, drawing a connection line between them with `react-native-svg`. Item positions SHALL be measured so the line endpoints track the dots.

#### Scenario: Select then connect
- **WHEN** the child taps a left item and then a right item
- **THEN** an SVG line is drawn between their connection dots and the pair is recorded

### Requirement: Per-pair validation and completion
Each formed pair SHALL be validated against `payload.correctPairs`: a correct pair shows a green line with the items dimming slightly; a wrong pair flashes red and its line disappears so the child can retry. When all pairs are correctly connected the activity SHALL report a correct outcome.

#### Scenario: Correct pair
- **WHEN** a formed pair matches an entry in `correctPairs`
- **THEN** the line turns green, the two items dim, and the pair counter increments

#### Scenario: Wrong pair
- **WHEN** a formed pair does not match `correctPairs`
- **THEN** the line flashes red and disappears, leaving both items selectable again

#### Scenario: All pairs matched
- **WHEN** every correct pair has been connected
- **THEN** a correct outcome is reported

