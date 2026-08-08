## 1. Server Session Foundation

- [x] 1.1 Add Household, DeviceCredential, and PurchaseBinding Mongoose schemas with required indexes and redacted security fields
- [x] 1.2 Add anonymous-session DTOs and cryptographic helpers for device secrets, PINs, recovery codes, hashing, and timing-safe verification
- [x] 1.3 Implement idempotent device registration, credential authentication, device revocation/rotation support, and request household context
- [x] 1.4 Implement parent PIN setup/verification lockout plus recovery-code issue, regeneration, and new-device recovery endpoints

## 2. Server Household Ownership

- [x] 2.1 Add householdId to Child and require authenticated household ownership in children create/read services and controller
- [x] 2.2 Require device authentication and household-filtered child access across lesson and entitlement paths
- [x] 2.3 Require device authentication and household-filtered child access across progress paths, including protecting the weekly-report runner
- [x] 2.4 Require device authentication and household-filtered child access across all parent paths
- [x] 2.5 Bind verified Google Play purchase tokens to the authenticated household and reject cross-household replay

## 3. Mobile Anonymous Session

- [x] 3.1 Add Expo secure-storage and cryptographic random dependencies compatible with the current Expo SDK
- [x] 3.2 Implement secure device credential generation, restore, registration, recovery, and in-memory anonymous session state
- [x] 3.3 Bootstrap the anonymous session before protected app/API flows and attach its bearer in the Axios interceptor
- [x] 3.4 Handle 401 as anonymous-session recovery, preserve credentials on 403, and remove conventional auth-token coupling from protected requests
- [x] 3.5 Remove DEV_CHILD_ID fallbacks from production paths and ensure onboarding creates children only after session bootstrap

## 4. Mobile Parent Access and Recovery

- [x] 4.1 Implement parent PIN setup and verification client APIs with local five-minute foreground unlock state
- [x] 4.2 Gate ParentStack entry and immediately relock parent access when the app backgrounds
- [x] 4.3 Add Settings security controls for PIN change, one-time recovery-code acknowledgement, local secure display, and regeneration
- [x] 4.4 Require an authenticated household and current parent unlock before purchase/restore actions in Paywall and IAP flows

## 5. Verification and Go-Live Evidence

- [x] 5.1 Add server tests for registration idempotency, invalid/revoked secrets, child IDOR rejection, PIN lockout, recovery, and purchase-token conflict
- [x] 5.2 Add mobile tests for secure bootstrap, bearer attachment, 401/403 behavior, parent relock, and purchase gating where test infrastructure permits
- [x] 5.3 Run focused server tests/build and mobile lint/type checks, fixing regressions within the change scope
- [x] 5.4 Update the Google Play go-live checklist with implemented anonymous-session evidence and any remaining external blockers
