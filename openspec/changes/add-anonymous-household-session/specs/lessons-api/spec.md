## ADDED Requirements

### Requirement: Child lesson endpoints enforce household ownership

All lesson endpoints that select, return, or prefetch content using a child ID SHALL require a valid anonymous device bearer and SHALL validate that the child belongs to the authenticated household before evaluating entitlement or returning lesson data. Direct lesson lookup SHALL validate the lesson's child context supplied by the client or derived from persisted ownership.

#### Scenario: Household requests today's lesson for its child

- **WHEN** an authenticated household calls `GET /lessons/today?childId=<ownedChildId>`
- **THEN** ownership is validated before entitlement and lesson selection
- **AND** the existing lesson response contract is preserved

#### Scenario: Household requests practice or prefetch for another child

- **WHEN** an authenticated household supplies a child ID owned by another household to a practice or prefetch endpoint
- **THEN** the server returns `403` or a non-enumerating `404`
- **AND** returns no lesson or manifest data

#### Scenario: Caller requests a lesson without a device bearer

- **WHEN** a caller requests a child-scoped or direct lesson endpoint without a valid device bearer
- **THEN** the server returns `401`

