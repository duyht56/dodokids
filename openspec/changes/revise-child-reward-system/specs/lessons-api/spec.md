## MODIFIED Requirements

### Requirement: GET /lessons/today trả về lesson của ngày hôm nay cho child
`GET /lessons/today?childId=` SHALL look up the household-owned child position, return the imported canonical lesson with exactly 8 populated activities and resolved asset URLs, and include `contentVersion` plus a child-specific frozen reward context containing `weekPlanVersion`, `requiredLessonIds`, and `stickerId`. On the first canonical read for a week, the server SHALL persist that week plan for the child. If no imported content exists it SHALL return a non-reward-eligible stub.

#### Scenario: Trả về canonical lesson và reward context
- **WHEN** the current imported lesson exists for the child
- **THEN** response is `200 OK` with `isStub: false`, 8 activities, deterministic `contentVersion`, and `rewardContext.eligible: true`

#### Scenario: Frozen week plan is reused
- **WHEN** the same child fetches another lesson in a week whose reward plan was already created
- **THEN** response uses the same `weekPlanVersion` and `requiredLessonIds` even if additional content was published later

#### Scenario: Stub response khi chưa có content
- **WHEN** no imported lesson matches the child position
- **THEN** response is `200 OK` with `isStub: true`, empty activities, and `rewardContext.eligible: false`

#### Scenario: childId thiếu trong query
- **WHEN** `GET /lessons/today` has no `childId`
- **THEN** response is `400 Bad Request` with `childId is required`

#### Scenario: Response được cache
- **WHEN** the same child requests the same frozen lesson context within the cache TTL
- **THEN** the cached response preserves the identical content and plan versions

## ADDED Requirements

### Requirement: Imported lessons have deterministic content versions
Every imported runtime lesson SHALL have a deterministic `contentVersion` that changes when canonical reward-relevant lesson/activity content changes and remains stable across repeated reads of unchanged content.

#### Scenario: Unchanged lesson is fetched twice
- **WHEN** the same imported lesson payload is read twice
- **THEN** both responses contain the same `contentVersion`

#### Scenario: Canonical activity content is republished
- **WHEN** reward-relevant content of a lesson changes through publish ingest
- **THEN** the stored `contentVersion` changes and stale completion events are rejected with a structured version conflict
