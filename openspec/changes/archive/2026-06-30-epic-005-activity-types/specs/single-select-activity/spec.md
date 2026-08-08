## ADDED Requirements

### Requirement: Question image and option grid
The system SHALL display the question image from `payload.questionImage` in the upper part of the content zone, with the options rendered in the grid defined by `payload.layout`: `grid_2x2` (2×2, four options), `grid_2x1` (two larger cards), or `row_3` (three options in a horizontal row).

#### Scenario: 2×2 layout
- **WHEN** `layout` is `grid_2x2` and there are four options
- **THEN** options render in a 2×2 grid with 16pt gaps and 16pt corner radius

#### Scenario: Row layout
- **WHEN** `layout` is `row_3` and there are three options
- **THEN** options render in a single horizontal row

### Requirement: Option card presentation
Each option card SHALL render the image from its `assetRef.imageUrl` at a minimum of 120×120pt with a soft shadow, showing a loading indicator while the image loads and a gray placeholder if it fails.

#### Scenario: Image loading state
- **WHEN** an option image has not finished loading
- **THEN** an activity indicator is shown in place of the image

#### Scenario: Image failure fallback
- **WHEN** an option image fails to load
- **THEN** a gray placeholder is shown instead of a broken image

### Requirement: Single-select tap behavior
On tapping an option the system SHALL apply visual feedback within 100ms (scale to ~0.95), immediately disable all other options, and report the outcome to the container by comparing the tapped option to `payload.correctAnswer`.

#### Scenario: Correct option tapped
- **WHEN** the tapped option id equals `correctAnswer`
- **THEN** other options are disabled and the container is notified of a correct outcome

#### Scenario: Wrong option tapped
- **WHEN** the tapped option id does not equal `correctAnswer`
- **THEN** the container is notified of a wrong outcome with the current attempt number
