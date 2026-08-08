## ADDED Requirements

### Requirement: Anonymous device registration creates an ownership boundary

The system SHALL let a fresh installation register an app-generated `deviceId` and high-entropy `deviceSecret` without collecting an email, phone number, password, hardware identifier, or advertising identifier. It SHALL atomically create one anonymous household and one active device credential, return an authenticated session, and SHALL NOT persist the plaintext device secret.

#### Scenario: First installation registers successfully

- **WHEN** a fresh installation submits a valid new device ID and device secret
- **THEN** the server creates a household and an active device credential for it
- **AND** the response allows the installation to authenticate subsequent API calls

#### Scenario: Registration is retried idempotently

- **WHEN** the same device ID and matching device secret are registered again
- **THEN** the server returns the existing household session without creating another household

#### Scenario: Existing device ID is presented with another secret

- **WHEN** a caller submits an existing device ID with a non-matching secret
- **THEN** the server rejects the request without revealing household data

### Requirement: Device bearer authenticates one household

The system SHALL accept a versioned bearer credential containing the app-generated device ID and secret. It SHALL authenticate only active device credentials, compare secret hashes safely, attach the credential's household to the request, and update last-used metadata without logging the secret.

#### Scenario: Valid active credential is supplied

- **WHEN** an API request includes a valid active device bearer
- **THEN** the request is authenticated as exactly the household that owns the credential

#### Scenario: Missing, malformed, invalid, or revoked credential is supplied

- **WHEN** a protected API request has no valid active device bearer
- **THEN** the server returns `401`
- **AND** no protected resource lookup or mutation is performed

### Requirement: Child resources are household-owned

The system SHALL associate every child with exactly one household and SHALL validate the authenticated household in all reads and writes involving a child ID. A caller-supplied child ID SHALL NOT establish ownership.

#### Scenario: Household accesses its child

- **WHEN** an authenticated device requests a resource for a child owned by its household
- **THEN** the operation proceeds according to the endpoint contract

#### Scenario: Household accesses another household's child

- **WHEN** an authenticated device requests a resource for a child owned by another household
- **THEN** the server returns `403` or a non-enumerating `404`
- **AND** the resource is not read or changed

### Requirement: Household can be recovered without a conventional account

The system SHALL allow a parent to recover an existing household on a new installation using the current recovery code, the parent PIN, and a newly generated device credential. Recovery codes SHALL have at least 60 bits of entropy, SHALL be stored only as salted hashes on the server, and SHALL be rate-limited together with PIN attempts.

#### Scenario: Correct recovery proof is supplied

- **WHEN** a new installation supplies the current recovery code, correct parent PIN, and a new valid device credential
- **THEN** the server adds that device to the existing household
- **AND** existing children, progress, and entitlement remain in that household

#### Scenario: Recovery proof is invalid

- **WHEN** the recovery code or PIN is incorrect
- **THEN** the server returns a generic failure without disclosing which value was wrong
- **AND** records a failed attempt for throttling and lockout

#### Scenario: Recovery code is regenerated

- **WHEN** a PIN-verified parent regenerates the recovery code
- **THEN** the previous recovery code becomes invalid
- **AND** the new plaintext code is returned only once

### Requirement: Play purchase tokens are unique to a household

The system SHALL bind the hash of each Google Play purchase token to exactly one household after Google verifies the purchase. Re-verification by the same household SHALL be idempotent, and use by a different household SHALL be rejected and audited.

#### Scenario: Household verifies a new purchase token

- **WHEN** Google verifies a purchase token that has no existing household binding
- **THEN** the server binds its hash to the authenticated household and updates entitlement

#### Scenario: Another household replays a bound token

- **WHEN** a verified purchase token is already bound to a different household
- **THEN** the server rejects activation for the caller
- **AND** does not transfer the binding or entitlement

