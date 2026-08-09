## ADDED Requirements

### Requirement: Reviewed inventory generation
kido-pipeline SHALL generate the finite Explore prompt-audio inventory (fixed
phrases and slot words) with `tts.service` in Vietnamese using the approved
Northern voice, storing each clip in the reusable `audio_library` keyed by
word-key + `lang`. Fixed-phrase and slot clips MUST be synthesized as exact text
(`wrap:false`) so stitched playback is predictable. Only clips at `approved` in
the `audio_library` lifecycle SHALL be eligible for export; the routine MUST NOT
auto-approve.

#### Scenario: Clip is reused, not regenerated
- **WHEN** an inventory entry already exists in `audio_library` for the same
  word-key and language
- **THEN** the existing clip is reused and no duplicate is synthesized

#### Scenario: Unapproved clip is withheld
- **WHEN** an inventory clip has not reached `approved`
- **THEN** it is excluded from the exported pack

### Requirement: Deterministic bundled-pack export
kido-pipeline SHALL export approved Explore clips as a versioned audio pack plus a
Metro-static registry (static `require` references) that the mobile app bundles.
The export target SHALL be the app bundle only — Explore audio MUST NOT be
published to kido-server. The export MUST record the pack version and covered keys
and MUST fail if any required key is missing, rejected or resolves to a network
URL.

#### Scenario: Export covers the required keys
- **WHEN** the Explore audio pack is exported for a release
- **THEN** every key required by the mobile prompt mapping resolves to an approved
  bundled clip and the pack records its version and covered keys

#### Scenario: No server publish
- **WHEN** the Explore audio pack is exported
- **THEN** no kido-server publish request is made and no runtime lesson content is
  altered

### Requirement: Generator/inventory coverage
The exported inventory SHALL cover every prompt key the mobile games can request.
A prompt template introduced without its corresponding inventory clips MUST fail
verification rather than ship a mute prompt.

#### Scenario: Missing inventory is caught
- **WHEN** a mobile prompt template references a key with no approved clip in the
  pack
- **THEN** export/verification fails and the gap is reported
