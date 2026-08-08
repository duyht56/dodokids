## ADDED Requirements

### Requirement: Published content view

The kido-server SHALL provide a page that lists published activities and lessons with their key metadata (week, day, subject, action type, status, last transfer time). The view MUST be read-only with respect to activity content — it does not edit the activity payload, audio scripts, or assets.

#### Scenario: Operator views published content

- **WHEN** an operator opens the activity management page
- **THEN** the page lists published activities and lessons with their metadata and current status
- **AND** no control allows editing the activity content payload

#### Scenario: Operator inspects a single published activity

- **WHEN** an operator opens a single published activity
- **THEN** the page shows its current served content and the time it was last transferred from the pipeline

### Requirement: Rollback and unpublish

The page SHALL let an operator unpublish a published activity so the runtime stops serving it, and re-publish it again, without editing its content. Unpublishing MUST make the runtime treat the activity/lesson as not available (the runtime already gates on `imported` status).

#### Scenario: Operator unpublishes a faulty activity

- **WHEN** an operator unpublishes a published activity
- **THEN** the runtime no longer serves that activity (its served status is no longer `imported`)
- **AND** the activity content is not modified

#### Scenario: Operator re-publishes an unpublished activity

- **WHEN** an operator re-publishes a previously unpublished activity whose content is intact
- **THEN** the runtime serves it again

### Requirement: Transfer monitoring

The page SHALL surface the outcome of publish transfers, including documents rejected by the deterministic guard, so an operator can see what was published and what failed.

#### Scenario: A publish had guard rejections

- **WHEN** a week publish rejected one or more documents at the deterministic guard
- **THEN** the management page shows the rejected items and their failure reason
