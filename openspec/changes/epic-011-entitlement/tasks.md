## 1. Entitlement policy (pure)

- [x] 1.1 Add `src/modules/lessons/entitlement.policy.ts` with `canAccessWeek(entitlement, currentWeek, targetWeek): boolean` implementing trial(1–2), monthly(currentWeek+4), annual(all 48), expired(1–2)
- [x] 1.2 Add unit tests covering each plan/status × in-window and out-of-window weeks

## 2. Entitlement guard

- [x] 2.1 Add `EntitlementGuard` that resolves the child (`childId` query) and the target week (current week for `/today`; week parsed from `w{week}-...` lessonId for `/:lessonId`)
- [x] 2.2 On deny, throw `ForbiddenException` with body `{ requiresUpgrade: true }`; fail closed when `childId` cannot be resolved on `:lessonId`
- [x] 2.3 Preserve existing 400/404 handler behavior (guard does not mask missing-child / bad-request)
- [x] 2.4 Wire the guard onto `LessonsController` for `GET /lessons/today` and `GET /lessons/:lessonId`; add optional `childId` query to `:lessonId`
- [x] 2.5 Add tests: blocked week → 403 `{ requiresUpgrade: true }`; allowed week → handler runs

## 3. Entitlement read + restore API

- [x] 3.1 Add `GET /iap/entitlement?childId=` to `IapController` returning `{ plan, status, trialWeeksUnlocked, paidWeeksUnlocked, expiresAt }` (400 missing childId, 404 unknown child)
- [x] 3.2 Add `RestoreDto` (`{ childId, platform, receipts[] }`) and `POST /iap/restore`
- [x] 3.3 Implement `IapService.restore`: re-validate each receipt via existing Apple/Google paths, pick most-recent active, call existing `activate()` (idempotent by token); return resulting entitlement
- [x] 3.4 Add tests: read entitlement; restore picks active receipt; restore is idempotent (no duplicate in `iapReceipts`); no-active-receipt leaves entitlement unchanged

## 4. Verification

- [x] 4.1 Confirm a trial child is blocked from week 3 via `GET /lessons/today` and `GET /lessons/:lessonId` (403 requiresUpgrade)
- [x] 4.2 Confirm an annual child can read any week; monthly within current+4
- [x] 4.3 Run the full `kido-server` test suite and typecheck (`tsc -p tsconfig.build.json --noEmit`)

## 5. Activation-code entitlement

- [x] 5.1 Add hashed one-time activation-code schema with plan, duration, source, validity window, external reference, and redemption audit fields
- [x] 5.2 Add admin-key-protected provisioning endpoint for landing-page/marketing backends
- [x] 5.3 Add household-authenticated redeem endpoint with atomic consumption, idempotent retry, child ownership check, and save-failure compensation

## 6. Database experience campaign

- [x] 6.1 Add `trial_campaign_configs` schema with `enabled` and `endsAt`
- [x] 6.2 Resolve effective entitlement dynamically using server time and `household.createdAt`; do not cache campaign config
- [x] 6.3 Apply effective entitlement in lesson guard and entitlement read API, including stored `expiresAt` invalidation

## 7. Parent mobile UX

- [x] 7.1 Add activation-code input, loading, success, and error states to parent Settings
- [x] 7.2 Refresh bootstrap from the effective entitlement endpoint and update paid-week state

## 8. Tests and operations

- [x] 8.1 Add focused tests for campaign eligibility/invalidation, expired stored entitlement, code redemption, retry, and provisioning
- [x] 8.2 Add database/API operations runbook in `docs/KIDO_ENTITLEMENTS.md`
- [x] 8.3 Run server build, focused entitlement tests, mobile lint/typecheck, and full server suite (224/226 pass; 2 unrelated Explore contract failures remain in the dirty worktree)
