# pipeline-operations Specification (delta)

## ADDED Requirements

### Requirement: Generate math seed files from the admin UI

The admin SHALL let an operator generate the next missing math seed week without leaving the UI. The action SHALL create `seeds/wNN.json`, import newly created seeds with `pending_review` seed status and `pending` pipeline status, and enqueue seed review. It SHALL NOT approve seeds or enqueue activity generation.

#### Scenario: Generate next missing math week

- **WHEN** seed files exist for weeks before W and no `wWW.json` exists for W
- **THEN** the UI shows W as the next generated week
- **AND** clicking generate creates `wWW.json`, imports its seeds, and reports inserted/skipped counts plus the seed-review job id

#### Scenario: Activity generation remains gated

- **WHEN** a seed file is generated and imported
- **THEN** its seeds remain in seed-review flow
- **AND** activity generation is not enqueued until those seeds are approved

#### Scenario: Complete seed set blocks generation

- **WHEN** `w01.json` through `w48.json` all exist
- **THEN** the UI reports that all seed weeks exist
- **AND** the generate action is disabled
