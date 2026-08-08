# content-pipeline-flow Specification (delta)

## ADDED Requirements

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
