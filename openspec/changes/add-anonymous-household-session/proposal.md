## Why

Kido currently identifies a child by a caller-supplied `childId` without proving that the caller owns that child, which exposes child profile, progress, parent reports, and entitlement operations to IDOR-style access. The app must remain login-free for families, so it needs an app-scoped anonymous identity that provides real authentication, ownership, recovery, and parent-only access without collecting email, phone, or password credentials.

## What Changes

- Add an anonymous household session created automatically on first launch from a Kido-generated `deviceId` plus a high-entropy `deviceSecret`; no login screen or personal account is introduced.
- Store the mobile credential in platform secure storage, exchange it for bearer access, rotate/revoke it safely, and bootstrap the session before child setup or runtime API calls.
- Add household ownership to child records and enforce it on child, lesson, progress, parent, entitlement, restore, and purchase-verification operations.
- Add a parent PIN gate for parent-only surfaces, including subscription purchase, recovery details, and credential-management actions.
- Generate a human-readable recovery code so a parent can recover the anonymous household after reinstall or on a new device without an email/password account.
- Bind verified Google Play/App Store purchases to one household and reject cross-household purchase-token reuse.
- Update 401 handling for a login-free app: attempt session recovery/refresh and return to anonymous bootstrap when the device credential is invalid, rather than redirecting to a conventional login screen.
- **BREAKING** Child-owned runtime endpoints that currently accept only `childId` will require a valid anonymous household bearer credential and verify ownership.

## Capabilities

### New Capabilities

- `anonymous-household-session`: Automatic app-instance registration, secure bearer authentication, household ownership, credential rotation/revocation, recovery-code restore, and purchase binding without user login.
- `parent-access-gate`: Parent PIN creation and verification for parent-only settings, subscription purchase, recovery, and credential-management actions.

### Modified Capabilities

- `children-api`: Child creation and reads require an authenticated household and may only access children owned by that household.
- `api-client`: Mobile bootstraps the anonymous session, securely persists its device credential, attaches bearer auth, and handles invalid sessions without a login UI.
- `lessons-api`: Child-specific lesson, practice, and prefetch requests require household ownership of the supplied child.
- `progress-api`: Progress reads and completion writes require household ownership of the supplied child.
- `parent-api`: Parent summaries, profile updates, reports, and offline-task operations require household ownership.
- `mongoose-schemas`: Runtime persistence adds household/session ownership, hashed credentials, recovery data, and globally unique purchase-token ownership.
- `settings-screen`: Parent settings can manage the PIN and display/regenerate recovery information only after the parent gate.
- `paywall`: Starting a purchase requires successful parent-gate verification while preserving a dismissible child-safe paywall.

## Impact

- **Mobile:** app bootstrap, secure storage dependency, Axios authentication, persisted auth state migration, onboarding/setup, parent navigation/gate, Settings, Paywall, and IAP restore flows.
- **Server:** new anonymous-session module and persistence; ownership guards across children, lessons, progress, parent, and IAP modules; child schema migration/backfill; purchase-token uniqueness.
- **API:** new session bootstrap/restore/refresh/revoke endpoints and bearer requirement on child-owned endpoints.
- **Operations:** recovery-code support flow, credential hashing/rotation, migration strategy for existing unowned child records, and deployment ordering so old clients are not locked out unexpectedly.
- **Verification:** server unit/integration tests for authentication, IDOR denial, recovery, token rotation, and IAP replay; mobile lint/type checks plus bootstrap/reinstall/recovery flows.
