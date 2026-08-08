## ADDED Requirements

### Requirement: Route-local practice decoration
An Explore route MAY hold selected item, sequence position and completed-item identifiers solely to render navigation and neutral completion decoration during the currently mounted visit. This state SHALL contain no child identity, SHALL NOT affect later visits, and SHALL NOT be persisted or transmitted.

#### Scenario: Current-visit cards are decorated
- **WHEN** the mounted tracing workshop route records completed item IDs in memory
- **THEN** it may decorate those cards until route unmount without creating Explore play history

#### Scenario: Workshop route unmounts
- **WHEN** the child leaves the tracing workshop
- **THEN** selected item, sequence position and all completed-item decoration are discarded
