# explore-stateless-privacy

## Purpose

Guarantees that Explore play leaves no per-child history: no play evidence is persisted or transmitted, every entry starts a fresh run, only static parent-authored configuration may be stored, break reminders use current-run in-memory time only, and Explore is excluded from parent reports and behavior analytics.

## Requirements

### Requirement: No Explore play history
The system SHALL NOT persist or transmit a child's Explore game selection, exercise, answer, outcome, tries, hints, duration, completion, exit, random seed, reached level, tracing data or derived evidence. This prohibition applies to app storage, server databases, logs, analytics, reports and caches.

#### Scenario: Child completes a run
- **WHEN** the active Explore run completes
- **THEN** no play-history record or behavior event is created locally or remotely

### Requirement: Fresh entry every time
Explore play state SHALL exist only while the play route is mounted. Exit, unmount, process death and later re-entry SHALL start a new run from its initial state with no resume or recent-game affordance.

#### Scenario: Child exits midway
- **WHEN** the child exits midway and selects the same game again
- **THEN** the game creates a new run and exposes no state from the abandoned run

### Requirement: Static parent configuration only
The system MAY persist parent-authored starting-level, support or break-reminder preferences. These settings SHALL contain no play evidence and SHALL NOT be automatically changed by Explore behavior.

#### Scenario: Parent selects an easier start
- **WHEN** the parent saves a lower starting level
- **THEN** future fresh runs use that static default without recording how the child plays

### Requirement: Current-run reminder only
An optional break reminder SHALL use only elapsed time held in memory for the active run and SHALL reset when the child exits. The system SHALL NOT implement an accumulated daily Explore limit from play history.

#### Scenario: Child re-enters after a break
- **WHEN** a previous run has ended and a new run starts
- **THEN** the reminder timer starts fresh and no prior duration is read

### Requirement: Explore excluded from reports and behavior analytics
Parent reports SHALL contain no Explore usage, game, skill, level, duration or hint data. Generic analytics SHALL NOT be used to bypass the no-history rule; only non-user-specific service-health metrics MAY be recorded.

#### Scenario: Weekly report is requested
- **WHEN** a parent loads the weekly report after the child has used Explore
- **THEN** the report is unchanged and contains no Explore-derived section or aggregate
