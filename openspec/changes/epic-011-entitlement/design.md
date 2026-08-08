## Context

`kido-server` already implements most of EPIC-011. `child.entitlement` (`plan`, `status`, `trialWeeksUnlocked` default 2, `paidWeeksUnlocked`, `expiresAt`) and `child.iapReceipts` exist. `IapService` already verifies Apple receipts (`callApple`, sandbox→prod fallback) and Google tokens, and `activate()` writes the entitlement + dedups receipts by token. `LessonsController` exposes `GET /lessons/today` (uses `child.progress.currentWeek/currentDay`) and `GET /lessons/:lessonId` (lessonId format `w{week}-d{day}-{subject}`), with no entitlement enforcement today. Mobile already handles `403 { requiresUpgrade: true }` → Paywall.

This change adds the two missing backend pieces: an entitlement enforcement guard on lesson reads (STORY-011-05) and the entitlement read + restore endpoints (STORY-011-04). No schema changes.

## Goals / Non-Goals

**Goals:**
- Enforce week access server-side on lesson reads; deny with `403 { requiresUpgrade: true }`.
- One reusable, unit-testable entitlement policy (week-access decision).
- `GET /iap/entitlement` and `POST /iap/restore` reusing the existing verification paths.

**Non-Goals:**
- No `POST /reports/share` (sharing is client-side in mobile).
- No schema/model changes.
- No change to verify-ios/verify-android, generation, pipeline, or publish.
- No new external dependencies.

## Decisions

### D1 — Pure policy function + thin guard
Extract the week-access rule into a pure `canAccessWeek(entitlement, currentWeek, targetWeek): boolean` helper (and a `WEEK` mapper), and keep `EntitlementGuard` thin: resolve child + target week, call the helper, throw `ForbiddenException({ requiresUpgrade: true })` on deny.
- **Why:** the policy (trial 1–2, monthly N+4, annual all, expired 1–2) is the part worth testing exhaustively; a pure function makes that trivial and keeps the guard a thin adapter.
- **Alternative:** inline the logic in the guard — harder to unit-test, easy to drift.

### D2 — How the guard gets `childId` and `targetWeek` per route
- `GET /lessons/today`: `childId` from `?childId=`; `targetWeek` = the child's `progress.currentWeek` (guard loads the child).
- `GET /lessons/:lessonId`: `targetWeek` parsed from the `w{week}-...` param; `childId` from `?childId=` query (the endpoint currently takes none — add an optional `childId` query the guard reads).
- **Why query param for `:lessonId`:** there is no auth/session layer yet in this codebase, and `today` already identifies the child by `?childId=`. Staying consistent avoids inventing an auth mechanism in this change. If `childId` is absent on `:lessonId`, the guard denies (cannot prove entitlement) — fail closed.
- **Alternative considered:** a request header / future auth principal — deferred; no auth layer exists yet.

### D3 — Reuse IapService for restore
`POST /iap/restore` iterates the supplied receipts, calls the existing Apple/Google verification per platform, picks the most recent receipt whose expiry is in the future, and calls the existing `activate()` (which already dedups by token and writes the entitlement). `GET /iap/entitlement` just reads `child.entitlement`.
- **Why:** verification + activation logic already exists and is tested; restore is orchestration over it, not new verification.

### D4 — Guard ordering with the existing Redis cache
The guard runs before the handler, so the `lesson:today` cache read happens only after access is allowed. A denied request never serves cached content.
- **Why:** entitlement must gate even cache hits.

## Risks / Trade-offs

- **`childId` via query param is spoofable** (no auth yet) → a determined client could pass another child's id. Mitigation: acceptable for the current no-auth stage; the guard is the right insertion point so that when an auth principal is added, only the `childId` resolution changes, not the policy. Documented as a follow-up.
- **`:lessonId` without `childId` fails closed (403)** → a legitimate call that omits `childId` is denied. Mitigation: mobile always has the child context; document the required query param. Fail-closed is the safe default for entitlement.
- **Restore depends on store availability** (Apple/Google) → a store outage makes restore fail. Mitigation: surface verification errors; restore is retryable and idempotent.

## Migration Plan

1. Add `entitlement.policy.ts` (`canAccessWeek` + plan windows) with unit tests.
2. Add `EntitlementGuard`; wire it onto `LessonsController` (`today`, `:lessonId`); add optional `childId` query to `:lessonId`.
3. Add `GET /iap/entitlement` + `POST /iap/restore` to `IapController`/`IapService`; add a `RestoreDto`.
4. Tests: policy table (trial/monthly/annual/expired × in/out weeks), guard 403 vs pass, restore idempotency.
5. **Rollback:** remove the guard from `LessonsController` (endpoints revert to ungated) and drop the two new IAP routes; no data migration involved.

## Open Questions

- Auth: when a real auth/session principal lands, `childId` resolution in the guard should switch from the query param to the authenticated principal. Out of scope here.
- Whether `monthly` "current week + 4" should be measured against the child's `progress.currentWeek` or a subscription-anchored week. This design uses `progress.currentWeek`; revisit if product wants a fixed entitlement window from purchase date.

## Extension Decisions: Activation Codes and Experience Campaign

### D5 - One-time code, child-scoped grant

Activation codes are atomically consumed and audited against household + child.
Only a SHA-256 lookup hash and a four-character hint are stored. The landing
backend supplies the plaintext code so it can persist/deliver that code with
the payment order without requiring reversible encryption in Kido.

### D6 - One database date controls eligibility and expiry

`trial_campaign_configs.endsAt` is both the registration cutoff and access end.
Eligibility requires `household.createdAt <= endsAt` and `serverNow < endsAt`.
The query is intentionally not cached, making DB changes take effect on the
next protected request.

### D7 - Resolve effective entitlement before applying the pure week policy

The existing `canAccessWeek` remains pure. `EntitlementService` first combines
stored entitlement, real expiry time, and campaign eligibility; the lesson
guard applies the unchanged week policy to that effective view.
