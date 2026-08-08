# content-transfer Specification (delta)

## ADDED Requirements

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
