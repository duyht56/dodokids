# visual-asset-library Specification

## Purpose
TBD - created by archiving change materialize-primitive-assets. Update Purpose after archive.
## Requirements
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

### Requirement: Generated object sprites have canonical structured identity

Each reusable generated object SHALL be identified by normalized theme, object, color, variant, view, and style-version fields. Equivalent requests SHALL resolve to the same logical library asset; materially different variants or views SHALL use different identities.

#### Scenario: English and math reuse one guava sprite

- **WHEN** an English vocabulary activity and a math count activity request the same approved green whole-guava identity and style version
- **THEN** both resolve to the same library asset and image URL

#### Scenario: Whole and sliced fruit remain distinct

- **WHEN** one request asks for a whole guava and another asks for a sliced guava
- **THEN** the requests resolve to different canonical identities even if theme, object, and color match

### Requirement: Missing object sprites are generated once and held for review

When no reusable object sprite exists, the pipeline SHALL create one idempotent generation record, generate a single isolated object, perform background removal and alpha QA, and set the result to `pending_review`. The sprite SHALL NOT be considered approved or publishable until a human approves it.

#### Scenario: Concurrent requests coalesce

- **WHEN** two workers request the same missing canonical sprite identity concurrently
- **THEN** at most one logical library asset and one active generation revision are created

#### Scenario: Generated sprite awaits approval

- **WHEN** Imagen generation and alpha QA succeed
- **THEN** the sprite is stored as `pending_review`
- **AND** activities cannot silently publish it as an approved reusable asset

### Requirement: Transparent sprite output is verified

The post-processing stage SHALL produce a real alpha channel, standardized transparent padding, and recorded crop/quality metadata. It SHALL reject output that fails configured border transparency, foreground occupancy, alpha-bounds, or significant-region checks.

#### Scenario: Background removal fails quality checks

- **WHEN** the produced sprite retains a large connected background or loses the foreground
- **THEN** the asset receives a structured alpha-QA failure and is not marked transparent/approved

### Requirement: Legacy assets remain readable

Existing asset IDs and non-alpha images SHALL remain readable. Where identity backfill is unambiguous the system MAY add structured metadata; it SHALL NOT overwrite an approved image automatically. Legacy non-alpha sprites MAY use the existing mobile sticker fallback.

#### Scenario: Existing approved asset has no new metadata

- **WHEN** legacy content references an approved asset without structured identity or alpha metadata
- **THEN** the content still renders through the compatibility path

### Requirement: Transform eligibility belongs to the asset

Generated sprites SHALL declare which semantic transform families are permitted. The pipeline SHALL reject a display variant that is not allowed by the asset's transform policy.

#### Scenario: Pencil supports long and short

- **WHEN** an approved pencil sprite allows horizontal stretch and an activity requests `long` and `short`
- **THEN** the same sprite may be reused with those semantic presets

#### Scenario: Guava cannot be stretched to teach length

- **WHEN** an activity requests `long` for a guava sprite that allows only uniform scale
- **THEN** deterministic validation rejects the activity before Human Gate

