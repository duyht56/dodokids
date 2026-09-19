## ADDED Requirements

### Requirement: Audio URIs hydrate in parallel
`hydrateAudioFiles` SHALL resolve its five audio URIs concurrently (`Promise.all`), not sequentially, matching the option/visual arrays.

#### Scenario: Five URIs resolved concurrently
- **WHEN** an activity's audio files are hydrated
- **THEN** the question/correct/hint1/hint2/explain URIs are resolved with a single `Promise.all`, and the resulting object is identical to the sequential version
