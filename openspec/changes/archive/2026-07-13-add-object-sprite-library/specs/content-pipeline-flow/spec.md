# content-pipeline-flow Specification (delta)

## ADDED Requirements

### Requirement: Missing vocabulary sprites resolve through a review workflow

Before media generation, the pipeline SHALL classify a reusable object reference as an approved sprite or a missing sprite. A missing canonical identity SHALL create or coalesce a single sprite-generation workflow and expose its review status; an approved sprite SHALL be reused without regeneration.

#### Scenario: Resolver routes a missing vocabulary object

- **WHEN** a canonical object identity has no approved sprite
- **THEN** the resolver creates/coalesces a sprite-generation workflow and exposes its review status

#### Scenario: Resolver reuses an approved sprite

- **WHEN** a canonical object identity already has an approved alpha sprite
- **THEN** the resolver reuses it without enqueuing a new generation job

### Requirement: Human Gate and publish lifecycle remain authoritative for sprites

Imagen-generated object sprites SHALL require human approval before reuse or publish. Activity generation SHALL still stop at `pending_review`, and only publish SHALL set `imported`.

#### Scenario: New sprite does not bypass Human Gate

- **WHEN** an activity requires a newly generated object sprite
- **THEN** the sprite/activity remains reviewable and cannot be silently imported into runtime content
