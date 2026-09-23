# Draft — Consent flow cho "Luyện phỏng vấn cùng Đô Đô" (task 0.6)

> Draft thuộc change `add-dodo-interview-practice`, Phase 0. Trạng thái: chờ review.
> Nguồn ràng buộc: `proposal.md`, `design.md` (§6 Dữ liệu & retention),
> `specs/dodo-interview-practice/spec.md` (Requirement: Consent phụ huynh),
> `docs/KIDO_DODO_PERSONA.md` (xưng hô), pattern gate hiện có
> `mobile/src/components/ParentGateModal.tsx`, convention module server
> `kido-server/src/modules/entitlements/`.
>
> Con số cố định toàn change: 10 câu/phiên; 3 mode `lam_quen` / `english_basics`
> / `tong_hop_clc`; tối đa 60 giây/câu; cap 2 phiên/bé/ngày; 1 phiên trải nghiệm
> miễn phí/bé; file audio xóa ngay sau khi chấm xong.

---

## 1. Luồng màn hình

```
Entry point "Luyện phỏng vấn"           (ngoài khu Khám phá — ràng buộc C-13)
  │  bé active CHƯA consent → entry hiển thị kèm biểu tượng khóa
  │  (chạm vào không mở phiên; speech bubble Đô Đô: "Bé nhờ bố mẹ mở giúp Đô Đô nha!")
  ▼
ParentGateModal (tái dùng nguyên trạng: adult challenge chữ số bằng lời + PIN 4–6 số)
  ▼
Màn GIỚI THIỆU cho phụ huynh (giọng Kido trung tính)
  │  giải thích tính năng: 10 câu/phiên, ≤60s/câu, 3 chế độ, 2 phiên/bé/ngày,
  │  1 phiên trải nghiệm miễn phí/bé, bé chỉ nhận lời khen — nhận xét chi tiết
  │  nằm trong báo cáo phụ huynh. Nêu rõ: tính năng cần ghi âm nên cần cho phép.
  │  CTA "Tiếp tục" / "Để sau"
  ▼
Màn CONSENT (wording đầy đủ ở §5)
  │  nội dung bắt buộc: (a) mục đích, (b) dữ liệu thu, (c) nêu đích danh
  │  Google Vertex AI (model Gemini) là bên xử lý, (d) xóa audio ngay sau chấm,
  │  (e) quyền thu hồi bất kỳ lúc nào, (f) link Chính sách quyền riêng tư (/privacy).
  │  Checkbox "Tôi là phụ huynh/người giám hộ…" + toggle BẬT THEO TỪNG BÉ.
  │  Mỗi toggle = 1 request POST /interview/consent (server-first, xem §3, §4.4).
  ▼
Quay lại entry point: bé đã bật → entry mở khóa cho bé đó.
Phiên ĐẦU TIÊN sau consent: OS hỏi quyền micro đúng lúc vào màn phiên
(trước khi Đô Đô hỏi câu đầu) — không sớm hơn ở bất kỳ đâu.
```

Ghi chú thiết kế:

- **Entry hiển thị-kèm-khóa** (không ẩn hẳn) khi chưa consent: giữ discoverability
  và là điểm bán gói; scenario spec chỉ yêu cầu "không cho vào phiên và không xin
  quyền mic" nên hiển thị-kèm-khóa thỏa yêu cầu.
- Màn consent đồng thời là màn quản lý về sau: Khu vực phụ huynh → "Luyện phỏng
  vấn cùng Đô Đô" mở lại đúng màn này để bật cho bé khác hoặc thu hồi.
- Consent độc lập với entitlement: phiên trải nghiệm miễn phí CŨNG cần consent
  trước. Paywall chỉ xuất hiện sau khi consent đã hiệu lực và hết lượt miễn phí.
- Nếu phụ huynh đã consent nhưng OS mic permission bị từ chối: không vào phiên
  được; hiện hướng dẫn (giọng Kido) mở Cài đặt hệ thống để cấp quyền micro.
  Không hiển thị lỗi cho bé.

## 2. State machine consent (theo TỪNG bé)

Ba trạng thái, id snake_case dùng thống nhất client + server:

| Trạng thái | Ý nghĩa |
|---|---|
| `chua_hoi` | Mặc định khi tạo hồ sơ bé; hoặc khi `policyVersion` đã lưu cũ hơn phiên bản hiện hành (cần hỏi lại) |
| `da_dong_y` | Phụ huynh đã opt-in cho bé này, `policyVersion` còn hiệu lực |
| `da_thu_hoi` | Phụ huynh đã tắt opt-in cho bé này |

Chuyển trạng thái:

- `chua_hoi → da_dong_y`: POST consent `granted: true` (chỉ đi qua đủ chuỗi
  gate → giới thiệu → màn consent).
- `da_dong_y → da_thu_hoi`: POST consent `granted: false` (toggle trong Khu vực
  phụ huynh, sau gate).
- `da_thu_hoi → da_dong_y`: bắt buộc đi lại QUA MÀN CONSENT ĐẦY ĐỦ (không phải
  toggle nhanh) — hiển thị lại toàn bộ disclosure rồi POST `granted: true`.
- `da_dong_y → chua_hoi` (suy ra, không phải write): server so `policyVersion`
  đã lưu với phiên bản chính sách hiện hành; nếu cũ hơn thì trạng thái hiệu lực
  trả về là `chua_hoi` kèm `needsReconsent: true` — app hỏi lại từ đầu.

Hành vi app theo trạng thái:

| | `chua_hoi` | `da_dong_y` | `da_thu_hoi` |
|---|---|---|---|
| Entry point | Hiển thị kèm khóa; chạm → parent gate → giới thiệu → consent | Mở | Hiển thị kèm khóa; chạm → parent gate → màn consent (copy "bật lại") |
| Tạo phiên | Không (client chặn; server 403 nếu cố) | Có (còn qua entitlement + cap 2 phiên/ngày) | Không (server 403) |
| Quyền mic OS | **Không bao giờ xin** | Xin đúng 1 lần, tại lúc vào phiên đầu tiên sau consent | Không xin |
| Ghi âm / upload | Không có mã đường nào chạy tới ghi âm | Push-to-talk ≤60s/câu, upload ngầm | Client khóa; server từ chối 403 mọi upload |

Bất biến (invariant):

- Không tồn tại nhánh code nào request quyền mic OS khi trạng thái hiệu lực của
  bé active khác `da_dong_y`.
- Quyền mic OS là theo THIẾT BỊ, consent là theo BÉ: thiết bị đã có quyền mic
  không làm entry mở cho bé chưa consent (xem §4.1).
- Server là nguồn sự thật; trạng thái cache trên client chỉ phục vụ UI và luôn
  có thể bị 403 của server phủ quyết (xem §4.2).

## 3. API server — module `interview`

Đặt trong `kido-server/src/modules/interview/` (module mới của change này),
theo convention hiện có: `@Controller('interview')` +
`@UseGuards(DeviceSessionGuard)`, lấy `householdId` từ `@CurrentSession()`
(pattern `parent.controller.ts`, `children.controller.ts`); route kebab-case;
lỗi trả `{ error: 'snake_case_code' }` (pattern `entitlement.service.ts`).

### 3.1 Endpoints

**`POST /interview/consent`** — ghi/thu hồi consent cho một bé.

```jsonc
// request body (DTO: SetInterviewConsentDto)
{
  "childId": "chd_abc",
  "granted": true,            // true = bật, false = thu hồi
  "policyVersion": "2026-09"  // phiên bản disclosure phụ huynh vừa xem
}
// response: InterviewConsentView của bé đó
{
  "childId": "chd_abc",
  "status": "da_dong_y",      // 'chua_hoi' | 'da_dong_y' | 'da_thu_hoi'
  "grantedAt": "2026-09-11T03:00:00.000Z",
  "revokedAt": null,
  "policyVersion": "2026-09",
  "needsReconsent": false
}
```

- Xác thực bé thuộc household: `findOne({ childId, householdId })` (pattern
  `EntitlementService.getEntitlement`); không thấy → 404.
- `granted: true` với `policyVersion` cũ hơn hiện hành → 400
  `{ error: 'interview_consent_policy_outdated' }` (client phải load lại màn
  consent với bản mới).
- Idempotent: POST lặp cùng giá trị vô hại (last-write-wins), phục vụ retry khi
  mất mạng (§4.4).
- Thu hồi (`granted: false`) có side effect server: hủy job chấm đang chờ của bé
  đó và xóa ngay file audio chưa chấm trong bucket tạm (§4.3).

**`GET /interview/consent`** — trạng thái theo household (mọi bé), cho client
sync đa thiết bị.

```jsonc
{
  "policyVersionCurrent": "2026-09",
  "children": [
    { "childId": "chd_abc", "status": "da_dong_y", "grantedAt": "…",
      "revokedAt": null, "policyVersion": "2026-09", "needsReconsent": false },
    { "childId": "chd_xyz", "status": "chua_hoi", "grantedAt": null,
      "revokedAt": null, "policyVersion": null, "needsReconsent": false }
  ]
}
```

`status` là trạng thái HIỆU LỰC đã tính (đã áp luật policyVersion): bé từng
đồng ý nhưng version cũ → trả `chua_hoi` + `needsReconsent: true`.

### 3.2 Lưu trữ

- **Trạng thái hiện hành**: subdocument `interviewConsent` embed trên
  `common/schemas/child.schema.ts` (pattern embed `entitlement` sẵn có):
  `{ status, grantedAt, revokedAt, policyVersion }`, default `status: 'chua_hoi'`.
- **Event log append-only** (khuyến nghị): collection
  `interview-consent-event.schema.ts` — `{ householdId, childId, action:
  'granted' | 'revoked', policyVersion, at }` — làm bằng chứng consent cho App
  Review / Data safety và đối soát khi tranh chấp. Bị xóa cùng household khi
  phụ huynh dùng "Xoá dữ liệu gia đình".
- `policyVersionCurrent` là hằng cấu hình server (env hoặc const), tăng khi
  wording disclosure thay đổi TRỌNG YẾU (đổi bên xử lý, đổi mục đích, đổi
  retention); sửa chính tả không tăng version.

### 3.3 Cưỡng chế (enforcement)

Mọi endpoint động tới phiên/audio của module interview đều check consent hiệu
lực TRƯỚC entitlement:

- `POST /interview/sessions` (tạo phiên) và
  `POST /interview/sessions/:sessionId/answers` (upload từng câu):
  trạng thái hiệu lực khác `da_dong_y` → **403**
  - `{ error: 'interview_consent_required' }` khi `chua_hoi`/cần re-consent;
  - `{ error: 'interview_consent_revoked' }` khi `da_thu_hoi`.
- Check tại thời điểm MỖI request (không chỉ lúc tạo phiên) — chốt chặn cho
  tình huống thu hồi giữa phiên (§4.3) và cache stale đa thiết bị (§4.2).
- Trust model của `POST /interview/consent`: đứng sau `DeviceSessionGuard` +
  parent gate phía client — nhất quán với các hành động phụ huynh hiện có
  (vd. `PATCH /parent/:childId/profile`); server không xác thực PIN theo từng
  request. Ghi nhận là giới hạn đã biết của trust model hiện tại, không mở rộng
  trong change này.

## 4. Edge cases

### 4.1 Đổi bé active

- Consent là per-child: đổi bé active → client đọc lại trạng thái của bé mới và
  render lại entry (mở/khóa) ngay.
- Thiết bị đã được cấp quyền mic OS (vì bé A đã dùng) KHÔNG mở khóa cho bé B
  chưa consent: điều kiện vào phiên là consent của đúng bé active, quyền mic chỉ
  là điều kiện phụ. Server chặn 403 theo `childId` nên kể cả client lỗi vẫn
  không có upload nào cho bé B.

### 4.2 Nhiều thiết bị cùng household

- Trạng thái lưu server-side nên mọi thiết bị nhìn cùng một sự thật qua
  `GET /interview/consent`; client revalidate khi mở entry point, mở Khu vực
  phụ huynh, và khi app quay lại foreground.
- Cache stale (thiết bị B chưa refresh sau khi thiết bị A thu hồi) chỉ gây khóa
  muộn về UI, KHÔNG gây rò dữ liệu: request tạo phiên/upload đầu tiên từ thiết
  bị B nhận 403 → client cập nhật trạng thái local, khóa entry và kết thúc phiên
  nhẹ nhàng như §4.3.
- Hai thiết bị cùng bật/tắt gần nhau: POST idempotent + last-write-wins; event
  log giữ đủ vết từng lần.

### 4.3 Thu hồi giữa phiên đang chạy

- **Server** (ngay khi nhận `granted: false`): đổi trạng thái → mọi upload sau
  đó của bé này trả 403 `interview_consent_revoked`; hủy job chấm còn chờ trong
  queue của bé; xóa ngay các file audio CHƯA chấm trong bucket tạm (thu hồi =
  ngừng xử lý, không chỉ ngừng thu). Kết quả đã chấm xong trước thời điểm thu
  hồi (điểm/nhận xét — không còn audio) được giữ lại và xóa được qua "Xoá dữ
  liệu gia đình".
- **Client** (phiên đang mở nhận 403 khi upload): kết thúc phiên nhẹ nhàng —
  phát clip dẫn chuyện "tạm dừng" từ pool clip duyệt sẵn (không TTS runtime):
  "Đô Đô tạm nghỉ chút nha. Hẹn bé lần sau!"; hiện màn kết thúc bình thường,
  không thông báo lỗi, không nói nguyên nhân với bé. Báo cáo phụ huynh đánh dấu
  phiên "kết thúc sớm do đã tắt cho phép".
- Câu đang thu dở tại thời điểm client biết thu hồi: hủy tại chỗ, không upload.

### 4.4 Mất mạng khi bật consent

- Toggle là **server-first, không optimistic**: UI chỉ chuyển "đã bật" sau khi
  POST trả 2xx. Lý do: nếu bật optimistic mà server chưa ghi thì mọi upload sẽ
  403 → phiên hỏng khó hiểu.
- POST thất bại/timeout → giữ nguyên trạng thái cũ trên UI + thông báo giọng
  Kido: "Chưa kết nối được máy chủ. Cài đặt chưa thay đổi, bạn thử lại nhé." +
  nút thử lại.
- Trường hợp server ĐÃ ghi nhưng response rớt: retry POST idempotent vô hại;
  hoặc `GET /interview/consent` lúc mở lại màn sẽ reconcile.
- Thu hồi khi mất mạng: cũng server-first; ngoài ra client khóa entry LOCAL ngay
  lập tức (fail-safe nghiêng về phía khóa) và tiếp tục retry POST tới khi server
  xác nhận.

## 5. Wording màn hình (bản đầy đủ)

Giọng "Kido" trung tính với phụ huynh (theo `docs/KIDO_DODO_PERSONA.md` §3:
gọi phụ huynh "bạn", gọi trẻ "bé" — KHÔNG dùng persona Đô Đô ở các màn này).
Lời Đô Đô duy nhất trong flow là speech bubble ở entry khóa và clip tạm dừng
(§1, §4.3) — hai câu này theo đúng persona Đô Đô.

### 5.1 Màn giới thiệu (sau ParentGate PIN)

> **Luyện phỏng vấn cùng Đô Đô**
>
> Đô Đô đặt câu hỏi bằng giọng nói, như một buổi khảo sát đầu vào lớp 1 thu
> nhỏ. Với mỗi câu, bé chạm nút mic để bắt đầu trả lời và chạm lần nữa để
> dừng (máy tự dừng sau 60 giây).
>
> - Mỗi phiên gồm 10 câu hỏi, mỗi câu trả lời tối đa 60 giây.
> - Ba chế độ: Làm quen (tiếng Việt) · English basics · Tổng hợp phong cách CLC.
> - Bé chỉ nghe lời khen và động viên. Nhận xét chi tiết từng câu nằm trong báo
>   cáo dành riêng cho bạn.
> - Mỗi bé có 1 phiên trải nghiệm miễn phí; sau đó tính năng thuộc gói đăng ký
>   Kido. Tối đa 2 phiên cho mỗi bé mỗi ngày.
>
> Tính năng cần ghi âm câu trả lời của bé, vì vậy Kido cần sự cho phép của bạn
> trước khi bắt đầu.
>
> [Tiếp tục]   [Để sau]

### 5.2 Màn consent

> **Cho phép ghi âm và xử lý giọng nói**
>
> **Mục đích**
> Kido ghi âm câu trả lời của bé chỉ để nhận xét nội dung trả lời và mức độ tự
> tin, từ đó tạo báo cáo luyện tập cho bạn. Không dùng cho quảng cáo. Không
> dùng để huấn luyện AI.
>
> **Dữ liệu được thu**
> Bản ghi giọng nói của từng câu trả lời, tối đa 60 giây mỗi câu. Máy chỉ thu
> từ lúc bé chạm nút mic bắt đầu tới lúc bé chạm dừng, và tự dừng sau 60
> giây — không bao giờ thu âm nền. Bản ghi không kèm tên, số điện thoại hay
> định danh thiết bị.
>
> **Ai xử lý bản ghi**
> Bản ghi được gửi từ máy chủ Kido tới dịch vụ **Google Vertex AI (model
> Gemini)** để phân tích nội dung trả lời, theo cấu hình không-lưu-trữ và
> không-dùng-để-huấn-luyện của Google. Thiết bị của bạn không kết nối trực tiếp
> tới Google.
>
> **Lưu trữ và xóa**
> File ghi âm bị **xóa ngay sau khi hệ thống chấm xong** câu đó. Kido chỉ giữ
> lại kết quả chấm: điểm, nhận xét và tóm tắt nội dung nghe được, gắn với hồ sơ
> ẩn danh của bé.
>
> **Quyền của bạn**
> Bạn bật riêng cho từng bé và có thể tắt bất kỳ lúc nào trong Khu vực phụ
> huynh. Khi tắt, tính năng khóa lại ngay và máy chủ ngừng nhận mọi bản ghi
> mới. Bạn cũng có thể xóa toàn bộ dữ liệu của gia đình bằng chức năng "Xoá dữ
> liệu gia đình".
>
> Khi bé vào phiên đầu tiên, hệ điều hành sẽ hỏi quyền dùng micro của thiết bị.
>
> [Đọc Chính sách quyền riêng tư của Kido] *(link tới trang /privacy —
> `landing/src/app/privacy/page.tsx`, đã viết lại ở task 0.2)*
>
> ☐ Tôi là phụ huynh/người giám hộ và đồng ý với nội dung trên.
>
> Bật cho từng bé:
> ( ) Bé {tên bé 1}    ( ) Bé {tên bé 2} …
>
> [Đồng ý và bật]   *(chỉ bấm được khi đã tick checkbox và chọn ≥1 bé)*

### 5.3 Chuỗi quyền mic OS (tham chiếu, cấu hình ở task mobile)

- iOS `NSMicrophoneUsageDescription`: "Kido cần micro để ghi câu trả lời của bé
  trong phiên luyện phỏng vấn. Máy chỉ thu từ lúc bé chạm nút nói tới lúc chạm
  dừng, tối đa 60 giây mỗi câu."
- Android: runtime permission `RECORD_AUDIO`, xin đúng thời điểm §2.
- Bị từ chối → màn hướng dẫn giọng Kido: "Kido chưa được cấp quyền micro. Bạn
  mở Cài đặt của máy để cấp quyền cho Kido nhé." (không hiển thị cho bé).

### 5.4 Bản tiếng Anh tóm tắt (dán vào App Review notes)

> **Interview Practice with Dodo — parental consent flow (reviewer notes)**
>
> - The feature entry is locked behind a parental gate (spelled-out arithmetic
>   challenge + 4–6 digit parent PIN, same gate used across the app).
> - Before any recording is possible, the parent sees a dedicated consent
>   screen disclosing: purpose (speaking-practice feedback for the parent
>   report only; no ads, no AI training), data collected (per-answer voice
>   recordings, max 60 seconds each; recording runs only between the child's
>   explicit start tap and stop tap on the mic button and auto-stops at 60
>   seconds — never background audio, no name/phone/device identifiers
>   attached), processor (**Google
>   Vertex AI — Gemini**, called from our server only, configured for
>   zero data retention and no training; the device never contacts Google
>   directly), retention (**audio files are deleted immediately after
>   automated review**; only structured scores/summaries are kept, tied to an
>   anonymous child profile), withdrawal (per-child toggle in the parent area;
>   once revoked the server rejects any further audio upload with HTTP 403),
>   and a privacy policy link.
> - Consent is opt-in **per child** and stored server-side; a free household
>   is limited to 1 trial session per child, and all children are capped at
>   2 sessions per day.
> - The OS microphone permission is requested only after parental consent, at
>   the moment the child first enters a session — never during onboarding.

## 6. Mapping sang yêu cầu store

### Apple — 5.1.1(i) Data Collection and Storage

- Yêu cầu: app thu dữ liệu cá nhân phải có privacy policy link trong app và
  metadata, mô tả dữ liệu thu + bên thứ ba nhận dữ liệu → **link chính sách
  ngay trên màn consent (§5.2)** + trang `/privacy` viết lại (task 0.2, gỡ cam
  kết "Không ghi âm") + App Privacy nutrition label cập nhật mục Audio Data.
- Yêu cầu: phải có consent trước khi thu dữ liệu cá nhân; app trẻ em cần consent
  của phụ huynh → **toàn bộ đường tới ghi âm nằm sau ParentGate (adult
  challenge + PIN) → màn consent**; state machine §2 bảo đảm không có mic
  prompt và không có upload trước `da_dong_y`.
- Yêu cầu: người dùng rút được consent, app ngừng thu khi rút → **toggle
  per-child + `POST /interview/consent {granted:false}`; server 403 mọi upload
  sau thu hồi (§3.3, §4.3)**.
- Yêu cầu: chỉ thu dữ liệu cần thiết cho tính năng (minimization) → **push-to-
  talk ≤60 giây/câu, không thu nền; audio xóa ngay sau chấm; chỉ giữ kết quả
  có cấu trúc (§5.2 Lưu trữ và xóa)**.

### Apple — 5.1.2(i) Data Use and Sharing

- Yêu cầu: không chia sẻ dữ liệu cá nhân cho bên thứ ba khi chưa được cho phép
  rõ ràng → **màn consent nêu đích danh Google Vertex AI (Gemini) là bên xử lý
  TRƯỚC khi bất kỳ bản ghi nào tồn tại (§5.2 Ai xử lý bản ghi)**.
- Yêu cầu: dữ liệu chỉ dùng đúng mục đích đã khai với người dùng → **mục đích
  giới hạn ghi trên màn consent (báo cáo luyện tập; không ads, không huấn luyện
  AI) + cấu hình zero-retention/no-training của Vertex (design.md §4, §6)**.
- Yêu cầu: không dùng dữ liệu trẻ em cho tracking/profiling → **request AI đi
  từ kido-server, không kèm định danh thiết bị hay định danh cá nhân của trẻ
  (design.md §6); childId ẩn danh không rời server**.
- Liên quan 1.3 (Kids Category): commerce/cài đặt phụ huynh phải sau parental
  gate → **tái dùng `ParentGateModal` hiện có ngay đầu flow (§1)**.

### Google Play — Families policy

- Yêu cầu: thu personal info từ trẻ (gồm bản ghi giọng nói) phải có verifiable
  parental consent trước khi thu → **gate người lớn + checkbox "Tôi là phụ
  huynh/người giám hộ" + consent lưu server-side theo từng bé kèm event log
  (§3.2) làm bằng chứng**.
- Yêu cầu: Data safety form khai đúng thực tế → **khai mục "Voice or sound
  recordings": collected (optional, user-initiated), processed ephemerally
  (xóa ngay sau chấm), shared với service provider (Google Vertex AI, vai trò
  data processor) cho app functionality; consent flow này là căn cứ khai**
  (checklist go-live §Data safety).
- Yêu cầu: app cho trẻ em không truyền AAID/định danh thiết bị cho bên thứ ba →
  **thiết bị không gọi provider AI trực tiếp; server gửi audio không kèm định
  danh (design.md §6)**.
- Yêu cầu: chỉ xin runtime permission khi tính năng cần tới (permission best
  practice, đặc biệt với mic trong app trẻ em) → **`RECORD_AUDIO`/mic iOS chỉ
  xin tại phiên đầu tiên SAU consent (§2), không xin ở onboarding; manifest
  khớp inventory quyền (checklist §2.5)**.
- Yêu cầu: khai báo AI-generated content trên Play Console → **feature dùng AI
  chấm; khai theo proposal §Compliance**.
- Yêu cầu: privacy policy truy cập được từ store listing và trong app → **link
  ở màn consent (§5.2) + store listing (checklist go-live)**.

### Ghi chú phương án lùi (POC fail)

Nếu POC Phase 0 không đạt gate (≥85% câu rõ ràng hiểu đúng VÀ 0 false-negative
gắt) → phương án không-AI (phụ huynh nghe lại bản ghi + checklist) VẪN giữ
nguyên cấu trúc consent flow này, nhưng wording đổi hai chỗ: bỏ mục "Ai xử lý
bản ghi" (không còn Vertex AI), mục "Lưu trữ và xóa" đổi thành lưu-để-phụ-
huynh-nghe-lại kèm thời hạn lưu cụ thể. Biến thể wording chốt sau quyết định
go/no-go, không nằm trong draft này.
