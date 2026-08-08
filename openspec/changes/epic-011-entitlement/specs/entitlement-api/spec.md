## ADDED Requirements

### Requirement: GET /iap/entitlement returns the child's entitlement

`GET /iap/entitlement?childId=` SHALL return the child's current entitlement: `{ plan, status, trialWeeksUnlocked, paidWeeksUnlocked, expiresAt }`. It MUST `404` when the child does not exist and `400` when `childId` is missing.

#### Scenario: Read entitlement for an existing child

- **WHEN** `GET /iap/entitlement?childId=child_x` and the child exists
- **THEN** response `200 OK` with `{ plan, status, trialWeeksUnlocked, paidWeeksUnlocked, expiresAt }`

#### Scenario: Missing childId

- **WHEN** `GET /iap/entitlement` without `childId`
- **THEN** response `400 Bad Request`

#### Scenario: Unknown child

- **WHEN** `GET /iap/entitlement?childId=nope` and no such child exists
- **THEN** response `404 Not Found`

### Requirement: POST /iap/restore re-validates and restores a subscription

`POST /iap/restore` with body `{ childId, platform, receipts[] }` SHALL re-validate every supplied receipt/token against the platform store, select the most recent still-active subscription, and reactivate the child's entitlement from it. It MUST be idempotent (restoring an already-recorded receipt does not duplicate it) and MUST return the resulting entitlement.

#### Scenario: Restore an active subscription

- **WHEN** `POST /iap/restore` is called with receipts that include at least one active subscription
- **THEN** the child's entitlement is reactivated from the most recent active receipt
- **AND** the response returns the resulting `{ plan, status, paidWeeksUnlocked, expiresAt }`

#### Scenario: No active subscription among receipts

- **WHEN** all supplied receipts are expired or invalid
- **THEN** the entitlement is not upgraded and the response indicates nothing was restored

#### Scenario: Idempotent restore

- **WHEN** a receipt already recorded in `child.iapReceipts` is restored again
- **THEN** it is not duplicated in `child.iapReceipts`
