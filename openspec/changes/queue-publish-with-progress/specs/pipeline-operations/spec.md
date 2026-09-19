## MODIFIED Requirements

### Requirement: Pause and resume the pipeline queues

The admin SHALL display each processing queue's paused state and job counts, and let the operator pause or resume queues (individually or all at once) using a global pause so it affects all workers. The observable and controllable queue set SHALL include the `publish` queue alongside generate/image/audio/seed-review.

#### Scenario: Pause halts intake

- **WHEN** the operator pauses the queues
- **THEN** no new jobs start processing and the panel shows the queues as paused

#### Scenario: Resume continues processing

- **WHEN** the operator resumes the queues
- **THEN** waiting jobs begin processing again and the panel shows the queues as running

#### Scenario: Publish queue is observable and controllable

- **WHEN** the operator opens the queue panel
- **THEN** the `publish` queue appears with its counts and paused state and can be paused/resumed like the other queues

### Requirement: Start and stop workers from the UI

The admin SHALL let an operator start and stop the pipeline worker processes (generate/image/audio/seed-review/publish) from the UI, individually or all at once, and SHALL surface the real attached-worker count per queue so the operator can tell a queue is unconsumed even when it is not paused. The `publish` queue SHALL be included so an operator can see when a publish job would pile up in `waiting` because no publish worker is attached.

#### Scenario: Start workers without a terminal

- **WHEN** the operator starts workers from the queue panel
- **THEN** the worker processes are launched and the panel's attached-worker count rises to reflect them

#### Scenario: Zero-worker queue is visible

- **WHEN** a queue has waiting jobs but no attached worker
- **THEN** the panel shows the worker count as zero with a warning, distinct from the paused state

#### Scenario: Unconsumed publish queue is visible

- **WHEN** a publish job is enqueued but no publish worker is attached
- **THEN** the panel shows the `publish` queue's worker count as zero with a warning, so the operator knows the publish will not progress until a worker is started
