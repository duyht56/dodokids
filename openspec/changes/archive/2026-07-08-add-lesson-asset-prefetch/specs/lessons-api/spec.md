## ADDED Requirements

### Requirement: GET /lessons/prefetch-manifest returns entitlement-capped asset URLs
`GET /lessons/prefetch-manifest?childId=&lookaheadWeeks=` SHALL return a manifest
of image, audio, and video URLs for imported lessons from the child's current
week through the requested lookahead, capped by entitlement and the V1 maximum of
4 lookahead weeks.

#### Scenario: Manifest is capped by entitlement
- **WHEN** a child requests lookahead content beyond their entitlement
- **THEN** the response `toWeek` does not exceed the week allowed by the existing entitlement policy

#### Scenario: Manifest includes activity media URLs
- **WHEN** imported lessons contain nested payload asset URLs and `audioFiles`
- **THEN** the response includes deduped URL entries classified as `image`, `audio`, or `video`
