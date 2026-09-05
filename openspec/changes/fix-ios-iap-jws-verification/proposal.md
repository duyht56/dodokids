## Why

Đường verify mua hàng iOS **hỏng ở mọi môi trường**, không chỉ là nợ kỹ thuật với API deprecated.

Đã đối chiếu trên source thật:

1. `mobile/src/services/iap.ts` gửi `purchase.purchaseToken`. `react-native-iap@15.3.4` khai trường này trong typings của chính nó (`types.d.ts:1113`) là *"Unified purchase token (**iOS JWS**, Android purchaseToken)"* — trên iOS đây là **StoreKit 2 signed transaction (compact JWS)**, không phải App Store receipt.
2. `mobile/src/services/iapApi.ts` post chuỗi đó lên `POST /iap/verify-ios` dưới key `receiptData`.
3. `kido-server` `IapService.validateApple` post tiếp chuỗi đó vào `'receipt-data'` của `https://buy.itunes.apple.com/verifyReceipt`, vốn cần **base64 App Store receipt**.

Apple trả **status 21002 (malformed receipt data)**, không phải 21007 — nên nhánh retry sandbox trong code **không bao giờ chạy**. Không có entitlement iOS nào từng được kích hoạt được, ở sandbox lẫn production. Đây là blocker cứng cho App Review (Guideline 3.1.1/3.1.2: mua và restore phải hoạt động).

Ngoài ra, review adversarial phát hiện `validateApple` thiếu guard hết hạn: một transaction ký hợp lệ nhưng đã hết hạn vẫn kích hoạt `status:'active'` và chiếm binding — người dùng đã hết hạn có thể replay token cũ vô hạn.

## What Changes

- **iap-api**: thay `verifyReceipt` bằng `@apple/app-store-server-library@3.1.0`. Provider mới `AppleJwsVerifier` verify chữ ký JWS cục bộ bằng Apple Root CA (nhúng dạng base64 DER trong source vì `nest-cli.json` không có mục `assets`, file dưới `src/` không được copy vào `dist/`). Không dùng App Store Server API ở phase này — payload đã decode có đủ `productId`, `expiresDate`, `originalTransactionId`, `revocationDate`.
- **iap-api**: định tuyến môi trường **deterministic** theo claim `environment` trong payload (`Sandbox`/`Production`), thay cho vòng retry 21007. Claim này không được tin: nó chỉ chọn verifier, và verifier kiểm lại claim **sau khi** đã xác thực chữ ký Apple. `Xcode`/`LocalTesting` bị từ chối thẳng — verifier cho các môi trường đó bỏ qua kiểm tra chữ ký.
- **iap-api**: env đổi từ `APPLE_SHARED_SECRET` sang `APPLE_BUNDLE_ID` + `APPLE_APP_APPLE_ID`. `APPLE_APP_APPLE_ID` chỉ bắt buộc cho Production (constructor của thư viện throw nếu thiếu), nên thiếu nó là lỗi **chỉ lộ ra ở lần mua thật đầu tiên** — cấu hình sai làm hỏng verifier tương ứng nhưng **không** làm sập bootstrap của Nest.
- **iap-api**: field wire `receiptData` đổi tên thành `signedTransactionJws` ở cả `VerifyIosDto` và `RestoreReceiptDto`, kèm guard hình dạng (`@Matches` compact JWS + `@MaxLength`). iOS chưa từng phát hành nên không có vấn đề tương thích ngược.
- **iap-api**: thêm guard **hết hạn** và guard **revoked/refunded** vào `validateApple`; guard product đổi từ toán tử `in` (đúng cả với key kế thừa như `constructor`) sang `KIDO_PRODUCT_IDS.includes`.
- **iap-purchase-binding**: danh tính binding lấy từ `originalTransactionId` của payload đã verify, **bỏ hẳn fallback về raw token**. Apple phát hành JWS mới sau mỗi lần gia hạn, nên fallback về token thô sẽ cho một subscription trả tiền gán vào nhiều household — đây là hồi quy bảo mật chứ không phải bug thường.
- **mobile**: đổi tên field theo server; thêm guard hình dạng JWS trước khi post; sửa `restorePurchases` chọn theo `expirationDateIOS`/`transactionDate` thay vì `kido[kido.length - 1]` (thứ tự `getAvailablePurchases` không được cam kết ở cả hai store), loại bản ghi đã revoke, và gọi `syncIOS()` trước khi đọc — thiếu sync thì máy mới/cài lại báo "không có gì để restore" (App Review có test luồng này).

## Capabilities

### Modified Capabilities
- `iap-api`: Apple verification chuyển từ `/verifyReceipt` + `APPLE_SHARED_SECRET` sang xác thực chữ ký JWS StoreKit 2 cục bộ; thêm guard hết hạn/revoked; đổi tên field wire.
- `iap-purchase-binding`: danh tính binding Apple là `originalTransactionId` từ payload đã verify, không còn chuỗi fallback.

## Out Of Scope

- **App Store Server Notifications V2** và App Store Server API (đối soát refund/renew/grace). Phase 1 đọc snapshot tại thời điểm mua; subscription bị refund sau đó chỉ được phát hiện khi qua `expiresDate`. Android hiện cũng có tính chất này nên không phải hồi quy.
- **Ghi `environment` vào `PurchaseBinding`**: một grant từ Sandbox trong production hiện không phân biệt được với mua thật khi audit. Cần thiết vì TestFlight/App Review mua ở Sandbox, nhưng thêm field xuyên qua `activate()`/`bindPurchase()` chạm cả đường Android đang chạy tốt → tách change riêng.
- `PaywallScreen` gọi `disconnectIap()` lúc unmount (xoá luôn listener gốc qua `resetListenerState`) và đăng ký listener trùng với `useIapBootstrap` → một lần mua bắn hai POST verify.
- Transaction StoreKit không bao giờ được `finishTransaction` khi verify fail (402/409) → StoreKit gửi lại mỗi lần khởi động.
- `src/common/schemas/iap-receipt.schema.ts` là schema chết (không nơi nào tham chiếu) và vẫn khai field `receiptData`.
