# Google Play Go-Live Checklist — Kido Android

> Ngày rà soát: 2026-07-28  
> Phạm vi: `mobile/`, các API runtime liên quan trong `kido-server/`, và các yêu cầu cần hoàn tất trên Google Play Console.  
> Kết luận hiện tại: **NO-GO**. Chưa được đưa lên Production cho đến khi toàn bộ mục `P0` đạt.

## Cách dùng checklist

- `[x]`: đã xác minh từ source hoặc artifact hiện có trong repo.
- `[ ] P0`: chặn upload/review hoặc có rủi ro bảo mật, dữ liệu trẻ em, doanh thu.
- `[ ] P1`: phải hoàn tất trước khi bấm gửi Production.
- `[ ] CONSOLE`: chỉ xác minh được khi vào Google Play Console.
- Mỗi mục chỉ được tick khi có bằng chứng đi kèm: link Console, ảnh chụp, log test, artifact hoặc commit.

## 1. Snapshot hiện trạng

| Hạng mục | Trạng thái | Bằng chứng hiện tại |
|---|---|---|
| Android package | PASS | `com.kido.app` nhất quán trong Expo config và Gradle. |
| Version | CHƯA CHỐT | `versionName=1.0.0`, `versionCode=1`; chưa có quy trình tăng version cho release. |
| Target SDK | PASS | Release manifest hiện có dùng `targetSdkVersion=36`, đáp ứng mốc Google Play từ 31/08/2026. |
| Play Billing Library | PASS | Artifact release hiện có dùng Billing Library `8.3.0`. |
| IAP client/server cơ bản | PARTIAL | Có mua, verify server-side, `finishTransaction`, restore; chưa chứng minh bằng license test trên Play. |
| Production signing | **BLOCKER** | `release` đang ký bằng `signingConfigs.debug`. |
| AAB Production | **BLOCKER** | Chỉ thấy APK; chưa có `.aab` production và upload key. |
| Production API/TLS | **BLOCKER** | Script hiện trỏ tới `http://136.115.68.173:3001`; release manifest không cho phép cleartext và dữ liệu trẻ em không được gửi qua HTTP. |
| API authentication/authorization | PASS (LOCAL) | Đã có anonymous household session, bearer theo thiết bị, ownership `{ householdId, childId }` trên child/lesson/progress/parent/IAP và focused security tests. Chưa xác minh trên production deployment. |
| Privacy/Terms | **BLOCKER** | App trỏ tới `https://kido.app/privacy` và `/terms`, nhưng không có page tương ứng trong `landing/` và chưa xác minh được URL live. |
| Data deletion | **BLOCKER/POLICY** | Chưa có luồng xoá hồ sơ/dữ liệu trẻ trong app hoặc web request. Cần chốt cách khai báo Data safety ngay cả khi Kido chưa có tài khoản đăng nhập chuẩn. |
| Android permissions | **BLOCKER** | Release manifest còn `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, legacy storage và foreground service; source chỉ phát audio, chưa thấy chức năng ghi âm. |
| Child/Families policy | **BLOCKER/PARTIAL** | Parental gate/PIN đã có; vẫn thiếu bộ khai báo Play Console và hồ sơ privacy dành cho trẻ em. |
| Store listing assets | CHƯA CÓ | Có source icon 1024×1024; chưa thấy Play icon 512×512, feature graphic 1024×500 hoặc bộ screenshot. |
| Play Console setup | CHƯA XÁC MINH | Không có quyền truy cập Console trong lần rà soát này. |

## 2. P0 — Blocker phải xử lý trước khi upload Internal testing

### 2.1 Production signing và artifact

- [ ] P0 Tạo upload keystore riêng cho Kido; lưu trong secret manager/CI, không commit keystore hoặc password.
- [ ] P0 Thay `release.signingConfig signingConfigs.debug` bằng production upload signing.
- [ ] P0 Bật Play App Signing trên Console và lưu an toàn upload certificate SHA-256.
- [ ] P0 Build Android App Bundle bằng production config, ví dụ `mobile/android/gradlew.bat :app:bundleRelease`.
- [ ] P0 Xác minh `.aab` có package `com.kido.app`, version code đúng, không debuggable và không chứa dev client/debug menu.
- [ ] P0 Quyết định nguồn cấu hình duy nhất cho version/package giữa `app.json` và native Gradle để tránh lệch khi prebuild.
- [ ] P0 Xác nhận ABI hỗ trợ. Hiện `reactNativeArchitectures=arm64-v8a`; quyết định có cần `armeabi-v7a`/`x86_64` theo device catalog hay không.

**Exit criteria:** có AAB production ký bằng upload key, cài được qua Play Internal testing và Play Console không báo lỗi signing/package/version.

### 2.2 Production API, HTTPS và secret

- [ ] P0 Cấp domain production cố định cho `kido-server`, dùng HTTPS/TLS hợp lệ; không dùng IP thô hoặc HTTP.
- [ ] P0 Tạo production build profile với `KIDO_API_URL=https://...`; build phải fail sớm nếu thiếu production URL, không fallback `localhost`.
- [ ] P0 Xoá các script go-live đang dùng `http://136.115.68.173:3001` khỏi đường phát hành production.
- [ ] P0 Xoá log tạm `[API] baseURL` và log request/IP toàn cục trước Production, hoặc thay bằng logging có redaction/retention rõ ràng.
- [ ] P0 Giữ cleartext bị tắt ở release; chỉ cho phép HTTP ở debug manifest nếu thực sự cần.
- [ ] P0 Cấu hình CORS theo domain/client cần thiết; không dùng `enableCors()` mở toàn bộ trong production.
- [ ] P0 Xác minh secret production: Mongo/Redis, `GOOGLE_PLAY_KEY`, `GOOGLE_PLAY_PACKAGE_NAME`, publish/admin secret; không để trong app bundle hoặc source.

**Exit criteria:** AAB từ Play gọi đúng HTTPS production, tạo child/tải bài/ghi progress/IAP verify thành công; không có request HTTP hoặc localhost.

### 2.3 Authentication, authorization và chống abuse

- [x] P0 Có anonymous household session bằng app-scoped `deviceId` + secret ngẫu nhiên lưu trong SecureStore; `childId` không còn là secret/quyền sở hữu.
- [x] P0 Mọi API đọc/sửa hồ sơ, progress, parent report và entitlement kiểm tra ownership bằng cả `householdId` từ bearer và `childId`.
- [ ] P0 Bảo vệ các endpoint vận hành như `run-weekly-reports`, publish/admin và các action nội bộ bằng auth/role hoặc network boundary.
- [x] P0 IAP token đã được hash và bind duy nhất vào một household; token thuộc household khác bị trả `409`.
- [ ] P0 Thêm rate limit, request size limit, security headers và audit log đã redaction cho endpoint nhạy cảm.
- [x] P0 Focused test xác nhận lookup entitlement/IAP luôn có `householdId`; `childId` ngoài household trả `404`.

**Evidence anonymous session — 2026-07-28:**

- [x] Server lưu hash của device secret, PIN, recovery code và purchase token; không lấy Android ID/IMEI/MAC/Advertising ID làm danh tính.
- [x] Đăng ký thiết bị idempotent; secret sai hoặc thiết bị revoked bị từ chối.
- [x] Parent PIN được verify ở server, khóa sau 5 lần sai; app tự khóa lại sau 5 phút hoặc ngay khi background.
- [x] Recovery yêu cầu recovery code + PIN và gắn thiết bị mới vào đúng household.
- [x] `run-weekly-reports` đã có internal-job guard; publish/admin boundary vẫn cần audit riêng trước khi tick mục tổng ở trên.
- [x] Focused server suites: `25/25` test pass; server build pass.
- [x] Mobile anonymous-session contract test, TypeScript check và targeted ESLint đều pass.
- [ ] Full server suite còn `2/213` test Explore fail ngoài change (`explore.architecture.spec.ts`, `explore.number-bond-arithmetic.spec.ts`); cần xử lý trước Final GO.
- [ ] Chưa có evidence runtime trên thiết bị/AAB từ Play cho clean install, reinstall, recovery, revoke và IAP license test.

**Exit criteria:** security test chứng minh client A không thể đọc/sửa child B, không thể tự mở entitlement và không thể gọi endpoint admin.

### 2.4 Quyền riêng tư và dữ liệu trẻ em

- [ ] P0 Public trang Privacy Policy tại URL HTTPS ổn định, truy cập không cần đăng nhập, đồng thời link trong app và Play listing.
- [ ] P0 Public Terms of Use/Subscription Terms tại URL HTTPS ổn định.
- [ ] P0 Privacy Policy phải ghi rõ tối thiểu: pháp nhân/developer, liên hệ, dữ liệu trẻ/phụ huynh thu thập, mục đích, third-party SDK, lưu trữ, bảo mật, retention, xoá dữ liệu, quyền của phụ huynh và phạm vi quốc gia.
- [ ] P0 Chốt cơ chế parental notice/consent phù hợp cho dữ liệu trẻ 4–6 tuổi trước khi tạo hồ sơ server-side.
- [ ] P0 Tạo luồng in-app xoá hồ sơ/dữ liệu trẻ hoặc đường dẫn rõ ràng tới form yêu cầu xoá; có web URL dùng được sau khi đã gỡ app.
- [ ] P0 Backend xoá/anonymize đầy đủ child profile, progress, activity results và entitlement data theo policy retention; giao dịch phải giữ lại vì nghĩa vụ pháp lý thì cần nêu rõ.
- [ ] P0 Lập data inventory thực tế từ app, SDK và server logs trước khi điền Data safety. Ít nhất cần đánh giá:
  - tên, tuổi và avatar của trẻ;
  - lesson/activity progress, XP, streak, report và offline tasks;
  - purchase product, token, entitlement và expiry;
  - IP/request logs và mọi device identifier do SDK thu thập;
  - email nếu tính năng báo cáo tuần sau này thực sự thu thập email.
- [ ] P0 Chỉ khai “data encrypted in transit” sau khi toàn bộ luồng production đã dùng HTTPS.

**Lưu ý account deletion:** Google yêu cầu in-app path và web deletion URL nếu app cho tạo app account. Kido hiện tạo child profile nhưng chưa có auth account hoàn chỉnh; vẫn phải trả lời phần Data deletion trong Data safety. Hướng an toàn là cung cấp xoá hồ sơ/dữ liệu dù Console có phân loại child profile là account hay không.

### 2.5 Android permission và SDK inventory

- [ ] P0 Loại `RECORD_AUDIO` nếu Kido chỉ phát audio. Nếu sau này ghi âm, phải có disclosure, runtime request đúng ngữ cảnh và cập nhật Data safety/privacy.
- [ ] P0 Loại `SYSTEM_ALERT_WINDOW` khỏi release; kiểm tra nguyên nhân từ dev client/debug tooling.
- [ ] P0 Đánh giá và loại `READ_EXTERNAL_STORAGE`/`WRITE_EXTERNAL_STORAGE` nếu không cần; không giữ permission chỉ vì dependency.
- [ ] P0 Chỉ giữ foreground media playback service nếu có use case phát nền rõ ràng và phù hợp hành vi app trẻ em.
- [ ] P0 Export merged manifest từ AAB cuối, lập danh sách toàn bộ permission, service, provider và SDK.
- [ ] P0 Xác nhận không có Ads SDK/analytics/identifier SDK ngoài khai báo. Nếu không có quảng cáo, chọn chính xác “No ads” trên Console.

**Exit criteria:** Play Console App content và Data safety khớp 100% với merged manifest/SDK thực tế; không còn quyền không dùng.

### 2.6 Paywall và subscription policy

- [x] P0 Purchase và restore đều yêu cầu anonymous household session sẵn sàng và parent PIN đã unlock trước khi mở purchase sheet.
- [ ] P0 Paywall hiển thị rõ giá localized, kỳ thanh toán, tự động gia hạn, cách huỷ, Terms và Privacy trước CTA.
- [ ] P0 Không dùng claim hardcode chưa được chứng minh. Hiện cần legal/product duyệt lại:
  - `Chỉ 83.000đ/tháng`;
  - `Tiết kiệm 40%`;
  - `Hoàn tiền trong 7 ngày đầu`;
  - `= Bằng 2 buổi học thêm tại trung tâm`.
- [ ] P0 Product IDs trên Console phải khớp source: `kido_monthly_139k`, `kido_annual_999k`.
- [ ] P0 Tạo và activate base plan/offer cho từng subscription, khai báo giá và quốc gia phát hành.
- [ ] P0 Link Google Play Developer API/service account với đúng app; production env có `GOOGLE_PLAY_KEY` và `GOOGLE_PLAY_PACKAGE_NAME=com.kido.app`.
- [ ] P0 Test bằng license tester trên build cài từ Play:
  - load đúng product và giá;
  - mua mới thành công;
  - user cancel/pending/payment fail;
  - app bị kill giữa purchase và verify;
  - restore sau reinstall/đổi máy;
  - renew, expire, cancel, grace period, refund/revoke;
  - duplicate callback không cấp quyền hai lần.
- [ ] P0 Đồng bộ lifecycle subscription ở backend bằng RTDN/Google Play Developer API hoặc cơ chế tương đương; không chỉ tin expiry đã lưu từ lần mua đầu.
- [ ] P0 Có quy trình revoke entitlement khi refund/chargeback/cancel-expired.

**Điểm đã đạt:** client chỉ `finishTransaction` sau khi backend verify; backend verify với Google; release artifact dùng Billing Library 8.3.0. API `purchases.subscriptions.get` đang bị Google deprecate nhưng chưa shutdown cho tới 2028; nên lên backlog migrate sang `subscriptionsv2` sau khi ổn định go-live.

### 2.7 Không để mock/dev behavior lọt Production

- [ ] P0 Không fallback sang `buildMockLesson` khi production API lỗi hoặc trả payload không map được; hiển thị trạng thái retry/content unavailable có kiểm soát.
- [x] P0 Đã loại `DEV_CHILD_ID`/`child_test00001` khỏi toàn bộ runtime source mobile; contract test quét và fail nếu xuất hiện lại.
- [ ] P0 Không để debug menu, dev client, test endpoint, test child hoặc IP dev trong AAB.
- [ ] P0 Store listing chỉ mô tả đúng tính năng/content có thật trong bản submit.

## 3. P1 — Google Play Console và store listing

### 3.1 Developer account

- [ ] CONSOLE Xác minh account là Personal hay Organization và ngày tạo account.
- [ ] CONSOLE Hoàn tất identity/contact verification; nếu là Organization, chuẩn bị D-U-N-S, giấy tờ pháp nhân và website đã verify khi Console yêu cầu.
- [ ] CONSOLE Hoàn tất merchant/payments profile để bán subscription.
- [ ] CONSOLE Kiểm tra package `com.kido.app` chưa bị chiếm và chấp nhận Play App Signing.
- [ ] CONSOLE Theo dõi yêu cầu Android developer verification trước đợt enforcement bắt đầu từ 09/2026.

### 3.2 App setup

- [ ] CONSOLE Tạo app `Kido`, default language `Vietnamese (vi-VN)`, loại `App`, giá app `Free` và có in-app purchases.
- [ ] CONSOLE Chọn category phù hợp, dự kiến `Education`.
- [ ] CONSOLE Khai báo target audience chính xác cho trẻ 4–6: đánh giá cả bucket `Ages 5 and under` và `Ages 6–8`; tuân thủ Families Policy.
- [ ] CONSOLE Hoàn tất IARC content rating questionnaire.
- [ ] CONSOLE Khai Ads = No nếu AAB cuối không có ads.
- [ ] CONSOLE Điền App access/reviewer instructions. Nếu có parent gate/paywall, cung cấp PIN/test path và hướng dẫn review đầy đủ.
- [ ] CONSOLE Hoàn tất Data safety và Data deletion URL từ data inventory thực tế.
- [ ] CONSOLE Khai Financial features/Health/News/Government/Other declarations theo Dashboard; mục không áp dụng cũng phải trả lời.
- [ ] CONSOLE Chọn quốc gia phát hành, giá subscription, thuế và chính sách refund/support.

### 3.3 Store listing assets và metadata

- [ ] P1 Tên app tối đa theo giới hạn Console; tránh claim xếp hạng, giá/khuyến mại và keyword spam.
- [ ] P1 Short description tối đa 80 ký tự; mô tả đúng giá trị giáo dục, không cam kết kết quả học tập không chứng minh được.
- [ ] P1 Full description nhất quán với app thật, nêu rõ subscription và phạm vi nội dung miễn phí/trả phí.
- [ ] P1 Play icon PNG 512×512, tối đa 1 MB.
- [ ] P1 Feature graphic PNG/JPEG 1024×500, không alpha.
- [ ] P1 Tối thiểu 2 screenshot phone hợp lệ; khuyến nghị 4–8 screenshot thể hiện onboarding, bài học, tiến độ và parent dashboard.
- [ ] P1 Vì app hỗ trợ tablet, chuẩn bị screenshot tablet 7-inch/10-inch và test layout thực tế.
- [ ] P1 Support email hoạt động; website, Privacy URL và Terms URL đều HTTPS/live.
- [ ] P1 Nội dung listing/ảnh phù hợp trẻ em và khớp target audience/Families answers.

## 4. P1 — Kiểm thử theo track

### 4.1 Internal testing

- [ ] Upload AAB production đầu tiên lên Internal testing.
- [ ] Xử lý toàn bộ pre-review check, SDK warning, target API, permission và policy warning.
- [ ] Cài đúng build từ Play bằng link tester; không sideload artifact local để nghiệm thu IAP.
- [ ] Chạy smoke test trên ít nhất Android API 24, 28, 34 và 36; phone RAM thấp và tablet.
- [ ] Test clean install, upgrade, uninstall/reinstall, mất mạng, mạng chậm, backend 5xx và token/session hết hạn.
- [ ] Test audio, SVG/image cache, 8 activities/lesson, completion, progress, parent report và subscription gate.
- [ ] Xác minh không có crash/ANR, blank screen, mock content, HTTP request hoặc debug UI.
- [ ] Lưu test evidence: device/OS, versionCode, checklist result, screenshot/video và lỗi còn lại.

### 4.2 Closed testing và production access

- [ ] CONSOLE Nếu là Personal account tạo sau 13/11/2023: chạy Closed test với ít nhất **12 tester opt-in liên tục 14 ngày**.
- [ ] Tester phải cài và sử dụng bản test thật; thu thập feedback và ghi rõ các lỗi đã sửa.
- [ ] Sau khi đủ điều kiện, nộp Production access questionnaire bằng dữ liệu test thật.
- [ ] Với Organization hoặc Personal account cũ không bị rule trên, vẫn nên chạy Closed test trước production.

### 4.3 Pre-launch report và staged rollout

- [ ] Chạy Pre-launch report; xử lý crash, ANR, accessibility, security và device compatibility issue.
- [ ] Đảm bảo Android vitals có owner theo dõi và ngưỡng rollback.
- [ ] Release Production theo staged rollout: đề xuất `5% → 20% → 50% → 100%`, chỉ tăng khi vitals/IAP/backend ổn định.
- [ ] Bật Managed publishing nếu cần kiểm soát chính xác thời điểm go-live.
- [ ] Chuẩn bị release notes tiếng Việt và kịch bản rollback/hotfix với versionCode mới.

## 5. Backend/operations trước khi mở Production

- [ ] Production DB/Redis có backup, restore drill, retention và monitoring.
- [ ] Có `/health`/readiness check, uptime alert, latency/error-rate dashboard và on-call contact.
- [ ] Có crash reporting mobile và server alerting phù hợp privacy trẻ em; không gửi PII/purchase token trong event/log.
- [ ] Có capacity/load test cho create child, lesson fetch, progress complete và IAP verify.
- [ ] Published content thật đủ cho phạm vi listing; asset/audio URL HTTPS, không hết hạn giữa lesson.
- [ ] Có runbook khi lesson/content lỗi, backend down, IAP verify lỗi hoặc Play product không load.
- [ ] Có support flow cho purchase/restore/refund/data deletion và SLA trả lời phụ huynh.
- [ ] Chốt người có quyền Play Console theo least privilege; bật 2-step verification.

## 6. Final GO/NO-GO gate

Chỉ **GO** khi tất cả câu dưới đây trả lời `YES`:

- [ ] Tất cả mục P0 đã tick và có evidence.
- [ ] AAB production được ký đúng, cài từ Play, dùng HTTPS production và không chứa dev/mock behavior.
- [ ] Security test xác nhận ownership/auth cho dữ liệu child và IAP.
- [ ] Privacy, Terms, Data safety, Target audience/Families và permission declaration khớp app thật.
- [ ] IAP license test đã qua các case purchase/restore/renew/expire/refund.
- [ ] Closed/Internal testing và Production access requirement đã hoàn tất.
- [ ] Pre-launch report không còn blocker; crash/ANR/vitals đạt ngưỡng đã chốt.
- [ ] Backend/content/support/monitoring sẵn sàng và có rollback owner.
- [ ] Người chịu trách nhiệm release ghi `GO`, versionCode, rollout %, thời điểm và link evidence bên dưới.

### Release record

| Trường | Giá trị |
|---|---|
| Release owner | |
| Version name / code | |
| AAB SHA-256 | |
| Internal/Closed track link | |
| Production release link | |
| Privacy/Data safety evidence | |
| IAP test evidence | |
| Security test evidence | |
| Rollout start | |
| Rollback threshold | |
| Final decision | `NO-GO` |

## 7. Thứ tự xử lý đề xuất

1. **Security + HTTPS + production identity**: auth/ownership, TLS, secret, CORS/rate limit.
2. **Privacy/Families + deletion**: public legal pages, parental consent, data inventory, permission cleanup.
3. **Production build**: upload key, bỏ dev client/mock/dev IDs, tạo AAB và versioning.
4. **IAP production readiness**: Console products/base plans, paywall disclosure, parental gate, RTDN và license test.
5. **Store/Console setup**: Data safety, target audience, content rating, listing assets.
6. **Internal → Closed → Production access**: test thật từ Play, pre-launch report, staged rollout.

## 8. Nguồn Google chính thức dùng để đối chiếu

- [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-GB_ALL)
- [Play Billing Library deprecation timeline](https://developer.android.com/google/play/billing/deprecation-faq)
- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Google Play Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)
- [Target audience and app content](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en)
- [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)
- [Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-EN)
- [Create and set up an app / Android App Bundle](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)
- [Store listing preview asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
