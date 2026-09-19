## ADDED Requirements

### Requirement: Practice bank reads lean
`GET /lessons/practice` SHALL read completed lessons and their activities as lean (plain) objects, avoiding Mongoose document hydration overhead, while returning the same capped, shuffled selection.

#### Scenario: Returns at most 12 activities
- **WHEN** a child with completed lessons requests practice
- **THEN** up to 12 activities drawn from the completed lessons' activities are returned

#### Scenario: Empty when nothing completed
- **WHEN** the child has no completed lessons
- **THEN** an empty array is returned
