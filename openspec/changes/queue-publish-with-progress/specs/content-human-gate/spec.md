## MODIFIED Requirements

### Requirement: Per-week batch publish

The gate SHALL batch the publish decision at the week level: a week becomes publishable only when all of its activities are individually approved, and the reviewer confirms the publish once per week. The gate MUST show per-week progress (approved vs total activities).

When the reviewer confirms the publish, the gate SHALL enqueue a background publish job (per `queued-publish`) rather than issue a single synchronous blocking request, and SHALL display the job's live staged progress (current phase plus assets uploaded / activities written) until the job finishes. The progress display SHALL survive a page reload by re-attaching to the in-flight job, and on completion the gate SHALL show the final written/rejected report. A publish that fails SHALL surface its error at the gate, and the week SHALL remain re-publishable (the idempotent ingest makes a retry safe).

#### Scenario: All activities in a week are approved

- **WHEN** every activity across all days of a week has been individually approved
- **THEN** the week is marked publishable and a single "publish week" action is offered

#### Scenario: A week has unapproved activities

- **WHEN** one or more activities in a week are not yet approved
- **THEN** the week is not publishable and the gate shows the remaining count

#### Scenario: Confirming publish shows live progress

- **WHEN** the reviewer confirms the publish for a publishable week
- **THEN** the gate enqueues a background publish job and shows its staged progress (phase + upload/transfer counts) instead of a blocking spinner, then shows the written/rejected report when the job completes

#### Scenario: Progress survives a reload

- **WHEN** the reviewer reloads the gate while a publish job for the week is still running
- **THEN** the gate re-attaches to that job and continues showing its live progress rather than a fresh empty state
