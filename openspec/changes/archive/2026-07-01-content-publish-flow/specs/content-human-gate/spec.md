## ADDED Requirements

### Requirement: WYSIWYG activity preview

The pipeline admin SHALL render each candidate activity through a web replica of the mobile Lesson Player so the reviewer evaluates exactly what a child experiences. The preview MUST use the real generated image assets and audio (the GCS URLs produced by the asset/audio steps), never placeholders, and MUST support all six action types (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`, `watch_video`).

#### Scenario: Reviewer opens an activity that has finished asset generation

- **WHEN** a reviewer opens an activity whose status is past the asset/audio step
- **THEN** the admin renders it in the web-replica Lesson Player using the activity's real image URLs and plays its real audio scripts
- **AND** the rendered interaction (options, tap targets, sequencing, matching, counting) behaves like the corresponding mobile activity component

#### Scenario: Activity has not finished asset generation

- **WHEN** a reviewer opens an activity whose assets or audio are not yet generated
- **THEN** the gate marks it not-ready-for-review and does not allow approval
- **AND** the preview does not substitute placeholder images or audio

### Requirement: Production-ready review checklist

The gate SHALL present a production-ready checklist beside the preview, and approval of an activity MUST require the reviewer to confirm each checklist item. The checklist MUST cover: image renders correctly and matches the intended subject, audio plays and matches the on-screen text, the activity is solvable (the marked correct answer is actually correct), no forbidden words, and layout does not overflow.

#### Scenario: Reviewer approves with all checklist items confirmed

- **WHEN** a reviewer confirms every checklist item and approves the activity
- **THEN** the activity is marked approved and becomes eligible for the week-level publish

#### Scenario: Reviewer attempts approval with unconfirmed checklist items

- **WHEN** a reviewer tries to approve an activity while one or more checklist items are unconfirmed
- **THEN** the gate blocks the approval and indicates which items remain

### Requirement: Per-week batch publish

The gate SHALL batch the publish decision at the week level: a week becomes publishable only when all of its activities are individually approved, and the reviewer confirms the publish once per week. The gate MUST show per-week progress (approved vs total activities).

#### Scenario: All activities in a week are approved

- **WHEN** every activity across all days of a week has been individually approved
- **THEN** the week is marked publishable and a single "publish week" action is offered

#### Scenario: A week has unapproved activities

- **WHEN** one or more activities in a week are not yet approved
- **THEN** the week is not publishable and the gate shows the remaining count

### Requirement: No AI review or duplicate detection at the gate

The gate SHALL NOT run an AI content review and SHALL NOT show a duplicate-detection panel. Content-quality and cross-week duplication are owned upstream by Seed Review in the pipeline; the gate is solely a human production-readiness decision.

#### Scenario: Gate renders without AI or duplicate checks

- **WHEN** the gate displays an activity for review
- **THEN** it shows only the WYSIWYG preview and the production-ready checklist
- **AND** it does not call any AI review service or render a duplicate-detection panel
