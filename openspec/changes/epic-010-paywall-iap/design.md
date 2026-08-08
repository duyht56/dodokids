## Context

The PaywallScreen exists and is wired into `ChildStack` at two trigger points: the week-3 map tap and the locked-report "Xem chi tiết". Currently `onStart` calls `startTrial()` — a local store mutation only. EPIC-010 replaces this with a real IAP flow. The `child.entitlement` sub-document is already in the schema (`plan`, `status`, `trialWeeksUnlocked`, `paidWeeksUnlocked`, `expiresAt`). The backend has no IAP module yet. Product IDs are fixed: `kido_monthly_139k` and `kido_annual_999k`.

## Goals / Non-Goals

**Goals:**
- Real purchase flow on both Android (Google Play) and iOS (App Store) using `react-native-iap`.
- Server-side receipt/token verification (no client-side trust).
- PaywallScreen UI updated to final spec (prices, CTA, anchoring, restore link).
- App-launch entitlement sync from server to local store.

**Non-Goals:**
- Server-side subscription renewal webhooks (deferred; expiry is BE-checked on entitlement endpoints).
- Free-trial period enforcement at the IAP level (Apple/Google handle this; BE just activates on first verify).
- Admin dashboard, refund handling, or webhook ingestion.

## Decisions

- **`react-native-iap` as the IAP library.** Expo-compatible, supports both stores, well-maintained. *Alternative:* RevenueCat — simpler but adds a vendor dependency and cost; deferred until scale requires it.
- **`initConnection` → `getSubscriptions` on mount.** Loads store-localised prices to display. Falls back to hardcoded VND strings on failure so the screen is always functional (albeit non-purchasable). Listener cleanup in `useEffect` return.
- **Backend verification over client-side trust.** After `purchaseUpdatedListener` fires, the app POSTs the raw token/receipt to the BE, which calls Apple/Google APIs server-side. No entitlement is activated until the server confirms. *Why:* prevents fake receipts; required for App Store / Google Play policy.
- **Production-first, sandbox fallback for Apple.** POST to `https://buy.itunes.apple.com/verifyReceipt`; on status 21007 retry against `https://sandbox.itunes.apple.com/verifyReceipt`. *Why:* Apple's recommended flow; avoids hardcoding environment.
- **Google Play verification via googleapis service-account.** `GOOGLE_PLAY_KEY` env var holds the service-account JSON. Use `google-auth-library` + `googleapis` to call `androidpublisher.purchases.subscriptions.get`. *Why:* avoids a third-party wrapper; gives direct access to the canonical API.
- **Entitlement stored on `child` document** (existing `entitlement` sub-doc). `paidWeeksUnlocked` is set to a large constant (e.g. 52 for annual, 5 for monthly) representing content access. `expiresAt` mirrors the store's expiry.
- **App-launch sync** reads `child.entitlement` from `GET /children/:childId` (already fetched on boot by the auth flow) and calls `subscriptionStore.setPlan` to overwrite local state. No new endpoint needed.
- **Pending purchases** handled via `purchaseUpdatedListener` registered in the root app component (not inside `PaywallScreen`) so interrupted purchases are caught even when the user doesn't re-open the paywall.

## Risks / Trade-offs

- [react-native-iap requires a real device + store account to test] → Sandbox testing for both platforms before go-live; the screen falls back gracefully on simulator.
- [Google Play API requires service-account permissions] → `GOOGLE_PLAY_KEY` must be provisioned before launch; BE returns 503 until it is.
- [Apple receipt validation is deprecated in favour of App Store Server Notifications] → `verifyReceipt` still works for direct purchases; migrate to Server Notifications in a future epic.
- [Price display: localised strings vs hardcoded VND] → Use store-returned price if available; hardcoded VND strings as fallback. Matches what Apple/Google show in their own sheets, so discrepancy is minimal.
- [Double-purchase on network retry] → `purchaseUpdatedListener` may fire twice; idempotent BE (check token not already stored) prevents double-activation.

## Migration Plan

1. Add `iap` NestJS module; add env vars to `.env.example`.
2. Install `react-native-iap` in `mobile/`; run `expo prebuild` for native config.
3. Update `PaywallScreen` UI and wire IAP.
4. Test purchase flow in sandbox on both platforms.
5. Rollback: revert `onStart` to `startTrial()` call; disable IAP endpoints.

## Open Questions

- Store product configuration (App Store Connect, Google Play Console) must be done outside the codebase — confirm product IDs `kido_monthly_139k` / `kido_annual_999k` are created before QA.
- `paidWeeksUnlocked` value for monthly vs annual: currently a content-access counter; confirm desired value with the content/product team.
