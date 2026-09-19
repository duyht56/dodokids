# Design — harden-mobile-client

## rank 13 — entitlement cache integrity

**Root cause.** `subscriptionStore` persists the full entitlement to AsyncStorage; a rooted device can edit `status:'active'` and, offline, the launch sync can't override it.

**Decision.** Add `partialize` to the persist middleware so only `trialStartDate` is persisted; `plan/status/paidWeeks/expiresAt/trialWeeks` are NOT persisted. On launch the store starts at its safe defaults (`plan:'free'`, `status:'trial'`) and `useIapBootstrap` reconciles from the server (authoritative). There is no persisted paid state to tamper.

**Tradeoff.** A legitimately-paid user launching offline sees trial UI until the server is reachable. This is acceptable because (a) premium content is fetched from the server anyway (unavailable offline regardless), (b) content is server-gated, and (c) the review explicitly lists "re-fetch on start instead of persisting it / or lock" as the fix. The default `status:'trial'` keeps the free portion accessible offline.

## rank 14 — parent-gate adult challenge

Add an adult-verification step shown ONLY on first-run setup (`isSetup`, no PIN configured yet), before the PIN-creation UI. The challenge is a sum of two numbers spelled in Vietnamese words (e.g. "sáu cộng bốn"); the parent types the numeric answer. On success the PIN-creation UI appears; on failure a new challenge is generated. The verify path (PIN already exists) is unchanged and remains server-rate-limited. Real-money purchases stay separately gated by the OS payment sheet.

## rank 17 — transport security

- `app.json`: remove the hardcoded `android.usesCleartextTraffic: true`.
- `app.config.js`: compute `usesCleartextTraffic = !KIDO_API_URL || KIDO_API_URL.startsWith('http://')` and set it under `android`, so a release pointed at an https origin ships with cleartext disabled while dev (LAN http via Metro) keeps it enabled.
- `api.ts`: the http fallback (`http://<metroHost>` / `http://localhost`) is used ONLY when `__DEV__`; non-dev falls back to `https://api.dodokids.vn` instead of http localhost, and a warning is logged if a non-dev build ends up on an http base URL. The auth interceptor and 401 handling are unchanged (contract-guarded).

## Risks

- rank 13 offline-trial tradeoff (documented above) — revert the `partialize` line if the product wants persisted offline paid UI.
- rank 14 challenge must not block the existing verify flow — gated behind `isSetup` only.
- rank 17: `app.config.js` must preserve the other `android` fields from `app.json` (package, adaptiveIcon, predictiveBackGestureEnabled) via spread.
