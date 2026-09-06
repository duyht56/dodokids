# Apple App Store Go-Live Checklist — Dodokids iOS

> Ngày rà soát gốc: 2026-08-31
> Phạm vi: `mobile/` (iOS build), các API runtime liên quan trong `kido-server/`, `landing/`, và các yêu cầu cần hoàn tất trên **Apple Developer** + **App Store Connect**.
> Kết luận hiện tại: **NO-GO**. Chưa được submit lên App Store cho tới khi toàn bộ mục `P0` đạt.
> Mục tiêu trước mắt: **hoàn tất Apple Developer Program + App Store Connect app record, cấu hình build iOS trong EAS, đẩy build đầu tiên lên TestFlight**, rồi submit qua App Review.
>
> Khác biệt then chốt so với Google Play: **Apple KHÔNG bắt buộc gate 12 tester × 14 ngày**. TestFlight là track test khuyến nghị nhưng không phải điều kiện cứng để lên Production. Bù lại, App Review của Apple review từng bản binary bằng người thật (thường 24–48 giờ), soi rất kỹ **Kids Category (Guideline 1.3 / 5.1.4)**, **auto-renewable subscription (3.1.2)**, **quyền riêng tư (5.1.1–5.1.2)** và **account/data deletion (5.1.1(v))**.

## 0. Cập nhật 2026-08-31 — Critical path (đè lên Section 1 khi khác biệt)

> Snapshot theo hiện trạng repo và tài liệu Apple chính thức. Khi mâu thuẫn với phần rà soát cũ, lấy Section 0 làm chuẩn.

### 0.1 Đã sẵn sàng trong repo

- [x] **Bundle identifier:** `com.dodokids.app`; app name `Dodokids`; `supportsTablet: true`; portrait; `userInterfaceStyle: light` (`mobile/app.json`). EAS project đã link bằng `projectId`.
- [x] **Layout iPad đã adaptive** (OpenSpec `add-ipad-support`, 2026-09-06). `orientation: "portrait"` chỉ khoá iPhone: với `supportsTablet: true`, Expo ghi `UISupportedInterfaceOrientations~ipad` = cả 4 hướng và `UIRequiresFullScreen = false`, nên iPad xoay được và cửa sổ resize được. Đã dựng hệ size class dùng chung (`mobile/src/constants/layout.ts`, `useResponsive`), giới hạn bề rộng cột nội dung ở mọi màn, đổi lưới từ phần trăm sang point, và sửa bug Paywall tràn khỏi mép phải. Kiểm ở 1032×1376, ~1010×1230, 858×482, ~600×1150 và iPhone 402×874 (không đổi). Xem §0.2 của runbook.
- [x] **iOS deployment target thật:** `IPHONEOS_DEPLOYMENT_TARGET = 16.4` trong `mobile/ios/Dodokids.xcodeproj/project.pbxproj`. Lưu ý `Info.plist` ghi `LSMinimumSystemVersion 12.0` là giá trị stale từ template — build thật dùng 16.4.
- [x] **Privacy manifest:** `mobile/ios/Dodokids/PrivacyInfo.xcprivacy` đã tồn tại trong app target; Pods có 25 `*.xcprivacy`. Cần rà nội dung required-reason API + tracking domains ở AAB/archive cuối.
- [x] **Apple purchase verify server-side (đã migrate 2026-09-05):** `/iap/verify-ios` xác thực **StoreKit 2 signed transaction (JWS)** cục bộ bằng `@apple/app-store-server-library` + Apple Root CA (`kido-server/src/modules/iap/apple-jws.verifier.ts`). Định tuyến Sandbox/Production theo claim `environment` đã được verifier kiểm lại sau khi xác thực chữ ký. `verifyReceipt` và `APPLE_SHARED_SECRET` đã bị loại bỏ.
- [x] **Product IDs khớp source:** `kido_monthly_139k`, `kido_annual_999k` (`mobile/src/services/iapApi.ts`), dùng chung cho cả hai store.
- [x] **IAP client iOS:** `react-native-iap ^15.3.4`; `verifyPurchase` route theo `Platform.OS === 'ios'` → `verifyIosPurchase`; `finishTransaction` chỉ chạy sau khi server verify (`mobile/src/services/iap.ts`).
- [x] **ATS:** `NSAllowsArbitraryLoads = false` trong `Info.plist` (chỉ còn `NSAllowsLocalNetworking = true` phục vụ Expo dev launcher).
- [x] **Production API config:** EAS `preview`/`production` dùng `https://api.dodokids.vn`; `/health` trả HTTP 200 ngày 2026-08-31 (theo bản rà Google Play). Archive cài từ TestFlight vẫn phải test runtime trước Final GO.
- [x] **Legal technical delivery:** `/privacy`, `/terms`, `/data-deletion` có source, trả HTTP 200 công khai ngày 2026-08-31; mobile Settings trỏ đúng `dodokids.vn` và `support@dodokids.vn`.

### 0.2 Còn chặn — đường găng theo thứ tự

**Bước 1 — Apple Developer Program + định danh.**
- [ ] ASC Đăng ký/kiểm tra Apple Developer Program (Individual hay Organization). Nếu là Organization: chuẩn bị **D-U-N-S number** và legal entity đúng chủ thể sở hữu Dodokids.
- [ ] ASC Hoàn tất Agreements, Tax, and Banking (Paid Applications Agreement) — bắt buộc để bán subscription; không có agreement này thì IAP không hoạt động kể cả ở sandbox review.
- [ ] ASC Bật 2FA cho Apple ID chủ tài khoản; phân quyền App Store Connect theo least privilege.

**Bước 2 — App record + bundle ID.**
- [ ] ASC Đăng ký App ID / bundle `com.dodokids.app` trong Certificates, Identifiers & Profiles; bật capability **In-App Purchase**.
- [ ] ASC Tạo app record `Dodokids` trong App Store Connect (primary language `Vietnamese`, bundle `com.dodokids.app`, SKU nội bộ).
- [ ] ASC Tạo 2 auto-renewable subscription trong cùng một Subscription Group: `kido_monthly_139k`, `kido_annual_999k`; điền giá theo territory, localized display name/description, review screenshot cho từng product.

**Bước 3 — Cấu hình build iOS trong EAS.**
- [ ] P0 Thêm cấu hình iOS vào `mobile/eas.json`: profile `production` cần khối `ios` và một `submit.production.ios` (`appleId`, `ascAppId`, `appleTeamId`). Hiện `eas.json` **chỉ có Android** (`app-bundle`), không có bất kỳ mục iOS nào.
- [ ] P0 Đặt export compliance: `ios.config.usesNonExemptEncryption = false` trong Expo config (app chỉ dùng HTTPS chuẩn → exempt), để không phải trả lời thủ công mỗi lần upload; nếu giữ mặc định thì phải khai Export Compliance ở ASC mỗi build.
- [ ] P0 Thiết lập iOS credentials do EAS quản lý (Distribution certificate + App Store provisioning profile); lưu evidence, không commit secret.
- [ ] P0 Chốt nguồn `CFBundleVersion`/build number cho iOS (EAS `appVersionSource: remote`). Hiện `Info.plist` ghi `CFBundleVersion 1` static — xác nhận EAS tự tăng build number khi build production.

**Bước 4 — Build + TestFlight.**
- [ ] P0 `cd mobile && eas build --platform ios --profile production`; ghi lại `CFBundleShortVersionString`, build number, build URL.
- [ ] P0 `eas submit --platform ios --profile production` (hoặc Transporter) đẩy build lên App Store Connect → TestFlight.
- [ ] Cài từ TestFlight và chạy smoke test + sandbox IAP; **không nghiệm thu IAP bằng build cài trực tiếp từ Xcode**, phải qua TestFlight/sandbox để đúng luồng StoreKit.

**Bước 5 — App Store Connect content + submit.**
- [ ] ASC Hoàn tất App Privacy (nutrition label), Age Rating, App Review Information (parental gate PIN + demo path), Category (`Education`), screenshots iPhone + iPad, Privacy Policy URL, EULA/Terms.
- [ ] P0 Legal/product sign-off ba trang pháp lý. Privacy hiện mô tả thao tác xoá dữ liệu có trong app sau PIN, nhưng source mobile chưa có luồng/link xoá — phải triển khai hoặc sửa policy cho đúng hành vi thật.
- [ ] Submit for Review; theo dõi App Review, xử lý rejection nếu có.

### 0.3 Việc có thể bắt đầu ngay

1. Enroll/kiểm tra Apple Developer Program + Paid Applications Agreement + 2FA.
2. Tạo App ID `com.dodokids.app` + app record + 2 subscription trong App Store Connect.
3. Bổ sung cấu hình iOS vào `eas.json` + export compliance, chạy build iOS đầu tiên, đẩy TestFlight.
4. Chuẩn bị App Privacy/Age Rating/screenshots/review notes song song trong lúc build.

---

## Cách dùng checklist

- `[x]`: đã xác minh từ source hoặc artifact hiện có trong repo.
- `[ ] P0`: chặn submit/review hoặc có rủi ro bảo mật, dữ liệu trẻ em, doanh thu.
- `[ ] P1`: phải hoàn tất trước khi bấm Submit for Review.
- `[ ] ASC`: chỉ xác minh được khi vào **Apple Developer / App Store Connect**.
- Mỗi mục chỉ được tick khi có bằng chứng đi kèm: link ASC, ảnh chụp, log test, artifact hoặc commit.

## 1. Snapshot hiện trạng

| Hạng mục | Trạng thái | Bằng chứng hiện tại |
|---|---|---|
| iOS bundle identifier | PASS | `com.dodokids.app` trong `mobile/app.json`; native sinh lại từ config khi prebuild. |
| Version / build number | PARTIAL | `CFBundleShortVersionString=1.0.0`; `CFBundleVersion=1` static trong Info.plist. EAS `appVersionSource=remote` — cần xác nhận auto-increment build number cho iOS ở lần build đầu. |
| iOS deployment target | PASS / VERIFY FINAL | pbxproj dùng `16.4`; đáp ứng yêu cầu SDK hiện hành. Kiểm lại minimum-SDK requirement của Apple tại thời điểm submit. |
| Privacy manifest | PASS / VERIFY | `PrivacyInfo.xcprivacy` có trong app target + 25 Pod manifest. Cần rà required-reason API + tracking domains trên archive cuối. |
| Apple IAP verify (server) | PASS (CODE) / RUNTIME PENDING | Xác thực chữ ký JWS StoreKit 2 cục bộ (`@apple/app-store-server-library@3.1.0`), guard revoked + hết hạn + product, bind theo `originalTransactionId`. 43 test IAP xanh. Chưa có App Store Server Notifications V2 (đối soát refund/renew) — xem §2.6. |
| Apple env (bundle id + app id) | **BLOCKER (PROVISION)** | Code đọc `APPLE_BUNDLE_ID` + `APPLE_APP_APPLE_ID`. `APPLE_APP_APPLE_ID` chỉ bắt buộc cho Production, nên thiếu nó **chỉ lộ ra ở lần mua thật đầu tiên** — sandbox vẫn chạy. Phải trùng `submit.production.ios.ascAppId` trong `mobile/eas.json`. |
| IAP client iOS | PARTIAL | `react-native-iap ^15.3.4`; purchase/verify/restore theo platform; chưa có sandbox license test evidence. |
| EAS iOS build/submit | **BLOCKER** | `mobile/eas.json` không có khối `ios` ở bất kỳ profile nào và không có `submit.*.ios`. Chưa build/submit iOS được. |
| iOS signing / credentials | **BLOCKER** | Chưa có evidence Distribution certificate / App Store provisioning profile do EAS quản lý. |
| Export compliance | **PARTIAL** | Chưa set `usesNonExemptEncryption`; sẽ bị hỏi Export Compliance mỗi lần upload cho tới khi khai. |
| ATS / HTTPS | PASS (CONFIG) / RUNTIME PENDING | `NSAllowsArbitraryLoads=false`. Còn `NSAllowsLocalNetworking=true` + `NSLocalNetworkUsageDescription` + `_expo._tcp` + URL scheme `exp+mobile` là dev-launcher artifact; phải xác minh archive production (không kèm `expo-dev-client`) không ship các mục này. |
| Production API/auth | PASS (LOCAL) | Anonymous household session, bearer theo thiết bị, ownership `{householdId, childId}`, IAP token hash + bind household (dùng chung server, xem §2.3). Chưa xác minh trên production deployment/archive từ TestFlight. |
| Privacy/Terms/EULA | PASS (TECHNICAL) / LEGAL REVIEW | Source + mobile links đúng `dodokids.vn`; URL trả 200 công khai 2026-08-31. Cần legal sign-off + EULA cho auto-renewable subscription. |
| Data/Account deletion | **PARTIAL/POLICY** | Web deletion URL trả 200; chưa có in-app path/backend deletion evidence. Apple 5.1.1(v) yêu cầu xoá trong app nếu app tạo account/profile. |
| Kids Category policy | **BLOCKER/PARTIAL** | Parental gate/PIN đã có; chưa hoàn tất bộ khai App Store Connect (Age Rating, Kids/Made for Kids nếu chọn), rà third-party SDK/ads theo Guideline 1.3 & 5.1.4. |
| App Privacy nutrition label | CHƯA CÓ | Chưa khai trên App Store Connect; cần data inventory thực tế. |
| Store listing assets | CHƯA CÓ | Có source icon 1024×1024; chưa thấy screenshot iPhone 6.9"/6.5" và iPad 13" (bắt buộc vì `supportsTablet=true`). |
| Apple Developer / ASC setup | CHƯA CÓ | Chưa có evidence enrollment, Paid Applications Agreement, app record, subscription setup. |

## 2. P0 — Blocker phải xử lý trước App Review

### 2.1 iOS signing, build config và artifact

- [ ] P0 Bổ sung khối `ios` vào profile `production` trong `mobile/eas.json` và `submit.production.ios` (`appleId`, `ascAppId`, `appleTeamId`). Hiện chỉ có cấu hình Android.
- [ ] P0 Thiết lập iOS credentials do EAS quản lý: Distribution certificate + App Store provisioning profile cho `com.dodokids.app`; lưu evidence an toàn, không commit secret.
- [ ] P0 Set `ios.config.usesNonExemptEncryption = false` (HTTPS chuẩn → exempt) để tránh khai Export Compliance thủ công mỗi upload; nếu app về sau thêm mã hoá non-exempt thì phải khai lại đúng.
- [ ] P0 Build archive bằng `cd mobile && eas build --platform ios --profile production`.
- [ ] P0 Ghi lại `CFBundleShortVersionString`, build number thực tế và build URL sau mỗi build; xác nhận EAS auto-increment build number cho iOS.
- [ ] P0 Xác minh archive: đúng bundle `com.dodokids.app`, không debuggable, không kèm `expo-dev-client`/dev launcher, không menu debug, deployment target hợp lệ.
- [ ] P0 Kiểm merged `Info.plist` của archive: **không còn** `exp+mobile` URL scheme, `_expo._tcp` Bonjour, `NSAllowsLocalNetworking`, `NSLocalNetworkUsageDescription` (các mục này chỉ nên tồn tại trong dev client).

**Exit criteria:** có archive production ký đúng, upload App Store Connect thành công, cài được qua TestFlight, không cảnh báo ITMS về signing/bundle/version/privacy-manifest.

### 2.2 Production API, HTTPS, ATS và secret

- [x] P0 Domain production `https://api.dodokids.vn`; `/health` trả 200 (2026-08-31).
- [x] P0 EAS `preview`/`production` đặt `KIDO_API_URL=https://api.dodokids.vn`; non-dev fallback trong source cũng là HTTPS.
- [x] P0 `NSAppTransportSecurity.NSAllowsArbitraryLoads = false` — không cho cleartext toàn cục.
- [ ] P0 Xác nhận `NSAllowsLocalNetworking=true` chỉ phục vụ dev; trên archive production không mở loopback/cleartext ngoài ý muốn.
- [ ] P0 Provision `APPLE_BUNDLE_ID=com.dodokids.app` và `APPLE_APP_APPLE_ID` (số ở App Store Connect > App Information > Apple ID) trong production env của kido-server. Thiếu `APPLE_APP_APPLE_ID` thì mọi giao dịch Production trả 503 trong khi sandbox vẫn xanh — xác minh bằng log boot, đừng suy ra từ test sandbox.
- [ ] P0 Mở egress HTTPS từ container tới OCSP responder của Apple; thiếu là mọi verify cold-cache trả 502 `apple_unreachable`.
- [ ] P0 Xác minh các secret production khác: Mongo/Redis, publish/admin secret; không nằm trong app bundle hoặc source.
- [ ] P0 Chốt logging production có redaction/retention; không log PII trẻ em, device secret, recovery code hoặc receipt/transaction token.

**Exit criteria:** archive từ TestFlight gọi đúng HTTPS production, tạo child/tải bài/ghi progress/IAP verify thành công; không có request HTTP hoặc localhost.

### 2.3 Authentication, authorization và chống abuse (dùng chung server)

> Phần lớn đã đạt ở tầng server và dùng chung với Android; xem chi tiết trong `docs/GOOGLE_PLAY_GOLIVE_CHECKLIST.md` §2.3. Với iOS chỉ cần xác minh lại trên archive/TestFlight.

- [x] P0 Anonymous household session bằng app-scoped `deviceId` + secret trong SecureStore; `childId` không phải secret/quyền sở hữu.
- [x] P0 Mọi API đọc/sửa child, progress, parent report và entitlement kiểm ownership bằng cả `householdId` (bearer) và `childId`.
- [x] P0 IAP token/receipt được hash và bind duy nhất vào một household; token thuộc household khác bị từ chối (`purchase-binding.schema`).
- [x] P0 Global Redis/IP rate limit, route override, body limit và CORS default-deny.
- [ ] P0 Xác minh runtime trên archive từ TestFlight: clean install, reinstall, recovery, revoke thiết bị, parent PIN lockout.

**Exit criteria:** security test chứng minh client A không đọc/sửa được child B, không tự mở entitlement, không gọi được endpoint admin — kiểm lại trên build iOS thật.

### 2.4 Quyền riêng tư và dữ liệu trẻ em (App Store)

- [x] P0 Privacy Policy public tại `https://dodokids.vn/privacy` (200, 2026-08-31), đã link trong mobile Settings.
- [x] P0 Terms public tại `https://dodokids.vn/terms` (200, 2026-08-31), đã link trong mobile Settings.
- [ ] P0 Khai **App Privacy (nutrition label)** trên App Store Connect từ data inventory thực tế (xem danh mục dưới); mọi loại dữ liệu và mục đích phải khớp app + SDK thật.
- [ ] P0 Lập data inventory thực tế từ app, SDK, Pod privacy manifest và server logs trước khi khai. Ít nhất đánh giá:
  - tên, tuổi, avatar của trẻ;
  - lesson/activity progress, XP, streak, report, offline tasks;
  - purchase product, receipt/transaction, entitlement, expiry;
  - IP/request logs và mọi device identifier do SDK thu thập;
  - email nếu tính năng báo cáo tuần sau này thực sự thu thập email.
- [ ] P0 Chọn đúng đối tượng trẻ em và tuân thủ **Kids Category / Guideline 1.3 & 5.1.4**: parental gate trước mọi hành vi nhạy cảm (mua hàng, link ra ngoài), **không** dùng behavioral ads, **không** third-party analytics/tracking không có cơ chế phù hợp cho trẻ.
- [ ] P0 Nếu chọn niêm yết trong **Kids Category / "Made for Kids"**: chuẩn bị đủ hồ sơ tuân thủ; nếu **không** chọn Kids Category, vẫn phải đảm bảo app hướng trẻ em tuân thủ 1.3 và không vi phạm privacy.
- [ ] P0 Khai **Age Rating** chính xác cho nội dung trẻ 4–6.
- [ ] P0 Xác nhận **PrivacyInfo.xcprivacy** khai đúng: required-reason API (nếu dùng), `NSPrivacyTracking=false` (nếu không tracking), tracking domains rỗng; đối chiếu với 25 Pod manifest.
- [ ] P0 Chỉ khai "data encrypted in transit" sau khi toàn bộ luồng production đã dùng HTTPS.

### 2.5 Account/Data deletion (Guideline 5.1.1(v))

- [x] P0 Có web deletion URL `https://dodokids.vn/data-deletion` (200, 2026-08-31) hướng dẫn gửi yêu cầu qua email.
- [ ] P0 Thêm **in-app path** để xoá/yêu cầu xoá dữ liệu sau parent gate. Apple 5.1.1(v) yêu cầu app cho tạo account/profile phải có cơ chế xoá **trong app**, không chỉ web/email. Dodokids tạo child profile → áp dụng.
- [ ] P0 Đồng bộ nội dung Privacy với hành vi thật: hiện policy mô tả thao tác xoá có trong app sau PIN nhưng source mobile chưa có path này — triển khai hoặc sửa policy.
- [ ] P0 Bỏ yêu cầu gửi **recovery code qua email** ở trang data deletion (đây là credential); thiết kế xác minh yêu cầu xoá không thu secret qua email.
- [ ] P0 Backend xoá/anonymize đầy đủ child profile, progress, activity results và entitlement theo retention; giao dịch giữ lại vì nghĩa vụ pháp lý thì nêu rõ.

### 2.6 Paywall và auto-renewable subscription (Guideline 3.1.2)

- [x] P0 Purchase và restore yêu cầu anonymous household session sẵn sàng và parent PIN unlock trước khi mở purchase sheet.
- [ ] P0 **Binary disclosure** ngay cạnh CTA (yêu cầu cứng của 3.1.2): tên subscription, độ dài kỳ, giá localized theo kỳ, tự động gia hạn, cách huỷ, cộng **link chức năng tới Privacy Policy và EULA/Terms** trong chính app binary.
- [ ] P0 Metadata App Store Connect cũng phải có functional Privacy URL và EULA (dùng Apple standard EULA hoặc custom EULA).
- [ ] P0 Product IDs trên App Store Connect khớp source: `kido_monthly_139k`, `kido_annual_999k`, cùng một Subscription Group với upgrade/downgrade hợp lý.
- [ ] P0 Không dùng claim hardcode chưa được chứng minh (đối chiếu `docs/KIDO_MARKETING_CLAIMS.md`); cần legal/product duyệt lại các claim như `Chỉ 83.000đ/tháng`, `Tiết kiệm 40%`, `Hoàn tiền trong 7 ngày đầu`, `= Bằng 2 buổi học thêm tại trung tâm`. Lưu ý wording refund/cancel phải đúng cơ chế App Store (huỷ qua Apple, refund do Apple xử lý), không copy nguyên văn từ Google Play.
- [ ] P0 **Sandbox test** trên build cài từ TestFlight với Sandbox Apple ID:
  - load đúng product và giá localized;
  - mua mới thành công;
  - user cancel / pending / interrupted purchase;
  - app bị kill giữa purchase và verify;
  - restore sau reinstall/đổi máy (dùng "Restore Purchases");
  - renew, expire, cancel, grace period / billing retry, refund/revoke;
  - duplicate callback không cấp quyền hai lần.
- [x] P0 **Migrate verify khỏi API deprecated** (2026-09-05): đã bỏ `verifyReceipt`, xác thực JWS StoreKit 2 cục bộ. Xem OpenSpec change `fix-ios-iap-jws-verification`.
- [ ] P0 **App Store Server Notifications V2:** cấu hình endpoint nhận ASSN V2 để đồng bộ lifecycle (renew/expire/refund/grace/revoke) thay vì chỉ tin expiry lưu từ lần verify đầu.
- [ ] P0 Quy trình revoke entitlement khi refund/chargeback/cancel-expired.

**Điểm đã đạt:** client chỉ `finishTransaction` sau khi backend verify; server xác thực chữ ký JWS StoreKit 2 cục bộ với guard revoked/hết hạn/product; `restorePurchases` gọi `syncIOS()` và chọn theo thời hạn thay vì vị trí mảng. Nợ còn lại là **ASSN V2** (đối soát refund/renew/grace) — phase 1 chỉ đọc snapshot lúc mua.

### 2.7 Không để mock/dev behavior lọt archive

- [ ] P0 Không fallback sang `buildMockLesson` khi production API lỗi/trả payload không map được; hiển thị trạng thái retry/content unavailable có kiểm soát.
- [x] P0 Đã loại `DEV_CHILD_ID`/`child_test00001` khỏi runtime source mobile; contract test quét và fail nếu tái xuất hiện.
- [ ] P0 Không để debug menu, dev client, test endpoint, test child hoặc IP dev trong archive; xác nhận không kèm `expo-dev-client`.
- [ ] P0 Store listing chỉ mô tả đúng tính năng/nội dung có thật trong bản submit.

## 3. P1 — Apple Developer, App Store Connect và store listing

### 3.1 Apple Developer Program

- [ ] ASC Enroll/kiểm tra Apple Developer Program; xác định Individual hay Organization và ngày enroll.
- [ ] ASC Nếu Organization: chuẩn bị D-U-N-S number, legal entity name, quyền ký hợp đồng.
- [ ] ASC Hoàn tất Agreements/Tax/Banking (Paid Applications Agreement) để bán subscription.
- [ ] ASC Bật 2FA cho Apple ID; phân quyền App Store Connect theo least privilege (Account Holder / Admin / App Manager).
- [ ] ASC Đăng ký App ID `com.dodokids.app` với capability In-App Purchase.

### 3.2 App record + subscription setup

- [ ] ASC Tạo app record `Dodokids`: primary language `Vietnamese`, bundle `com.dodokids.app`, SKU nội bộ, category `Education`.
- [ ] ASC Tạo Subscription Group + 2 auto-renewable subscription `kido_monthly_139k` / `kido_annual_999k`: giá theo territory, localized name/description, review screenshot, review note cho từng product.
- [ ] ASC Chọn availability/territory phát hành và pricing.
- [ ] ASC Điền App Review Information: parental gate PIN, tài khoản/hướng dẫn demo, cách reviewer tới paywall và nội dung trả phí.
- [ ] ASC Hoàn tất Age Rating questionnaire.
- [ ] ASC Khai App Privacy (nutrition label) từ data inventory §2.4.
- [ ] ASC Điền Privacy Policy URL, EULA/Terms; Support URL và Marketing URL nếu có.

### 3.3 Store listing assets và metadata

- [ ] P1 Tên app + subtitle đúng giới hạn; tránh claim xếp hạng, giá/khuyến mại, keyword spam.
- [ ] P1 Promotional text / description nhất quán app thật; nêu rõ subscription (giá, kỳ, tự gia hạn) và phạm vi miễn phí/trả phí; không cam kết kết quả học tập không chứng minh được.
- [ ] P1 Keywords phù hợp, không nhồi nhét, không trùng tên đối thủ.
- [ ] P1 App icon 1024×1024 PNG, không alpha, không bo góc thủ công.
- [ ] P1 Screenshot **iPhone 6.9"** (và/hoặc 6.5") — tối thiểu theo yêu cầu Apple; khuyến nghị 4–8 ảnh: onboarding, bài học, tiến độ, parent dashboard.
- [ ] P1 Screenshot **iPad 13"** — **bắt buộc** vì `supportsTablet=true`. Layout iPad đã revamp và kiểm trên Simulator (§0.1); **còn nợ** một lượt xoay ngang thật 1376×1032 trước khi chụp, vì Simulator trên máy này không xoay được bằng `simctl`.
- [ ] P1 Support URL/email hoạt động; Privacy URL, EULA đều HTTPS/live.
- [ ] P1 Nội dung listing/ảnh phù hợp trẻ em và khớp Age Rating/Kids answers.

## 4. P1 — Kiểm thử

### 4.1 TestFlight (khuyến nghị; Apple không bắt buộc gate như Google)

- [ ] Upload archive production đầu tiên lên App Store Connect → TestFlight.
- [ ] Xử lý toàn bộ ITMS warning: privacy-manifest, missing compliance, non-public API, deprecated API.
- [ ] Internal testers (tối đa 100, không cần Beta App Review) chạy smoke test trước.
- [ ] Nếu cần external testers: submit **Beta App Review** cho build, phát qua public/link.
- [ ] Cài từ TestFlight (không phải Xcode) và test sandbox IAP đầy đủ theo §2.6.
- [ ] Smoke test trên nhiều iPhone (kể cả máy cấu hình thấp/màn nhỏ) và iPad; iOS gần deployment target và iOS mới nhất.
- [ ] Test clean install, upgrade, uninstall/reinstall, mất mạng, mạng chậm, backend 5xx, token/session hết hạn.
- [ ] Test audio (kể cả silent switch), SVG/image cache, 8 activities/lesson, completion, progress, parent report, subscription gate.
- [ ] Xác minh không crash, blank screen, mock content, HTTP request hoặc debug UI.
- [ ] Lưu evidence: device/iOS, version/build, checklist result, screenshot/video, lỗi còn lại.

### 4.2 App Review và release

- [ ] Submit for Review sau khi metadata + build + App Privacy + Age Rating + review notes hoàn tất.
- [ ] Theo dõi App Review (thường 24–48 giờ); chuẩn bị phản hồi Resolution Center cho các rejection hay gặp: 3.1.2 (subscription disclosure/EULA), 5.1.1 (privacy/data & account deletion), 1.3/5.1.4 (Kids), 2.1 (thiếu demo/parental gate cho reviewer), 4.2 (minimum functionality).
- [ ] Chọn release mode: **Manual release**, **Automatic**, hay **Phased Release (7 ngày)** cho auto-update. Khuyến nghị Manual/Phased để kiểm soát go-live.
- [ ] Chuẩn bị release notes tiếng Việt và kịch bản hotfix (tăng build number, expedited review nếu cần).

## 5. Backend/operations trước khi mở Production

- [ ] Production DB/Redis có backup, restore drill, retention và monitoring.
- [ ] `/health`/readiness check, uptime alert, latency/error-rate dashboard và on-call contact.
- [ ] Endpoint nhận **App Store Server Notifications V2** hoạt động (khi triển khai §2.6) và có alert khi xử lý lỗi.
- [ ] Crash reporting mobile + server alerting phù hợp privacy trẻ em; không gửi PII/receipt token trong event/log.
- [ ] Capacity/load test cho create child, lesson fetch, progress complete và IAP verify.
- [ ] Published content thật đủ cho phạm vi listing; asset/audio URL HTTPS, không hết hạn giữa lesson.
- [ ] Runbook khi lesson/content lỗi, backend down, IAP verify lỗi hoặc StoreKit product không load.
- [ ] Support flow cho purchase/restore/refund/data deletion và SLA trả lời phụ huynh.
- [ ] Chốt người có quyền App Store Connect theo least privilege; 2FA bật.

## 6. Final GO/NO-GO gate

Chỉ **GO** khi tất cả câu dưới đây trả lời `YES`:

- [ ] Tất cả mục P0 đã tick và có evidence.
- [ ] Archive production ký đúng, cài từ TestFlight, dùng HTTPS production, không chứa dev/mock behavior, Info.plist không còn dev-launcher artifact.
- [ ] Security test xác nhận ownership/auth cho dữ liệu child và IAP trên build iOS.
- [ ] Privacy Policy, EULA, App Privacy nutrition label, Age Rating, Kids compliance và privacy manifest khớp app thật.
- [ ] Sandbox IAP test đã qua purchase/restore/renew/expire/refund; verify không còn phụ thuộc API legacy khi lên subscription (hoặc có kế hoạch migration được chấp nhận), ASSN V2 hoạt động.
- [ ] In-app + web account/data deletion hoạt động và khớp Privacy Policy.
- [ ] TestFlight smoke test sạch; không crash/ANR trên iPhone + iPad.
- [ ] Backend/content/support/monitoring sẵn sàng và có rollback/hotfix owner.
- [ ] Người chịu trách nhiệm release ghi `GO`, version/build, release mode, thời điểm và link evidence bên dưới.

### Release record

| Trường | Giá trị |
|---|---|
| Release owner | |
| Apple Developer account type / enroll date | |
| Team ID / ASC App ID | |
| Version / build number | |
| Archive / build URL | |
| TestFlight build link | |
| Sandbox IAP test evidence | |
| App Privacy / Age Rating evidence | |
| Account/data deletion evidence | |
| Security test evidence | |
| App Review submission / result | |
| Release mode (manual/phased) | |
| Rollback/hotfix plan | |
| Final decision | `NO-GO` |

## 7. Thứ tự xử lý đề xuất

1. **Apple Developer**: enroll, D-U-N-S (nếu org), Paid Applications Agreement, 2FA, App ID.
2. **App Store Connect record + subscription**: app record, Subscription Group, 2 product, pricing/territory.
3. **EAS iOS + build**: thêm cấu hình `ios` build/submit, export compliance, credentials, build archive, đẩy TestFlight.
4. **Content/App Privacy**: nutrition label, Age Rating, Kids compliance, review notes, screenshots iPhone + iPad, EULA/Privacy.
5. **P0 song song**: HTTPS/ATS + `APPLE_BUNDLE_ID`/`APPLE_APP_APPLE_ID`, in-app deletion + backend, privacy manifest rà soát, ASSN V2, sandbox license test, operations.
6. **Submit + release**: App Review, xử lý feedback, phased/manual release, theo dõi crash/entitlement.

## 8. Nguồn Apple chính thức dùng để đối chiếu

- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Guideline 1.3 — Kids Category](https://developer.apple.com/app-store/review/guidelines/#kids-category)
- [Guideline 3.1.2 — Auto-renewable subscriptions](https://developer.apple.com/app-store/review/guidelines/#subscriptions)
- [Guideline 5.1.1 — Privacy, data collection & account deletion](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage)
- [Auto-renewable subscription requirements & disclosures](https://developer.apple.com/app-store/subscriptions/)
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [App Store Server Notifications V2](https://developer.apple.com/documentation/appstoreservernotifications)
- [App Store Server Library (Node)](https://github.com/apple/app-store-server-library-node)
- [Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
- [App privacy details on the App Store](https://developer.apple.com/app-store/app-privacy-details/)
- [Offering account deletion within your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- [Complying with encryption export regulations](https://developer.apple.com/documentation/security/complying_with_encryption_export_regulations)
- [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/)
- [TestFlight](https://developer.apple.com/testflight/)
- [Expo — iOS app submission & EAS Submit](https://docs.expo.dev/submit/ios/)
- [Expo — App Store Connect & credentials](https://docs.expo.dev/app-signing/app-credentials/)
