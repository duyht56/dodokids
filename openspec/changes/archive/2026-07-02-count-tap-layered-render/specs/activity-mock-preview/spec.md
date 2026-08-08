# activity-mock-preview Specification

## ADDED Requirements

### Requirement: Mock-data activity preview
The kido-pipeline admin SHALL provide a preview that renders activities through the same web-replica Lesson Player used by the human gate, but driven by built-in mock activity data (emoji visuals, no generated image or audio assets). The preview SHALL cover the `count_tap` type and its layered, spawned, seeded-layout interaction so the redesign can be evaluated before any asset generation.

#### Scenario: Reviewer opens the mock preview with no generated assets
- **WHEN** a reviewer opens the mock-preview route
- **THEN** the web-replica player renders the mock count_tap activity (background layer + `targetCount` tappable sprites) using emoji visuals
- **AND** the counting interaction, seeded non-overlapping layout, and number-answer phase behave like the mobile component

#### Scenario: Mock preview needs no real assets
- **WHEN** the mock activity has no generated `imageUrl` or audio URLs
- **THEN** the mock preview still renders (it does not apply the human-gate not-ready block)

### Requirement: Mock preview is never approvable
The mock preview SHALL be clearly distinct from the production approval gate and MUST NOT expose approve/publish actions. It MUST NOT weaken the human-gate rule that production approval requires real generated assets.

#### Scenario: No approval controls in mock preview
- **WHEN** the mock preview renders an activity
- **THEN** no approve, reject, or publish action is available
- **AND** the mock preview is visibly labeled as a design/dev preview using mock data

#### Scenario: Human gate unchanged
- **WHEN** a reviewer opens a real activity through the production human gate
- **THEN** the gate still blocks approval for activities whose assets are not generated and still never substitutes placeholders
