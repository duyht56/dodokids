## ADDED Requirements

### Requirement: Route-local replay exclusion state
The play route MAY retain only a bounded set of pedagogical variant keys from the immediately preceding round to plan a diverse replay. This state SHALL remain in memory, SHALL contain no outcome or child identity, and SHALL be discarded on route unmount or process death.

#### Scenario: Replay occurs on the mounted completion screen
- **WHEN** the child requests another round before leaving the play route
- **THEN** the route may use the immediately preceding variant keys locally to avoid repetition

#### Scenario: Child exits and later re-enters
- **WHEN** the play route unmounts before the same game is opened again
- **THEN** no exclusion key survives and the new run is generated without reading prior play state
