## ADDED Requirements

### Requirement: Two-field seed content model

A seed SHALL separate its child-facing question from its answer/asset specification into two distinct fields. `questionCore` SHALL contain only the short question read aloud to the child; it MUST NOT list the concrete assets or reveal the correct answer. `answerSpec` SHALL contain the concrete objects and the correct answer used to build the activity payload; it is never read aloud. `answerSpec` is REQUIRED for the five MVP action types (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`) and is exempt for `watch_video`.

#### Scenario: Well-formed odd-one-out seed

- **WHEN** authoring a `single_select` odd-one-out seed
- **THEN** `questionCore` reads `"Hình nào khác loại với các hình còn lại?"`
- **AND** `answerSpec` reads `"3 hình cùng màu xanh: 2 hình tròn, 1 hình tam giác. Đáp án đúng: hình tam giác."`
- **AND** `questionCore` contains neither the shape counts nor the word identifying the correct answer

#### Scenario: MVP seed missing answerSpec is invalid

- **WHEN** a seed of one of the five MVP action types is persisted or imported without an `answerSpec`
- **THEN** it is treated as incomplete and MUST be routed through seed review backfill before it can be generated

### Requirement: Generate splits fields by role

The generate step SHALL derive `audioScript.question` from `questionCore` only and SHALL derive the activity `payload` (options, items, sequence steps, or count target) from `answerSpec`. The generated `audioScript.question` MUST NOT enumerate the assets nor leak the correct answer.

#### Scenario: Question and payload come from separate fields

- **WHEN** the generate step processes a seed with `questionCore` = `"Hình nào khác loại với các hình còn lại?"` and `answerSpec` describing 2 circles + 1 triangle (triangle correct)
- **THEN** `audioScript.question` is a short kid-friendly phrasing of `questionCore` including the mascot Đô Đô
- **AND** `payload.options` contains the three shapes from `answerSpec` with the triangle marked correct
- **AND** `audioScript.question` does not list the shapes or state which is the answer

### Requirement: Generation guarded on answerSpec

The generate step SHALL refuse to process a seed of a MVP action type that has no `answerSpec`, failing with a clear error, in the same way it refuses seeds that are not `approved`.

#### Scenario: Approved seed without answerSpec is blocked

- **WHEN** the generate step receives an `approved` `single_select` seed whose `answerSpec` is empty or absent
- **THEN** generation throws an error identifying the missing `answerSpec`
- **AND** no activity is produced

### Requirement: Reviewer backfills answerSpec when missing

When a reviewed seed has no `answerSpec`, the seed reviewer SHALL derive one from the legacy `questionCore` and return it in `suggestion.answerSpec`, together with a cleaned `suggestion.questionCore` that removes the embedded asset/answer detail, and SHALL raise a warning-severity flag `ANSWER_SPEC_MISSING`.

#### Scenario: Legacy mixed seed is auto-split

- **WHEN** the reviewer reviews a seed whose `questionCore` = `"Tìm hình khác loại: 2 hình tròn và 1 hình tam giác cùng màu xanh"` and `answerSpec` is absent
- **THEN** the result includes an `ANSWER_SPEC_MISSING` warning flag
- **AND** `suggestion.questionCore` = `"Hình nào khác loại với các hình còn lại?"`
- **AND** `suggestion.answerSpec` describes the 2 circles + 1 triangle with the triangle as the correct answer

### Requirement: Reviewer does not overwrite an existing answerSpec

When a reviewed seed already has an `answerSpec`, the seed reviewer SHALL NOT populate `suggestion.answerSpec` (leaving it null); it MAY raise warnings about the existing spec but MUST leave the authored value untouched.

#### Scenario: Existing answerSpec is preserved

- **WHEN** the reviewer reviews a seed that already has a non-empty `answerSpec`
- **THEN** `suggestion.answerSpec` is null
- **AND** any concern about the spec is expressed as a flag, not an overwrite

### Requirement: Applying a suggestion updates both fields

The human "Dùng đề xuất" action SHALL apply whichever of `questionCore` and `answerSpec` the suggestion provides, writing each only when present, then re-enqueue the seed for review. The manual "Sửa tay" action SHALL allow editing both fields independently.

#### Scenario: Use-suggestion writes both fields for a backfilled seed

- **WHEN** a reviewer viewing a seed flagged `ANSWER_SPEC_MISSING` clicks "Dùng đề xuất"
- **THEN** both `questionCore` and `answerSpec` are updated from the suggestion
- **AND** the seed status becomes `edited` and is re-reviewed
- **AND** the re-review no longer raises `ANSWER_SPEC_MISSING`

#### Scenario: Use-suggestion for a clarity-only fix leaves answerSpec intact

- **WHEN** a seed already has an `answerSpec` and the reviewer only suggests a clearer `questionCore`
- **THEN** clicking "Dùng đề xuất" updates `questionCore` only
- **AND** the existing `answerSpec` is unchanged

### Requirement: Review rules scoped per field

Seed review rules SHALL apply to the field they concern: `questionCore` is checked for ambiguity and for not spoiling the answer or listing assets; `answerSpec` is checked for answer verifiability, plausible distractors, count range, and cross-match, per action type. The reviewer MUST NOT flag the mere separation of question and answer as an ambiguity defect.

#### Scenario: Clean split passes clarity checks

- **WHEN** the reviewer evaluates a seed with a clean `questionCore` and a complete `answerSpec`
- **THEN** it does not raise `SELECT_QUESTION_UNAMBIGUOUS` for the question containing no asset detail
- **AND** answer-verifiability checks are evaluated against `answerSpec`
