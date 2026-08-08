## ADDED Requirements

### Requirement: Canonical activity status lifecycle

An activity SHALL move through a single canonical status lifecycle regardless of how the pipeline is run: `draft` (generated) → `pending_review` (reviewed + assets/media enqueued) → `approved` (Human Gate) → `imported` (published to `kido-server`). The pipeline SHALL NOT set `approved` or `imported` outside of, respectively, the Human Gate and the publish step.

#### Scenario: Content awaiting review sits at pending_review

- **WHEN** an activity has passed AI review and its image/audio jobs are enqueued
- **THEN** its status is `pending_review`
- **AND** it is not `approved` or `imported`

#### Scenario: approved is only set by the Human Gate

- **WHEN** any pipeline path completes generation and media for an activity
- **THEN** it does not set the activity to `approved` on its own
- **AND** `approved` is reached only after a human approves it in the Human Gate

#### Scenario: imported means published to the runtime server

- **WHEN** an activity's status is `imported`
- **THEN** it has been published to `kido-server` via the publish step
- **AND** no pipeline-local step marks an activity `imported` without publishing

### Requirement: Both run modes converge on the same flow

The CLI sync runner and the queue workers SHALL produce the same end state for an activity: after generate → review → assets → image/audio, the activity SHALL be left at `pending_review` for the Human Gate. The CLI runner SHALL NOT auto-approve or locally import content.

#### Scenario: CLI sync run ends at pending_review

- **WHEN** `PipelineRunner` processes an approved seed in sync mode through media generation
- **THEN** the resulting activity status is `pending_review`
- **AND** it is neither `approved` nor `imported`

#### Scenario: Worker run ends at pending_review

- **WHEN** the generate/image/audio workers process an approved seed through media generation
- **THEN** the resulting activity status is `pending_review`

#### Scenario: Same seed, same outcome

- **WHEN** the same approved seed is processed via CLI sync mode and via the workers
- **THEN** both leave the activity in the same `pending_review` state awaiting the Human Gate

### Requirement: Legacy local-import path is retired

The pipeline SHALL NOT provide a path that marks content `approved`/`imported` inside the pipeline database as a substitute for publishing. The legacy local-import (the runner's import step and the `import` admin route/page) SHALL be retired in favour of the publish flow (`content-transfer`).

#### Scenario: No pipeline-local import in the run path

- **WHEN** an activity finishes generation and media in either run mode
- **THEN** no step copies/marks it as `imported` within the pipeline database
- **AND** reaching `imported` requires the publish step to `kido-server`

#### Scenario: Deprecated import route does not bypass the gate

- **WHEN** a user invokes the deprecated legacy import route/page
- **THEN** it does not move unapproved content to `approved`/`imported`
- **AND** it directs the user to the publish flow instead
