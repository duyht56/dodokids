## Why

EPIC-011 (Backend — API) is largely already implemented in `kido-server`: project setup, `POST /children`, `GET /lessons/today`, `GET /lessons/:lessonId`, `GET /lessons/practice/:childId`, lesson completion (`PATCH /progress/:childId/complete-lesson`), `GET /progress/:childId`, weekly reports, and IAP receipt verification (`POST /iap/verify-ios|verify-android`). Two backend gaps remain — both P0 — and this change closes them:

- **STORY-011-05 (Entitlement Middleware)** is missing entirely: lesson content is currently served with no entitlement check, so a free/trial child can fetch paid weeks. The backend MUST enforce week access server-side (never trust the client).
- **STORY-011-04 (IAP)** is incomplete: `verify-ios` / `verify-android` exist, but there is no way to **read** a child's entitlement (`GET /iap/entitlement`) or to **restore** purchases (`POST /iap/restore`).

`POST /reports/share` (part of STORY-011-03) is intentionally **out of scope**: sharing is already implemented client-side in the mobile app (`react-native-view-shot` + Expo `Sharing` in `mobile/src/screens/parent/ReportScreen.tsx`), so no server-side image generation is needed.

## What Changes

- **Entitlement enforcement guard** (STORY-011-05): a NestJS guard that, given `childId` + the target week, allows access per plan/status:
  - `trial`: weeks 1–2 only
  - `monthly`: current week + 4 weeks ahead
  - `annual`: all 48 weeks
  - `expired`: weeks 1–2 only (trial content)
  - Blocked access returns **`403`** with `{ requiresUpgrade: true }`. Applied to `GET /lessons/today` and `GET /lessons/:lessonId`.
- **`GET /iap/entitlement?childId=`** (STORY-011-04): returns `{ plan, status, trialWeeksUnlocked, paidWeeksUnlocked, expiresAt }` for the child.
- **`POST /iap/restore`** (STORY-011-04): body `{ childId, platform, receipts[] }` — re-validates the supplied receipts/tokens and restores the most recent active subscription, reactivating the entitlement.
- **Lesson endpoints** now run through the entitlement guard before returning content.

## Capabilities

### New Capabilities
- `entitlement-guard`: Server-side enforcement of week access on lesson endpoints based on the child's plan/status; returns `403 { requiresUpgrade: true }` when blocked.
- `entitlement-api`: `GET /iap/entitlement` (read) and `POST /iap/restore` (re-validate + restore) on the IAP module.

### Modified Capabilities
- `lessons-api`: lesson reads (`GET /lessons/today`, `GET /lessons/:lessonId`) are now gated by entitlement and return `403 { requiresUpgrade: true }` for weeks the child has not unlocked.

## Impact

- **Server** (`kido-server`): new `EntitlementGuard` (+ a small entitlement policy helper) wired onto `LessonsController`; the `LessonsController`/service must expose the target week to the guard (today's week from the child, or the week parsed from `:lessonId` `w{week}-d{day}-{subject}`). New `GET /iap/entitlement` and `POST /iap/restore` on `IapController`/`IapService`, reusing the existing Apple/Google verification paths and `child.iapReceipts`.
- **Schema**: no schema changes — `child.entitlement` (`plan`, `status`, `trialWeeksUnlocked`, `paidWeeksUnlocked`, `expiresAt`) and `child.iapReceipts` already exist.
- **Mobile**: already handles `403 { requiresUpgrade: true }` → navigate Paywall (per STORY-011-05); restore + entitlement read consumed by the subscription flow.
- **Out of scope**: `POST /reports/share` (handled client-side); no changes to generation/pipeline/publish.

## Extension: Activation Codes and Configurable Experience Campaign

The entitlement surface now also supports purchases completed outside the app
and time-boxed acquisition campaigns:

- Trusted landing-page/marketing systems provision one-time activation codes;
  parents redeem them for the selected child in mobile Settings.
- A database-owned `early_registration_full_access` record grants full-course
  access until `endsAt` to households registered before that same cutoff.
- Effective entitlement is resolved server-side on every lesson access, so a
  disabled or expired campaign is invalid immediately without deployment.
