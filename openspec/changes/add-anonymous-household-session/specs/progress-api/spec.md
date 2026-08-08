## ADDED Requirements

### Requirement: Progress endpoints enforce household ownership

Every progress endpoint that accepts or resolves a child ID SHALL require a valid anonymous device bearer and SHALL validate that the child belongs to the authenticated household before returning progress, completing a lesson, awarding achievements, or running a child report. Scheduled internal jobs SHALL use an explicit internal execution path rather than an unauthenticated public child operation.

#### Scenario: Household reads or updates its child's progress

- **WHEN** an authenticated household supplies its own child ID to a progress endpoint
- **THEN** the existing progress behavior and response contract are preserved

#### Scenario: Household supplies another household's child ID

- **WHEN** an authenticated household supplies a child ID owned by another household
- **THEN** the operation is rejected before reading or changing progress

#### Scenario: Public caller invokes weekly report runner

- **WHEN** an unauthenticated public caller invokes the weekly report runner
- **THEN** the server rejects the request

