# content-pipeline-flow Specification (delta)

## ADDED Requirements

### Requirement: Managed math seed generation precedes seed review

The content pipeline MAY generate math seed files as a managed pre-Step-0 stage. This stage SHALL produce a repository seed file artifact, validate it against the current seed contract, import it into the seed collection, and enqueue seed review. It SHALL NOT bypass seed review, seed approval, activity review, the Human Gate, or publish.

#### Scenario: GPT-generated seed file enters normal review

- **WHEN** GPT generates a valid next-missing math seed file
- **THEN** the file is written under `kido-pipeline/seeds/`
- **AND** new seeds are imported with `status: pending_review` and `pipelineStatus: pending`
- **AND** seed review is enqueued for the newly inserted seeds

#### Scenario: Invalid GPT output is not persisted

- **WHEN** GPT returns a seed file with missing `answerSpec`, invalid action type, wrong week, mismatched `domainCode`, duplicate seed IDs, or missing D1/D4 slots
- **THEN** the generator rejects the output
- **AND** no seed file or seed records are created from that output
