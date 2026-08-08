## ADDED Requirements

### Requirement: Household schema stores recovery and PIN security state

The persistence layer SHALL define a household identified by a unique opaque `householdId`, with salted parent PIN and recovery-code hashes, PIN/recovery attempt counters, lockout timestamps, and timestamps. Plaintext PINs and recovery codes SHALL NOT be stored.

#### Scenario: Household is created before PIN setup

- **WHEN** anonymous registration creates a household
- **THEN** the household has a unique ID and no plaintext security material
- **AND** PIN and recovery hashes may remain unset until parent setup

### Requirement: Device credential schema supports revocation

The persistence layer SHALL define a device credential with unique `deviceId`, indexed `householdId`, secret hash, active or revoked status, creation time, last-used time, and optional revocation time.

#### Scenario: Device credential is looked up

- **WHEN** the authentication guard receives a device ID
- **THEN** the server can efficiently find its credential and household
- **AND** can reject revoked credentials

### Requirement: Child schema records household ownership

The child schema SHALL include an indexed `householdId` and SHALL require it for all newly created children. Child lookup paths used by public APIs SHALL support filtering by both child ID and household ID.

#### Scenario: New child is persisted

- **WHEN** an authenticated household creates a child
- **THEN** the child document stores that household's ID

### Requirement: Purchase binding schema prevents cross-household reuse

The persistence layer SHALL store a unique hash of each verified store purchase token with the owning household ID, product and platform metadata, verification timestamps, and audit state. The unique token-hash index SHALL prevent concurrent binding to multiple households.

#### Scenario: Two households concurrently bind one token

- **WHEN** two households attempt to create a binding for the same purchase-token hash
- **THEN** at most one household binding succeeds
- **AND** the other operation is handled as a purchase conflict

