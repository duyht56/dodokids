## MODIFIED Requirements

### Requirement: Reviewed inventory generation
kido-pipeline SHALL generate the finite Explore prompt-audio inventory (fixed
phrases and slot words) and every whole-line sentence listed in the mobile line
manifest with `tts.service` in Vietnamese using the approved Northern voice,
storing each clip in the reusable `audio_library` keyed by word-key + `lang`;
line clips SHALL use the diacritic-safe word-key of their transcript and be
staged as WAV.
Fixed-phrase, slot and line clips MUST be synthesized as exact text
(`wrap:false`) so playback is predictable. Line transcripts MUST be read from the
mobile manifest and MUST NOT be mirrored by hand in the pipeline. Only clips at
`approved` in the `audio_library` lifecycle SHALL be eligible for export; the
routine MUST NOT auto-approve, and every newly generated clip, including every
line, SHALL land at `pending_review`.

#### Scenario: Clip is reused, not regenerated
- **WHEN** an inventory entry already exists in `audio_library` for the same
  word-key and language
- **THEN** the existing clip is reused and no duplicate is synthesized

#### Scenario: Unapproved clip is withheld
- **WHEN** an inventory clip has not reached `approved`
- **THEN** it is excluded from the exported pack

#### Scenario: Line transcripts come from the manifest
- **WHEN** generation runs against a mobile checkout
- **THEN** it reads `src/explore/explorePromptLines.generated.json` under the
  mobile root (default: the sibling `mobile/`) and synthesizes each listed
  transcript, without any line text defined in kido-pipeline

### Requirement: Explore audio review gate
Because the base pipeline has no approval flow for `audio_library` clips and
Explore prompt audio is spoken to children, this change SHALL provide an explicit
human review and approval step: a review action listing every inventory clip and
every whole-line clip with a local path to listen, an approve action a human runs
to set clips `approved`, and a reject action, each accepting line clips by the
audio id derived from their diacritic-safe key. Approval MUST NOT be automatic,
and the review / approve / export actions MUST run without generation (TTS/GCP)
credentials.

#### Scenario: Reviewer listens then approves
- **WHEN** a human runs review, listens to the generated clips, and runs approve
- **THEN** the reviewed clips become `approved` and are eligible for export

#### Scenario: Approve without generation credentials
- **WHEN** the review or approve action runs
- **THEN** it operates on the database only and does not require TTS/GCP credentials

#### Scenario: A line take is rejected
- **WHEN** a reviewer rejects a whole-line clip by its audio id
- **THEN** that line is no longer eligible for export until it is regenerated and
  approved

### Requirement: Deterministic bundled-pack export
kido-pipeline SHALL export approved Explore clips as a versioned audio pack
(`explore-audio-vi-v5` for this change) plus a Metro-static registry (static
`require` references) that the mobile app bundles. Whole-line clips SHALL be
exported as AAC `.m4a` encoded from their silence-trimmed WAV, named by the
filesystem-safe base of their key; phrase, word, number and label clips SHALL
stay WAV, unchanged. The registry SHALL also export `EXPLORE_AUDIO_DURATIONS_MS`
with one integer-millisecond entry per exported whole line and per other
exported clip whose trimmed PCM can be measured, measured before any encoding,
keys ordered like the registry. A whole line whose PCM cannot be measured MUST
fail the export; any other unmeasurable clip still ships as before, gets no
entry and is listed in a warning. The export target SHALL be the app bundle
only — Explore audio MUST NOT be published to kido-server. The export MUST record
the pack version and covered keys and MUST fail if any required key — inventory
or whole line — is missing, not approved, without audio or resolves to a network
URL. The silence-trim command MUST only touch `.wav` files.

#### Scenario: Export covers the required keys
- **WHEN** the Explore audio pack is exported for a release
- **THEN** every key required by the mobile prompt mapping and every line in the
  mobile manifest resolves to an approved bundled clip and the pack records its
  version and covered keys

#### Scenario: No server publish
- **WHEN** the Explore audio pack is exported
- **THEN** no kido-server publish request is made and no runtime lesson content is
  altered

#### Scenario: A line is not approved
- **WHEN** one manifest line is missing, pending or rejected at export time
- **THEN** the export aborts and lists that line, and the bundled registry is not
  rewritten

#### Scenario: Line clip format and duration
- **WHEN** the line "Có tất cả sáu bạn nhé." is exported
- **THEN** it is written as `explore-audio-vi-line-nb-total-6-v1.m4a`, registered
  under `explore-audio:vi:line:nb_total:6:v1`, and its trimmed duration appears in
  `EXPLORE_AUDIO_DURATIONS_MS`

#### Scenario: Re-trimming skips encoded lines
- **WHEN** the trim command runs over the mobile Explore audio folder
- **THEN** `.m4a` line clips are left untouched

## ADDED Requirements

### Requirement: Deterministic QC for new whole-line takes
kido-pipeline SHALL check every newly synthesized whole-line take with a cheap
deterministic rule: its speaking rate after silence trimming, computed from the
real PCM data length (not the WAV header's declared size), MUST be within 150–400
ms per syllable. A failing take SHALL be regenerated up to two more times; if the
last attempt still fails, the routine SHALL keep it and print a QC warning naming
the line. QC MUST NOT approve or reject any clip.

#### Scenario: A take is truncated
- **WHEN** a new line take is far shorter than its syllable count allows
- **THEN** it is regenerated, and the passing take is kept at `pending_review`

#### Scenario: Every attempt fails
- **WHEN** three consecutive takes of a line fail QC
- **THEN** the last take is kept at `pending_review` and the run ends with a QC
  warning listing that line for the reviewer
