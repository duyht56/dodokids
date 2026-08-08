# visual-asset-library Specification (delta)

## ADDED Requirements

### Requirement: Deterministic primitives are capabilities, not pre-seeded files

The system SHALL determine primitive validity from a controlled parser/registry that defines supported kinds, values, colors, sizes, and canonical IDs. When a supported primitive is referenced but no physical library record exists, the pipeline SHALL render and stage the primitive deterministically as SVG and SHALL NOT call Imagen.

#### Scenario: Supported missing primitive materializes on demand

- **WHEN** an activity references a supported primitive such as a four-dot green card and no matching DB/GCS asset exists
- **THEN** the pipeline renders the exact SVG, upserts an approved library asset, and continues without an Imagen job

#### Scenario: Invalid primitive never falls back to Imagen

- **WHEN** a primitive reference is malformed or outside its supported range
- **THEN** the pipeline returns a structured primitive-validation error
- **AND** it does not generate a free-form replacement image

#### Scenario: Bulk prewarm reuses the same registry

- **WHEN** the optional `seed:primitives` command runs
- **THEN** it materializes primitives through the same registry/renderer used on demand
- **AND** on-demand materialization of any already-warmed primitive is idempotent
