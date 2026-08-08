# content-pipeline-flow Specification (delta)

## ADDED Requirements

### Requirement: Generated audio URLs persist on the activity
After the audio step generates and uploads the TTS clips, the pipeline SHALL persist their URLs on the activity's `audioFiles` field. The pipeline activity schema MUST define `audioFiles` so it is not dropped by Mongoose strict mode. This applies to both run modes (CLI sync runner and the Bull `generate`/`audio` workers).

#### Scenario: Audio URLs survive persistence
- **WHEN** the audio step completes for an activity
- **THEN** the stored activity has an `audioFiles` object populated with the generated clip URLs

#### Scenario: Human gate readiness reflects audio
- **WHEN** an activity's audio URLs are persisted and reachable
- **THEN** the web human-gate readiness check counts them and allows review/approval
