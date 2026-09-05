## 1. Server — thay verifyReceipt bằng xác thực JWS

- [x] 1.1 Thêm `@apple/app-store-server-library@^3.1.0` vào `kido-server`.
- [x] 1.2 `src/modules/iap/apple-root-certs.ts`: nhúng 3 Apple Root CA (G3, G2, Apple Root CA) dạng base64 DER + accessor trả `Buffer[]`.
- [x] 1.3 `src/modules/iap/apple-jws.verifier.ts`: provider `AppleJwsVerifier` với `readJwsEnvironment` (export để test được), hai verifier Sandbox/Production, map lỗi RETRYABLE → 502 `apple_unreachable`, các lỗi khác → 402 `receipt_invalid`, thiếu cấu hình → 503 `iap_not_configured`. `onModuleInit` không bao giờ throw.
- [x] 1.4 `IapService.validateApple`: gọi verifier; guard product bằng `KIDO_PRODUCT_IDS.includes`; guard `revokedAt`; guard hết hạn; bind theo `originalTransactionId` không fallback.
- [x] 1.5 Xoá `APPLE_PROD_URL`/`APPLE_SANDBOX_URL`/`APPLE_SANDBOX_STATUS`, `AppleTransaction`/`AppleReceiptResponse`, `callApple`.
- [x] 1.6 Đăng ký `AppleJwsVerifier` trong `IapModule`.
- [x] 1.7 `.env.example`: bỏ `APPLE_SHARED_SECRET`, thêm `APPLE_BUNDLE_ID` + `APPLE_APP_APPLE_ID`.

## 2. Server — wire contract

- [x] 2.1 `VerifyIosDto`: `receiptData` → `signedTransactionJws` + `@Matches(COMPACT_JWS)` + `@MaxLength(8192)`.
- [x] 2.2 `RestoreReceiptDto`: đổi tên tương tự; cập nhật khoá dedupe trong `restore()`.

## 3. Server — test

- [x] 3.1 `apple-jws.verifier.spec.ts`: bảng kiểm `readJwsEnvironment`; **ghim D0** — receipt base64 cũ bị từ chối mà không gọi Apple, và chuỗi JWS tới verifier phải nguyên vẹn từng byte; kiểm cert decode ra đúng 3 CN; map lỗi 502/402/503.
- [x] 3.2 `iap.service.spec.ts`: bỏ mock `global.fetch` và `APPLE_SHARED_SECRET`; mock `AppleJwsVerifier`; thêm case revoked, hết hạn, product lạ, key nguyên mẫu (`constructor`), binding theo `originalTransactionId`; xoá test retry 21007.
- [x] 3.3 `npm run build` và `npm test` xanh (527 test).

## 4. Mobile

- [x] 4.1 `iapApi.ts`: `receiptData` → `signedTransactionJws`.
- [x] 4.2 `iap.ts`: guard `isCompactJws` trước khi post; `restorePurchases` gọi `syncIOS()`, dùng `onlyIncludeActiveItemsIOS: true`, loại revoked, chọn theo `purchaseRecency` thay vì vị trí mảng.
- [x] 4.3 `npx tsc --noEmit` xanh; eslint trên file đã sửa xanh.

## 5. Cấu hình phát hành iOS (đi kèm, không thuộc contract)

- [x] 5.1 `app.json`: `ios.supportsTablet: false`, `ios.config.usesNonExemptEncryption: false`, plugin `expo-build-properties` pin `ios.deploymentTarget: "16.4"`.
- [x] 5.2 `eas.json`: profile `ios-simulator`, khối `ios` cho `production`.
- [x] 5.3 Xác minh bằng prebuild sạch: `UISupportedInterfaceOrientations~ipad` biến mất, `TARGETED_DEVICE_FAMILY = "1"`, `ITSAppUsesNonExemptEncryption = false`, `IPHONEOS_DEPLOYMENT_TARGET = 16.4`.

## 6. Còn lại trước khi coi là xong ngoài repo

- [ ] 6.1 Set `APPLE_BUNDLE_ID` và `APPLE_APP_APPLE_ID` trong env production (lấy `APPLE_APP_APPLE_ID` ở App Store Connect > App Information > Apple ID; phải trùng `submit.production.ios.ascAppId` trong `mobile/eas.json`).
- [ ] 6.2 Mở egress HTTPS từ container tới OCSP responder của Apple, nếu không mọi verify cold-cache trả 502.
- [ ] 6.3 Mua sandbox thật end-to-end (chỉ chứng minh được đường Sandbox — đường Production vẫn phụ thuộc `APPLE_APP_APPLE_ID`).
