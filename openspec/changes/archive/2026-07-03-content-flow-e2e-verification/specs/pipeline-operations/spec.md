# pipeline-operations Specification

## Purpose

Operator controls in the kido-pipeline admin UI to drive and observe the content pipeline without the CLI: trigger seed review, trigger activity generation, preview generated activities as the child sees them, publish to kido-server, and pause/resume the processing queues.

## ADDED Requirements

### Requirement: Trigger activity generation from the admin UI
The admin SHALL let an operator enqueue activity generation for an approved seed or for a whole week without using the CLI. Only `approved` seeds are enqueued; the action reports how many were queued.

#### Scenario: Generate a week from the dashboard
- **WHEN** the operator clicks Generate on a week row
- **THEN** every `approved`, not-yet-done seed in that week is enqueued to the generate queue and the operator sees the queued count

#### Scenario: Non-approved seeds are not generated
- **WHEN** a seed is not `approved`
- **THEN** it is not enqueued and (for a single-seed trigger) the operator is told why

### Requirement: Pause and resume the pipeline queues
The admin SHALL display each processing queue's paused state and job counts, and let the operator pause or resume queues (individually or all at once) using a global pause so it affects all workers.

#### Scenario: Pause halts intake
- **WHEN** the operator pauses the queues
- **THEN** no new jobs start processing and the panel shows the queues as paused

#### Scenario: Resume continues processing
- **WHEN** the operator resumes the queues
- **THEN** waiting jobs begin processing again and the panel shows the queues as running

### Requirement: Preview generated activities as on mobile
The admin SHALL render each generated activity through a web replica of the mobile Lesson Player, covering all MVP action types, so the operator previews exactly what the child sees before publishing.

#### Scenario: Per-type preview
- **WHEN** the operator opens a generated activity in the review UI
- **THEN** it renders through the web Lesson Player matching its action type's mobile component (including count_tap's layered background + tappable sprites)

### Requirement: All seeded weeks are visible
The dashboard SHALL list every week that has seeds (derived from the seed data, not a fixed range) so verification or out-of-range weeks are visible and actionable.

#### Scenario: Verification weeks appear
- **WHEN** seeds exist for weeks outside the normal curriculum range (e.g. 90/91)
- **THEN** those weeks appear on the dashboard with their generate/review/publish actions

### Requirement: Start and stop workers from the UI
The admin SHALL let an operator start and stop the pipeline worker processes (generate/image/audio/seed-review) from the UI, individually or all at once, and SHALL surface the real attached-worker count per queue so the operator can tell a queue is unconsumed even when it is not paused.

#### Scenario: Start workers without a terminal
- **WHEN** the operator starts workers from the queue panel
- **THEN** the worker processes are launched and the panel's attached-worker count rises to reflect them

#### Scenario: Zero-worker queue is visible
- **WHEN** a queue has waiting jobs but no attached worker
- **THEN** the panel shows the worker count as zero with a warning, distinct from the paused state

### Requirement: Import seed files from the UI
The admin SHALL let an operator import seed files (from the repository's seeds directory or an uploaded JSON) without the CLI; imported seeds are upserted and enqueued for seed review.

#### Scenario: Import a seed file by name
- **WHEN** the operator imports a seed file listed in the admin
- **THEN** its new seeds are created and enqueued for seed review, and the count of newly-imported vs already-present seeds is reported

#### Scenario: Import an uploaded JSON
- **WHEN** the operator uploads a seed JSON payload
- **THEN** its seeds are imported the same way as an on-disk seed file
