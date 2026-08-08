## Context

Kido is preparing for Google Play go-live without requiring a conventional account. The current API trusts caller-supplied `childId` values and does not associate children, progress, parent data, or purchases with an authenticated owner. Anyone who learns a child ID can therefore request or mutate that child's data.

The approved product direction keeps onboarding login-free while giving every installation an app-scoped anonymous credential. A household owns child profiles, devices, recovery credentials, and purchase bindings. The design must work for a child-directed application, must not depend on Android hardware or advertising identifiers, and must keep parent-only actions behind a PIN.

### Threat model

- An unauthenticated remote caller guesses or obtains a `childId` and reads or changes another household's data.
- A caller copies a public `deviceId` but does not possess its secret.
- A purchase token is replayed to activate a different household.
- A child with access to the unlocked device opens parent settings or starts a purchase flow.
- A lost or replaced device must be recoverable without email, phone number, or password.

## Goals / Non-Goals

**Goals:**

- Keep first-run onboarding free of email, phone, social login, and password.
- Authenticate API calls with an app-generated identifier plus a high-entropy secret.
- Enforce household ownership for child, lesson, progress, parent, and purchase operations.
- Protect parent-only surfaces with a server-verified PIN and a short local unlock window.
- Support recovery on a replacement device using a recovery code plus the parent PIN.
- Bind each verified Play purchase token to exactly one household.
- Store mobile credentials outside AsyncStorage and avoid Android hardware/ad identifiers.

**Non-Goals:**

- Building a general user-account system or identity-provider integration.
- Synchronizing data between households or sharing a child across households.
- Recovering a household when both recovery code and parent PIN are lost.
- Migrating arbitrary pre-release test children through a public claim-by-ID endpoint.
- Replacing Google Play Billing purchase verification.

## Decisions

### 1. Use an app-scoped device credential, not a hardware identifier

The mobile app generates:

- `deviceId`: an opaque UUID used only to address a Kido device credential.
- `deviceSecret`: 32 cryptographically random bytes encoded as base64url.

Neither value comes from Android ID, IMEI, MAC address, serial number, SIM data, or the advertising ID. The credential is stored in secure platform storage. `deviceId` is not an authentication factor by itself; possession of `deviceSecret` is required.

### 2. Authenticate with a versioned opaque bearer credential

Authenticated calls send:

`Authorization: Bearer kidods_<deviceId>.<deviceSecret>`

The server stores only a one-way hash of the secret and compares hashes using a timing-safe operation. The token is stable until the device is revoked or rotated. This avoids JWT refresh complexity while retaining revocation and explicit server-side ownership checks.

Session registration is idempotent when the same device ID and secret are supplied. Reusing an existing device ID with a different secret is rejected.

### 3. Introduce a first-class anonymous household

`Household` is the ownership boundary. Each `Child` has a required, indexed `householdId`; each `DeviceCredential` belongs to one household. Controllers never authorize from a caller-supplied household ID. The authenticated device establishes the household, and every child-scoped operation queries or validates both `childId` and `householdId`.

### 4. Register before child onboarding

On first launch, mobile generates the device credential and calls `POST /anonymous-sessions/register`. The server atomically creates a household and device credential. Only after registration succeeds may onboarding create the first child. This preserves the current login-free experience while closing the ownership gap.

### 5. Use a parent PIN for local parent access and server recovery proof

The parent creates a 4-6 digit PIN. The server stores a salted scrypt hash, never the plaintext PIN. PIN verification is rate-limited per household with incremental lockout after repeated failures.

Successful verification unlocks parent navigation locally for five minutes of foreground activity. Backgrounding the app or expiry locks it again. The API bearer credential remains the authorization boundary for household data; the PIN prevents a child using an already authenticated device from entering parent UI or initiating a purchase/recovery action.

### 6. Issue a high-entropy human-readable recovery code

After the parent creates a PIN, the server issues a single-use-view recovery code with at least 60 bits of entropy. The server stores only a salted hash. Mobile stores the code in secure storage and shows it only from a PIN-unlocked parent screen.

Recovery on a new installation requires both the recovery code and parent PIN plus a newly generated device credential. Successful recovery adds the new device to the existing household; it does not copy a secret from the old device. Repeated recovery failures are rate-limited and locked out.

Regenerating the recovery code invalidates the previous code.

### 7. Bind verified purchases to one household

The server hashes each verified Play purchase token and persists a unique `PurchaseBinding`. A token already bound to the authenticated household is idempotent. A token bound to another household is rejected and audited. Raw purchase tokens are retained only where required for Google verification and are never returned by parent APIs.

### 8. Apply guards at the API boundary and household filters in services

Device authentication is applied to children, child-scoped lessons, progress, parent, and IAP controllers. Services receive the authenticated `householdId` and include it in database filters. Guard-only validation is insufficient because a future controller or background path could otherwise bypass ownership.

Public endpoints are limited to health/status, anonymous registration, and recovery. Registration and recovery receive dedicated throttling.

### 9. Treat authentication failure as session recovery, not account login

On `401`, mobile clears only the invalid device credential, locks parent access, and enters an anonymous-session recovery state. It offers household recovery or creation of a new household. It must not route users to the conventional login screen.

`403` means the authenticated household does not own the requested resource and does not clear the credential.

### 10. Do not expose a public legacy child-claim path

This work is pre-go-live. Existing unowned development/test children will be reset or backfilled by an operator-only migration. Mobile clears a stale local child selection after an ownership failure and restarts child onboarding. A public `claimChildId` endpoint would recreate the same IDOR risk and is explicitly excluded.

## Risks / Trade-offs

- **Lost recovery material:** without email or phone, losing both PIN and recovery code is unrecoverable. The parent UI must state this clearly and prompt the parent to save the code.
- **Stable bearer token:** a stolen device secret remains usable until revoked. Secure storage, HTTPS-only production endpoints, redacted logs, and device revocation reduce this risk. Short-lived JWTs can be added later without changing the household model.
- **PIN brute force:** numeric PINs have low entropy. Scrypt hashing, attempt counters, server lockouts, generic errors, and endpoint throttling are required.
- **Cross-device purchase restore:** Play can return a purchase to a new device. Recovery should attach that device to the original household before restore. Cross-household token replay is rejected rather than silently transferring ownership.
- **Schema rollout:** making `Child.householdId` immediately required can break existing fixtures. Deploy schemas and migration/backfill before enabling guards in a populated environment; pre-production data may be reset.
- **Offline startup:** secure credentials can be read offline, but the first registration and household recovery require network access. Existing downloaded lessons can remain playable according to current offline behavior.

## Migration Plan

1. Add household, device credential, purchase binding, and ownership schema fields with indexes.
2. Backfill or reset non-production children and receipts; report any unowned records before guard activation.
3. Deploy anonymous registration and recovery endpoints.
4. Deploy guarded server controllers and household-filtered services.
5. Release mobile secure bootstrap before requiring ownership in production, or coordinate both behind a server rollout flag.
6. Monitor `401`, `403`, recovery lockouts, and purchase-token conflict events.
7. After the supported client rollout window, make `householdId` required at database validation level and remove compatibility code.

Rollback disables the ownership enforcement flag but does not delete household associations or credential records. Purchase-token uniqueness must remain enabled during rollback.

## Open Questions

- No product decision is blocking implementation. The five-minute parent unlock duration is the initial default and may later become remotely configurable.
