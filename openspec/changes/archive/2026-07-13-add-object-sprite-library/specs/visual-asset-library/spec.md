# visual-asset-library Specification (delta)

## ADDED Requirements

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
