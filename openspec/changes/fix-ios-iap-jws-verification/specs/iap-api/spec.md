## MODIFIED Requirements

### Requirement: iOS Purchase Verification
The BE SHALL verify iOS purchases by validating the **StoreKit 2 signed transaction (compact JWS)** that the client obtains from `purchase.purchaseToken`, using Apple's App Store Server Library and the Apple Root CA chain. The BE SHALL NOT call the deprecated `/verifyReceipt` endpoint, which accepts only base64 App Store receipts and rejects a JWS with status 21002.

The request field carrying the signed transaction SHALL be named `signedTransactionJws` and SHALL be validated as three non-empty base64url segments before any outbound call.

The BE SHALL select the verification environment from the payload's `environment` claim (`Sandbox` or `Production`) rather than by retrying on status 21007. The claim SHALL NOT be trusted: it only selects a verifier, which re-checks the claim against its own configured environment after Apple's signature has been validated. Any other environment value, including `Xcode` and `LocalTesting`, SHALL be rejected.

#### Scenario: Signed transaction reaches Apple untouched
- **WHEN** the client posts a compact JWS to `POST /iap/verify-ios`
- **THEN** the exact string is passed to the App Store Server Library verifier with no transformation

#### Scenario: Legacy base64 receipt is refused
- **WHEN** a base64 App Store receipt is posted instead of a JWS
- **THEN** the request is rejected without any outbound call to Apple

#### Scenario: Sandbox transaction verified without production credentials
- **WHEN** a Sandbox transaction is verified and `APPLE_APP_APPLE_ID` is unset
- **THEN** verification succeeds, so TestFlight and App Review remain testable

#### Scenario: Non-App-Store environment refused
- **WHEN** a transaction carries environment `Xcode` or `LocalTesting`
- **THEN** verification is refused, because verifiers for those environments skip signature checking

#### Scenario: Transient verification failure is retryable
- **WHEN** signature verification fails for a retryable reason such as an OCSP outage
- **THEN** the endpoint returns HTTP 502 `{ error: "apple_unreachable" }`, not 402, so a real purchase is not burned as invalid

### Requirement: IAP Environment Variables
The BE SHALL read `APPLE_BUNDLE_ID` (the bundle identifier every signed transaction must carry), `APPLE_APP_APPLE_ID` (the app's numeric App Store id, required only for the Production environment) and `GOOGLE_PLAY_KEY` (service-account JSON for Google Play) from environment variables. A missing or invalid value SHALL disable the affected verifier and cause the corresponding verification to return HTTP 503, and SHALL NOT abort application bootstrap.

#### Scenario: Missing Apple bundle id
- **WHEN** `APPLE_BUNDLE_ID` is not set and iOS verify is called
- **THEN** the endpoint returns HTTP 503 with `{ error: "iap_not_configured" }`

#### Scenario: Missing production app id
- **WHEN** `APPLE_APP_APPLE_ID` is not set and a Production transaction is verified
- **THEN** the endpoint returns HTTP 503 with `{ error: "iap_not_configured" }`

#### Scenario: iOS misconfiguration does not take down the server
- **WHEN** Apple verification cannot be configured at startup
- **THEN** the application still boots and the lessons, progress and Android purchase paths keep working

### Requirement: Entitlement Activation
On successful IAP verification the BE SHALL update `child.entitlement` with `plan` (`monthly` | `annual`), `status: "active"`, and `expiresAt` derived from the verified Apple expiry or the Google Play expiry. Verification SHALL be refused when the transaction is revoked, when it has already expired, or when its product is not in the Kido catalogue. Only a one-way hash of the binding identity SHALL be persisted for audit — never the raw signed transaction.

#### Scenario: Annual entitlement persisted
- **WHEN** an annual purchase is verified
- **THEN** `child.entitlement.plan === "annual"`, `status === "active"`, and `expiresAt` matches the verified expiry

#### Scenario: Revoked transaction refused
- **WHEN** a verified transaction carries a `revocationDate` (refund or Family Sharing revocation)
- **THEN** the endpoint returns HTTP 402 and no entitlement is written

#### Scenario: Expired transaction refused
- **WHEN** a correctly signed transaction has already passed its expiry
- **THEN** the endpoint returns HTTP 402 and no entitlement or purchase binding is written

#### Scenario: Unknown product refused
- **WHEN** a verified transaction carries a product id outside `KIDO_PRODUCT_IDS`, including an inherited object key such as `constructor`
- **THEN** the endpoint returns HTTP 402
