# mongoose-schemas Specification (delta)

## ADDED Requirements

### Requirement: Activity display metadata survives persistence and publish

Optional count-tap surface metadata and option display variants SHALL survive pipeline persistence, publish payload construction, server ingest, lesson reads, and mobile mapping.

#### Scenario: Published comparison retains display variants

- **WHEN** an approved comparison activity is published with two options using `small` and `large`
- **THEN** the runtime lesson returned to mobile preserves both semantic variants unchanged

#### Scenario: Published pastel count-tap retains its surface token

- **WHEN** an approved pastel-mode count-tap activity is published with a resolved pastel token
- **THEN** the runtime lesson preserves the surface mode and token so mobile and web render the same stable surface
