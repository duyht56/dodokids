## 1. Backend — IAP Module Setup

- [x] 1.1 Create `kido-server/src/modules/iap/` module: `iap.module.ts`, `iap.controller.ts`, `iap.service.ts`; register in `app.module.ts`
- [x] 1.2 Add DTOs: `verify-ios.dto.ts` (`{ childId, receiptData }`) and `verify-android.dto.ts` (`{ childId, purchaseToken, productId }`); use `class-validator`
- [x] 1.3 Add `googleapis` + `google-auth-library` to `kido-server` dependencies; add `APPLE_SHARED_SECRET` and `GOOGLE_PLAY_KEY` to `.env.example`
- [x] 1.4 Implement Apple receipt verification in `IapService.verifyIos()`: POST to production `/verifyReceipt`, retry sandbox on status 21007, return parsed expiry and product ID; return HTTP 503 if `APPLE_SHARED_SECRET` is missing
- [x] 1.5 Implement Google Play token verification in `IapService.verifyAndroid()`: use `googleapis` `androidpublisher.purchases.subscriptions.get`; return HTTP 503 if `GOOGLE_PLAY_KEY` is missing
- [x] 1.6 Implement entitlement activation in `IapService`: update `child.entitlement` (`plan`, `status: "active"`, `paidWeeksUnlocked`, `expiresAt`); store raw receipt/token in a new `child.iapReceipts` array for audit; return updated entitlement
- [x] 1.7 Wire `POST /api/iap/verify-ios` and `POST /api/iap/verify-android` routes in controller; add 404 guard for unknown child, 402 on verification failure

## 2. Backend — Verification

- [x] 2.1 Add unit tests for `IapService`: mock Apple/Google API responses, assert entitlement is set correctly, assert 402/503 paths
- [x] 2.2 Rebuild `dist` (`npm run build`) and smoke-check both endpoints in the local dev environment with mock env vars

## 3. Mobile — Dependencies & IAP Init

- [x] 3.1 Add `react-native-iap` to `mobile/` (`npx expo install react-native-iap`); verify Expo SDK 56 compatibility
- [x] 3.2 Add IAP native config to `app.json` if needed (permissions, billing); run `expo prebuild --clean` if required
- [x] 3.3 Create `mobile/src/services/iapApi.ts` with `verifyIosPurchase(childId, receiptData)` and `verifyAndroidPurchase(childId, purchaseToken, productId)` calling the backend endpoints

## 4. Mobile — PaywallScreen UI Update

- [x] 4.1 Update plan names and prices: annual → "Gói Năm Đồng Hành", "999.000đ/năm", "Chỉ 83.000đ/tháng", "Tiết kiệm 40%"; monthly → "Gói Tháng Toàn Diện", "139.000đ/tháng"
- [x] 4.2 Update CTA text to "Bắt đầu học tiếp →" and add anchoring message "= Bằng 2 buổi học thêm tại trung tâm" below plan cards
- [x] 4.3 Add "Hoàn tiền trong 7 ngày đầu" policy note and "Khôi phục mua hàng" link (tappable, positioned below CTA)

## 5. Mobile — IAP Purchase Flow

- [x] 5.1 On `PaywallScreen` mount: call `initConnection()` and `getSubscriptions([...productIds])`, store returned prices; handle failure with hardcoded fallback and disabled CTA
- [x] 5.2 Register `purchaseUpdatedListener` and `purchaseErrorListener` (cleanup on unmount); route successful purchase events through the backend verify flow
- [x] 5.3 On CTA tap: call `requestSubscription({ sku: selectedProductId })`; on success receipt/token, call `iapApi.verifyIosPurchase` or `verifyAndroidPurchase` depending on platform; call `finishTransaction` after BE confirms
- [x] 5.4 On backend success: call `subscriptionStore.setPlan(plan, "active", expiresAt)`, dismiss paywall, navigate Home
- [x] 5.5 On purchase cancellation (error code `E_USER_CANCELLED`): remain on paywall silently; on other errors: show error toast

## 6. Mobile — Restore & Launch Sync

- [x] 6.1 Wire "Khôi phục mua hàng" tap: call `getAvailablePurchases()`, find most-recent active purchase for a Kido product ID, POST to appropriate verify endpoint; show success or "no active subscription" alert
- [x] 6.2 Register a root-level `purchaseUpdatedListener` in `App.tsx` (or `_layout.tsx`) to handle purchases interrupted between sessions; clean up on unmount
- [x] 6.3 On app launch (after child is loaded in auth flow): read `child.entitlement` from the existing `GET /children/:childId` response and call `subscriptionStore.setPlan` to sync local state

## 7. Finalize

- [x] 7.1 Typecheck mobile (`npx tsc --noEmit`) and confirm no errors in changed files
- [ ] 7.2 Manually verify on a simulator/sandbox device: product prices load, purchase sheet opens, backend verify called, entitlement set, navigation to Home; test cancel path; test restore path
- [x] 7.3 Commit: `feat(epic-010): paywall IAP integration`
