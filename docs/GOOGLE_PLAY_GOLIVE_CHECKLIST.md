# Google Play Go-Live Checklist — Dodokids Android

> Ngày rà soát gốc: 2026-07-28 · Cập nhật: 2026-08-31
> Phạm vi: `mobile/`, các API runtime liên quan trong `kido-server/`, `landing/`, và các yêu cầu cần hoàn tất trên Google Play Console.
> Kết luận hiện tại: **NO-GO**. Chưa được đưa lên Production cho đến khi toàn bộ mục `P0` đạt.
> Mục tiêu trước mắt: **hoàn tất account/app setup, đưa AAB đầu tiên lên Internal, rồi phát hành Closed test sớm nhất**. Production đang bị khóa bởi gate Closed testing.

## 0. Cập nhật 2026-08-31 — Critical path (đè lên Section 1 khi khác biệt)

> Đây là snapshot mới nhất theo xác nhận của release owner, hiện trạng repo và tài liệu Google chính thức. Khi mâu thuẫn với phần rà soát cũ, lấy Section 0 làm chuẩn.

### 0.1 Xác nhận mới từ Play Console

- [x] **Đã tạo tài khoản Google Play Developer.**
- [x] **Play Console đã báo tài khoản phải qua Closed testing trước khi xin Production.** Vì vậy checklist này coi gate Closed test là **bắt buộc**, không còn để ở dạng điều kiện.
- **Trạng thái upload:** chưa upload app/AAB lên Play Console. Chưa được tick app creation, signing, Internal release, Closed release hay tester count cho đến khi có evidence trên Console.

> **Lưu ý:** yêu cầu Closed testing không chặn lần upload đầu. Cần tạo app, upload AAB lên test track và publish Closed release thì tester mới opt-in được; gate này chỉ chặn quyền phát hành Production.

### 0.2 Đã sẵn sàng trong repo

- [x] **Package name:** `com.dodokids.app`; app name `Dodokids`; EAS project đã link bằng `projectId` trong `mobile/app.json`.
- [x] **Đường build:** `mobile/eas.json` đã có profile `production` tạo Android App Bundle, `autoIncrement: true`, `appVersionSource: remote`; submit profile trỏ tới track `internal`.
- [x] **Production API config:** profile `preview`/`production` dùng `https://api.dodokids.vn`; `/health` trả HTTP 200 ngày 2026-08-31. AAB cài từ Play vẫn phải được test runtime trước khi tick Final GO.
- [x] **Legal technical delivery:** `/privacy`, `/terms`, `/data-deletion` đều có source, trả HTTP 200 công khai ngày 2026-08-31; mobile Settings trỏ đúng `dodokids.vn` và `support@dodokids.vn`.

### 0.3 Còn chặn — làm theo đúng thứ tự này

**Bước 1 — Hoàn tất Developer account trước khi upload.**
- [ ] CONSOLE Ghi evidence loại tài khoản `Personal`/`Organization` và ngày tạo. Console đã yêu cầu Closed test nên không thay đổi account type chỉ để né gate; nếu Dodokids thuộc pháp nhân, rà đúng loại account theo chủ thể sở hữu.
- [ ] CONSOLE Hoàn tất identity/contact verification và 2-step verification.
- [ ] CONSOLE Hoàn tất **device verification** nếu Dashboard yêu cầu: owner đăng nhập app Play Console trên thiết bị Android vật lý, không root, Android 10 trở lên.
- [ ] CONSOLE Hoàn tất merchant/payments profile để bán subscription.

**Bước 2 — Tạo/kiểm tra app record và AAB đầu tiên.**
- [ ] CONSOLE Tạo hoặc xác minh app `Dodokids`, package `com.dodokids.app`, default language `vi-VN`, App/Free + in-app purchases; bật Play App Signing.
- [ ] CONSOLE Xác nhận `com.dodokids.app` đã được đăng ký trong Android developer verification trước mốc 2026-09-30.
- [ ] P0 Chạy `cd mobile && eas build --platform android --profile production`; tạo/kiểm tra EAS Android credentials và lưu upload key/certificate an toàn, không commit secret.
- [ ] P0 Ghi lại `versionName`, remote `versionCode`, build URL và SHA-256 của AAB đầu tiên.
- [ ] P0 Xác minh AAB: đúng package/version, target API 36+, production-signed, không debuggable, không dev client/debug menu, merged manifest/SDK/permission đúng khai báo.

**Bước 3 — Upload Internal và hoàn tất app setup song song.**
- [ ] Upload AAB lên **Internal testing**, xử lý hết pre-review warning; cài lại bằng link Play và chạy smoke/IAP test, không nghiệm thu bằng APK sideload.
- [ ] CONSOLE Hoàn tất Dashboard/App content bắt buộc để mở Closed testing: Privacy URL, Data safety, Data deletion, Target audience 4–6/Families, Ads, App access, IARC và các declaration áp dụng.
- [ ] P0 Legal/product sign-off nội dung ba trang pháp lý. Hiện Privacy nói thao tác xoá dữ liệu có trong app sau PIN, nhưng source mobile chưa có luồng/link xoá dữ liệu; phải triển khai hoặc sửa policy cho đúng hành vi thật.

**Bước 4 — Closed test bắt buộc (đường găng tối thiểu 14 ngày).**
- [ ] Chuẩn bị **15–20 người lớn/phụ huynh** để có buffer; mức bắt buộc của Google vẫn là tối thiểu **12 tester**. Tạo email list/Google Group, opt-in link, feedback channel và test script các flow chính.
- [ ] CONSOLE Publish Closed release. Mỗi tester phải nằm trong tester list **và tự opt-in**; chỉ thêm email chưa được tính. Tester đang ở Internal cần opt-out Internal trước khi nhận Closed.
- [ ] CONSOLE Duy trì ít nhất **12 tester actively opted-in liên tục đủ 14 ngày** ngay trước lúc Apply for production. Tester opt-out rồi vào lại sẽ reset chuỗi ngày của chính họ.
- [ ] Lưu evidence: roster, thời điểm opt-in, device/OS/version, phiên test, feedback, lỗi và thay đổi đã thực hiện. Google không bắt mở app mỗi ngày, nhưng sẽ đánh giá engagement thật khi xét Production access.
- [ ] Sau khi đủ điều kiện, vào Dashboard **Apply for production**, trả lời questionnaire về closed test/app/readiness. Không coi đủ 12×14 là tự động được mở Production; review thường trong 7 ngày nhưng có thể lâu hơn hoặc bị yêu cầu test tiếp.

**Bước 5 — Các P0 còn lại trước Production.**
- [ ] IAP: tạo/activate 2 subscription, service account/API credentials, RTDN/lifecycle, paywall disclosure và license test đầy đủ (§2.6).
- [ ] Permission/SDK/Data safety: kiểm theo AAB thật; loại quyền thừa, xác nhận No ads và declarations khớp 100% (§2.4–§2.5).
- [ ] Store assets + listing; pre-launch report; backend/monitoring/support/rollback; staged rollout `5% → 20% → 50% → 100%` (§3–§5).

### 0.4 Việc có thể bắt đầu ngay

1. Hoàn tất identity/contact/device verification và chụp evidence account type/ngày tạo.
2. Tạo/kiểm tra app record `Dodokids` + package registration + Play App Signing.
3. Chạy EAS production build đầu tiên, upload Internal và sửa toàn bộ warning.
4. Tuyển tester ngay trong lúc hoàn tất app setup; đồng hồ 14 ngày chỉ bắt đầu khi Closed release đã publish và từng tester đã opt-in.

---

## Cách dùng checklist

- `[x]`: đã xác minh từ source hoặc artifact hiện có trong repo.
- `[ ] P0`: chặn upload/review hoặc có rủi ro bảo mật, dữ liệu trẻ em, doanh thu.
- `[ ] P1`: phải hoàn tất trước khi bấm gửi Production.
- `[ ] CONSOLE`: chỉ xác minh được khi vào Google Play Console.
- Mỗi mục chỉ được tick khi có bằng chứng đi kèm: link Console, ảnh chụp, log test, artifact hoặc commit.

## 1. Snapshot hiện trạng

| Hạng mục | Trạng thái | Bằng chứng hiện tại |
|---|---|---|
| Android package | PASS | `com.dodokids.app` (chốt 2026-08-14) trong Expo config; native sinh lại từ `app.json` khi prebuild. |
| Version | PARTIAL | `versionName=1.0.0`; EAS dùng remote app version + auto-increment. Chưa có build đầu tiên để ghi nhận `versionCode`. |
| Target SDK | PASS / VERIFY FINAL AAB | Expo prebuild audit ngày 31/08/2026 dùng `targetSdkVersion=36`, đáp ứng yêu cầu hiện hành; phải kiểm lại AAB submit cuối. |
| Play Billing Library | PASS / VERIFY FINAL AAB | Expo prebuild đã resolve Billing Library `8.3.0`, hiện còn được Play hỗ trợ; kiểm lại metadata trong AAB cuối. |
| IAP client/server cơ bản | PARTIAL | Có mua, verify server-side, `finishTransaction`, restore; chưa chứng minh bằng license test trên Play. |
| Production signing | **BLOCKER** | EAS production profile đã có nhưng chưa có evidence Android credentials/upload certificate hoặc Play App Signing. |
| AAB Production | **BLOCKER** | EAS đã cấu hình `app-bundle`; repo không có `.aab` và release owner xác nhận chưa upload app. |
| Production API/TLS | PASS (CONFIG) / RUNTIME PENDING | EAS production trỏ `https://api.dodokids.vn`, release tự tắt cleartext; `/health` trả 200 ngày 31/08/2026. Chưa test AAB cài từ Play. |
| API authentication/authorization | PASS (LOCAL) | Đã có anonymous household session, bearer theo thiết bị, ownership `{ householdId, childId }` trên child/lesson/progress/parent/IAP và focused security tests. Chưa xác minh trên production deployment. |
| Privacy/Terms | PASS (TECHNICAL) / LEGAL REVIEW | Source + mobile links đúng `dodokids.vn`; cả hai URL trả 200 công khai ngày 31/08/2026. Cần legal/product sign-off và đối chiếu nội dung với app thật. |
| Data deletion | **PARTIAL/POLICY** | Web request URL trả 200, nhưng chưa có in-app path/backend deletion evidence; Privacy hiện mô tả in-app delete chưa khớp source. |
| Android permissions | **BLOCKER / AAB NEEDED** | Expo prebuild còn `SYSTEM_ALERT_WINDOW` và legacy storage (`maxSdkVersion=32`); phải xử lý/giải trình và kiểm merged manifest của AAB cuối. |
| Child/Families policy | **BLOCKER/PARTIAL** | Parental gate/PIN đã có; vẫn thiếu bộ khai báo Play Console và hồ sơ privacy dành cho trẻ em. |
| Store listing assets | CHƯA CÓ | Có source icon 1024×1024; chưa thấy Play icon 512×512, feature graphic 1024×500 hoặc bộ screenshot. |
| Play Console setup | PARTIAL | Developer account đã tạo; chưa upload app. Console đã xác nhận Closed testing là gate bắt buộc; các mục account/app setup khác chưa có evidence. |

## 2. P0 — Blocker phải xử lý trước Production

### 2.1 Production signing và artifact

- [x] P0 Có EAS project và `production` profile tạo `app-bundle`; `appVersionSource=remote`, `autoIncrement=true`.
- [ ] P0 Tạo/kiểm tra Android credentials/upload key do EAS quản lý; lưu certificate/evidence an toàn và không commit secret.
- [ ] P0 Bật Play App Signing trên Console và lưu an toàn upload certificate SHA-256.
- [ ] P0 Build Android App Bundle bằng `cd mobile && eas build --platform android --profile production`.
- [ ] P0 Xác minh `.aab` có package `com.dodokids.app`, version code đúng, không debuggable và không chứa dev client/debug menu.
- [x] P0 Nguồn package/version đã chọn: package + `versionName` trong Expo config; `versionCode` do EAS remote auto-increment. Ghi lại giá trị thực sau mỗi build.
- [ ] P0 Kiểm tra ABI/device compatibility bằng App Bundle Explorer và Pre-launch report thay vì dựa vào native directory local.

**Exit criteria:** có AAB production ký bằng upload key, cài được qua Play Internal testing và Play Console không báo lỗi signing/package/version.

### 2.2 Production API, HTTPS và secret

- [x] P0 Có domain production `https://api.dodokids.vn`; `/health` trả 200 ngày 31/08/2026.
- [x] P0 EAS `preview`/`production` đặt `KIDO_API_URL=https://api.dodokids.vn`; non-dev fallback trong source cũng là HTTPS.
- [x] P0 Các URL HTTP/IP chỉ nằm trong script dev/emulator, không nằm trong EAS production profile.
- [x] P0 Mobile không còn log tạm `[API] baseURL` trong runtime source.
- [x] P0 Với production URL HTTPS, `app.config.js` đặt `usesCleartextTraffic=false`; xác minh lại trên merged manifest cuối.
- [x] P0 Server dùng CORS allowlist từ `CORS_ALLOWED_ORIGINS`, mặc định từ chối cross-origin browser access.
- [ ] P0 Chốt logging production có redaction/retention; không log PII trẻ em, device secret, recovery code hoặc purchase token.
- [ ] P0 Xác minh secret production: Mongo/Redis, `GOOGLE_PLAY_KEY`, `GOOGLE_PLAY_PACKAGE_NAME`, publish/admin secret; không để trong app bundle hoặc source.

**Exit criteria:** AAB từ Play gọi đúng HTTPS production, tạo child/tải bài/ghi progress/IAP verify thành công; không có request HTTP hoặc localhost.

### 2.3 Authentication, authorization và chống abuse

- [x] P0 Có anonymous household session bằng app-scoped `deviceId` + secret ngẫu nhiên lưu trong SecureStore; `childId` không còn là secret/quyền sở hữu.
- [x] P0 Mọi API đọc/sửa hồ sơ, progress, parent report và entitlement kiểm tra ownership bằng cả `householdId` từ bearer và `childId`.
- [x] P0 `run-weekly-reports`, publish/admin và activation-code admin đều có guard fail-closed; publish còn có route rate limit.
- [x] P0 IAP token đã được hash và bind duy nhất vào một household; token thuộc household khác bị trả `409`.
- [x] P0 Có global Redis/IP rate limit, route override, JSON/urlencoded body limit và CORS default-deny.
- [ ] P0 Bổ sung/xác minh security headers và audit log đã redaction cho endpoint nhạy cảm.
- [x] P0 Focused test xác nhận lookup entitlement/IAP luôn có `householdId`; `childId` ngoài household trả `404`.

**Evidence anonymous session — 2026-07-28:**

- [x] Server lưu hash của device secret, PIN, recovery code và purchase token; không lấy Android ID/IMEI/MAC/Advertising ID làm danh tính.
- [x] Đăng ký thiết bị idempotent; secret sai hoặc thiết bị revoked bị từ chối.
- [x] Parent PIN được verify ở server, khóa sau 5 lần sai; app tự khóa lại sau 5 phút hoặc ngay khi background.
- [x] Recovery yêu cầu recovery code + PIN và gắn thiết bị mới vào đúng household.
- [x] `run-weekly-reports`, publish/admin và activation-code admin đã có guard riêng; focused guard tests pass.
- [x] Focused server suites: `25/25` test pass; server build pass.
- [x] Mobile anonymous-session contract test, TypeScript check và targeted ESLint đều pass.
- [x] Full server verification ngày 31/08/2026: `50` suites / `502` tests pass; `npm run build` pass.
- [ ] Chưa có evidence runtime trên thiết bị/AAB từ Play cho clean install, reinstall, recovery, revoke và IAP license test.

**Exit criteria:** security test chứng minh client A không thể đọc/sửa child B, không thể tự mở entitlement và không thể gọi endpoint admin.

### 2.4 Quyền riêng tư và dữ liệu trẻ em

- [x] P0 Privacy Policy có source, truy cập công khai tại `https://dodokids.vn/privacy` (HTTP 200 ngày 31/08/2026) và đã link trong mobile Settings.
- [x] P0 Terms có source, truy cập công khai tại `https://dodokids.vn/terms` (HTTP 200 ngày 31/08/2026) và đã link trong mobile Settings.
- [ ] CONSOLE Điền đúng Privacy URL/Data deletion URL trong Play listing và Data safety.
- [ ] P0 Privacy Policy phải ghi rõ tối thiểu: pháp nhân/developer, liên hệ, dữ liệu trẻ/phụ huynh thu thập, mục đích, third-party SDK, lưu trữ, bảo mật, retention, xoá dữ liệu, quyền của phụ huynh và phạm vi quốc gia.
- [ ] P0 Legal/ops xác minh các claim đang publish: chủ thể + địa chỉ, GCP, retention, cam kết phản hồi 7 ngày/xoá 30 ngày và quy trình thực thi thật.
- [ ] P0 Sửa/duyệt Subscription Terms theo hành vi Google Play thực tế; câu “huỷ ít nhất 24 giờ trước khi kết thúc kỳ” hiện mang wording kiểu App Store và không nên áp cứng cho cả hai store nếu chưa có căn cứ.
- [ ] P0 Chốt cơ chế parental notice/consent phù hợp cho dữ liệu trẻ 4–6 tuổi trước khi tạo hồ sơ server-side.
- [x] P0 Có web URL `https://dodokids.vn/data-deletion` dùng được sau khi gỡ app (HTTP 200 ngày 31/08/2026), hướng dẫn gửi yêu cầu qua email.
- [ ] P0 Thêm in-app path tới xoá/yêu cầu xoá dữ liệu sau parent gate, hoặc sửa Privacy cho đúng hành vi hiện tại. Policy đang nói thao tác xoá có trong app sau PIN nhưng source mobile chưa có path này.
- [ ] P0 Bỏ yêu cầu phụ huynh gửi **recovery code qua email** trên trang data deletion; đây là credential. Thiết kế cơ chế xác minh yêu cầu xoá không thu secret qua email.
- [ ] P0 Backend xoá/anonymize đầy đủ child profile, progress, activity results và entitlement data theo policy retention; giao dịch phải giữ lại vì nghĩa vụ pháp lý thì cần nêu rõ.
- [ ] P0 Lập data inventory thực tế từ app, SDK và server logs trước khi điền Data safety. Ít nhất cần đánh giá:
  - tên, tuổi và avatar của trẻ;
  - lesson/activity progress, XP, streak, report và offline tasks;
  - purchase product, token, entitlement và expiry;
  - IP/request logs và mọi device identifier do SDK thu thập;
  - email nếu tính năng báo cáo tuần sau này thực sự thu thập email.
- [ ] P0 Chỉ khai “data encrypted in transit” sau khi toàn bộ luồng production đã dùng HTTPS.

**Lưu ý account deletion:** Google yêu cầu in-app path và web deletion URL nếu app cho tạo app account. Dodokids hiện tạo child profile nhưng chưa có auth account hoàn chỉnh; vẫn phải trả lời phần Data deletion trong Data safety. Hướng an toàn là cung cấp xoá hồ sơ/dữ liệu dù Console có phân loại child profile là account hay không.

#### 2.4b Khi ship tính năng Luyện phỏng vấn cùng Đô Đô (change add-dodo-interview-practice)

> Các mục dưới đây chỉ áp dụng cho bản release đầu tiên có tính năng phỏng vấn (mic + chấm audio qua Vertex AI). Bản release không chứa tính năng này không bị chặn bởi 2.4b.

- [ ] Khai báo `RECORD_AUDIO` trong merged manifest của AAB chứa tính năng, khớp 100% với permission/SDK inventory §2.5 (mục "không còn `RECORD_AUDIO`" ở §2.5 chỉ đúng cho bản chưa có mic — cập nhật inventory khi ship).
- [ ] Cập nhật Data safety: thêm data type **Audio** (voice recordings), purpose **App functionality**, processor **Google Vertex AI** (proxy 100% qua kido-server), tính chất **ephemeral** — file audio xóa ngay sau khi chấm xong, chỉ lưu kết quả chấm có cấu trúc.
- [ ] Khai báo **AI-generated content** trên Play Console theo declaration hiện hành (feedback/nhận xét do model sinh trong báo cáo phụ huynh).
- [ ] Publish privacy policy bản đã có mục dữ liệu giọng nói (thu gì, xử lý ở đâu, retention xóa-sau-chấm, quyền thu hồi consent) **TRƯỚC** khi release bản có mic; policy hiện tại cam kết "Không ghi âm" nên bắt buộc thay trước.
- [ ] Lưu evidence consent flow phụ huynh: screenshot màn consent (sau parental gate, opt-in theo bé, thu hồi được) + mô tả cơ chế trong Families declaration.
- [ ] Xác nhận entry point tính năng nằm **ngoài Khám phá** và sau paywall/lượt trải nghiệm 1 phiên miễn phí; store listing/Data safety mô tả đúng phạm vi này.

### 2.5 Android permission và SDK inventory

- [x] P0 Expo prebuild audit ngày 31/08/2026 không còn `RECORD_AUDIO` hoặc foreground service trong generated manifest.
- [ ] P0 Loại `SYSTEM_ALERT_WINDOW` khỏi release; kiểm tra nguyên nhân từ dev client/debug tooling.
- [ ] P0 Đánh giá `READ_EXTERNAL_STORAGE`/`WRITE_EXTERNAL_STORAGE` (generated manifest đang giới hạn `maxSdkVersion=32`); loại nếu không có use case thật và ghi lý do nếu giữ.
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
- [ ] P0 Link Google Play Developer API/service account với đúng app; production env có `GOOGLE_PLAY_KEY` và `GOOGLE_PLAY_PACKAGE_NAME=com.dodokids.app`.
- [ ] P0 Test bằng license tester trên build cài từ Play:
  - load đúng product và giá;
  - mua mới thành công;
  - user cancel/pending/payment fail;
  - app bị kill giữa purchase và verify;
  - restore sau reinstall/đổi máy;
  - renew, expire, cancel, grace period, refund/revoke;
  - duplicate callback không cấp quyền hai lần.
- [ ] P0 Đồng bộ lifecycle subscription ở backend bằng RTDN/Google Play Developer API hoặc cơ chế tương đương; không chỉ tin expiry đã lưu từ lần mua đầu.
- [ ] P0 Migrate backend verify/reconcile từ API deprecated `purchases.subscriptions.get` sang `purchases.subscriptionsv2.get`; xử lý đúng active/pending/grace period/on hold/canceled/expired và line items trước khi mở subscription Production.
- [ ] P0 Có quy trình revoke entitlement khi refund/chargeback/cancel-expired.

**Điểm đã đạt:** client chỉ `finishTransaction` sau khi backend verify; backend hiện verify với Google; Expo prebuild dùng Billing Library 8.3.0. API `purchases.subscriptions.get` đã deprecated và dự kiến shutdown 31/08/2027, nên app mới không được go-live subscription với debt này.

### 2.7 Không để mock/dev behavior lọt Production

- [ ] P0 Không fallback sang `buildMockLesson` khi production API lỗi hoặc trả payload không map được; hiển thị trạng thái retry/content unavailable có kiểm soát.
- [x] P0 Đã loại `DEV_CHILD_ID`/`child_test00001` khỏi toàn bộ runtime source mobile; contract test quét và fail nếu xuất hiện lại.
- [ ] P0 Không để debug menu, dev client, test endpoint, test child hoặc IP dev trong AAB.
- [ ] P0 Store listing chỉ mô tả đúng tính năng/content có thật trong bản submit.

## 3. P1 — Google Play Console và store listing

### 3.1 Developer account

- [x] CONSOLE Đã tạo Google Play Developer account (release owner xác nhận 31/08/2026).
- [ ] CONSOLE Xác minh account là Personal hay Organization và ngày tạo account.
- [ ] CONSOLE Hoàn tất identity/contact verification; nếu là Organization, chuẩn bị D-U-N-S, giấy tờ pháp nhân và website đã verify khi Console yêu cầu.
- [ ] CONSOLE Hoàn tất device verification nếu Dashboard yêu cầu: Play Console mobile app trên Android vật lý, không root, Android 10 trở lên.
- [ ] CONSOLE Hoàn tất merchant/payments profile để bán subscription.
- [ ] CONSOLE Kiểm tra package `com.dodokids.app` chưa bị chiếm và chấp nhận Play App Signing.
- [ ] CONSOLE Xác nhận `com.dodokids.app` ở trạng thái registered trong Android developer verification trước mốc 30/09/2026; app mới tạo trong Play Console thường được đăng ký tự động nhưng vẫn phải kiểm evidence.

### 3.2 App setup

- [ ] CONSOLE Tạo/kiểm tra app `Dodokids`, default language `Vietnamese (vi-VN)`, loại `App`, giá app `Free` và có in-app purchases.
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

### 4.1 Internal testing (team smoke gate; Google không bắt buộc)

- [ ] Upload AAB production đầu tiên lên Internal testing.
- [ ] Xử lý toàn bộ pre-review check, SDK warning, target API, permission và policy warning.
- [ ] Cài đúng build từ Play bằng link tester; không sideload artifact local để nghiệm thu IAP.
- [ ] Chạy smoke test trên ít nhất Android API 24, 28, 34 và 36; phone RAM thấp và tablet.
- [ ] Test clean install, upgrade, uninstall/reinstall, mất mạng, mạng chậm, backend 5xx và token/session hết hạn.
- [ ] Test audio, SVG/image cache, 8 activities/lesson, completion, progress, parent report và subscription gate.
- [ ] Xác minh không có crash/ANR, blank screen, mock content, HTTP request hoặc debug UI.
- [ ] Lưu test evidence: device/OS, versionCode, checklist result, screenshot/video và lỗi còn lại.

### 4.2 Closed testing và production access

- [x] CONSOLE Play Console đã báo Closed testing là điều kiện bắt buộc cho account này.
- [ ] Chuẩn bị tester list/Google Group, opt-in link, test script và feedback channel; khuyến nghị tuyển 15–20 người lớn/phụ huynh để giữ buffer trên mức tối thiểu 12.
- [ ] CONSOLE Publish Closed release. Tester phải có trong list và tự bấm opt-in; chỉ thêm email không được tính. Người đang ở Internal phải opt-out Internal trước khi nhận Closed.
- [ ] CONSOLE Có ít nhất **12 tester actively opted-in liên tục 14 ngày** ngay trước lúc Apply for production; tester opt-out sẽ mất chuỗi liên tục của họ.
- [ ] Tester cài và sử dụng bản test thật; lưu device/OS/version, feedback, lỗi và thay đổi đã sửa. Không có yêu cầu chính thức phải mở app mỗi ngày, nhưng Google đánh giá engagement thật.
- [ ] Sau khi đủ 12×14, vào Dashboard **Apply for production** và trả lời questionnaire bằng dữ liệu test thật; đây không phải cơ chế tự động mở Production.
- [ ] Theo dõi kết quả xét Production access (Google thường hoàn tất trong 7 ngày nhưng có thể lâu hơn); nếu bị yêu cầu test tiếp, xử lý feedback và mở chu kỳ evidence mới.

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
- [ ] Team Internal smoke gate, Closed testing bắt buộc và Production access requirement đã hoàn tất.
- [ ] Pre-launch report không còn blocker; crash/ANR/vitals đạt ngưỡng đã chốt.
- [ ] Backend/content/support/monitoring sẵn sàng và có rollback owner.
- [ ] Người chịu trách nhiệm release ghi `GO`, versionCode, rollout %, thời điểm và link evidence bên dưới.

### Release record

| Trường | Giá trị |
|---|---|
| Release owner | |
| Developer account type / created date | |
| Version name / code | |
| AAB SHA-256 | |
| Internal/Closed track link | |
| Closed test start / eligible date | |
| Continuous opted-in tester count | |
| Production access application / result | |
| Production release link | |
| Privacy/Data safety evidence | |
| IAP test evidence | |
| Security test evidence | |
| Rollout start | |
| Rollback threshold | |
| Final decision | `NO-GO` |

## 7. Thứ tự xử lý đề xuất

1. **Developer account**: account type/ngày tạo, identity/contact/device verification, payments profile và 2FA.
2. **App record + production build**: đăng ký `com.dodokids.app`, Play App Signing, EAS credentials, AAB/versioning và Internal upload.
3. **Console/App content**: Privacy/Data deletion, Data safety, target audience/Families, content rating, App access và declarations.
4. **Closed test bắt buộc**: publish release, giữ ≥12 tester opt-in liên tục 14 ngày, feedback/evidence, Apply for production.
5. **P0 song song**: security/HTTPS, deletion backend, permission/SDK cleanup, IAP products + RTDN + license test, store assets và operations.
6. **Production**: Production access được duyệt, pre-launch report sạch, staged rollout và theo dõi vitals/rollback.

## 8. Nguồn Google chính thức dùng để đối chiếu

- [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-GB_ALL)
- [Play Billing Library deprecation timeline](https://developer.android.com/google/play/billing/deprecation-faq)
- [Google Play Developer API deprecations](https://developer.android.com/google/play/billing/play-developer-apis-deprecations)
- [Subscription lifecycle and RTDN](https://developer.android.com/google/play/billing/lifecycle/subscriptions)
- [Manage subscriptions and one-time purchases](https://developer.android.com/google/play/billing/manage-purchases)
- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Set up an open, closed, or internal test](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)
- [Device verification requirements for new developer accounts](https://support.google.com/googleplay/android-developer/answer/14316361?hl=en)
- [Developer account information requirements](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en)
- [Android developer verification and package registration](https://developer.android.com/developer-verification/guides/google-play-console)
- [Google Play Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)
- [Target audience and app content](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en)
- [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)
- [Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-EN)
- [Create and set up an app / Android App Bundle](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)
- [Store listing preview asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
