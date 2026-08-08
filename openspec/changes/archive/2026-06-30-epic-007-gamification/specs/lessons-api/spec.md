## ADDED Requirements

### Requirement: Practice Endpoint Route Ordering
The lessons controller SHALL register `GET practice/:childId` before the dynamic `GET :lessonId` route so the static segment is not shadowed.

#### Scenario: Practice route resolves
- **WHEN** a request hits `GET /lessons/practice/abc123`
- **THEN** it is handled by the practice handler, not the `:lessonId` handler
