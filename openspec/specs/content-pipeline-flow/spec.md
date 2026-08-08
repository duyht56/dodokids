## Purpose

The canonical authoring flow and activity status lifecycle for `kido-pipeline`. Both run modes (CLI sync runner and Bull workers) converge on `pending_review → Human Gate → publish`; the legacy local-import that marked content `approved`/`imported` inside the pipeline DB is retired, so `imported` only ever means "published to the runtime `kido-server`".
## Requirements
### Requirement: Canonical activity status lifecycle

An activity SHALL move through a single canonical status lifecycle regardless of how the pipeline is run: `draft` (generated) → `pending_review` (reviewed + assets/media enqueued) → `approved` (Human Gate) → `imported` (published to `kido-server`). The pipeline SHALL NOT set `approved` or `imported` outside of, respectively, the Human Gate and the publish step.

#### Scenario: Content awaiting review sits at pending_review

- **WHEN** an activity has passed AI review and its image/audio jobs are enqueued
- **THEN** its status is `pending_review`
- **AND** it is not `approved` or `imported`

#### Scenario: approved is only set by the Human Gate

- **WHEN** any pipeline path completes generation and media for an activity
- **THEN** it does not set the activity to `approved` on its own
- **AND** `approved` is reached only after a human approves it in the Human Gate

#### Scenario: imported means published to the runtime server

- **WHEN** an activity's status is `imported`
- **THEN** it has been published to `kido-server` via the publish step
- **AND** no pipeline-local step marks an activity `imported` without publishing

### Requirement: Both run modes converge on the same flow

The CLI sync runner and the queue workers SHALL produce the same end state for an activity: after generate → review → assets → image/audio, the activity SHALL be left at `pending_review` for the Human Gate. The CLI runner SHALL NOT auto-approve or locally import content.

#### Scenario: CLI sync run ends at pending_review

- **WHEN** `PipelineRunner` processes an approved seed in sync mode through media generation
- **THEN** the resulting activity status is `pending_review`
- **AND** it is neither `approved` nor `imported`

#### Scenario: Worker run ends at pending_review

- **WHEN** the generate/image/audio workers process an approved seed through media generation
- **THEN** the resulting activity status is `pending_review`

#### Scenario: Same seed, same outcome

- **WHEN** the same approved seed is processed via CLI sync mode and via the workers
- **THEN** both leave the activity in the same `pending_review` state awaiting the Human Gate

### Requirement: Legacy local-import path is retired

The pipeline SHALL NOT provide a path that marks content `approved`/`imported` inside the pipeline database as a substitute for publishing. The legacy local-import (the runner's import step and the `import` admin route/page) SHALL be retired in favour of the publish flow (`content-transfer`).

#### Scenario: No pipeline-local import in the run path

- **WHEN** an activity finishes generation and media in either run mode
- **THEN** no step copies/marks it as `imported` within the pipeline database
- **AND** reaching `imported` requires the publish step to `kido-server`

#### Scenario: Deprecated import route does not bypass the gate

- **WHEN** a user invokes the deprecated legacy import route/page
- **THEN** it does not move unapproved content to `approved`/`imported`
- **AND** it directs the user to the publish flow instead

### Requirement: Generated audio URLs persist on the activity
After the audio step generates and uploads the TTS clips, the pipeline SHALL persist their URLs on the activity's `audioFiles` field. The pipeline activity schema MUST define `audioFiles` so it is not dropped by Mongoose strict mode. This applies to both run modes (CLI sync runner and the Bull `generate`/`audio` workers).

#### Scenario: Audio URLs survive persistence
- **WHEN** the audio step completes for an activity
- **THEN** the stored activity has an `audioFiles` object populated with the generated clip URLs

#### Scenario: Human gate readiness reflects audio
- **WHEN** an activity's audio URLs are persisted and reachable
- **THEN** the web human-gate readiness check counts them and allows review/approval

### Requirement: Primitive asset resolution is deterministic and Imagen-free

Before media generation, the pipeline SHALL classify a valid primitive reference and resolve it by reuse or deterministic materialization. A primitive reference SHALL never fall through to free-form Imagen generation, and an invalid primitive reference SHALL surface a structured validation error rather than a generated fallback.

#### Scenario: Resolver routes a primitive separately

- **WHEN** a valid primitive reference reaches asset resolution
- **THEN** the resolver reuses or deterministically materializes it
- **AND** no Imagen job is enqueued

#### Scenario: Malformed primitive fails closed

- **WHEN** an asset reference looks like a primitive but is malformed or unsupported
- **THEN** resolution returns a structured primitive-validation error
- **AND** it does not enqueue an Imagen job as a fallback

### Requirement: Machine-fixable mechanics use deterministic repair

The generate step SHALL repair unambiguous machine-fixable violations deterministically before invoking semantic LLM repair. It SHALL validate after repair and SHALL NOT weaken mechanics rules when repair fails.

#### Scenario: Correct praise exceeds eight words

- **WHEN** `audioScript.correct` exceeds eight whitespace-delimited words
- **THEN** the pipeline replaces it with an approved short praise template and re-validates the activity

#### Scenario: Deterministic repair cannot safely preserve meaning

- **WHEN** a violation has no unambiguous deterministic correction
- **THEN** the system leaves it for the bounded semantic-repair path rather than truncating or changing the answer silently

### Requirement: Semantic repair is bounded and auditable

Semantic activity repair SHALL use a dedicated structured low-temperature model call with bounded attempts. Each attempt SHALL record stable error codes and relevant before/after values; exhausted repair SHALL leave the seed/activity in error with actionable diagnostics.

#### Scenario: Semantic repair remains invalid

- **WHEN** all configured semantic-repair attempts still violate mechanics
- **THEN** generation fails with `MECHANICS_REPAIR_EXHAUSTED`
- **AND** the stored/logged trace identifies the remaining fields and violations

### Requirement: Missing vocabulary sprites resolve through a review workflow

Before media generation, the pipeline SHALL classify a reusable object reference as an approved sprite or a missing sprite. A missing canonical identity SHALL create or coalesce a single sprite-generation workflow and expose its review status; an approved sprite SHALL be reused without regeneration.

#### Scenario: Resolver routes a missing vocabulary object

- **WHEN** a canonical object identity has no approved sprite
- **THEN** the resolver creates/coalesces a sprite-generation workflow and exposes its review status

#### Scenario: Resolver reuses an approved sprite

- **WHEN** a canonical object identity already has an approved alpha sprite
- **THEN** the resolver reuses it without enqueuing a new generation job

### Requirement: Human Gate and publish lifecycle remain authoritative for sprites

Imagen-generated object sprites SHALL require human approval before reuse or publish. Activity generation SHALL still stop at `pending_review`, and only publish SHALL set `imported`.

#### Scenario: New sprite does not bypass Human Gate

- **WHEN** an activity requires a newly generated object sprite
- **THEN** the sprite/activity remains reviewable and cannot be silently imported into runtime content

### Requirement: Pipeline generate/review/audio chấp nhận audio_select
Pipeline generate, review, và audio step SHALL xử lý `actionType: 'audio_select'` cho subject `tieng_viet`/`tieng_anh`. Generate SHALL sinh payload đúng contract (2–3 options có audioRef + altTextVi ≤4 từ, correctAnswer 1 optionId, không questionImage bắt buộc). Mechanics validator SHALL áp R-rule audio_select (số options 2..3, mỗi option có audioRef, correctAnswer khớp đúng 1 optionId, altTextVi ≤4 từ, cấm assetRef/correctAnswers). Audio step SHALL sinh clip cho mỗi option theo lang của subject (EN→ElevenLabs, VI→TTS), tái dùng `audio_library` cho audioRef type 'library'.

#### Scenario: Generate audio_select hợp lệ
- **WHEN** pipeline generate một activity `audio_select` cho skill `en_phonics_initial`
- **THEN** payload có 2–3 options mỗi option audioRef + altTextVi ≤4 từ, đúng 1 correctAnswer, và pass mechanics validator

#### Scenario: Audio step tái dùng library clip
- **WHEN** audio step gặp option audioRef type 'library' audioId 'cat' đã có trong `audio_library`
- **THEN** step KHÔNG gen lại mà trỏ audioUrl có sẵn và tăng `usageCount`, thêm activityId vào `usedInActivities`

#### Scenario: Audio step gen clip mới cho activity ref
- **WHEN** audio step gặp option audioRef type 'activity' cho âm "/b/" chưa có clip
- **THEN** step gen clip theo lang của subject và lưu vào activity audio, không đụng `audio_library`

### Requirement: Publish resolve audioRef sang URL
Publish/transfer SHALL resolve mỗi `audioRef.audioId` thành `audioUrl` thực (library hoặc activity) trước khi đẩy sang kido-server, và SHALL strip field `transcript` (chỉ sống Generate→Audio). Publish guard SHALL từ chối activity audio_select nếu bất kỳ option nào thiếu audioUrl resolve được.

#### Scenario: Publish với audioRef resolve đủ
- **WHEN** publish một activity audio_select mà mọi option đều có audioUrl resolve được
- **THEN** guard cho qua và payload publish chứa audioUrl, không còn transcript

#### Scenario: Publish chặn audioRef gãy
- **WHEN** một option có audioId không resolve được sang audioUrl
- **THEN** guard báo lỗi và chặn publish activity đó

