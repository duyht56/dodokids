## ADDED Requirements

### Requirement: POST /api/iap/verify-ios
The BE SHALL expose `POST /api/iap/verify-ios` accepting `{ childId: string, receiptData: string }`. It SHALL forward the receipt to the Apple `/verifyReceipt` endpoint (production first, then sandbox on status 21007), validate the response, activate the child's entitlement if valid, and return the updated entitlement.

#### Scenario: Valid Apple receipt, annual plan
- **WHEN** a valid `receiptData` corresponding to `kido_annual_999k` is sent
- **THEN** the endpoint returns HTTP 200 with `{ plan: "annual", status: "active", expiresAt: <ISO> }` and `child.entitlement` is updated

#### Scenario: Valid Apple receipt, monthly plan
- **WHEN** a valid `receiptData` corresponding to `kido_monthly_139k` is sent
- **THEN** the endpoint returns HTTP 200 with `{ plan: "monthly", status: "active", expiresAt: <ISO> }`

#### Scenario: Invalid or expired Apple receipt
- **WHEN** Apple returns a non-zero status code
- **THEN** the endpoint returns HTTP 402 with `{ error: "receipt_invalid" }`

#### Scenario: Sandbox receipt on production
- **WHEN** Apple returns status 21007 (sandbox receipt sent to production)
- **THEN** the BE retries against the sandbox endpoint and processes the result

#### Scenario: Unknown child
- **WHEN** `childId` does not match any child
- **THEN** the endpoint returns HTTP 404

### Requirement: POST /api/iap/verify-android
The BE SHALL expose `POST /api/iap/verify-android` accepting `{ childId: string, purchaseToken: string, productId: string }`. It SHALL verify the token with the Google Play Developer API, activate the child's entitlement if valid, and return the updated entitlement.

#### Scenario: Valid Google Play token, annual plan
- **WHEN** a valid `purchaseToken` for `kido_annual_999k` is sent
- **THEN** the endpoint returns HTTP 200 with `{ plan: "annual", status: "active", expiresAt: <ISO> }` and entitlement is activated

#### Scenario: Invalid or consumed token
- **WHEN** Google Play returns an error or the token is already consumed
- **THEN** the endpoint returns HTTP 402 with `{ error: "token_invalid" }`

#### Scenario: Unknown child
- **WHEN** `childId` does not match any child
- **THEN** the endpoint returns HTTP 404

### Requirement: Entitlement Activation
On successful IAP verification the BE SHALL update `child.entitlement` with `plan` (`monthly` | `annual`), `status: "active"`, and `expiresAt` (derived from Apple expiry or Google Play expiry). The raw receipt/token SHALL be stored server-side for audit purposes.

#### Scenario: Annual entitlement persisted
- **WHEN** annual purchase is verified
- **THEN** `child.entitlement.plan === "annual"`, `status === "active"`, and `expiresAt` is ~1 year from purchase

#### Scenario: Monthly entitlement persisted
- **WHEN** monthly purchase is verified
- **THEN** `child.entitlement.plan === "monthly"`, `status === "active"`, and `expiresAt` is ~1 month from purchase

### Requirement: IAP Environment Variables
The BE SHALL read `APPLE_SHARED_SECRET` (for Apple receipt validation) and `GOOGLE_PLAY_KEY` (service-account JSON for Google Play API) from environment variables. If either is absent, the corresponding verification endpoint SHALL return HTTP 503.

#### Scenario: Missing Apple secret
- **WHEN** `APPLE_SHARED_SECRET` is not set and iOS verify is called
- **THEN** the endpoint returns HTTP 503 with `{ error: "iap_not_configured" }`
