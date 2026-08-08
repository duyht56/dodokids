# mongoose-schemas Specification (delta)

## ADDED Requirements

### Requirement: Library assets store canonical identity and visual capabilities

The `assets_library` schema SHALL add structured identity fields for theme, object, color, variant, view, and style version; alpha/crop quality metadata; transform eligibility; and generation revision. Existing category/object/color/pose fields MAY remain as compatibility fields during migration.

#### Scenario: Generated guava record stores reusable identity

- **WHEN** a green whole-guava sprite is created
- **THEN** its document records normalized identity, alpha status, crop metadata, transform policy, style version, generation revision, and review status

### Requirement: Canonical sprite identity is unique

The schema SHALL enforce or transactionally guarantee uniqueness for the normalized logical sprite identity and style version. Concurrent requests SHALL not create duplicate logical assets.

#### Scenario: Duplicate concurrent insert

- **WHEN** two workers insert the same normalized sprite identity concurrently
- **THEN** one logical asset remains and both workflows resolve to it

### Requirement: Asset review and generation failures are auditable

Library assets SHALL retain generation/review status, structured failure code, rejection reason, generation revision, timestamps, and source prompt/style version needed to reproduce or deliberately regenerate an image.

#### Scenario: Alpha QA failure is stored

- **WHEN** background removal fails alpha quality checks
- **THEN** the library record preserves the failure code and metrics without marking the asset approved or alpha-capable
