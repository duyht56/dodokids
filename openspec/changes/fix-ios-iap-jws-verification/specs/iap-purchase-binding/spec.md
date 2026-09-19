## MODIFIED Requirements

### Requirement: Apple purchases bind on a stable subscription identity
Apple purchase anti-replay SHALL key the `PurchaseBinding` on the `originalTransactionId` of the **verified** StoreKit 2 transaction payload. There SHALL be no fallback to the raw signed transaction: Apple issues a different JWS for every transaction and renewal, so binding on it would let one paid subscription re-bind to many households.

#### Scenario: Binding identity comes from the verified payload
- **WHEN** `validateApple` succeeds
- **THEN** the returned purchase identity is the payload's `originalTransactionId`

#### Scenario: Renewed transaction for the same subscription is recognized
- **WHEN** a second household presents a different signed transaction that resolves to an `originalTransactionId` already bound to another household
- **THEN** the binding key matches the existing binding and the cross-household guard applies (no new grant)

#### Scenario: Missing identifiers are refused, not worked around
- **WHEN** a verified payload lacks `originalTransactionId` or `transactionId`
- **THEN** verification fails with HTTP 402 rather than falling back to another identity

#### Scenario: Google binding unchanged
- **WHEN** an Android purchase is verified
- **THEN** it continues to bind on `purchaseToken` (out of scope for this change)

### Requirement: Restore receipts are bounded
`RestoreDto.receipts` SHALL enforce a minimum and maximum array size, each iOS entry SHALL be validated as a compact JWS in the field `signedTransactionJws`, and `restore()` SHALL de-duplicate receipts before issuing outbound verification calls.

#### Scenario: Oversized restore is rejected
- **WHEN** a client posts `POST /iap/restore` with more than the maximum allowed receipts
- **THEN** validation fails (400) before any outbound Apple/Google call is made

#### Scenario: Malformed iOS restore entry is rejected
- **WHEN** a restore entry carries something that is not a compact JWS
- **THEN** validation fails (400)

#### Scenario: Duplicate receipts are collapsed
- **WHEN** a restore payload contains duplicate `signedTransactionJws`/`purchaseToken` entries
- **THEN** each distinct receipt is verified at most once
