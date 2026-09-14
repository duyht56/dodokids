# Kế hoạch: Bước đồng ý của ba mẹ trước khi tạo hồ sơ bé

- Ngày soạn: 14/09/2026.
- Trạng thái: bản nháp cho chủ sản phẩm duyệt. Chưa sửa dòng code nào.
- Phạm vi: `kido-server`, `mobile`, `landing`, docs, OpenSpec.
- Mục tiêu: ship làm bản cập nhật đầu tiên trong đợt closed test Google Play.

---

## 0. Tóm tắt quyết định

1. **Vị trí bước đồng ý.** Chèn **một màn hình mới `ParentConsent`** vào giữa slide giới thiệu và `SetupScreen`.
   - Tên, tuổi, avatar của bé chỉ được nhập và gửi lên sau khi server đã ghi nhận đồng ý.
2. **Màn hình gồm 2 bước.**
   - (A) Câu hỏi người lớn: phép cộng viết bằng chữ, **khó hơn** cổng PIN hiện tại, khoá 30 giây sau 3 lần sai liên tiếp.
   - (B) Thông báo ngắn và ô xác nhận **không đánh sẵn**, rồi nút "Đồng ý và tiếp tục".
   - Nếu ba mẹ "Không đồng ý", app không gửi gì lên server.
3. **Nơi ghi nhận.** Đồng ý được lưu trên **Household**, qua endpoint mới `POST /anonymous-sessions/parental-consent`.
   - **Không thêm field** vào body của bất kỳ request cũ nào.
   - Server trả trạng thái đồng ý kèm theo `register`, `recover` và `status`.
4. **Tương thích bản cũ.** Build mới gửi header `X-Kido-Client-Features: parental-consent-v1`.
   - `POST /children` chỉ từ chối (409) khi **có header đó** mà household chưa đồng ý.
   - Build cũ không gửi header nên vẫn chạy như trước.
   - Cờ env `PARENTAL_CONSENT_ENFORCE_ALL` dùng để bật cưỡng chế cho mọi client khi đã hết bản cũ.
5. **Household cũ trên bản mới.** App hiện một cổng đồng ý **một lần**; lựa chọn thay thế là "Xoá dữ liệu gia đình".
   - Không tự điền (backfill) "đã đồng ý" cho household cũ: im lặng không phải là đồng ý.
6. **Rút lại đồng ý** = "Xoá dữ liệu gia đình" như hiện có. Bản ghi đồng ý bị xoá cùng household.
7. **Thứ tự rollout:** server → trang privacy → build mobile → bật cờ cưỡng chế trước Production.
8. **Công sức:** khoảng 4 ngày công (3,5 nếu QA chạy song song). Bản cắt tối thiểu khoảng 3 ngày.

---

## 1. Chấm điểm 3 thiết kế

Thang điểm 1–5, cao là tốt. Trọng số theo mục tiêu của đợt này: pháp lý là lý do làm; tương thích ngược và "vài ngày" là ràng buộc cứng.

| Tiêu chí (trọng số) | A — UX | B — Pháp lý | C — Kỹ thuật |
|---|---|---|---|
| Đủ về pháp lý (25%) | 3,5 | **5** | 3,5 |
| Ba mẹ đi qua nhanh (15%) | **5** | 2,5 | 4 |
| Bé không tự qua được (20%) | **4,5** | 3 | 3 |
| Tương thích ngược (20%) | 4 | **5** | 4,5 |
| Rủi ro và công sức (20%) | 3,5 | 2,5 | **4,5** |
| **Tổng có trọng số** | **4,0** | 3,7 | 3,9 |

**A — UX (thắng, sát nút C)**
- Điểm mạnh:
  - Luồng chi tiết nhất: bỏ qua bước nếu đã đồng ý, chế độ "reconsent" cho household cũ, dòng đồng ý trong Cài đặt, bố cục iPad.
  - Nhanh nhất, khoảng 20 giây.
  - Chống bé tốt nhất: phép tính mạnh hơn, có khoá chờ, link chính sách nằm sau cổng.
  - Phía mobile so phiên bản đồng ý, nên không bao giờ hỏi lại một phiên bản mà app không hiển thị được. Không có vòng lặp.
- Điểm yếu:
  - Nội dung thông báo thiếu "ai xử lý, lưu ở đâu, lưu bao lâu".
  - Câu "đồng ý với Chính sách bảo mật" là đồng ý gộp, không cụ thể theo mục đích.
  - Cơ chế chặn theo phiên bản dựa vào **field mới trong body `POST /children`**. Nếu server bị rollback, `forbidNonWhitelisted` (`kido-server/src/main.ts:36-39`) sẽ trả 400 cho mọi lần tạo hồ sơ từ build mới.

**B — Pháp lý**
- Điểm mạnh:
  - Thông báo đủ nhất (loại dữ liệu, mục đích, bên xử lý, nơi lưu, thời hạn, quyền).
  - Ô xác nhận không đánh sẵn; bản ghi có phiên bản nội dung, mục đích, vai trò.
  - Chặn theo **header**: ValidationPipe không kiểm header, nên an toàn cả khi server bị rollback.
- Điểm yếu:
  - Màn dài, ba mẹ mất 45–60 giây.
  - Ghi thêm appVersion/osVersion/clientTimestamp/hash: thêm dữ liệu phải khai báo và rủi ro lệch văn bản giữa mobile và server.
  - Chèn §5 mới vào privacy rồi đánh số lại, đụng bản nháp privacy của tính năng phỏng vấn (cũng chèn §5).
  - Giữ nguyên phép tính yếu (đáp án 5–16) và không có khoá chờ.

**C — Kỹ thuật**
- Điểm mạnh:
  - Ít rủi ro nhất: endpoint riêng, **không đổi body request cũ**, gate `=== null` nghiêm ngặt (undefined không bao giờ chặn).
  - Có script kiểm hợp đồng; test rõ ràng.
- Điểm yếu:
  - Cưỡng chế chỉ bằng cờ env "tất cả hoặc không có gì". Trong closed test, server không chặn gì cho build mới.
  - Phép tính yếu; thông báo thiếu bên xử lý, nơi lưu, thời hạn.

**Phần ghép vào A**
- Từ C:
  - Không thêm field vào body cũ.
  - Client chỉ gửi phiên bản; server tự điền mọi thứ còn lại.
  - `undefined` = không biết, không chặn.
  - Không backfill.
  - Script `verify-parental-consent-contracts.cjs`.
- Từ B:
  - Chặn theo header `X-Kido-Client-Features`.
  - Tách `noticeVersion` (văn bản trong app) và `policyVersion` (ngày trang privacy).
  - Checkbox với câu tự khai vai trò và đồng ý **cụ thể theo mục đích**.
  - Nội dung ai xử lý, lưu ở đâu, lưu bao lâu.
  - Lưu văn bản từng phiên bản trong repo để in hoặc sao chép được.
  - Nêu rõ Luật 91 / NĐ 356 trên trang privacy.
  - Thêm một dòng vào danh sách xoá trên trang data-deletion.

**Không lấy**
- Hash văn bản (B). Server chỉ băm văn bản do chính nó giữ, nên không chứng minh gì hơn "phiên bản X ↔ văn bản lưu trong git", mà lại thêm nguy cơ lệch.
- appVersion/osVersion/clientTimestamp/platform (A/B). Chúng không cần để chứng minh, và mâu thuẫn với nguyên tắc tối thiểu hoá.
- Đánh số lại privacy (B).

---

## 2. Luồng

### 2.1 Cài mới trên build mới

```text
Mở app ─► bootstrapSession() (như hiện nay: household rỗng, chỉ có deviceId ngẫu nhiên + hash khoá)
      ─► Slide giới thiệu (Onboarding)
            "Bắt đầu" / "Bỏ qua"  ──►  ParentConsent   (trước đây: ──► Setup)
            "Khôi phục hồ sơ gia đình" ──► Recovery (không đổi)
      ─► ParentConsent
            [Bong bóng Đô Đô: "Bé gọi ba mẹ tới giúp Đô Đô nha!"]
            A. Xác nhận người lớn (phép cộng bằng chữ, 3 lần sai → chờ 30 giây)
                  └ đúng ─► B
            B. Thông báo + ô xác nhận (không đánh sẵn)
                  ├ "Đồng ý và tiếp tục" ─► await bootstrapSession()
                  │                          ─► POST /anonymous-sessions/parental-consent { noticeVersion }
                  │                          ─► 2xx: session.parentalConsent = {…} ─► replace('Setup')
                  │                          └► lỗi mạng/429: báo lỗi tại chỗ, ở lại màn, cho thử lại
                  └ "Không đồng ý" ─► C
            C. "Ba mẹ chưa đồng ý" — không gửi gì
                  ├ "Xem lại" ─► B
                  └ "Về trang giới thiệu" ─► replace('Onboarding')
      ─► Setup (tên/biệt danh, tuổi, avatar — như cũ)
            completeSetup: await bootstrapSession()
                         ─► nếu chưa có đồng ý hợp lệ trong session ─► replace('ParentConsent')
                         ─► fetchHouseholdChildren() / createChild() (như cũ; header báo "biết consent")
                         ─► 409 parental_consent_required ─► replace('ParentConsent')
      ─► Home. Tạo PIN vẫn ở lần đầu mở Khu vực phụ huynh (không đổi).
```

**Quy tắc bỏ qua bước.** Khi mở `ParentConsent` mà session đã có đồng ý với `noticeVersion` bằng phiên bản hiện hành, app `replace('Setup')` ngay. Trường hợp áp dụng:
- ba mẹ đồng ý xong rồi quay lại slide;
- app bị tắt giữa Setup.

**Nút Back Android và cử chỉ.**
- Màn đăng ký với `gestureEnabled: false`, giống Setup.
- Ở bước A/B, back sẽ `replace('Onboarding')` và bước A phải làm lại.
- Ở bước C, back quay về B.

**Vì sao đặt ở đây**
- **Trước slide:** chưa có ngữ cảnh, mà slide 1 lại chào bé.
- **Trong Setup sau khi nhập tên:** tên đã bị thu trước khi có đồng ý.
- **Gộp vào lần tạo PIN đầu tiên:** quá muộn, vì hồ sơ đã tồn tại; lại quá dài (PIN + nhập lại + mã khôi phục).
- **Đặt giữa slide và Setup** là đúng lúc cần, và người lớn thường đang cầm máy vì bé 4–6 tuổi không tự gõ tên được.

### 2.2 Household cũ (tạo bởi build cũ) mở trên build mới — cổng "reconsent"

```text
Mở app ─► session ready ─► App.tsx đối chiếu hồ sơ bé như hiện nay
      ─► nếu isOnboarded && trạng thái đồng ý là 'missing' hoặc 'outdated'
            ─► render <ParentConsentScreen mode="reconsent" /> (ngoài navigator, như SessionRecoveryScreen)
            A. Xác nhận người lớn ─► B. Thông báo (lời dẫn riêng cho household cũ) ─► đồng ý ─► vào Home
            "Không đồng ý" ─► C: "Xem lại" | "Xoá dữ liệu gia đình" (deleteHouseholdData() hiện có, không cần PIN
                                  — cùng tiền lệ "quên PIN")
```

- Không có "Quay lại": bé phải chờ ba mẹ. Nút Back Android bị chặn.
- Trạng thái `undefined` (không biết, ví dụ server cũ không trả field) **không bao giờ** kích hoạt cổng.

### 2.3 Các nhánh khác

| Tình huống | Hành vi |
|---|---|
| Build cũ chưa cập nhật | Chạy y như cũ: không gọi endpoint mới, bỏ qua field thừa trong response. `POST /children` không có header vẫn được nhận (khi cờ env tắt). |
| Khôi phục household **đã đồng ý** (thiết bị 2, cài lại iOS còn keychain) | `recover`/`status` trả đồng ý nên không hỏi lại. |
| Khôi phục household **cũ chưa đồng ý** | Cổng reconsent hiện ngay sau khi khôi phục. |
| Cài lại Android (mất SecureStore) | Tạo household mới, rồi slide → đồng ý → Setup. Household cũ bị bỏ rơi (nợ cũ "chưa có purge"). |
| Tắt app sau khi đồng ý, trước khi tạo hồ sơ | Đồng ý đã nằm trên server. Mở lại: slide → `ParentConsent` tự chuyển sang Setup. |
| Đồng ý xong nhưng chọn "Khôi phục" | `recover()` đổi credential; household mới (có đồng ý, chưa có bé) bị bỏ, giống ca household rỗng hiện nay. |
| Mất mạng hoặc 429 khi bấm đồng ý | Báo lỗi tại chỗ, không đi tiếp. Mất mạng lúc mở app vẫn dừng ở SessionRecoveryScreen như cũ. |
| Xoá dữ liệu gia đình | Bản ghi đồng ý bị xoá cùng household (`anonymous-sessions.service.ts:211`). Household mới phải đồng ý lại từ đầu. |
| Bé tự cầm máy | Bị chặn ở bước A. Phép tính đổi mỗi lần sai; 3 lần sai thì khoá 30 giây; link chính sách chỉ hiện sau A. |
| Tắt hẳn app khi đang khoá 30 giây | Khoá chỉ nằm trong bộ nhớ, nên mở lại app là hết khoá. Chấp nhận có chủ ý: không lưu gì mới trên máy, và rào chính là phép cộng viết bằng chữ với đáp án 18–28. QA và khai báo Families mô tả đúng như vậy. |

### 2.4 Rút lại đồng ý

- Cài đặt → Dữ liệu gia đình → Xoá dữ liệu gia đình (`SettingsScreen.tsx:479-482`).
- Hoặc qua đường "Quên PIN" (`ParentGateModal.tsx:394-404`).
- Hoặc email `support@dodokids.vn`.
- Dịch vụ chỉ có một mục đích nên rút lại = xoá household. **Không cần endpoint mới.**

### 2.5 Thời gian cho ba mẹ (mục tiêu ≤ 40 giây, đo bằng đồng hồ với 3–5 tester)

- Bước A: khoảng 6–8 giây.
- Bước B: đọc lướt khoảng 110 chữ (15–20 giây), tick và bấm (khoảng 3 giây), mạng khoảng 1 giây.
- Tổng khoảng 25–30 giây. Setup không tính.
- **Không thêm telemetry đo thời gian**: trang privacy cam kết không có analytics.

---

## 3. Copy tiếng Việt cuối cùng

**Quy tắc giọng**
- Bong bóng Đô Đô theo `docs/KIDO_DODO_PERSONA.md` §1–2: xưng "Đô Đô", gọi "bé".
- Mọi chữ còn lại nói với phụ huynh bằng giọng "Dodokids" trung tính (§3): gọi "ba mẹ", nói về trẻ là "bé".
- Không thêm clip âm thanh mới, để tránh kéo theo một batch audio (luật one-batch).

### 3.1 Bong bóng Đô Đô (cả hai chế độ)

> Bé gọi ba mẹ tới giúp Đô Đô nha!

### 3.2 Bước A — Xác nhận người lớn

| Vị trí | Chữ |
|---|---|
| Nhãn nhỏ | DÀNH CHO BA MẸ |
| Tiêu đề | Xác nhận người lớn |
| Mô tả | Trước khi tạo hồ sơ cho bé, ba mẹ nhập kết quả phép tính: |
| Đề (ví dụ) | mười bốn cộng bảy |
| Ô nhập | placeholder "?"; a11y "Nhập kết quả phép tính" |
| Sai | Chưa đúng. Ba mẹ thử phép tính mới nhé. |
| Đang khoá | Ba mẹ thử lại sau {n} giây nhé. |
| Nút | Tiếp tục · Quay lại (chỉ lần đầu) |

### 3.3 Bước B — Đồng ý (lần đầu)

| Vị trí | Chữ |
|---|---|
| Nhãn nhỏ | DÀNH CHO BA MẸ |
| Tiêu đề | Ba mẹ đồng ý để Dodokids tạo hồ sơ cho bé? |
| Lời dẫn | Vì bé còn nhỏ, Dodokids cần ba mẹ hoặc người giám hộ đồng ý trước khi lưu thông tin của bé. |
| Gạch đầu dòng 1 (icon `users`) | **Lưu gì:** tên gọi hoặc biệt danh, tuổi, hình đại diện và tiến độ học của bé. |
| Gạch đầu dòng 2 (icon `target`) | **Để làm gì:** đưa bài học hợp tuổi, lưu tiến độ và làm báo cáo cho ba mẹ. Không quảng cáo, không bán dữ liệu. |
| Gạch đầu dòng 3 (icon `lock`) | **Ai lưu, ở đâu:** Dodokids (do Hoàng Tư Duy vận hành), trên máy chủ đặt tại Việt Nam, cho tới khi ba mẹ xoá. |
| Gạch đầu dòng 4 (icon `settings`) | **Quyền của ba mẹ:** xem, sửa hoặc xoá dữ liệu bất cứ lúc nào trong Khu vực phụ huynh → Cài đặt. |
| Link | Đọc Chính sách bảo mật đầy đủ (a11y: "Mở Chính sách bảo mật") |
| Ô xác nhận (không đánh sẵn) | Tôi là cha, mẹ hoặc người giám hộ của bé và đồng ý để Dodokids xử lý các thông tin trên cho việc học của bé. |
| Nút chính (mờ tới khi tick) | Đồng ý và tiếp tục |
| Nút phụ | Không đồng ý |
| Ghi chú nhỏ | Dodokids ghi lại thời điểm ba mẹ đồng ý và phiên bản nội dung này để làm bằng chứng. Ba mẹ rút lại đồng ý bằng cách xoá dữ liệu gia đình. |
| Lỗi lưu | Chưa lưu được. Ba mẹ kiểm tra kết nối rồi thử lại nhé. |

### 3.4 Bước B — chế độ household cũ (reconsent)

| Vị trí | Chữ |
|---|---|
| Tiêu đề | Ba mẹ xác nhận giúp Dodokids |
| Lời dẫn | Hồ sơ của bé được tạo trước khi Dodokids thêm bước xin phép ba mẹ. Ba mẹ xem và xác nhận một lần để bé học tiếp. |
| Gạch đầu dòng, ô xác nhận, nút | Như bản lần đầu |

### 3.5 Bước C — Chưa đồng ý

| Chế độ | Tiêu đề | Nội dung | Nút |
|---|---|---|---|
| Lần đầu | Ba mẹ chưa đồng ý | Dodokids chưa lưu thông tin nào của bé. Khi sẵn sàng, ba mẹ quay lại bước này nhé. | Xem lại · Về trang giới thiệu |
| Household cũ | Ba mẹ chưa đồng ý | Chưa có đồng ý của ba mẹ, Dodokids không thể tiếp tục lưu dữ liệu của bé. Ba mẹ có thể xem lại, hoặc xoá dữ liệu gia đình. Gói đăng ký (nếu có) không bị huỷ theo, ba mẹ cần huỷ riêng trong cửa hàng ứng dụng. | Xem lại · Xoá dữ liệu gia đình |

Hộp thoại xoá dùng lại chuỗi hiện có (`ParentGateModal.tsx:161-178`):
- "Xoá vĩnh viễn?"
- "Thao tác này không thể hoàn tác."
- Nút "Huỷ" / "Xoá vĩnh viễn".
- Khi lỗi: "Chưa xoá được".

### 3.6 Cài đặt → Dữ liệu gia đình (dòng chỉ đọc, đặt trên "Xoá dữ liệu gia đình")

- Dòng: **Ba mẹ đã đồng ý ngày {dd/mm/yyyy}**
- Chú thích: Muốn rút lại đồng ý, ba mẹ xoá dữ liệu gia đình.

### 3.7 Setup bước 1 (giảm dữ liệu)

- `SetupScreen.tsx:295`, gợi ý: đổi "Nhập tên bé để Đô Đô gọi tên khi chào mỗi ngày nhé!" thành **"Ba mẹ có thể nhập biệt danh. Đô Đô sẽ gọi tên này khi chào bé mỗi ngày!"**
- `SetupScreen.tsx:265`, placeholder: đổi "Minh Khôi" thành **"Bi, Na, Tôm…"**

---

## 4. Ghi nhận gì

**Nơi lưu:** subdocument trên Household (`kido-server/src/common/schemas/household.schema.ts`), khoá bằng `householdId` ngẫu nhiên sẵn có.

```ts
parentalConsent: {
  noticeVersion: '2026-09-15',            // phiên bản VĂN BẢN trong app; tăng = hỏi lại
  policyVersion: '2026-09-15',            // ngày "Cập nhật lần cuối" của /privacy khi đó (server tự điền từ bảng)
  grantedAt: Date,                         // giờ máy chủ, UTC — bằng chứng thời điểm
  method: 'in_app_adult_check_checkbox_v1',// câu hỏi người lớn + ô xác nhận không đánh sẵn
  declaredRole: 'parent_or_guardian',      // tự khai vai trò
  purposes: ['learning_service'],          // một mục đích
  deviceId: '<uuid ngẫu nhiên do app tạo>' // lấy từ DeviceSessionGuard, KHÔNG nhận từ body
} | null                                   // mặc định null
parentalConsentHistory: [ …tối đa 10 bản ghi cũ bị thay thế khi noticeVersion đổi… ]
```

**Không ghi**
- Địa chỉ IP. Privacy §3 cam kết IP chỉ dùng khoảng 1 phút để chặn truy cập dồn dập.
- User agent, model máy, phiên bản app hoặc hệ điều hành, platform.
- Tên, email, số điện thoại của ba mẹ; câu hỏi và đáp án.
- Lần từ chối, lần khoá chờ, thời gian thao tác (vì không có analytics).
- Không lưu bản sao nào trên Child, và không lưu gì mới vào AsyncStorage. Mobile chỉ giữ tóm tắt trong session ở bộ nhớ, làm mới mỗi lần mở app.

**Ngữ nghĩa**
- Gửi lại cùng `noticeVersion` thì trả bản ghi cũ và **giữ nguyên `grantedAt` gốc** (idempotent, giữ bằng chứng).
- `noticeVersion` mới được chấp nhận thì bản ghi cũ bị đẩy vào history và bản mới được đặt thay.
- `grantedAt` lấy giờ máy chủ; client không gửi thời gian.

**Vòng đời**
- Trả về cho thiết bị của household (register/status/recover), dạng tóm tắt `{ noticeVersion, grantedAt }`.
- Hiện trong Cài đặt.
- Xoá cùng household bằng hard delete hiện có.

**Văn bản gốc từng phiên bản**
- Lưu trong repo ở `docs/KIDO_PARENTAL_CONSENT_NOTICE.md` (mục "2026-09-15", đúng từng chữ như trên màn hình) và tóm lược trên `/privacy`.
- Cách lưu này đáp ứng yêu cầu "in hoặc sao chép được" (bên pháp lý dẫn Luật 91 Điều 9 k3; cần luật sư xác nhận).

---

## 5. Thay đổi API và schema (kido-server)

Mọi thay đổi đều cộng thêm. Không cần migration: household hiện có đọc ra `null`.

### 5.1 Schema — `src/common/schemas/household.schema.ts`

- Thêm class `HouseholdParentalConsent` (`@Schema({ _id: false })`) với các field ở mục 4.
- Trên `Household` thêm hai field:
  - `@Prop({ type: HouseholdParentalConsentSchema, default: null }) parentalConsent`
  - `@Prop({ type: [HouseholdParentalConsentSchema], default: [] }) parentalConsentHistory`
- **Không** đặt `select: false`: đây không phải bí mật. `status()` đọc qua `SECRET_SELECT` dạng `+…`, nên các field thường vẫn được trả về.
- Không cần index mới, vì chỉ đọc theo `householdId`.

### 5.2 Hằng số — mới: `src/modules/anonymous-sessions/parental-consent.constants.ts`

```ts
export const PARENTAL_CONSENT_NOTICES: Record<string, { policyVersion: string }> = {
  '2026-09-15': { policyVersion: '2026-09-15' }, // đặt đúng ngày publish /privacy mới
};
export const PARENTAL_CONSENT_METHOD = 'in_app_adult_check_checkbox_v1';
export const PARENTAL_CONSENT_CLIENT_FEATURE = 'parental-consent-v1';
export function clientDeclaresFeature(header: string | undefined, feature: string) {
  return (header ?? '').split(',').map((s) => s.trim()).includes(feature);
}
```

Dùng bảng, không dùng một giá trị đơn, để build mang phiên bản cũ vẫn hợp lệ cho tới khi cố ý gỡ.

### 5.3 DTO — mới: `dto/record-parental-consent.dto.ts`

```ts
export class RecordParentalConsentDto {
  @IsString() @IsIn(Object.keys(PARENTAL_CONSENT_NOTICES)) noticeVersion: string;
}
```

- Client **chỉ** gửi `noticeVersion`.
- method, vai trò, mục đích, policyVersion, deviceId và thời gian đều do server điền.

### 5.4 Endpoint mới

```text
POST /anonymous-sessions/parental-consent
Auth: Bearer thiết bị (DeviceSessionGuard) · @RateLimit(10, 60)
Body: { "noticeVersion": "2026-09-15" }
2xx:  { "parentalConsent": { "noticeVersion": "2026-09-15", "grantedAt": "2026-09-15T03:12:45.000Z" } }
400:  noticeVersion không được chấp nhận / có field thừa (forbidNonWhitelisted)
401:  { "error": "anonymous_session_invalid" }
409:  { "error": "household_deleted" }   (household đang/đã bị tombstone)
429:  rate limit
```

**Service `recordParentalConsent(session, dto)`**
1. `findOne({ householdId }).select('deletedAt parentalConsent')`. Nếu có `deletedAt`, trả 409 `household_deleted`.
2. Nếu bản hiện có đã cùng `noticeVersion`: trả tóm tắt bản hiện có, không ghi gì.
3. Nếu khác: gọi `updateOne({ householdId, deletedAt: null }, { $set: { parentalConsent: record }, ...(current ? { $push: { parentalConsentHistory: { $each: [current], $slice: -10 } } } : {}) })`.
   - Nếu `matchedCount === 0`, trả 409 `household_deleted` (phòng trường hợp xoá chạy song song).

### 5.5 Trả trạng thái cho client

- `status()` (`anonymous-sessions.service.ts:134-147`) thêm `parentalConsent: { noticeVersion, grantedAt } | null`.
- `SessionResponse` (:53-59) và `sessionResponse()` (:393-407) thêm cùng field:
  - `register()` cho household mới trả `null`.
  - `resumeExisting()` và `recover()` lấy từ household đã load sẵn.
- Build cũ bỏ qua field này: `sessionFrom` chỉ chép field có tên, còn `register`/`recover` lưu cả `response.data` vào bộ nhớ, vô hại.

### 5.6 Cưỡng chế ở `POST /children`

- `children.controller.ts`: đọc `@Headers('x-kido-client-features')` và truyền `{ consentAware }` vào service.
- `children.service.ts:31-36`: thay truy vấn `exists(...)` tombstone bằng `findOne({ householdId }).select('deletedAt parentalConsent').lean()`.
- **Không đổi `CreateChildDto`.**

| Header `parental-consent-v1` | Household đã đồng ý | `PARENTAL_CONSENT_ENFORCE_ALL` | Kết quả |
|---|---|---|---|
| (bất kỳ) | (bất kỳ) — household tombstone | (bất kỳ) | 409 `household_deleted` (giữ như cũ, ưu tiên trước) |
| Có | Có | (bất kỳ) | Tạo hồ sơ |
| Có | Không | (bất kỳ) | **409 `parental_consent_required`**, không `save` |
| Không (build cũ) | Không | `false` (mặc định) | Tạo hồ sơ + `logger.warn('child created without parental consent (legacy client) household=<id>')` — **không ghi tên bé** |
| Không | Không | `true` | 409 `parental_consent_required` |
| Không | Có | (bất kỳ) | Tạo hồ sơ |

- Cờ env được đọc một lần khi khởi tạo, cùng kiểu `process.env.X` như `publish/asset-url.checker.ts`.
- Trên VPS, compose nạp `env_file: .env`, nên chỉ cần thêm dòng vào `.env` rồi redeploy.
- Mobile an toàn với 409: chỉ lỗi 401 `anonymous_session_invalid` mới xoá credential (`mobile/src/services/api.ts`, được `verify-anonymous-session-contracts.cjs` kiểm).

### 5.7 Không đổi

- `deleteHousehold`: bản ghi đồng ý nằm trong document, nên bị xoá ở dòng :211.
- `PATCH /parent/:childId/profile`: sửa tên/tuổi vẫn nằm trong mục đích đã đồng ý.
- `docs/kido-activity-schema.ts`: không phải hợp đồng nội dung.

---

## 6. Thay đổi mobile và danh sách file

Chỉ JS/TS: không thêm native module, quyền hay config plugin. App không có `expo-updates`, nên **vẫn phải build và nộp store**.

| File | Loại | Thay đổi |
|---|---|---|
| `src/screens/auth/ParentConsentScreen.tsx` | Mới | Props `mode: 'first_run' \| 'reconsent'`, `navigation` tuỳ chọn (mẫu `Partial<…>` như `SessionRecoveryScreen.tsx:18`). State `check → consent → declined`. Checkbox `useState(false)`. Chống bấm đúp bằng ref (mẫu `SetupScreen.tsx:76`). Khi đồng ý: `await bootstrapSession(); await recordParentalConsent(PARENTAL_CONSENT_NOTICE_VERSION)`, rồi `replace('Setup')` (lần đầu) hoặc để store re-render App (reconsent). Quy tắc bỏ qua khi đã đồng ý. Link `Linking.openURL(PRIVACY_URL)` chỉ hiện ở bước B. Reconsent: nút xoá dùng `deleteHouseholdData()`. Bố cục: `SafeAreaView` → `KeyboardAvoidingView behavior="padding"` → `ScrollView keyboardShouldPersistTaps="handled"`; iPad dùng `ContentFrame measure="form"` (560). Chạm ≥ 44pt; tiêu đề `accessibilityRole="header"`; lỗi đọc qua live region. Icon có sẵn: `users`, `target`, `lock`, `settings`, `check` (không dùng emoji làm icon). |
| `src/components/parentGate/adultChallenge.ts` | Mới | Chuyển `VN_NUMBER_WORDS` (mở rộng 0–19: "mười một"… "mười lăm"… "mười chín") và `makeAdultChallenge(preset)` ra đây. Hai preset: `'standard'` (3..8 + 2..8, như hôm nay) và `'consent'` (12..19 + 6..9, đáp án 18–28, phần lớn có nhớ). Thêm `spellAdultChallenge()`. |
| `src/components/ParentGateModal.tsx` | Sửa | Chỉ import helper, dùng preset `'standard'`. **Không đổi hành vi**, vì reviewer đã thấy cổng này. |
| `src/constants/legal.ts` | Sửa | `PARENTAL_CONSENT_NOTICE_VERSION = '2026-09-15'` (phải nằm trong bảng của server), `CLIENT_FEATURES = 'parental-consent-v1'`. |
| `src/services/api.ts` | Sửa | Thêm `'X-Kido-Client-Features': CLIENT_FEATURES` vào `headers` mặc định của `create({...})`. Header không chứa bí mật; server cũ bỏ qua. |
| `src/store/anonymousSessionStore.ts` | Sửa | Type `ParentalConsentSummary`. `parentalConsent?: … \| null` trong `AnonymousSession` và `SessionStatusResponse`; `sessionFrom` chép field. Session tạm lúc bootstrap (:164-172) để `undefined` = không biết. Action `recordParentalConsent(noticeVersion)` gọi POST rồi merge vào session (mẫu `setParentPin` :260-279). Helper `parentalConsentState(session): 'unknown' \| 'missing' \| 'outdated' \| 'ok'`: so chuỗi ngày ISO với `PARENTAL_CONSENT_NOTICE_VERSION`, phía mobile nên không có vòng lặp. |
| `src/navigation/types.ts` | Sửa | `ParentConsent: undefined` trong `AuthStackParamList`. |
| `src/navigation/AuthStack.tsx` | Sửa | `<Stack.Screen name="ParentConsent" … options={{ gestureEnabled: false }} />` giữa Onboarding và Setup. |
| `src/screens/auth/OnboardingScreen.tsx` | Sửa | 4 chỗ `replace('Setup')` (:298, :361, :410, :455) đổi thành `replace('ParentConsent')`. Link "Khôi phục" giữ nguyên. |
| `src/screens/auth/SetupScreen.tsx` | Sửa | Sau `await bootstrapSession()` (:133), trước `fetchHouseholdChildren` (:136): nếu trạng thái đồng ý khác `'ok'` thì `replace('ParentConsent')` và return. `catch` (:152) đổi thành `catch (caught)`; nếu `code === 'parental_consent_required'` thì `replace('ParentConsent')`. Sửa gợi ý và placeholder biệt danh (mục 3.7). `createChild` **không đổi chữ ký**. |
| `App.tsx` | Sửa | Sau `if (sessionStatus !== 'ready') return <SessionRecoveryScreen />` (:275-277): nếu `isOnboarded` và trạng thái là `'missing'`/`'outdated'` thì render `<ParentConsentScreen mode="reconsent" />` bọc `GestureHandlerRootView`. Giữ nguyên mọi dòng mà `verify-anonymous-session-contracts.cjs` kiểm. |
| `src/screens/parent/SettingsScreen.tsx` | Sửa | Mục "Dữ liệu gia đình" (:479-485): dòng "Ba mẹ đã đồng ý ngày …" và chú thích, chỉ hiện khi có bản ghi. |
| `scripts/verify-parental-consent-contracts.cjs` | Mới | Xem mục 8. |
| `package.json` | Sửa | Script `"test:parental-consent": "node scripts/verify-parental-consent-contracts.cjs"`. |

`childrenApi.ts` **không đổi** (body vẫn là `{ name, age, avatarId }`).

---

## 7. Diff lời văn trang Privacy (landing, repo đang ở `main` 5195da3, sạch)

Giọng landing dùng "con" (persona §3 cho phép). **Không đánh số lại mục**. Như vậy tránh sửa tham chiếu chéo ("xem mục 8" ở :26), và tránh đụng bản nháp privacy của tính năng phỏng vấn (cũng muốn chèn §5).

### 7.1 `landing/src/app/privacy/page.tsx`

**Tóm tắt nhanh (sau :25)**
```diff
             <>Chúng tôi chỉ thu thập lượng dữ liệu <Term>tối thiểu cần thiết</Term> để bài học và tiến độ của con hoạt động đúng.</>,
+            <>Hồ sơ của con <Term>chỉ được tạo sau khi ba mẹ đồng ý</Term> ngay trong ứng dụng (xem mục 2).</>,
             <>Ba mẹ có thể <Term>tự xoá tài khoản gia đình cùng toàn bộ dữ liệu</Term> ngay trong ứng dụng, bất cứ lúc nào (xem mục 8).</>,
```

**§2 Cam kết với trẻ em (:47-58)**
```diff
         <p>
-          Dodokids được thiết kế cho trẻ trước lớp 1 và tuân theo tinh thần của các quy định
-          bảo vệ trẻ em trực tuyến. Chúng tôi kỳ vọng ứng dụng luôn được sử dụng dưới sự
-          đồng hành của ba mẹ hoặc người giám hộ.
+          Dodokids được thiết kế cho trẻ trước lớp 1. Chúng tôi xử lý dữ liệu của con theo
+          Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP, và kỳ vọng
+          ứng dụng luôn được sử dụng dưới sự đồng hành của ba mẹ hoặc người giám hộ.
         </p>
         <Bullets
           items={[
             "Không quảng cáo, không liên kết mua sắm ngoài ứng dụng, không nội dung dẫn con rời khỏi Dodokids.",
             "Không thu thập dữ liệu của trẻ cho mục đích quảng cáo hay tiếp thị hành vi.",
-            "Các thao tác nhạy cảm (mua gói, đổi thiết lập, xoá dữ liệu) đều nằm sau cổng dành cho phụ huynh: mã PIN, hoặc câu hỏi dành cho người lớn khi ba mẹ quên PIN và chọn xoá dữ liệu.",
+            "Các thao tác nhạy cảm (đồng ý tạo hồ sơ của con, mua gói, đổi thiết lập, xoá dữ liệu) đều nằm sau cổng dành cho phụ huynh: câu hỏi dành cho người lớn ở bước đồng ý và khi ba mẹ quên PIN, hoặc mã PIN.",
           ]}
         />
+        <p>
+          <Term>Sự đồng ý của ba mẹ.</Term> Vì con còn nhỏ, Dodokids chỉ tạo hồ sơ và lưu dữ liệu
+          học tập của con sau khi ba mẹ hoặc người giám hộ đồng ý ngay trong ứng dụng:
+        </p>
+        <Bullets
+          items={[
+            "Ở lần mở đầu tiên, trước khi nhập tên của con, ứng dụng hiện một câu hỏi dành cho người lớn, rồi một màn hình nêu rõ dữ liệu được lưu, mục đích, bên lưu trữ, nơi lưu, thời hạn lưu và quyền của ba mẹ. Ô xác nhận không được đánh dấu sẵn. Nếu ba mẹ không đồng ý, không có thông tin nào của con được gửi đi.",
+            "Chúng tôi lưu bản ghi sự đồng ý: phiên bản nội dung ba mẹ đã xem, phiên bản Chính sách bảo mật, thời điểm đồng ý (theo giờ máy chủ), cách xác nhận và mã thiết bị ngẫu nhiên đã ghi nhận. Bản ghi không chứa tên, email hay số điện thoại của ba mẹ và không lưu địa chỉ IP.",
+            "Ba mẹ rút lại sự đồng ý bất cứ lúc nào bằng cách xoá dữ liệu gia đình trong ứng dụng, hoặc email cho chúng tôi (mục 8). Vì Dodokids chỉ xử lý dữ liệu của con để cung cấp bài học, rút lại sự đồng ý đồng nghĩa với xoá tài khoản gia đình; bản ghi sự đồng ý bị xoá cùng.",
+          ]}
+        />
```

**§3 Thông tin chúng tôi thu thập (:65, :67, sau :68)**
```diff
-            <><Term>Hồ sơ của con:</Term> tên gọi/biệt danh, độ tuổi (4–6) và hình đại diện chọn sẵn, nhập ở bước thiết lập ứng dụng.</>,
+            <><Term>Hồ sơ của con:</Term> tên gọi/biệt danh, độ tuổi (4–6) và hình đại diện chọn sẵn, do ba mẹ nhập sau bước đồng ý (ba mẹ có thể dùng biệt danh).</>,
             …
-            <><Term>Dữ liệu định danh thiết bị (ẩn danh):</Term> khi mở lần đầu, ứng dụng tạo một mã thiết bị cùng một khoá bí mật ngẫu nhiên lưu an toàn trên máy, gắn với tài khoản gia đình. Máy chủ chỉ lưu <Term>bản băm (hash)</Term> của khoá này, không phải giá trị gốc.</>,
+            <><Term>Dữ liệu định danh thiết bị (ẩn danh):</Term> khi mở lần đầu, trước cả bước đồng ý, ứng dụng tạo một mã thiết bị cùng một khoá bí mật ngẫu nhiên lưu an toàn trên máy, gắn với một tài khoản gia đình lúc đó chưa chứa thông tin nào của con. Máy chủ chỉ lưu <Term>bản băm (hash)</Term> của khoá này, không phải giá trị gốc.</>,
             <><Term>Bảo vệ tài khoản gia đình:</Term> mã PIN của ba mẹ và mã khôi phục — đều được lưu dưới dạng băm.</>,
+            <><Term>Bản ghi sự đồng ý của ba mẹ:</Term> phiên bản nội dung và phiên bản chính sách ba mẹ đã đồng ý, thời điểm đồng ý, cách xác nhận và mã thiết bị ngẫu nhiên đã ghi nhận (xem mục 2).</>,
```

**§5 Cách chúng tôi sử dụng thông tin (:90-95)**
```diff
             "Xử lý và duy trì gói đăng ký, xác thực giao dịch với cửa hàng ứng dụng.",
+            "Lưu bằng chứng sự đồng ý của ba mẹ theo quy định về bảo vệ dữ liệu cá nhân.",
             "Bảo mật hệ thống, phát hiện lạm dụng và khắc phục sự cố kỹ thuật.",
```

**§7 Lưu trữ (sau :128)**
```diff
             "Hồ sơ và dữ liệu học tập của con được lưu cho tới khi ba mẹ xoá tài khoản gia đình. Việc xoá là xoá hẳn khỏi máy chủ, không phải ẩn danh hoá.",
+            "Bản ghi sự đồng ý của ba mẹ được lưu cùng tài khoản gia đình và bị xoá khi ba mẹ xoá tài khoản.",
```

**§8 Quyền của ba mẹ (sau :141)**
```diff
             <><Term>Xoá tài khoản gia đình cùng toàn bộ dữ liệu, ngay trong ứng dụng:</Term> Cài đặt → Dữ liệu gia đình → Xoá dữ liệu gia đình. Quên mã PIN vẫn xoá được. Khi ba mẹ xoá, Dodokids ngừng toàn bộ việc xử lý dữ liệu của con.</>,
+            <><Term>Rút lại sự đồng ý bất cứ lúc nào:</Term> xoá dữ liệu gia đình trong ứng dụng (có hiệu lực ngay) hoặc email cho chúng tôi. Vì dữ liệu của con chỉ dùng để cung cấp bài học, rút lại sự đồng ý đồng nghĩa với xoá tài khoản gia đình.</>,
             "Yêu cầu ngừng, hạn chế hoặc phản đối việc xử lý dữ liệu mà không cần xoá, hoặc khiếu nại về cách chúng tôi xử lý dữ liệu.",
```

**§10 Thay đổi chính sách (:171-173)**
```diff
-          Chúng tôi có thể cập nhật chính sách này theo thời gian. Khi có thay đổi quan
-          trọng, chúng tôi sẽ cập nhật ngày ở đầu trang và, nếu cần, thông báo trong ứng
-          dụng. Ngày &quot;Cập nhật lần cuối&quot; ở đầu trang cho biết phiên bản hiện hành.
+          Chúng tôi có thể cập nhật chính sách này theo thời gian. Khi có thay đổi quan
+          trọng, chúng tôi sẽ cập nhật ngày ở đầu trang và thông báo trong ứng dụng. Nếu thay
+          đổi loại dữ liệu, mục đích hoặc bên xử lý, ứng dụng sẽ hỏi lại sự đồng ý của ba mẹ
+          trước khi áp dụng. Ngày &quot;Cập nhật lần cuối&quot; ở đầu trang cho biết phiên bản hiện hành.
```

### 7.2 Các file landing khác

- `landing/src/components/sections/LegalPage.tsx:18`: đổi `LEGAL_UPDATED = "14/09/2026"` thành **ngày publish** (ví dụ `"15/09/2026"`). Ngày này phải khớp `policyVersion` trong bảng của server.
- `landing/src/app/data-deletion/page.tsx`, danh sách "Trên máy chủ Dodokids" (sau :170):
  ```diff
               "Hồ sơ của con: tên gọi, độ tuổi và hình đại diện.",
  +            "Bản ghi sự đồng ý của ba mẹ (phiên bản nội dung, thời điểm đồng ý, mã thiết bị ngẫu nhiên).",
  ```
- (Tuỳ chọn) `landing/src/app/terms/page.tsx` §1, sau "…đại diện hợp pháp cho con khi sử dụng dịch vụ.": thêm " Trước khi con có hồ sơ, ba mẹ xác nhận vai trò này và đồng ý cho Dodokids xử lý dữ liệu của con ngay trong ứng dụng, theo Chính sách bảo mật."

---

## 8. Kiểm thử

### 8.1 kido-server (jest) — `cd kido-server && npm test && npm run build`

**`anonymous-sessions.service.spec.ts`** (harness ở :36-193)
1. `register` household mới trả `parentalConsent: null`.
2. `recordParentalConsent` ghi đủ `{noticeVersion, policyVersion, grantedAt instanceof Date, method, declaredRole, purposes, deviceId === session.deviceId}`.
3. Gửi lại cùng phiên bản thì `grantedAt` không đổi và history không thêm.
4. Phiên bản mới được chấp nhận thì bản cũ vào history (cắt còn 10).
5. Household tombstone trả 409 `household_deleted`.
6. `status()`, `register` lặp lại (resumeExisting) và `recover` sang thiết bị mới đều trả tóm tắt đồng ý.
- Mock cần sửa:
  - `updateOne` phải so **mọi** cặp trong filter (để tôn trọng `deletedAt: null`), vì hiện chỉ so `householdId`.
  - `applyUpdate` cần thêm `$push` + `$each`/`$slice`.

**DTO**
- `noticeVersion` lạ bị từ chối.
- Field thừa bị từ chối, khi chạy `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` như `main.ts`.

**`children.service.spec.ts` (mới, hiện chưa có)** — chạy theo đúng bảng ở mục 5.6
- Không header + chưa đồng ý + cờ tắt: tạo được.
- Có header + chưa đồng ý: 409, `save` không được gọi.
- Có header + đã đồng ý: tạo được.
- Cờ bật + không header + chưa đồng ý: 409.
- Tombstone vẫn trả `household_deleted` trước.
- Log cảnh báo chứa householdId và **không chứa tên bé**.

**Helper header**
- `clientDeclaresFeature("foo, parental-consent-v1", …) === true`; `undefined` cho `false`.

### 8.2 mobile

**`npm run test:parental-consent` (script mới) kiểm:**
- `AuthStack` có đăng ký `ParentConsent`.
- `OnboardingScreen` không còn `replace('Setup')`.
- `ParentConsentScreen`:
  - import `adultChallenge`;
  - checkbox khởi tạo `useState(false)`;
  - `recordParentalConsent(` đứng trước `replace('Setup')`;
  - `PRIVACY_URL` chỉ nằm trong nhánh bước đồng ý.
- `SetupScreen`: kiểm tra đồng ý nằm giữa `await bootstrapSession();` và `await createChild(`.
- Store gọi `'/anonymous-sessions/parental-consent'` và `sessionFrom` chép `parentalConsent`.
- `api.ts` gửi `X-Kido-Client-Features`.
- `App.tsx` chỉ gate khi trạng thái là `'missing'`/`'outdated'` (không gate khi `undefined`).
- `PARENTAL_CONSENT_NOTICE_VERSION` khớp `/^\d{4}-\d{2}-\d{2}$/`.
- `ParentGateModal` vẫn dùng preset `'standard'`.

**Lệnh khác**
- `npm run test:anonymous-session` vẫn phải pass.
- `npx tsc --noEmit`.
- `npx eslint <các file đã sửa>` (không `--fix`).
- **Không** chạy `npm run format` / `prettier --write`.

### 8.3 QA tay (Android emulator, iOS simulator, iPad)

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| 1 | Cài mới, bấm "Bỏ qua" ở slide 1 | Tới ParentConsent, không vào thẳng Setup |
| 2 | Sai phép tính 3 lần | Khoá 30 giây, đếm ngược; phép tính đổi mỗi lần |
| 3 | Bước B chưa tick | Nút chính mờ, không bấm được |
| 4 | "Không đồng ý" → "Về trang giới thiệu" | Server không có bản ghi (kiểm `status`) |
| 5 | Tắt mạng, bấm đồng ý | Hiện lỗi tại chỗ; bật mạng, thử lại thì thành công |
| 6 | Đồng ý rồi tắt app trước Setup, mở lại | Slide → tự sang Setup |
| 7 | Setup "Quay lại giới thiệu" → "Bắt đầu" | Bỏ qua ParentConsent |
| 8 | Cài build cũ (internal), tạo bé, cập nhật bản mới | Cổng reconsent một lần; đồng ý thì vào Home với tiến độ còn nguyên |
| 9 | Như #8 nhưng "Không đồng ý" → "Xoá dữ liệu gia đình" | Xoá xong quay về slide → đồng ý mới |
| 10 | Khôi phục household đã đồng ý trên máy thứ 2 | Không hỏi lại |
| 11 | Khôi phục household cũ chưa đồng ý | Cổng reconsent |
| 12 | Build cũ gọi server mới: tạo hồ sơ mới (sau khi xoá dữ liệu) | Tạo được; log server có dòng "legacy client" |
| 13 | Xoá dữ liệu gia đình trên bản mới | Lần onboarding sau hỏi đồng ý lại |
| 14 | VoiceOver/TalkBack | Tiêu đề, checkbox, link, lỗi đều đọc đúng |
| 15 | iPhone SE có bàn phím; iPad dọc/ngang; Split View 1/3 | "Tiếp tục" không bị bàn phím che; cột 560 căn giữa; màn hẹp dùng bố cục điện thoại |
| 16 | Cài lại iOS (máy thật, nếu có) | Keychain còn thì không hỏi lại |

**Bằng chứng**
- Chụp màn bước A, B, C (lần đầu và reconsent) cho checklist Play `docs/GOOGLE_PLAY_GOLIVE_CHECKLIST.md:155` và cho khai báo Families.
- Đo thời gian ba mẹ với 3–5 người bằng đồng hồ bấm giờ.

---

## 9. Thứ tự rollout (server trước)

1. **Chốt câu hỏi mở** (mục 10), đặc biệt copy và ngày phiên bản.
2. **kido-server** — nhánh `feat/parental-consent` → test/build → merge `main` → GitHub Actions deploy lên VPS. `PARENTAL_CONSENT_ENFORCE_ALL` **không đặt** (= tắt).
   - Smoke trên prod bằng một thiết bị giả, rồi xoá household đó:
     - `POST /anonymous-sessions/register` (UUID + secret ngẫu nhiên);
     - `GET /anonymous-sessions/status` phải có `"parentalConsent": null`;
     - `POST /children` kèm header trả 409 `parental_consent_required`;
     - `POST /anonymous-sessions/parental-consent` trả 2xx;
     - `status` hiện bản ghi;
     - `POST /children` kèm header trả 2xx;
     - `POST /anonymous-sessions/household/delete {confirm:true}`.
   - Mở build internal cũ đang cài: bài học, cổng PIN, Cài đặt vẫn chạy.
3. **landing** — nhánh trên `main` với privacy + data-deletion + `LEGAL_UPDATED` → `npm run build`. **Giữ chưa merge** cho tới ngày build mobile được rollout. Trang mô tả bước đồng ý, nên không publish sớm hơn app. Khi cờ cưỡng chế còn tắt, build cũ vẫn tạo hồ sơ không qua đồng ý, nên mọi câu khẳng định về bước đồng ý trên privacy/terms phải gắn với "phiên bản có bước đồng ý" và nói rõ phiên bản cũ chưa có bước này (kết luận của vòng review 14/09/2026).
4. **mobile** — nhánh `feat/parental-consent` → test → build production EAS (skill `release-mobile`) → Internal testing.
   - App đang "Bản nháp": release ở trạng thái draft và phải rollout tay trong Console.
   - Cùng ngày: merge/deploy landing (Vercel).
   - Tester cập nhật → kiểm cổng reconsent → đưa lên Closed testing.
   - iOS: build TestFlight cùng mã, nếu đang dùng.
5. **Bật cưỡng chế toàn phần** trước Production, khi mọi tester internal đã cập nhật:
   - thêm `PARENTAL_CONSENT_ENFORCE_ALL=true` vào `.env` trên VPS → chạy workflow deploy tay;
   - theo dõi dòng log "legacy client" biến mất;
   - đếm household cũ còn thiếu bằng `db.households.countDocuments({ parentalConsent: null, deletedAt: null })`.
6. **Giấy tờ**
   - Tick `GOOGLE_PLAY_GOLIVE_CHECKLIST.md:155` kèm ảnh.
   - Mô tả cơ chế trong Families declaration / Data safety và App Review notes (Apple).
   - Thêm một bullet vào `docs/AI_CONTEXT.md` (bản đồ mobile + Runtime API Contracts).
   - Archive OpenSpec sau khi ship.
   - Root repo đang có sửa chưa commit ở 2 checklist, từ phiên khác: phối hợp trước khi tick.

**Luật rollback:** khi build mới đã ở máy tester, **không rollback server về trước thay đổi này**. Nếu buộc phải lùi, chỉ gỡ đoạn chặn ở `POST /children`, giữ endpoint và field `status`. Nếu không, onboarding của người dùng mới sẽ kẹt ở màn đồng ý (POST trả 404).

---

## 10. Câu hỏi mở cho chủ sản phẩm

(Đề xuất mặc định in đậm.)

1. **Duyệt copy mục 3.** Có ghi tên người vận hành "Hoàng Tư Duy" ngay trong app không? **Đề xuất: có**, vì luật yêu cầu nêu bên xử lý và trang privacy đã ghi tên.
2. **Ô xác nhận + nút, hay chỉ một nút "Tôi đồng ý"?** Một nút nhanh hơn khoảng 2 giây. **Đề xuất: ô xác nhận**, vì tách hành vi tự khai vai trò thành một thao tác riêng, là bằng chứng mạnh hơn khi bên xử lý phải chứng minh.
3. **Phép tính mạnh hơn (đáp án 18–28) + khoá 30 giây, chỉ cho bước đồng ý.** Cổng PIN giữ nguyên. **Đề xuất: đồng ý.** Ba mẹ sẽ làm phép tính 2 lần (lúc đồng ý và lúc tạo PIN đầu tiên); chấp nhận được.
4. **Household cũ:** cổng reconsent chặn một lần (**đề xuất**), hay nhờ tester xoá dữ liệu rồi tạo lại (bỏ 0,5 ngày công nhưng dữ liệu cũ vẫn được xử lý không có đồng ý trên các máy đã cập nhật)?
5. **Bằng chứng sau khi xoá:** xoá bản ghi đồng ý cùng household (**đề xuất**, khớp cam kết "xoá hẳn"), hay giữ biên nhận ẩn danh `{householdId ngẫu nhiên, grantedAt, deletedAt, noticeVersion}` một thời hạn? Phương án thứ hai buộc sửa privacy §7 và mục "Dữ liệu được giữ lại" trên trang data-deletion.
6. **Ngày phiên bản** (`noticeVersion`/`policyVersion`/`LEGAL_UPDATED`): chốt đúng ngày publish. **Đã chốt `2026-09-15`** (ngày 14/09/2026): ngày dự kiến đăng landing, cùng ngày build lên Internal testing.
7. **Khi nào bật `PARENTAL_CONSENT_ENFORCE_ALL`?** **Đề xuất:** trước Production, khi mọi tester internal đã cập nhật. Sau đó build cũ không tạo được hồ sơ **mới**, còn hồ sơ đã có không bị ảnh hưởng.
8. **Nhờ luật sư Việt Nam xác nhận trước Production** (không chặn closed test):
   - (a) chi tiết Luật 91 Điều 24 về trẻ em;
   - (b) dữ liệu của trẻ có thuộc danh sách dữ liệu nhạy cảm của NĐ 356 không; nếu có, màn đồng ý phải ghi rõ;
   - (c) household ẩn danh tạo trước khi đồng ý (chỉ có mã thiết bị ngẫu nhiên) có ổn không;
   - (d) một mục đích `learning_service` đã đủ chưa, trong khi gói đăng ký và bảo mật dựa trên căn cứ khác;
   - (e) có phải cho ba mẹ xuất hoặc in bản ghi đồng ý không.
9. **Phối hợp với change `add-dodo-interview-practice`:**
   - bản nháp `drafts/consent-flow-spec.md:240-241` gọi phụ huynh là "bạn", trái persona §3 ("ba mẹ"), cần sửa;
   - privacy của nó muốn chèn §5 mới; đề xuất chuyển thành một đoạn trong §2 như ở trên;
   - định dạng `policyVersion` "2026-09" của nó nên thống nhất sang ngày ISO đầy đủ;
   - khi ship phỏng vấn phải tăng `noticeVersion`, vì bỏ câu "không ghi âm" trên privacy. Consent giọng nói theo từng bé vẫn là một consent riêng.
10. **Dòng "Ba mẹ đã đồng ý ngày …" trong Cài đặt:** làm ngay (**đề xuất**, khoảng 0,25 ngày, là bằng chứng "thu hồi được" cho store) hay để bản sau?

---

## 11. Công sức và phương án cắt

| Hạng mục | Ngày công |
|---|---|
| Server: schema, hằng số, DTO, route, service, trả trạng thái, chặn ở `/children`, cờ env, spec | 0,75 |
| Mobile: tách helper phép tính, ParentGateModal import | 0,25 |
| `ParentConsentScreen` (3 bước × 2 chế độ, điện thoại/iPad, khoá chờ, a11y) | 1,0 |
| Nối dây: nav, Onboarding ×4, Setup (chặn, 409, biệt danh), store, header | 0,5 |
| Cổng reconsent trong App.tsx + dòng Cài đặt | 0,5 |
| Script hợp đồng + tsc + eslint có mục tiêu | 0,25 |
| Landing (privacy, data-deletion, ngày) + `docs/KIDO_PARENTAL_CONSENT_NOTICE.md` | 0,25 |
| OpenSpec + AI_CONTEXT + checklist | 0,25 |
| QA thiết bị + ảnh bằng chứng | 0,5–1 |
| **Tổng** | **khoảng 4–4,5 (3,5 nếu QA song song)** |

**Bản cắt khoảng 3 ngày:** bỏ dòng Cài đặt, bỏ `parentalConsentHistory` (thêm vào khi tăng phiên bản lần đầu), và QA gọn. **Giữ** cổng reconsent và header chặn: đó là phần làm cho thay đổi này có giá trị pháp lý.

---

## Phụ lục A — Bản nháp OpenSpec change `add-parental-consent`

Khi làm thật, tạo ở `openspec/changes/add-parental-consent/`. Bản nháp này **chưa tạo file trong repo**.

Ghi chú cấu trúc:
- Capability `anonymous-household-session` hiện chỉ nằm trong change chưa archive `add-anonymous-household-session`, chưa có ở `openspec/specs/`.
- Vì vậy mọi requirement được đặt vào **một capability mới `parental-consent`** (toàn bộ ADDED), để khỏi viết MODIFIED chồng lên spec chưa archive.

### `.openspec.yaml`

```yaml
schema: spec-driven
created: 2026-09-14
```

### `proposal.md`

```markdown
## Why

Hôm nay app gửi tên gọi, tuổi và avatar của bé (4–6 tuổi) lên server ở `SetupScreen` trước bất kỳ thao tác nào của người lớn, và không nơi nào ghi nhận sự đồng ý của phụ huynh. Chính sách Gia đình của Google Play yêu cầu tuân thủ luật bảo vệ trẻ em hiện hành; Luật 91/2025/QH15 và Nghị định 356/2025/NĐ-CP yêu cầu cha, mẹ hoặc người giám hộ đồng ý trước khi xử lý dữ liệu cá nhân của trẻ, và bên xử lý phải lưu bằng chứng về thời điểm và nội dung đồng ý. Checklist go-live Play đang mở mục P0 "Chốt cơ chế parental notice/consent… trước khi tạo hồ sơ server-side". Chủ sản phẩm đã quyết định (14/09/2026) thêm bước này và ship làm bản cập nhật đầu tiên của đợt closed test.

## What Changes

- **Mobile:** màn mới `ParentConsent` đặt giữa slide giới thiệu và `SetupScreen`. Bước A là câu hỏi người lớn (phép cộng viết bằng chữ, preset mạnh hơn, khoá 30 giây sau 3 lần sai). Bước B là thông báo ngắn (lưu gì, để làm gì, ai lưu, ở đâu, bao lâu, quyền của ba mẹ, link Chính sách bảo mật chỉ hiện sau A), ô xác nhận không đánh sẵn, "Đồng ý và tiếp tục" / "Không đồng ý". Nếu ba mẹ không đồng ý, không gửi gì.
- **Mobile:** Setup chỉ gọi `POST /children` khi session đã có đồng ý hợp lệ; lỗi 409 `parental_consent_required` đưa về màn đồng ý. Gợi ý nhập biệt danh.
- **Mobile:** household cũ (tạo bởi build trước) mở trên bản mới thấy cổng đồng ý một lần, với lựa chọn thay thế "Xoá dữ liệu gia đình". Trạng thái không biết (server cũ) không bao giờ kích hoạt cổng.
- **Mobile:** mọi request gửi header `X-Kido-Client-Features: parental-consent-v1`; Cài đặt hiện ngày đồng ý.
- **Server:** `Household.parentalConsent` (và lịch sử tối đa 10 bản ghi bị thay thế); endpoint mới `POST /anonymous-sessions/parental-consent { noticeVersion }`; `register`/`recover`/`status` trả `parentalConsent`.
- **Server:** `POST /children` trả 409 `parental_consent_required` khi client khai báo `parental-consent-v1` mà household chưa đồng ý; client không khai báo (build cũ) vẫn tạo được cho tới khi bật `PARENTAL_CONSENT_ENFORCE_ALL=true`. Không đổi body của request cũ nào.
- **Landing:** privacy §2/§3/§5/§7/§8/§10 mô tả bước đồng ý và bản ghi; trang data-deletion thêm bản ghi đồng ý vào danh sách bị xoá; cập nhật `LEGAL_UPDATED`.
- **Docs:** `docs/KIDO_PARENTAL_CONSENT_NOTICE.md` lưu nguyên văn từng phiên bản thông báo; cập nhật `docs/AI_CONTEXT.md`, checklist go-live Play/Apple.
- Không backfill "đã đồng ý" cho household cũ. Rút lại đồng ý = xoá dữ liệu gia đình hiện có; bản ghi đồng ý bị xoá cùng household.

## Capabilities

### New Capabilities

- `parental-consent`: ghi nhận, trả trạng thái và cưỡng chế sự đồng ý của ba mẹ trên household trước khi tạo hồ sơ bé; luồng mobile hỏi đồng ý lần đầu và hỏi lại household cũ; rút lại bằng xoá household.

### Modified Capabilities

- (Không viết delta MODIFIED: `anonymous-household-session` chưa archive vào `openspec/specs/`. Các thay đổi lên `POST /children`, `status`, `register`, `recover` được đặc tả trong `parental-consent`.)

## Impact

- **Server:** `common/schemas/household.schema.ts`; `modules/anonymous-sessions/` (constants, DTO, controller, service, spec); `modules/children/` (controller đọc header, service kiểm đồng ý, spec mới); env `PARENTAL_CONSENT_ENFORCE_ALL` (mặc định tắt). Không migration.
- **Mobile:** `ParentConsentScreen` mới, `components/parentGate/adultChallenge.ts` mới, `ParentGateModal` (chỉ import), `AuthStack`/`types`, `OnboardingScreen` (4 chỗ), `SetupScreen`, `anonymousSessionStore`, `api.ts`, `constants/legal.ts`, `App.tsx`, `SettingsScreen`, script `verify-parental-consent-contracts.cjs`. Chỉ JS/TS nhưng cần build store mới (không có expo-updates).
- **Landing:** `privacy/page.tsx`, `data-deletion/page.tsx`, `LegalPage.tsx` (`LEGAL_UPDATED`), tuỳ chọn `terms/page.tsx`.
- **Thứ tự triển khai:** server → landing (cùng ngày rollout build) → mobile → bật cưỡng chế toàn phần trước Production. Không rollback server về trước thay đổi này khi build mới đã phát hành.
- **Tương thích:** build cũ không đổi hành vi; field mới trong response được bỏ qua; `POST /children` không header vẫn được nhận khi cờ tắt.
- **Rủi ro tồn dư:** câu hỏi người lớn chứng minh "người lớn", không chứng minh "đúng người giám hộ" (tự khai); household ẩn danh vẫn được tạo trước khi đồng ý (không chứa dữ liệu của bé); các điều khoản luật cần luật sư xác nhận trước Production.
```

### `tasks.md`

```markdown
## 1. Server — ghi nhận đồng ý

- [ ] 1.1 Thêm sub-schema `HouseholdParentalConsent` (`noticeVersion`, `policyVersion`, `grantedAt`, `method`, `declaredRole`, `purposes`, `deviceId`) và field `parentalConsent` (mặc định null) + `parentalConsentHistory` (mặc định []) vào `Household`
- [ ] 1.2 Thêm `parental-consent.constants.ts` (bảng `PARENTAL_CONSENT_NOTICES`, `PARENTAL_CONSENT_METHOD`, `PARENTAL_CONSENT_CLIENT_FEATURE`, `clientDeclaresFeature`)
- [ ] 1.3 Thêm `RecordParentalConsentDto` (`noticeVersion` thuộc bảng; không nhận field nào khác)
- [ ] 1.4 Thêm `POST /anonymous-sessions/parental-consent` (DeviceSessionGuard, RateLimit 10/60) và `recordParentalConsent`: từ chối tombstone (409 `household_deleted`), idempotent cùng phiên bản, đẩy bản cũ vào history (cắt 10) khi phiên bản đổi, `deviceId` lấy từ session, `grantedAt` giờ máy chủ
- [ ] 1.5 Trả `parentalConsent: { noticeVersion, grantedAt } | null` trong `status`, `register` (household mới = null), `resumeExisting`, `recover`

## 2. Server — cưỡng chế ở POST /children

- [ ] 2.1 `ChildrenController.create` đọc header `x-kido-client-features` và truyền `consentAware`
- [ ] 2.2 `ChildrenService.create`: một truy vấn `deletedAt parentalConsent`; giữ 409 `household_deleted`; 409 `parental_consent_required` khi `consentAware` hoặc `PARENTAL_CONSENT_ENFORCE_ALL=true` mà chưa có đồng ý; client cũ thì tạo và log cảnh báo chỉ kèm householdId
- [ ] 2.3 Mở rộng `anonymous-sessions.service.spec.ts` (ghi, idempotent, đổi phiên bản, tombstone, trả trạng thái; mock `updateOne` so mọi filter, `applyUpdate` hỗ trợ `$push`/`$slice`) và kiểm DTO với ValidationPipe như `main.ts`
- [ ] 2.4 Thêm `children.service.spec.ts` theo bảng cưỡng chế (header × đồng ý × cờ, tombstone ưu tiên, log không có tên bé)
- [ ] 2.5 `cd kido-server && npm test && npm run build`

## 3. Mobile — màn đồng ý

- [ ] 3.1 Tách `VN_NUMBER_WORDS` (0–19) và `makeAdultChallenge(preset)` sang `src/components/parentGate/adultChallenge.ts`; `ParentGateModal` import với preset `standard`, không đổi hành vi
- [ ] 3.2 Thêm `PARENTAL_CONSENT_NOTICE_VERSION` và `CLIENT_FEATURES` vào `src/constants/legal.ts`; gửi header `X-Kido-Client-Features` trong `src/services/api.ts`
- [ ] 3.3 `anonymousSessionStore`: field `parentalConsent` (undefined = không biết), `sessionFrom`, action `recordParentalConsent`, helper `parentalConsentState`
- [ ] 3.4 Tạo `ParentConsentScreen` (bước kiểm tra/đồng ý/từ chối; chế độ `first_run`/`reconsent`; checkbox không đánh sẵn; link chính sách chỉ sau bước A; khoá 30 giây sau 3 lần sai; bỏ qua khi đã đồng ý; bố cục điện thoại/iPad qua `ContentFrame measure="form"`; a11y)
- [ ] 3.5 Đăng ký `ParentConsent` trong `AuthStack`/`types` (gestureEnabled false); đổi 4 chỗ `replace('Setup')` trong `OnboardingScreen` thành `replace('ParentConsent')`
- [ ] 3.6 `SetupScreen`: kiểm tra đồng ý sau `bootstrapSession()` và trước tra cứu/tạo hồ sơ; 409 `parental_consent_required` về `ParentConsent`; gợi ý biệt danh + placeholder
- [ ] 3.7 `App.tsx`: cổng reconsent khi `isOnboarded` và trạng thái `missing`/`outdated`, lựa chọn thay thế "Xoá dữ liệu gia đình" qua `deleteHouseholdData()`
- [ ] 3.8 `SettingsScreen`: dòng "Ba mẹ đã đồng ý ngày …" + chú thích rút lại đồng ý
- [ ] 3.9 Thêm `scripts/verify-parental-consent-contracts.cjs` + script `test:parental-consent`; chạy nó, `test:anonymous-session`, `npx tsc --noEmit`, eslint có mục tiêu (không prettier --write)

## 4. Landing và docs

- [ ] 4.1 Cập nhật `landing/src/app/privacy/page.tsx` (Tóm tắt, §2, §3, §5, §7, §8, §10 — không đánh số lại) và `data-deletion/page.tsx`; đổi `LEGAL_UPDATED` bằng ngày publish = `policyVersion` trong bảng server
- [ ] 4.2 Tạo `docs/KIDO_PARENTAL_CONSENT_NOTICE.md` chứa nguyên văn thông báo phiên bản `2026-09-15`
- [ ] 4.3 Cập nhật `docs/AI_CONTEXT.md` (bản đồ mobile + Runtime API Contracts) và viết spec `specs/parental-consent/spec.md`

## 5. Rollout và bằng chứng

- [ ] 5.1 Deploy server (push main), smoke trên prod bằng thiết bị giả rồi xoá household giả; xác nhận build cũ vẫn chạy
- [ ] 5.2 Build production EAS → Internal testing (rollout tay vì app đang Bản nháp) → cùng ngày publish landing → Closed testing
- [ ] 5.3 QA tay theo ma trận (cài mới, từ chối, mất mạng, tắt app giữa chừng, household cũ, khôi phục, xoá, a11y, iPad) và chụp ảnh bước A/B/C
- [ ] 5.4 Tick checklist Play mục consent kèm ảnh; mô tả cơ chế trong Families/Data safety và App Review notes
- [ ] 5.5 Trước Production: bật `PARENTAL_CONSENT_ENFORCE_ALL=true` khi mọi tester internal đã cập nhật; đếm household `parentalConsent: null`
```

### `specs/parental-consent/spec.md` (phác thảo)

```markdown
## ADDED Requirements

### Requirement: Ghi nhận sự đồng ý của ba mẹ trên household

Server SHALL expose `POST /anonymous-sessions/parental-consent` behind the device bearer, accept only `noticeVersion` from an accepted list, and store on the household `noticeVersion`, `policyVersion`, server-clock `grantedAt`, `method`, `declaredRole`, `purposes`, and the session `deviceId`. It MUST NOT store IP address or parent identity.

#### Scenario: Ghi nhận lần đầu
- **WHEN** an authenticated household without consent posts an accepted `noticeVersion`
- **THEN** the household stores the consent record with server time and the session `deviceId`
- **AND** the response returns `{ parentalConsent: { noticeVersion, grantedAt } }`

#### Scenario: Gửi lại cùng phiên bản
- **WHEN** the household posts the same `noticeVersion` again
- **THEN** the stored `grantedAt` is unchanged and no history entry is added

#### Scenario: Household đã bị xoá
- **WHEN** a tombstoned household posts consent
- **THEN** server returns `409 { error: "household_deleted" }`

#### Scenario: Phiên bản lạ
- **WHEN** the body carries an unknown `noticeVersion` or any extra field
- **THEN** server returns `400` and stores nothing

### Requirement: Trả trạng thái đồng ý cho thiết bị

`GET /anonymous-sessions/status`, `POST /anonymous-sessions/register` and `POST /anonymous-sessions/recover` SHALL include `parentalConsent` as `{ noticeVersion, grantedAt }` or `null`.

#### Scenario: Household mới
- **WHEN** a new device registers a new household
- **THEN** the response includes `parentalConsent: null`

### Requirement: POST /children tôn trọng đồng ý của ba mẹ

`POST /children` SHALL return `409 { error: "parental_consent_required" }` without creating a child when the household has no consent and either the request declares `parental-consent-v1` in `X-Kido-Client-Features` or `PARENTAL_CONSENT_ENFORCE_ALL` is `true`. Requests without the declaration MUST keep today's behaviour while the flag is off.

#### Scenario: Client mới chưa đồng ý
- **WHEN** a client declaring `parental-consent-v1` creates a child for a household without consent
- **THEN** server returns 409 and no child is stored

#### Scenario: Client cũ
- **WHEN** a client without the declaration creates a child while the flag is off
- **THEN** the child is created and the server logs a warning without the child's name

### Requirement: Mobile hỏi đồng ý trước khi nhập thông tin của bé

The mobile app SHALL show an adult check followed by a consent notice with an unticked confirmation before `SetupScreen`, and MUST NOT send any child data until the server has recorded consent. Households onboarded without consent MUST see a one-time consent gate on the new build; an unknown consent state MUST NOT trigger that gate.

#### Scenario: Cài mới
- **WHEN** a parent finishes the onboarding slides on a fresh install
- **THEN** the app shows the adult check, then the consent notice, and opens Setup only after consent is stored

#### Scenario: Ba mẹ không đồng ý
- **WHEN** the parent chooses "Không đồng ý"
- **THEN** no request carrying child data is sent and the parent can review again or return to the slides

#### Scenario: Household cũ trên bản mới
- **WHEN** an onboarded household with `parentalConsent: null` opens the new build
- **THEN** the app blocks with the consent gate, offering consent or household deletion

### Requirement: Rút lại đồng ý bằng xoá household

Withdrawing consent SHALL be done through the existing household deletion, which MUST remove the consent record together with the household.

#### Scenario: Xoá dữ liệu gia đình
- **WHEN** the parent deletes family data
- **THEN** the household and its consent record are hard-deleted and the next onboarding asks for consent again
```

---

## Phụ lục B — Ghi chú kiểm chứng

**Đã đối chiếu mã (đọc, không sửa)**
- `OnboardingScreen.tsx:298/361/410/455` đều là `replace('Setup')`.
- `SetupScreen.tsx`:
  - :133 `await bootstrapSession()`;
  - :136 `fetchHouseholdChildren`;
  - :148 là nơi gọi `createChild` duy nhất trong app;
  - :174 lỗi chung;
  - :265 placeholder, :295 gợi ý.
- `ParentGateModal.tsx`:
  - :29-45 phép tính (đáp án 5–16);
  - :138-149 thử lại không giới hạn;
  - :161-178 chuỗi xoá.
- `App.tsx`: :107-109 bootstrap lúc mở; :275-277 nhánh SessionRecovery.
- `anonymousSessionStore.ts`: :112-123 `sessionFrom` chép theo tên field; :164-172 session tạm.
- `api.ts`: không có header phiên bản; chỉ lỗi 401 `anonymous_session_invalid` mới xoá credential.
- `app.json` version `1.0.0`; `eas.json` `appVersionSource: remote` + autoIncrement.
- Không có `expo-updates` hay `expo-application`.
- `AndroidManifest.xml:15` `allowBackup="true"`.
- Server:
  - `main.ts:36-39` `whitelist` + `forbidNonWhitelisted`;
  - `household.schema.ts` chưa có field đồng ý;
  - `children.service.ts:31-36` kiểm tombstone bằng `exists`;
  - `anonymous-sessions.service.ts:53-59/134-147/211/393-407`;
  - cờ env đọc kiểu `process.env`; compose dùng `env_file: .env`;
  - deploy chạy khi push `main`.
- Landing: repo đang ở `main` 5195da3, sạch; `LEGAL_UPDATED = "14/09/2026"`.
- Checklist Play: :155 (consent P0), :178 (ảnh consent, thuộc 2.4b phỏng vấn).

**Chưa kiểm chứng**
- Văn bản gốc Luật 91/2025/QH15 và NĐ 356/2025/NĐ-CP. Các điều khoản dẫn trong tài liệu này lấy từ bản tóm tắt của thiết kế "pháp lý", **cần luật sư xác nhận**.
- Hành vi keychain iOS khi cài lại chưa được thử trên máy thật.
- Không chạy lệnh test/lint nào, và không tạo file trong repo.
