## ADDED Requirements

### Requirement: Parent APIs require the owning anonymous household

Every parent endpoint SHALL require a valid anonymous device bearer and SHALL validate the requested child belongs to the authenticated household before returning summaries, reports, offline tasks, or profile data, or before changing settings. The server SHALL no longer treat possession of a child ID as authorization.

#### Scenario: Parent requests data for an owned child

- **WHEN** an authenticated household requests parent data for its child
- **THEN** the existing parent response contract is preserved

#### Scenario: Parent requests data for an unowned child

- **WHEN** an authenticated household requests parent data for a child in another household
- **THEN** the server returns `403` or a non-enumerating `404`
- **AND** returns no child, progress, report, or task data

#### Scenario: Parent update lacks authentication

- **WHEN** a caller attempts a parent setting or profile mutation without a valid device bearer
- **THEN** the server returns `401`
- **AND** changes nothing

