## ADDED Requirements

### Requirement: Child progress stores canonical reward synchronization state
The child progress schema SHALL add `stickerIdsEarned: string[]`, `weekRewardPlans` keyed by week, numeric `rewardRevision`, and bounded recent reward event receipts. Defaults SHALL be empty/zero, reward updates SHALL use set/compare-and-swap semantics, and legacy `stickersEarned: number[]` SHALL remain readable during migration.

#### Scenario: New child has reward defaults
- **WHEN** a child document is created after this change
- **THEN** stable sticker IDs/plans/receipts are empty and `rewardRevision` is 0

#### Scenario: Atomic revision guard
- **WHEN** an update computed from revision N is written after another event advanced the child to N+1
- **THEN** the stale write does not apply and processing retries from the newer revision

#### Scenario: Legacy sticker ownership is read
- **WHEN** a legacy child contains week-number stickers only
- **THEN** application mapping exposes equivalent stable IDs without data loss

### Requirement: Frozen week reward plans are bounded and immutable per child
Each `weekRewardPlans` entry SHALL store week, plan version, required canonical lesson IDs, and sticker ID. Once created for a child/week, its required lesson membership MUST NOT change because later content was published; at most 48 plan entries are retained.

#### Scenario: Content is published after plan freeze
- **WHEN** a new lesson becomes imported after a child’s week plan already exists
- **THEN** that child’s stored required lesson set remains unchanged

### Requirement: Imported lessons store deterministic contentVersion
The lesson schema SHALL include a deterministic `contentVersion` set/backfilled by publish ingest or migration. Reward-eligible lesson responses MUST NOT omit it.

#### Scenario: Existing imported lesson is backfilled
- **WHEN** migration processes an imported lesson without a version
- **THEN** it stores a deterministic version derived from canonical lesson/activity content

#### Scenario: Republish changes reward-relevant content
- **WHEN** the canonical payload changes and is republished
- **THEN** the lesson stores a different `contentVersion`
