## Purpose

The mechanical, idempotent publish step that copies approved content from the pipeline into the kido-server database. It runs a deterministic guard (schema + asset-URL reachability), upserts server-shaped activities/lessons keyed by id, moves only asset references, and defines the edit-after-import re-flow that keeps the pipeline as the single source of truth.

## Requirements

### Requirement: Mechanical idempotent publish

On week publish, the system SHALL copy each approved activity and its lesson from the pipeline database into the kido-server database. The copy MUST be idempotent: writes are upserts keyed by `activityId` (activities) and `lessonId` (lessons), so re-publishing the same content updates in place without creating duplicates. The transfer MUST NOT run any AI review and MUST NOT perform duplicate detection.

#### Scenario: First publish of a week

- **WHEN** a publishable week is published
- **THEN** every approved activity is upserted into the server `activities` collection with status `imported`
- **AND** a server-shaped lesson document is upserted into the server `lessons` collection with `lessonStatus: 'imported'` for each day

#### Scenario: Re-publish of an already-published activity

- **WHEN** an activity that already exists in the server database is published again
- **THEN** the existing server document is overwritten in place (matched by `activityId`)
- **AND** no duplicate server document is created

### Requirement: Deterministic publish guard

Before writing any document to the server database, the system SHALL run a deterministic guard and reject the write if it fails. The guard MUST validate the document against the server activity/lesson schema and MUST assert that every referenced asset URL (image, audio) resolves with HTTP 200. A document that fails the guard MUST NOT be written, and the failure MUST be reported.

#### Scenario: Document passes the guard

- **WHEN** a document validates against the server schema and all its asset URLs return HTTP 200
- **THEN** the transfer writes it to the server database

#### Scenario: Document has a broken asset reference

- **WHEN** a document references an asset URL that does not return HTTP 200
- **THEN** the transfer rejects the document, does not write it, and reports the failing reference
- **AND** the publish surfaces the failure rather than silently completing

#### Scenario: Document fails server schema validation

- **WHEN** a document does not validate against the server activity/lesson schema
- **THEN** the transfer rejects it and does not write it to the server database

### Requirement: Reference-only asset handling

The transfer SHALL move only asset references. Image and audio binaries MUST remain in their existing public GCS buckets; the transfer MUST NOT re-upload or copy binary assets.

#### Scenario: Activity with images and audio is published

- **WHEN** an activity with image and audio references is published
- **THEN** the server document stores the same GCS URLs
- **AND** no asset binary is re-uploaded or duplicated

### Requirement: Edit-after-import re-flow

The pipeline SHALL be the single source of truth for activity content. A fix to an already-published activity MUST be made in the pipeline, re-flow through the WYSIWYG Human Gate, and be re-copied via the idempotent transfer to overwrite the server copy. The kido-server SHALL NOT edit activity content directly.

#### Scenario: A live activity needs a content fix

- **WHEN** an already-published activity must be corrected
- **THEN** the correction is applied in the pipeline and the activity re-enters the Human Gate for re-approval
- **AND** on re-approval the transfer re-copies it, overwriting the server document in place

#### Scenario: Attempt to edit content on the server

- **WHEN** a user attempts to change activity content through kido-server
- **THEN** the system does not allow it (server content is read-only with respect to authoring)

### Requirement: Audio file URLs are carried and stored end-to-end
The publish payload SHALL include each activity's `audioFiles` (the five generated TTS clip URLs: `question`, `correct`, `hint1`, `hint2`, `explain`), and the kido-server SHALL persist them on the stored activity. The server activity schema MUST define an `audioFiles` field so strict-mode does not silently drop it on ingest.

#### Scenario: Published activity retains its audio
- **WHEN** an activity with generated audio is published to kido-server
- **THEN** the stored activity has a non-empty `audioFiles` object with the five clip URLs
- **AND** those URLs are among the assets the guard verifies as reachable

#### Scenario: Server schema does not drop audioFiles
- **WHEN** the ingest DTO carries `audioFiles`
- **THEN** the persisted document includes `audioFiles` (not stripped by Mongoose strict mode)

### Requirement: Published assets must be publicly reachable
The publish guard SHALL reject any activity whose referenced image or audio URLs do not resolve with HTTP 200. Because the guard and the mobile client fetch these URLs directly, the pipeline's asset storage MUST make uploaded objects publicly readable (e.g. bucket-level `allUsers:objectViewer`); private objects (HTTP 403) cause the guard to reject the activity.

#### Scenario: Private assets are rejected
- **WHEN** an activity's asset URLs return 403 (objects not public)
- **THEN** the guard rejects that activity and it is not published

#### Scenario: Public assets pass
- **WHEN** all of an activity's asset URLs return 200
- **THEN** the guard passes it and it is upserted into kido-server
