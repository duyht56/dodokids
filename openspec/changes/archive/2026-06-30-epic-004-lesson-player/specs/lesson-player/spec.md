## ADDED Requirements

### Requirement: Display activity with progress bar
The system SHALL display a header with back button, lesson title (e.g. "Tuần 3 · Bài 2"), a teal progress bar showing current question index out of total (e.g. 4/8), and a counter label.

#### Scenario: Progress bar fills proportionally
- **WHEN** user is on question 4 of 8
- **THEN** progress bar fills to 50% with sky/teal color (#4ECDC4)

### Requirement: Show mascot speech bubble
The system SHALL display Đô Đô mascot (dodo.png, 66pt mobile / 240pt tablet) with a teal speech bubble containing the question prompt text.

#### Scenario: Speech bubble renders with tail
- **WHEN** LessonPlayerScreen mounts
- **THEN** dodo image appears left of a teal (#4ECDC4) rounded bubble with a left-pointing tail

### Requirement: Render question image zone
The system SHALL display a pastel-pink radial gradient image zone (mobile: 208pt height, tablet: 230pt) containing the subject images for the current question (e.g. 4 clay-leaf tiles).

#### Scenario: Image zone shows correct count of subject images
- **WHEN** question has 4 answer objects
- **THEN** 4 images render in a wrapped grid inside the image zone with rounded corners and soft shadow

### Requirement: Single-select answer options (2×2 grid)
The system SHALL display 4 answer options in a 2×2 grid. Default state: white bg, 2pt border #F0ECE4. Selected state: coral border 3pt, coral text, coral shadow. Correct state: green bg #EAF7EA, green border #4CAF50, green text, ✓ badge top-right.

#### Scenario: Option selected before submission
- **WHEN** user taps an option card
- **THEN** that card gets coral border/text/shadow; other cards revert to default

#### Scenario: Correct answer revealed
- **WHEN** selected option matches correct answer
- **THEN** card flashes green (green-flash animation), ✓ badge appears, other options fade to opacity 0.5

#### Scenario: Wrong answer revealed
- **WHEN** selected option does not match correct answer
- **THEN** selected card shakes (translateX shake animation), mascot updates to encouraging message

### Requirement: Tablet split-panel layout
The system SHALL render a two-column layout on screens ≥768pt: left panel (38% width) with Đô Đô floating + speech bubble (kido-float), right panel (62%) with question image and options grid.

#### Scenario: Tablet renders Đô Đô fixed panel
- **WHEN** screen width ≥ 768pt
- **THEN** left panel shows dodo with kido-float animation and teal speech card; right panel shows question + 2×2 options

### Requirement: Auto-advance on correct answer
The system SHALL auto-advance to next question after 1200ms delay when correct answer is selected.

#### Scenario: Auto-advance timing
- **WHEN** correct answer selected
- **THEN** after 1200ms the next question renders (or LessonComplete if last question)
