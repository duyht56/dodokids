# Apple App Store — Runbook thao tác (Dodokids iOS)

> Cập nhật: 2026-09-04 · Phiên bản này viết cho **ràng buộc thật của team**: enroll **Individual** (không pháp nhân) và **không có iPhone/iPad** — chỉ MacBook M5, macOS 26.3, Xcode 26.6.
>
> Runbook này để **làm**; [`APPLE_APP_STORE_GOLIVE_CHECKLIST.md`](./APPLE_APP_STORE_GOLIVE_CHECKLIST.md) để **nghiệm thu**.
>
> Cấu trúc repo: `mobile/` là repo git riêng; `mobile/ios/` bị gitignore và EAS **prebuild lại trên cloud từ `app.json`**. Mọi cấu hình iOS sửa ở `app.json`/`eas.json`, không sửa `mobile/ios/`.

## 0. Ba quyết định phải chốt TRƯỚC khi bấm gì

### 0.1 Individual → tên thật của anh là "nhà phát triển" trên App Store

Không có pháp nhân thì chỉ enroll Individual được, và hệ quả **không đảo ngược rẻ được**: App Store hiển thị **tên pháp lý cá nhân** làm seller. Apple chỉ cho hiển thị tên thương hiệu ("Dodokids") với tài khoản **Organization** có D-U-N-S; DBA/tên giao dịch không được chấp nhận.

Developer name được set **lần đầu tiên anh tạo app record** và không sửa được self-service (có đường xin đổi qua Apple Support kèm giấy tờ, nhưng đổi vendor name sẽ **reset IDFV** của người dùng hiện có).

Đường nâng cấp về sau là **migration Individual → Organization** (form riêng của Apple), giữ nguyên team, bundle ID, subscriber, review, product ID — **khác** với app transfer (transfer là đường phá: mất TestFlight, mất promo code, tách báo cáo doanh thu). Nhưng có một chi phí thuế ít người biết:

> Trong Exhibit B của Paid Applications Agreement (bản 29/01/2026), Việt Nam được đánh dấu `††`: Apple thu và nộp thuế thay cho **developer cá nhân cư trú tại VN**, nhưng **không** làm thay cho **doanh nghiệp VN**. Nghĩa là ngày anh lập công ty và migrate, nghĩa vụ thu/nộp VAT nội địa chuyển về phía anh. Hỏi kế toán trước khi migrate.

**Kết luận:** Individual là lựa chọn đúng cho v1. Chỉ cần biết trước rằng dòng developer name sẽ là tên anh.

### 0.2 `supportsTablet` → **BẬT** (đổi quyết định, 2026-09-06)

> Phiên bản trước của mục này chốt `supportsTablet: false` cho v1. Quyết định đã
> đổi sau khi layout iPad được revamp — phần phân tích kỹ thuật bên dưới vẫn
> đúng nguyên văn, nó chỉ chuyển từ "lý do để tắt" thành "điều kiện phải đạt
> trước khi bật".

Ràng buộc kỹ thuật (đã xác minh lại trực tiếp trong `node_modules`):

`@expo/config-plugins/build/ios/RequiresFullScreen.js:55-70` — khi
`ios.supportsTablet = true` và `ios.requireFullScreen` **không set**, plugin ghi
`UISupportedInterfaceOrientations~ipad` = **cả 4 hướng** và
`UIRequiresFullScreen = false`.

Tức là **`orientation: "portrait"` trong `app.json` KHÔNG khoá xoay trên iPad**
(key đó chỉ áp cho iPhone). Bật iPad = chấp nhận app xoay 4 hướng **và** cửa sổ
resize được (Split View + windowing của iPadOS 26).

Không có đường tắt: `ios.requireFullScreen: true` chỉ là băng dán — TN3192 nói
`UIRequiresFullScreen` đã deprecated ở iPadOS 26 và hết tác dụng ở iPadOS 27.
Nên điều kiện duy nhất để bật là **layout phải adaptive theo bề rộng cửa sổ**.

**Điều kiện đó đã đạt.** OpenSpec `add-ipad-support`: hệ size class dùng chung
(`mobile/src/constants/layout.ts` + `useResponsive`) thay cho breakpoint nhị
phân, cột nội dung có trần bề rộng ở mọi màn, lưới tính bằng point thay vì phần
trăm, và Paywall hết lỗi tràn khỏi mép phải (bug chặn phát hành, ghi ở commit
`a9d040c` nhánh `test/ipad-layout`).

Đã kiểm trên iPad Pro 13-inch (M5) Simulator ở các bề rộng:

| viewport | size class | kết quả |
|---|---|---|
| 1032×1376 (13" dọc, full screen) | `large` | Home 2 pane, Khám phá 4 cột, Paywall split |
| ~1010×1230 (cửa sổ iPadOS 26) | `regular` | Paywall xếp dọc, Home 2 pane |
| 858×482 (cửa sổ ngang, thấp) | `regular` | lesson player split, không tràn |
| ~600×1150 (cửa sổ hẹp) | `compact` | rơi về layout điện thoại, không vỡ |
| iPhone 17 Pro 402×874 | `compact` | **không đổi** so với trước |

Guideline 2.4.1 ("should run on iPad whenever possible") giờ được đáp ứng thật,
không phải bằng chế độ tương thích.

⚠️ **Một chiều:** bật rồi tắt lại sẽ **cắt update của người dùng iPad hiện có**.
Đã bật thì không quay lại `false` nữa.

⚠️ Còn nợ kiểm: **xoay thiết bị thật sang 1376×1032**. Simulator không xoay được
bằng `simctl`, và AppleScript bị chặn assistive access trên máy này — hình dạng
ngang đã kiểm bằng cửa sổ iPadOS 26 (858×482) chứ chưa phải bằng rotate. Trước
khi submit, xoay Simulator bằng ⌘← rồi soát lại Home / Khám phá / Paywall.

### 0.3 EU → khai "not a trader" và loại EU khỏi territory ở v1

Khai trader với tư cách cá nhân nghĩa là Apple **đăng công khai** địa chỉ + số điện thoại + email lên trang App Store ở cả 27 storefront EU. P.O. Box được chấp nhận thay địa chỉ nhà, nhưng vẫn cần giấy tờ chứng minh, và **số điện thoại phải qua xác thực và bị công khai**.

Bán subscription cho người tiêu dùng EU thì khai "non-trader" là không đứng vững được — yếu tố đầu tiên trong bài test của Apple là "có tạo doanh thu từ app, ví dụ có In-App Purchase" hay không.

Lối thoát chính thức: **không phát hành ở EU**. Apple ghi rõ nếu chỉ phân phối ngoài EU thì "không phải là trader trên App Store".

⚠️ **Nhưng vẫn phải trả lời câu hỏi đó:** "Even if you don't distribute apps in the EU, you'll still need to declare a trader status." Vào **Business → Agreements → Compliance → Digital Services Act** chọn *This is not a trader account*, nếu không sẽ **không submit được app mới**.

Territory sửa bất kỳ lúc nào ở Pricing and Availability, hiệu lực ngay (tối đa 24h lan toả). Nhưng **bật lại EU sau này không tức thì**: phải khai trader, xác thực email/phone, upload giấy tờ, chờ Apple verify — tính bằng ngày. Và đừng gỡ territory đang có subscriber đang trả tiền: Apple không tài liệu hoá điều gì xảy ra với subscription auto-renew ở territory bị gỡ.

### 0.4 Apple Account nào đứng tên — chọn một lần, dùng cho cả portfolio

**Một membership 99 USD/năm phủ không giới hạn số app.** Không tạo tài khoản riêng cho từng app — chỉ có agreements/tax/banking/payout ở cấp tài khoản, còn support email, privacy URL, listing là field **theo từng app**.

Vì tài khoản này sẽ ôm nhiều app trên nhiều domain khác nhau, **không** buộc nó vào email của một sản phẩm. Chọn một địa chỉ **độc lập domain sản phẩm**:

| Vai trò | Dùng | Ghi chú |
|---|---|---|
| Apple Account (đăng nhập developer) | Gmail **chuyên dụng cho việc dev** | domain sản phẩm nào chết cũng không ảnh hưởng tài khoản |
| Support email/URL trên App Store | theo domain từng app (`support@dodokids.vn`, …) | field per-app, khai lúc làm listing |
| Rescue email | một địa chỉ khác nữa | không trùng Apple Account |
| Trusted phone | số di động VN | 2FA qua SMS |

**Điều kiện của cái Gmail đó — kiểm trước khi enroll:**

1. **Không phải Apple ID cá nhân đang dùng iCloud** (ảnh, iMessage, backup, mua app). Trộn vào là sau này bàn giao/thuê người rất khó gỡ. Kiểm ở <https://account.apple.com>: nếu đăng nhập được và thấy dữ liệu iCloud cá nhân → tạo Apple Account **mới** bằng một Gmail khác dành riêng cho dev.
2. **Tên trên Apple Account phải khớp từng ký tự hộ chiếu** (spelling Latin, không dấu). Apple ID cũ hay để nickname — sửa trước khi enroll, vì identity verification đối chiếu với giấy tờ.
3. **Bật recovery phone + lưu backup code của chính Google.** Với lựa chọn này, Google account là điểm chết duy nhất của cả portfolio.

**Không dùng `support@<domain>` làm Apple Account:** hộp thư dùng chung — ai trả lời support cũng chạy được luồng reset; và nó bị đăng công khai trên trang App Store nên thành đích phishing.

**Không cần đăng nhập Apple Account này vào iCloud trên Mac.** Enroll qua **web** chỉ cần trusted phone number là đủ 2FA — giữ nguyên Apple ID cá nhân làm tài khoản iCloud của máy. Chỉ đường **Apple Developer app** mới bắt đăng nhập iCloud trên thiết bị; nếu buộc đi đường đó để quét giấy tờ thì tạo một **user macOS thứ hai**.

**Email đổi được, con người thì không.** Apple cho đổi primary email của Apple Account sang địa chỉ third-party khác (xác thực bằng mã, miễn chưa thuộc Apple Account nào). Nhưng với Individual, Apple chỉ chuyển Account Holder khi người giữ tài khoản qua đời hoặc trẻ vị thành niên đủ tuổi — không có đường tự chuyển.

**Hệ quả khi ôm nhiều app dưới Individual:**

- **Mọi app đều hiện tên pháp lý cá nhân** ở dòng nhà phát triển, và tên đó set ở app record **đầu tiên**. Với một portfolio nhiều thương hiệu, đây là lập luận mạnh hơn nhiều so với một app đơn lẻ để lập pháp nhân sớm (kèm hệ quả thuế ở §0.1).
- **Payout gộp chung** về một tài khoản ngân hàng đứng tên anh; báo cáo tách theo app nhưng tiền về một mối.
- **Giữ product ID IAP duy nhất trên toàn portfolio.** App transfer về sau bị chặn nếu tài khoản nhận đã tồn tại cùng product ID — đừng đặt trùng `kido_monthly_139k` kiểu `monthly_139k` chung chung cho app khác.
- **Cộng tác viên:** Individual thêm được tối đa **50 user vào App Store Connect**, nhưng họ không phải team member của Developer Program (không có certificate/profile riêng). Designer/marketer thì đủ; developer thứ hai cần signing identity riêng thì phải lên Organization.

---

## A. Enroll Apple Developer Program — làm 100% trên MacBook

Không cần iPhone ở bất kỳ bước nào. Apple ghi rõ enrollment "is available through the Apple Developer app and on the web" (chỉ Ấn Độ bị bắt buộc dùng app), và **Mac Apple silicon nằm trong danh sách thiết bị được chấp nhận cho cả enrollment lẫn identity verification** — quét giấy tờ bằng camera MacBook được.

Thứ tự bắt buộc:

1. **Chọn người đứng tên** và lấy **hộ chiếu** ra. Apple xác nhận rộng rãi passport; CCCD không được tài liệu hoá là chấp nhận ở VN. Tên trên Apple Account phải khớp **từng ký tự** với spelling Latin trên hộ chiếu (không dấu).
2. **Dùng Apple Account chuyên dụng cho dev** (xem §0.4) — Gmail riêng cho việc dev, không phải Apple ID cá nhân đang gắn iCloud, không phải `support@<domain>`. First/Last name đúng hộ chiếu, **không** để alias hay "Dodokids".
3. **Bật 2FA trước khi enroll**: System Settings → [tên anh] → Sign-In & Security → Two-Factor Authentication → Turn On.
4. **Thêm số điện thoại VN làm trusted phone number** (định dạng `+84…`), gửi thử một mã từ appleid.apple.com để chắc SMS về được.
5. **Xác nhận MacBook đã là trusted device** (hiện trong danh sách thiết bị). Thêm **rescue email ở domain KHÁC** `dodokids.vn` — mất DNS/mail của domain đó là mất tài khoản developer.
6. **Điền địa chỉ + điện thoại thật** ở appleid.apple.com → Personal Information. Apple từ chối P.O. Box ở mục này.
7. **Enroll**: <https://developer.apple.com/enroll/> → Individual. Hoặc cài app **Apple Developer** từ Mac App Store (cần macOS 15+) → Account → Enroll Now → quét giấy tờ bằng camera Mac. **Làm hết trên cùng một máy**, Apple yêu cầu không đổi thiết bị giữa chừng.
8. **Thanh toán bằng thẻ tín dụng đứng tên chính anh.** Apple: *"If you're paying by credit card and enrolling as an individual, you must use your own credit card"* — dùng thẻ người khác là bị delay và bị đòi giấy tờ. **Không** dùng số dư Apple Account/gift card. **99 USD bị trừ TRƯỚC khi được duyệt** — tiền có thể nằm ở Apple trong lúc hồ sơ treo.
9. **Lưu Enrollment ID + email xác nhận đơn.** Quá 24 giờ không có email duyệt thì mở ticket ở <https://developer.apple.com/contact/> kèm Enrollment ID.
10. Nếu quét giấy tờ trên Mac lỗi: có hai đường thoát chính thức, đều qua trang contact — xin phương thức xác minh thay thế, hoặc xin phương thức không dùng government ID.

## A2. Business — không xong bước này thì **sandbox cũng không có product**

App Store Connect → **Business**, đúng thứ tự (Apple ép thứ tự này):

1. **Paid Apps Agreement** → Request → Accept. Phải hiển thị *Active*.
2. **Tax forms**: `W-8BEN` (cá nhân không cư trú Mỹ). ⚠️ **Hiệp định thuế Mỹ–Việt chưa có hiệu lực** → không khai treaty benefit ở Part II được. ⚠️ Form này **một chiều**: *"Once you submit this information, you won't be able to make any changes in App Store Connect"* — sai là phải mở ticket, và banking bị chặn cho tới khi tax được duyệt.
3. **Banking**: tài khoản phải đứng tên **chính anh**. Tên chủ tài khoản chỉ nhận **chữ Latin không dấu** (ngoài A–Z, 0–9 chỉ cho `,` `/` `?` `-` `)` `(`) nhưng vẫn phải khớp bản ghi ngân hàng. Ngưỡng chi trả tối thiểu tính **theo từng region** — vùng Việt Nam phải tự vượt ~40 USD/tháng tài chính.
4. **Compliance → Digital Services Act** → *This is not a trader account* (xem §0.3).

Cả ba mục Agreements / Bank Accounts / Tax Forms phải **Active** thì StoreKit mới trả về product. Chưa Active thì `fetchProducts` trả mảng rỗng và anh sẽ mất nhiều ngày truy một bug không tồn tại.

## A3. Users and Access

- **Integrations → App Store Connect API**: tạo key role **App Manager**, tải `AuthKey_*.p8` (**chỉ tải được 1 lần**), ghi Key ID + Issuer ID. Không commit (`*.p8` phải trong `.gitignore`). Với `eas submit` chạy tay thì key này **tuỳ chọn**; chỉ bắt buộc khi chạy CI.
- **Sandbox → Test Accounts**: tạo 2 tài khoản, Country/Region = **Vietnam** để thấy giá VND. Email dùng làm sandbox account **không được đã là Apple Account**.

---

## B. App ID, app record, subscription

1. **Identifiers → App ID**: bundle **Explicit** `com.dodokids.app`, tick **In-App Purchase**.
   ⚠️ **Bẫy im lặng:** TN3186 — *"In the sandbox, you can't test In-App Purchase with a provisioning profile that contains a wildcard App ID"*, và capability IAP mặc định **tắt** với wildcard App ID. EAS quản lý credentials nên anh không nhìn thấy profile → phải tự vào Certificates, Identifiers & Profiles xác nhận App ID là explicit và IAP đã tick, nếu không product trả rỗng và anh sẽ đổ lỗi cho `react-native-iap`.
2. **Apps → New App**: iOS, name `Dodokids` (phải duy nhất toàn cầu), Primary Language Vietnamese, bundle `com.dodokids.app`, SKU `dodokids-ios-001`. Ghi lại **Apple ID dạng số** → chính là `ascAppId`.
3. **Monetization → Subscriptions**: một Subscription Group, hai product `kido_monthly_139k` (1 Month) và `kido_annual_999k` (1 Year), giá VND, localization tiếng Việt, **review screenshot cho từng product**, review note nêu rõ **mã PIN parental gate**. Đặt rank annual > monthly.
4. **Age Rating**: từ 31/01/2026 Apple đã đổi sang hệ age rating mới và bắt buộc trả lời lại bộ câu hỏi cho từng app — không làm thì bị chặn khi submit update. Làm được hoàn toàn trên MacBook.

---

## C. Sửa repo (`mobile/`)

### C1. `app.json`

```jsonc
"ios": {
  "supportsTablet": true,                           // xem §0.2 — iPad bật, layout đã adaptive
  "bundleIdentifier": "com.dodokids.app",
  "config": { "usesNonExemptEncryption": false }    // HTTPS chuẩn → exempt, khỏi khai mỗi lần upload
}
```

Và thêm plugin để **chốt deployment target** — hiện `app.json` **không** set gì cả:

```jsonc
["expo-build-properties", { "ios": { "deploymentTarget": "16.4" } }]
```

> ⚠️ `APPLE_APP_STORE_GOLIVE_CHECKLIST.md` đang khẳng định deployment target = 16.4 dựa trên `mobile/ios/Dodokids.xcodeproj/project.pbxproj`. Nhưng `ios/` bị gitignore và EAS prebuild lại từ `app.json`, nơi không có `deploymentTarget` — **bản cloud build đang dùng default của template Expo, không phải 16.4**. Checklist đang khẳng định về một artifact không tồn tại trong CI. Set explicit rồi mới tick được mục đó.

### C2. `eas.json`

```jsonc
{
  "cli": { "version": ">= 12.0.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "ios-simulator": {                     // dev hằng ngày, KHÔNG cần Apple account
      "extends": "development",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "autoIncrement": true,
      "android": { "buildType": "apk" },
      "env": { "KIDO_API_URL": "https://api.dodokids.vn" }
    },
    "production": {
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" },
      "ios": { "resourceClass": "m-medium" },
      "env": { "KIDO_API_URL": "https://api.dodokids.vn" }
    }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" },
      "ios": { "ascAppId": "<số ở §B2>", "appleTeamId": "<Team ID>" }
    }
  }
}
```

Ghi chú:

- **Đừng đụng vào ad hoc / internal distribution cho iOS.** Nó nhúng danh sách UDID vào provisioning profile lúc build; không có thiết bị thì không có gì để đăng ký. (`eas device:create` chỉ hữu ích nếu mượn được máy ai đó.)
- Build simulator ra `.app`, **không bao giờ submit lên TestFlight/App Store được** — giữ tách bạch với profile `production`.
- Từ **28/04/2026** Apple bắt buộc upload phải build bằng **Xcode 26 + iOS 26 SDK**. Cái gate này áp lên **image của EAS cloud**, không phải Xcode trên máy anh. Image `auto` của SDK 56 hiện resolve về `macos-tahoe-26.4-xcode-26.4` — đạt; muốn chắc thì pin `"image": "macos-tahoe-26.4-xcode-26.4"` trong khối `ios`.
- `eas build --local` **bỏ qua** field `image` và dùng Xcode 26.6 trên máy — pass local không chứng minh được cloud pass.

### C3. Credentials

```bash
cd mobile && npx eas-cli credentials
```

iOS → production → Set up new credentials. EAS tự tạo Distribution Certificate + App Store provisioning profile.

---

## D. Test IAP khi không có iPhone

### D0. ✅ Luồng verify iOS — đã sửa (2026-09-05)

Lỗi cũ: client gửi `purchase.purchaseToken` (là **JWS** trên iOS) còn server post nó vào `receipt-data` của `verifyReceipt` (cần **base64 receipt**). Apple trả **21002**, không phải 21007, nên nhánh retry sandbox không bao giờ chạy — hỏng ở mọi môi trường.

Đã thay bằng xác thực chữ ký **StoreKit 2 JWS** cục bộ với `@apple/app-store-server-library@3.1.0`:

- `kido-server/src/modules/iap/apple-jws.verifier.ts` — verify bằng Apple Root CA, hai verifier Sandbox/Production, chọn theo claim `environment` (verifier kiểm lại claim **sau khi** xác thực chữ ký; `Xcode`/`LocalTesting` bị từ chối vì verifier cho các môi trường đó bỏ qua kiểm tra chữ ký).
- `apple-root-certs.ts` — 3 root CA nhúng base64 DER. Không dùng file `.cer` vì `nest-cli.json` không có mục `assets`: file dưới `src/` không được copy vào `dist/`, sẽ pass local rồi crash trong container.
- Guard mới: **hết hạn**, **revoked/refunded**, product qua `KIDO_PRODUCT_IDS.includes` (toán tử `in` cũ nhận cả key kế thừa như `constructor`).
- Binding chống replay lấy `originalTransactionId` từ payload đã verify, **bỏ hẳn fallback về token thô** — Apple phát hành JWS mới mỗi lần gia hạn.
- Field wire đổi `receiptData` → `signedTransactionJws` (cả verify lẫn restore), kèm guard hình dạng compact JWS. iOS chưa phát hành nên không có vấn đề tương thích.
- Env: bỏ `APPLE_SHARED_SECRET`, thêm `APPLE_BUNDLE_ID` + `APPLE_APP_APPLE_ID`.
- Mobile: `restorePurchases` gọi `syncIOS()` trước khi đọc, dùng `onlyIncludeActiveItemsIOS: true`, loại bản ghi revoked, chọn theo thời hạn thay vì `kido[kido.length - 1]`.

Kiểm chứng: `nest build` pass, **527/527 test server xanh**, `tsc --noEmit` mobile sạch. Test ghim đúng lỗi cũ — receipt base64 cũ bị từ chối mà không gọi Apple, và chuỗi JWS phải tới verifier nguyên vẹn từng byte.

**Còn lại (không làm được trong repo):**

- [ ] Set `APPLE_BUNDLE_ID=com.dodokids.app` và `APPLE_APP_APPLE_ID` trong env production. ⚠️ Thiếu `APPLE_APP_APPLE_ID` thì **sandbox vẫn xanh** còn mọi giao dịch Production trả 503 — kiểm bằng log boot, đừng suy ra từ test sandbox.
- [ ] `APPLE_APP_APPLE_ID` phải **trùng** `submit.production.ios.ascAppId` trong `mobile/eas.json`. Lệch nhau là lỗi im lặng: build submit bình thường, mọi JWS production fail.
- [ ] Mở egress HTTPS tới OCSP responder của Apple; thiếu là mọi verify cold-cache trả 502.

Nợ còn lại: **App Store Server Notifications V2** để đối soát refund/renew/grace. Phase 1 chỉ đọc snapshot lúc mua — subscription bị refund sau đó chỉ phát hiện khi qua `expiresDate` (Android hiện cũng vậy, không phải hồi quy).

### D1. Ba lớp test không cần thiết bị

| Lớp | Làm được gì | Không làm được gì |
|---|---|---|
| **1. StoreKit Testing trong Xcode** (file `.storekit` cục bộ, chạy Simulator) | Toàn bộ state machine: mua, restore, upgrade/downgrade, refund, offer code, **billing retry + grace period**, **interrupted purchase**, tua nhanh renewal, ép lỗi StoreKit, test tăng giá | Receipt/JWS do **Xcode ký**, không phải App Store → **server không verify được** |
| **2. iOS App on Mac** — chạy development-signed từ Xcode thẳng trên MacBook M5 | Apple ký thật → JWS thật, ASSN v2 thật; **đăng nhập được Sandbox Apple Account** qua App Store → Settings; không cần upload | Chưa được Apple tài liệu hoá end-to-end → phải tự validate |
| **3. TestFlight trên Mac** (bật cho từng tester group trong ASC) | Xác nhận lại end-to-end với bản build thật đã upload | Dùng Apple ID thật của anh, không phải sandbox → không có các nút điều khiển sandbox |

⛔ **Simulator KHÔNG dùng được Sandbox Apple Account.** Kỹ sư Apple DTS xác nhận tháng 3/2026: *"To test in the sandbox environment, you need a physical device."* Đừng mất thời gian thử.

**Bẫy vận hành lớn nhất của lớp 1:** file `.storekit` gắn ở **scheme** của Xcode (Product → Scheme → Edit Scheme → Run → Options → StoreKit Configuration). `npx expo run:ios` **không** áp option đó khi launch qua simctl — phải mở `ios/*.xcworkspace` và bấm Run trong Xcode. Và vì `ios/` bị gitignore + `expo prebuild --clean` xoá sạch, scheme này chỉ tồn tại cục bộ → viết script tái tạo hoặc ghi lại các bước.

Vì receipt lớp 1 do Xcode ký, cần một **cờ dev-only ở server** (ví dụ `KIDO_IAP_ALLOW_LOCAL_STOREKIT=1`, **không bao giờ bật trên `api.dodokids.vn`**) để chạy hết luồng paywall → entitlement trên Simulator.

Điều khiển sandbox (renewal rate 3/5/30/60 phút, interrupted purchase, clear purchase history, đổi storefront) đều **set được từ App Store Connect, không cần thiết bị** — storefront thậm chí **chỉ** set được ở ASC. Chỉ hai thao tác cần máy iOS ký sau đó: kích hoạt việc đổi storefront, và thoát trạng thái interrupted purchase.

### D2. ASSN v2 — kiểm được không cần mua gì

Cấu hình sandbox Server Notifications URL trong ASC (cần endpoint HTTPS public có cert hợp lệ — chạy local thì phải mở tunnel), rồi `POST https://api.storekit-sandbox.apple.com/inApps/v1/notifications/test` ký bằng ASC API key; lấy `testNotificationToken` rồi gọi Get Test Notification Status để xem kết quả giao.

### D3. Vẫn nên mua một chiếc iPhone rẻ trước khi submit

Guideline 2.1(a) ghi thẳng: *"Make sure your app has been tested on-device for bugs and stability before you submit it."* Những thứ không đường nào trên Mac phủ được: parental gate bằng ngón tay thật, Ask to Buy / Family Sharing (rất liên quan với app gia đình), deep link "Manage Subscription", và đơn giản là nhìn app ở kích thước điện thoại thật.

Máy rẻ nhất còn chạy iOS 26: **iPhone 11** hoặc **iPhone SE (gen 2)**. Đừng mua thấp hơn — Xcode 27 beta đã nâng sàn on-device debugging lên **iOS 17+**, nên iPhone 8 sẽ hết dùng được trong một chu kỳ.

Cloud device farm **không cứu được**: AWS Device Farm re-sign làm mất luôn entitlement In-App Purchase; sandbox còn đòi build development-signed + Developer Mode bật trên đúng máy đó, và *"You can only use a Sandbox Apple Account to test apps within your own developer account."*

⚠️ **Đừng suy ra ngày hết hạn từ timestamp test.** TestFlight ép mọi subscription renew mỗi 24h, tối đa 6 lần; trang sandbox của Apple lại nói tốc độ renew phụ thuộc độ dài gói (preset 3/5/30/60 phút) và renew tới 12 lần. Apple không hoà giải hai luật này. Số học 52 tuần của `kido_annual_999k` phải test bằng **payload JWS tổng hợp**, không phải bằng quan sát.

---

## E. Screenshot — chụp trên Simulator, đã đo trên máy anh

| Simulator (Xcode 26.6) | Ảnh xuất ra | App Store |
|---|---|---|
| iPhone 17 Pro Max | **1320 × 2868** | đúng cỡ 6.9" |
| iPad Pro 13-inch (M5) | **2064 × 2752** | đúng cỡ 13" — **bắt buộc** vì `supportsTablet: true` |

Xcode ghi rõ ảnh chụp từ simulated device dùng được cho *"sharing, review, or App Store submission"*. Chỉ cần upload bộ **cỡ lớn nhất**, Apple tự scale xuống cho máy nhỏ hơn.

⚠️ **Bẫy đã kiểm chứng:** `xcrun simctl io … screenshot` ghi ra PNG **có alpha channel**, mà spec Apple nói ảnh *"can't include alpha channels or transparencies"*. Và `sips -s format png` **không** gỡ được alpha. Cách chắc chắn là xuất JPEG:

```bash
xcrun simctl boot "iPhone 17 Pro Max"; xcrun simctl bootstatus "iPhone 17 Pro Max" -b
xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 --cellularBars 4
xcrun simctl io booted screenshot --type=jpeg ~/Desktop/asc/iphone-01.jpg
```

Đừng dùng `--mask=black` (bôi đen 4 góc bo, trông như lỗi render) và tuyệt đối tránh `--mask=alpha` (ghi transparency thật → vi phạm spec).

Nội dung nên chụp: onboarding → một bài học → tiến độ/phần thưởng → parent dashboard → paywall.

Metadata còn lại: description phải nêu **giá + chu kỳ + tự động gia hạn + cách huỷ** (huỷ qua Apple, refund do Apple xử lý — không bê nguyên wording Google Play); Category `Education`; Privacy Policy URL; EULA (bắt buộc với subscription); App Privacy nutrition label; App Review Notes ghi **PIN parental gate** + đường đi tới paywall.

---

## F. Blocker còn lại trước Submit

1. **D0 — luồng verify iOS gửi JWS vào `verifyReceipt`.** Chặn cứng, sửa trên Mac được, có unit test.
2. **Xoá dữ liệu trong app** (Guideline 5.1.1(v)) — chưa có, mà Privacy Policy đang mô tả là có.
3. **Binary disclosure ở paywall** (Guideline **3.1.2** — nguyên nhân reject phổ biến nhất với app subscription): tên gói, độ dài kỳ, nội dung/dịch vụ mỗi kỳ, giá mỗi kỳ, **link chức năng tới Terms of Use và Privacy Policy**, ngay cạnh nút mua. Kiểm được 100% trên MacBook.
4. **Restore Purchases** phải nhìn thấy được (3.1.1) và restore đúng gói (xem D0).
5. **Marketing claim**: `Tiết kiệm 40%`, `Hoàn tiền trong 7 ngày đầu` — refund do Apple quyết, không phải anh. Đối chiếu `KIDO_MARKETING_CLAIMS.md`.
6. **Kids Category**: parental gate là **bắt buộc nếu opt vào Kids Category**. Không opt vào thì vẫn bị ràng bởi **5.1.4** (không third-party analytics/ads trong app hướng trẻ em) và 3.1.1/3.1.2.
7. **Age rating questionnaire mới** (bắt buộc từ 31/01/2026).
8. **Apple Silicon Mac Availability mặc định BẬT** — nếu không test bản chạy trên Mac thì vào Pricing and Availability tắt đi, đừng để nó tự lên Mac App Store.

## G. Việc làm được ngay hôm nay

1. Bật 2FA + trusted phone + rescue email cho Apple Account `support@dodokids.vn` (§A bước 2–5).
2. Enroll Individual, thanh toán bằng thẻ đứng tên anh.
3. Sửa `app.json` (`supportsTablet: true`, `usesNonExemptEncryption`, `deploymentTarget`) và `eas.json` (§C).
4. Sửa blocker D0 — không phụ thuộc Apple, không phụ thuộc thiết bị.
5. Đặt mua một iPhone 11 / SE gen 2 cũ.

## Nguồn

- [Apple Developer Program — Enroll](https://developer.apple.com/programs/enroll/) · [What you need to enroll](https://developer.apple.com/help/account/membership/program-enrollment/)
- [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [SDK minimum requirements (Xcode 26 từ 28/04/2026)](https://developer.apple.com/news/upcoming-requirements/?id=02212025a)
- [EU DSA trader requirements](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)
- [TN3186 — Testing in-app purchases](https://developer.apple.com/documentation/technotes/tn3186-testing-in-app-purchases)
- [App Store Server Library](https://developer.apple.com/documentation/appstoreserverapi) · [App Store Server Notifications V2](https://developer.apple.com/documentation/appstoreservernotifications)
- [Setting up StoreKit Testing in Xcode](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [Expo — Submit to the Apple App Store](https://docs.expo.dev/submit/ios/)
