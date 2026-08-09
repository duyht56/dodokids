## ADDED Requirements

### Requirement: Apple purchases bind on a stable subscription identity
Apple purchase anti-replay SHALL key the `PurchaseBinding` on a stable subscription identity (`original_transaction_id`), not on the raw client receipt blob, so that renewed/refreshed receipts for the same subscription cannot be re-bound to additional households.

#### Scenario: Renewed receipt for the same subscription is recognized
- **WHEN** a second household presents a different receipt blob that resolves to an `original_transaction_id` already bound to another household
- **THEN** the binding key matches the existing binding and the cross-household guard applies (no new grant)

#### Scenario: Binding identity is extracted from the verified response
- **WHEN** `validateApple` succeeds
- **THEN** the returned purchase identity is `original_transaction_id` (falling back to `transaction_id`, then the receipt blob only if neither is present)

#### Scenario: Google binding unchanged
- **WHEN** an Android purchase is verified
- **THEN** it continues to bind on `purchaseToken` (out of scope for this change)

### Requirement: Restore receipts are bounded
`RestoreDto.receipts` SHALL enforce a minimum and maximum array size, and `restore()` SHALL de-duplicate receipts before issuing outbound verification calls.

#### Scenario: Oversized restore is rejected
- **WHEN** a client posts `POST /iap/restore` with more than the maximum allowed receipts
- **THEN** validation fails (400) before any outbound Apple/Google call is made

#### Scenario: Duplicate receipts are collapsed
- **WHEN** a restore payload contains duplicate `receiptData`/`purchaseToken` entries
- **THEN** each distinct receipt is verified at most once
