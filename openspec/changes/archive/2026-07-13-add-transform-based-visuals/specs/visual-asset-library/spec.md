# visual-asset-library Specification (delta)

## ADDED Requirements

### Requirement: Transform eligibility belongs to the asset

Generated sprites SHALL declare which semantic transform families are permitted. The pipeline SHALL reject a display variant that is not allowed by the asset's transform policy.

#### Scenario: Pencil supports long and short

- **WHEN** an approved pencil sprite allows horizontal stretch and an activity requests `long` and `short`
- **THEN** the same sprite may be reused with those semantic presets

#### Scenario: Guava cannot be stretched to teach length

- **WHEN** an activity requests `long` for a guava sprite that allows only uniform scale
- **THEN** deterministic validation rejects the activity before Human Gate
