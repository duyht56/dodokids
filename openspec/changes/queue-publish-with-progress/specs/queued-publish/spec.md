## ADDED Requirements

### Requirement: Publish runs as a background queue job

Publishing an approved week to kido-server SHALL run as a background job on a
dedicated `publish` queue rather than inside the triggering HTTP request. The
trigger endpoint SHALL enqueue the job and return a stable `jobId` immediately
(before any asset upload or transfer), so the operator's request never blocks on
the full publish and never depends on it staying connected.

#### Scenario: Enqueue returns immediately

- **WHEN** the operator triggers a publish (live or dry-run) for a week
- **THEN** a `publish` job is enqueued and the endpoint responds with its `jobId`
  without waiting for asset upload or the transfer to complete

#### Scenario: Job runs on a worker, not the request

- **WHEN** the enqueued publish job is processed
- **THEN** a `publish`-queue worker performs the asset upload, payload build, and
  transfer to `/admin/publish`, independent of the request that enqueued it

### Requirement: Staged publish progress

The publish job SHALL advance through observable, ordered phases — verify week
approved, upload local assets to GCS, build payload, transfer to kido-server,
done — and SHALL record its current phase plus a `done`/`total` count for any
countable phase (e.g. assets uploaded, activities written) as durable job
progress that a client can read.

#### Scenario: Progress advances through phases

- **WHEN** a publish job is running
- **THEN** its recorded progress reflects the current phase and, for the upload
  phase, how many assets of the total have been uploaded

#### Scenario: Countable transfer progress

- **WHEN** the job reaches the transfer phase
- **THEN** its progress reports activities written against the total to be written

### Requirement: Progress status endpoint

The pipeline admin SHALL expose a status endpoint that, given a `jobId`, returns
the job's current phase, `done`/`total` counts, lifecycle state (waiting /
active / completed / failed), and — when terminal — its report or error. Progress
SHALL be derived from durable job state so that reloading the page or navigating
away and back reattaches to the same running job rather than losing it.

#### Scenario: Poll a running job

- **WHEN** a client requests the status of an in-flight `jobId`
- **THEN** it receives the current phase, counts, and an active lifecycle state

#### Scenario: Reattach after reload

- **WHEN** the operator reloads the page while a publish job is still running
- **THEN** the same job is re-attached by `jobId` and its live progress continues
  to display, not a fresh/empty state

### Requirement: Single-flight publish per week

The system SHALL allow at most one in-flight publish job per week. A trigger for
a week whose publish (live or dry-run) is already waiting or active SHALL be
refused or coalesced onto the existing job rather than starting a second job, so
a double-click or repeated trigger cannot double-upload assets or double-post the
week.

#### Scenario: Second trigger while one is in flight

- **WHEN** the operator triggers a publish for a week that already has a waiting
  or active publish job
- **THEN** no second job starts; the operator is attached to (or told about) the
  existing job for that week

### Requirement: Terminal job result carries report or error

On success the publish job SHALL complete carrying the same written/rejected
report the synchronous path produced; on failure it SHALL end in a failed state
carrying the error message. Because the server ingest is idempotent, a failed or
retried publish job SHALL be safe to re-run without duplicating imported content.

#### Scenario: Successful completion exposes the report

- **WHEN** a publish job finishes successfully
- **THEN** its terminal status carries the written and rejected counts and the
  per-activity rejection reasons

#### Scenario: Failure exposes the error

- **WHEN** a publish job throws during upload, build, or transfer
- **THEN** its terminal status is `failed` and carries the error message, and no
  partial success is reported as done

### Requirement: Dry-run shares the job path

A dry-run publish SHALL flow through the same publish job and status contract as
a live publish, differing only in that it skips the GCS upload phase and does not
persist content on the server, so the admin UI uses a single progress/report code
path for both.

#### Scenario: Dry-run skips upload but reports progress

- **WHEN** the operator triggers a dry-run publish
- **THEN** a publish job runs through verify → build → transfer (rehearsing the
  server guard) with progress, skipping the upload phase, and reports the same
  written/rejected shape without writing content
