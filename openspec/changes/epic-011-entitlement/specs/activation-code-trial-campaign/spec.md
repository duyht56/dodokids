## ADDED Requirements

### Requirement: Parent redeems a one-time activation code

The server SHALL allow an authenticated household to redeem a valid one-time
activation code for one of its children. Codes SHALL be stored as one-way
hashes, SHALL enforce their validity window and status atomically, and SHALL
not be redeemable by a different household or child after redemption.

#### Scenario: Valid code activates a child

- **WHEN** the parent redeems an active, in-window code for a child in the authenticated household
- **THEN** the child receives an active monthly or annual entitlement for the code duration
- **AND** the code is marked redeemed with household, child, and timestamp audit fields

#### Scenario: Retry is idempotent

- **WHEN** the same household retries the same code for the same child
- **THEN** the server returns the effective entitlement without consuming the code again

#### Scenario: Code is unavailable

- **WHEN** a code is invalid, expired, revoked, or redeemed by another target
- **THEN** the server returns `409` with `activation_code_unavailable`

### Requirement: Trusted systems provision activation codes

The server SHALL expose an admin-key-protected provisioning endpoint for the
landing-page payment backend and marketing operations. The caller SHALL supply
a high-entropy plaintext code; the server SHALL persist only its hash and hint.

#### Scenario: Landing payment provisions a code

- **WHEN** a trusted backend calls `POST /admin/activation-codes` with a valid `x-admin-key`, code, plan, duration, source, and payment reference
- **THEN** the server creates the code and returns its provisioning metadata

#### Scenario: Admin key is absent or invalid

- **WHEN** `ACTIVATION_CODE_ADMIN_KEY` is not configured or `x-admin-key` does not match
- **THEN** provisioning fails without writing a code

### Requirement: Database-configured early-registration experience campaign

The server SHALL grant full-course access when the
`early_registration_full_access` database record is enabled, server time is
before `endsAt`, and the household was created on or before `endsAt`.

#### Scenario: Eligible household accesses paid content

- **WHEN** an earlier household requests a paid lesson while the campaign is active
- **THEN** effective entitlement is annual/full-course with `accessSource: trial_campaign`

#### Scenario: Campaign is invalidated

- **WHEN** the record is disabled, `endsAt` is changed to the past, or server time reaches `endsAt`
- **THEN** campaign access no longer applies on the next entitlement or lesson request

#### Scenario: Household registered after the cutoff

- **WHEN** `households.createdAt` is later than `endsAt`
- **THEN** the campaign does not grant access

