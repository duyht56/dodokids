## MODIFIED Requirements

### Requirement: Transient play run
Starting a game SHALL create a new in-memory run. Question-style games SHALL normally use 5-8 interactions. A game MAY instead declare a finite ordered-track run when its learning interaction requires direct item selection and canonical continuation. All run state SHALL remain transient and SHALL NOT be persisted to local storage, secure storage, database, analytics or a remote service.

#### Scenario: Child exits during a question-style run
- **WHEN** the child leaves the game and later opens it again
- **THEN** a new 5-8 interaction run starts with no resumable state

#### Scenario: Child enters an ordered-track workshop
- **WHEN** the child selects an item in a finite track-based practice game
- **THEN** the run may continue through the remaining track items without a fixed interaction cap and is discarded when the workshop route unmounts

#### Scenario: App process restarts
- **WHEN** the app is terminated during any Explore run and relaunched
- **THEN** no Explore run, sequence position or current-visit mark can be resumed or reconstructed
