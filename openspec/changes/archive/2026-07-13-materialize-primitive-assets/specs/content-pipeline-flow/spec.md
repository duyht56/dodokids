# content-pipeline-flow Specification (delta)

## ADDED Requirements

### Requirement: Primitive asset resolution is deterministic and Imagen-free

Before media generation, the pipeline SHALL classify a valid primitive reference and resolve it by reuse or deterministic materialization. A primitive reference SHALL never fall through to free-form Imagen generation, and an invalid primitive reference SHALL surface a structured validation error rather than a generated fallback.

#### Scenario: Resolver routes a primitive separately

- **WHEN** a valid primitive reference reaches asset resolution
- **THEN** the resolver reuses or deterministically materializes it
- **AND** no Imagen job is enqueued

#### Scenario: Malformed primitive fails closed

- **WHEN** an asset reference looks like a primitive but is malformed or unsupported
- **THEN** resolution returns a structured primitive-validation error
- **AND** it does not enqueue an Imagen job as a fallback
