## Why

The existing PaywallScreen ships a polished UI but calls `startTrial()` — a local store mutation with no payment. EPIC-010 replaces this stub with production-grade in-app purchases on both Android (Google Play) and iOS (App Store), backend receipt/token verification, and entitlement activation, while also updating the PaywallScreen to match the final design spec (correct prices, anchoring message, restore-purchases link, new CTA copy).

## What Changes

- **PaywallScreen UI update**: correct prices (999.000đ/year → "Chỉ 83.000đ/tháng, tiết kiệm 40%"; 139.000đ/month), hero copy "Tiếp tục hành trình cùng Kido! 🚀", anchoring message "= Bằng 2 buổi học thêm tại trung tâm", CTA "Bắt đầu học tiếp →", "Khôi phục mua hàng" restore link (required by Apple).
- **react-native-iap**: install and configure; load products on mount; `requestSubscription()` on CTA tap; `getAvailablePurchases()` for restore; handle pending purchases.
- **Backend IAP module**: `POST /api/iap/verify-ios` (Apple receipt validation against `/verifyReceipt`, sandbox/production handling) and `POST /api/iap/verify-android` (Google Play Developer API token validation); both activate the child's entitlement on the server.
- **Entitlement activation**: on successful verification, update `child.entitlement` (`plan`, `status`, `paidWeeksUnlocked`), persist the purchase token/receipt, and return the updated entitlement to the client.
- **subscriptionStore update**: replace `startTrial()` call with real purchase flow; sync entitlement from backend response into store after successful verification.
- **App-launch entitlement check**: on app start, re-validate subscription status from the server and update the store.

## Capabilities

### New Capabilities
- `iap-api`: Backend IAP verification endpoints — iOS (Apple receipt) and Android (Google Play token) — plus entitlement activation.
- `iap-mobile`: Mobile IAP integration: react-native-iap setup, product loading, purchase/restore flows, backend verification handshake, and store sync.

### Modified Capabilities
- `paywall`: Update pricing, CTA copy, anchoring message, and add "Khôi phục mua hàng" restore link; wire real IAP flow behind the CTA.

## Impact

- **Backend** (`kido-server`): new `iap` NestJS module with `IapService` (receipt/token verification via Apple/Google APIs), `IapController`, DTOs; environment variables `APPLE_SHARED_SECRET` and `GOOGLE_PLAY_KEY`; `child.entitlement` writes.
- **Mobile** (`mobile`): install `react-native-iap`; extend `PaywallScreen.tsx`; extend `subscriptionStore`; add `iapApi.ts` service; add app-launch entitlement sync in the root app component.
- **Specs**: 2 new (`iap-api`, `iap-mobile`); 1 delta to `paywall`.
- **External dependencies**: Apple `/verifyReceipt` endpoint, Google Play Developer API; product IDs `kido_monthly_139k` and `kido_annual_999k` must be configured in both stores before go-live.
