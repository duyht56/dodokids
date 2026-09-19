# Kido — Truth Matrix cho Claim Thương mại

- **Mục đích**: mỗi claim công khai về sản phẩm → nguồn sự thật → trạng thái đối chiếu.
- **Phạm vi dùng chung**: landing page, store listing (Play/App Store), copy trong app, quảng cáo. Đây là nguồn duy nhất; không claim ở bất kỳ kênh nào mà không có dòng tương ứng ở đây.
- **Trạng thái**: ACTIVE — chỉ các dòng ✅, hoặc phạm vi hẹp đã ghi rõ ở dòng 🟡, được dùng cho public copy; các dòng ❓ **chờ owner xác nhận**.
- **Task liên quan**: `T-3` trong `landing/docs/SEO_PLAN.md`. Content route chỉ được dùng claim đã đạt điều kiện ở bảng này.
- **Ngày lập**: 2026-07-29 · cập nhật gần nhất: 2026-09-05.

> ⚠️ File này nằm ở `kido-app/docs/` chứ không ở `landing/docs/` vì landing là repo git riêng, còn claim thì dùng chung nhiều kênh. Ngoại lệ đã ghi trong G-5 của SEO plan. Hệ quả: plan và truth matrix **không bao giờ nằm chung một PR** — nhớ khi review.

## Chú giải trạng thái

| Ký hiệu | Nghĩa |
|---|---|
| ✅ | Đã đối chiếu được với code hoặc canonical doc trong phiên rà 2026-07-29. Có dẫn nguồn. |
| ⚠️ | **Mâu thuẫn đã xác nhận.** Không được dùng cho tới khi xử lý. |
| 🟡 | Đối chiếu được **một phần** — đúng trong phạm vi hẹp hơn câu chữ đang dùng. |
| ❓ | **Chưa xác minh.** Là chính sách sản phẩm/pháp lý, không suy ra được từ code. Cần owner xác nhận. |

---

## 1. Mâu thuẫn phải xử lý trước

> ✅ **Đã sửa 2026-07-29.** Hai dòng dưới đây đã được thay bằng câu chữ an toàn. `Q-6`/`T-2` **vẫn chưa chốt** — mục này giữ lại làm hồ sơ, và để nhắc rằng câu chữ mới là *tạm* cho tới khi có quyết định chính thức.

| Claim cũ | Vị trí | Runtime thực tế | Trạng thái |
|---|---|---|---|
| *"Gói Tháng và Năm **cùng mở toàn bộ lộ trình**"* | `landing/src/lib/content.ts:227` | Hai gói **không** như nhau — xem dưới | ✅ đã sửa |
| Gói Tháng: *"Toàn bộ lộ trình 48 tuần"* | `landing/src/lib/content.ts:255` | `entitlement.policy.ts:24-26` → `min(currentWeek + 4, 48)`, cửa sổ trượt theo tiến độ học. `entitlement.service.ts:324-328` lật `expired` khi hết hạn → `entitlement.policy.ts:21` trả về phạm vi trial. | ✅ đã sửa |

⚠️ **Dòng `:227` từng bị bản rà đầu tiên bỏ sót** — chỉ bắt được `:255`. Nó nặng hơn vì khẳng định thẳng hai gói tương đương. Bài học: rà claim phải quét **cả câu dẫn/subtitle của section**, không chỉ danh sách feature.

**Câu chữ hiện đang dùng** (đúng dù `Q-6` ngã về hướng nào — nếu cửa sổ trượt là cố ý thì chính xác, nếu là bug server thì nói giảm):

- Subtitle — *"Gói Năm mở toàn bộ lộ trình ngay. Gói Tháng mở dần theo tiến độ học của con."*
- Gói Tháng — *"Mở tuần hiện tại và 4 tuần tiếp theo, tự động mở tiếp khi con học lên."*

**Còn nợ**: bullet của **Gói Năm** vẫn là *"Toàn bộ lộ trình 48 tuần"* — đúng theo `entitlement.policy.ts:23` (C-11 ✅) nhưng **chưa nêu điều kiện hiệu lực** theo `R-3`. Ứng viên: *"Mở toàn bộ 48 tuần ngay, chủ động học và xem lại trong thời hạn gói."* Chưa sửa vì nằm ngoài phạm vi quyết định đã duyệt.

---

## 2. Truth matrix

### 2.1 Cấu trúc chương trình

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-01 | Lộ trình **48 tuần** | `entitlement.policy.ts:13` (`TOTAL_WEEKS = 48`); `KIDO_ENGLISH_CURRICULUM.md:7` | ✅ |
| C-02 | **Mỗi ngày đúng 8 hoạt động**, khó dần | `AGENTS.md:43-44` — "one learning day = exactly 8 activities (`activityIndex` 1..8, difficulty ascending)" | ✅ |
| C-03 | **Ba trụ cột**: Toán tư duy · Tư duy ngôn ngữ · Tiếng Anh nền tảng | `KIDO_MATH_CURRICULUM.md`, `KIDO_LANG_CURRICULUM.md`, `KIDO_ENGLISH_CURRICULUM.md` | ✅ |
| C-04 | Dành cho trẻ **4–6 tuổi** | ❓ chưa đối chiếu trong phiên này — cần trỏ tới phát biểu độ tuổi trong canonical doc | ❓ |
| C-05 | Hoạt động 1–2 khởi động / 3–6 luyện tập / 7–8 vận dụng | 🟡 `AGENTS.md:43-44` xác nhận *difficulty ascending*, nhưng **không** xác nhận cách chia nhóm 2/4/2 cụ thể này | 🟡 |
| C-06 | Con **dừng và tiếp tục theo nhịp của mình** | ❓ cần đối chiếu luồng progress/resume | ❓ |

### 2.2 Gói & giá

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-07 | Gói Tháng **139.000đ/tháng** | `iap.service.ts:32-34` — product id `kido_monthly_139k` | ✅ |
| C-08 | Gói Năm **999.000đ/năm** | `iap.service.ts:32-34` — product id `kido_annual_999k` | ✅ |
| C-09 | Gói Năm "**tiết kiệm 669.000đ/năm**" | Số học: 139.000×12 − 999.000 = 669.000 | ✅ |
| C-10 | Gói Năm "**≈83.000đ/tháng**" | Số học: 999.000÷12 = 83.250 | ✅ |
| C-11 | Gói Năm mở **toàn bộ 48 tuần** | `entitlement.policy.ts:23` — `annual` → `TOTAL_WEEKS` | ✅ |
| C-12 | ~~Gói Tháng mở toàn bộ 48 tuần~~ → **"Mở tuần hiện tại và 4 tuần tiếp theo, tự động mở tiếp khi con học lên"** | `entitlement.policy.ts:24-26`. Xem §1 | 🟡 câu chữ đã an toàn, nhưng `Q-6` chưa chốt quyền lợi *chính thức* |
| C-12b | Subtitle section học phí: **"Gói Năm mở toàn bộ lộ trình ngay. Gói Tháng mở dần theo tiến độ học của con."** | `entitlement.policy.ts:23` vs `:24-26` | 🟡 như C-12 |
| C-13 | **Khu Khám phá miễn phí**, không cần mua gói | `KIDO_EXPLORE_BRD.md:16,60` — "miễn phí 100%"; `:717` — "Free means free: không khóa game bằng subscription, quảng cáo hoặc lượt" | ✅ |
| C-14 | "Hủy hoặc đổi gói theo chính sách của cửa hàng ứng dụng" | ❓ claim pháp lý — cần owner + đối chiếu điều khoản store | ❓ |

### 2.3 An toàn & kiểm duyệt

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-15 | **Có người thật kiểm duyệt**; AI không quyết định phát hành | `AGENTS.md:47-48` — "Only Human Gate sets `approved`; only publish to `kido-server` sets `imported`" | ✅ |
| C-16 | **Không quảng cáo** | 🟡 `KIDO_EXPLORE_BRD.md:717` chỉ xác nhận cho **Khu Khám phá**. Claim "không quảng cáo" cho **toàn app** cần owner xác nhận thành chính sách | 🟡 |
| C-17 | **Không tạo áp lực**, không chê bai, không chấm lỗi | ❓ nguyên tắc sản phẩm (no-stress) có trong `AI_CONTEXT.md`, nhưng cần owner chốt thành claim công khai | ❓ |

### 2.4 Nội dung từng trụ cột

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-18 | Tiếng Anh: **12 chủ đề** gần gũi | `KIDO_ENGLISH_CURRICULUM.md:7` — "48 tuần = 48 bài = 12 chủ đề × 4 bài" | ✅ |
| C-19 | Tiếng Anh: **phần nói tiếp tục cùng ba mẹ ngoài màn hình** | `KIDO_ENGLISH_CURRICULUM.md:47` — trẻ chỉ *nhận ra/chọn*, phần nói xử lý ở lớp offline-task, **không** dùng mic/ASR trong MVP; `:83` — "App không có mic" | ✅ |
| C-20 | Tư duy ngôn ngữ: **không dạy mặt chữ hay đánh vần trên màn hình** | `KIDO_LANG_SKILL_CATALOG.md:25-35` chốt phạm vi thuần nghe/tư duy; pipeline còn cưỡng chế Ear Test tại `seed-review.prompts.ts` | ✅ |
| C-21 | Khung Toán tư duy gồm: số và lượng; quy luật/phân loại; hình–không gian; logic/giải quyết vấn đề | `KIDO_MATH_CURRICULUM.md` (FREEZE) §2–§3; `KIDO_MATH_SKILL_CATALOG_V2.md` theo các domain; corpus `kido-pipeline/seeds/w01..w48.json` có các skill tương ứng. Chỉ dùng để mô tả **khung chương trình**, không suy ra mọi activity đã imported | ✅ |

### 2.5 Khu vực phụ huynh

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-22 | Xem **tuần hiện tại, bài đã hoàn thành, chuỗi ngày học** | `parent.service.ts:112-118` — `streakCount`, `completedLessons`, `currentWeek` | ✅ |
| C-23 | Xem **sao và thành tích** | 🟡 `progress.service.ts:212-215` có `stickersEarned` (sticker theo tuần). Cần chốt: "sao" trong copy có phải chính là sticker không, hay là hai thứ khác nhau | 🟡 |
| C-24 | "Nhận **tổng kết**" về việc duy trì học | ❓ cần xác nhận tính năng này tồn tại | ❓ |

### 2.6 Khu Khám phá

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-25 | Khu Khám phá cho trẻ **tự chọn trò, chơi lại không giới hạn và thoát bất kỳ lúc nào** | `KIDO_EXPLORE_BRD.md:14-18,58-61`; catalog và luồng chơi hiện có tại `mobile/src/screens/child/ExploreCatalogScreen.tsx` + `ExplorePlayScreen.tsx` | ✅ |
| C-26 | Khu Khám phá **không có XP/sao/huy hiệu/streak/leaderboard** và không ghi thay tiến độ lộ trình | `KIDO_EXPLORE_BRD.md:61-62,69-70`; `docs/kido-explore-contract.ts:4-6`; guard cấm play-history tại `mobile/src/explore/privacy.ts` | ✅ |
| C-27 | Khu Khám phá **không có đồng hồ đếm ngược hoặc trạng thái thua**; khi trẻ gặp khó có thể tăng gợi ý/giảm độ phức tạp | `KIDO_EXPLORE_BRD.md:137-170,584,911-914`; logic `hintLevel`/demotion trong `mobile/src/screens/child/ExplorePlayScreen.tsx` | ✅ |
| C-28 | Khu Khám phá không gọi AI sinh nội dung tự do khi trẻ chơi; bài được sinh bằng generator/validator và tài nguyên đã duyệt | `KIDO_EXPLORE_BRD.md:66-68`; registry generator/validator tại `mobile/src/explore/registry.ts`; request stateless được giới hạn tại `mobile/src/explore/privacy.ts` | ✅ |

---

## 3. Quy tắc diễn đạt bắt buộc

Ràng buộc kế thừa từ canonical docs. **Áp cho mọi copy mới**, đặc biệt là 4–5 page nội dung ở Phase D — nơi rủi ro claim vượt thực tế là cao nhất.

### R-1 — Tiếng Anh: chỉ nói *coverage chương trình*, không nói *outcome cá nhân*

`KIDO_ENGLISH_CURRICULUM.md:33` quy định trực tiếp cách nói với phụ huynh:

- ✅ Được: *"Trong 48 tuần, bé được làm quen và luyện nghe–nhận ra khoảng 120–150 từ và cụm từ tiếng Anh nền tảng thuộc 12 chủ đề gần gũi."*
- ❌ Cấm: *"sau 48 tuần trẻ nghe hiểu 150 từ"* — chương trình cố định chưa chứng minh được outcome đó.
- Nếu buộc phải cam kết năng lực: chỉ nói **80–100 mục lõi**.

> Landing hiện **chưa** claim con số từ vựng nào — tốt. Rủi ro nằm ở tương lai: một trang "Tiếng Anh cho bé" dài 800 từ gần như chắc chắn sẽ muốn có con số. R-1 tồn tại để chặn đúng lúc đó.

### R-2 — Không bịa social proof

Không rating, review, số lượng người dùng, logo báo chí, testimonial nếu chưa có thật. Áp cho cả structured data. *(= G-1 trong SEO plan.)*

### R-3 — Claim quyền lợi gói phải kèm điều kiện hiệu lực

Rút ra từ §1: mọi phát biểu về phạm vi truy cập phải nêu rõ nó phụ thuộc gói còn hiệu lực. Không nói phạm vi truy cập như một quyền vĩnh viễn.

### R-4 — Không claim tính thích ứng theo trẻ

`KIDO_ENGLISH_CURRICULUM.md:6` ghi rõ chương trình đã được reframe thành **cố-định-48-bài**, đã **bỏ hàm ý thích ứng theo trẻ**. Không dùng các từ như "cá nhân hóa", "tự điều chỉnh theo trình độ của con" trừ khi có tính năng thật.

---

## 4. Việc còn lại

| Việc | Owner | Hạn |
|---|---|---|
| Chốt Q-6 — quyền lợi chính thức gói Tháng (§1) | | |
| Xác nhận các dòng ❓ còn lại ở §2 | | |
| Chốt C-16 — "không quảng cáo" áp cho toàn app hay chỉ Khu Khám phá | | |
| Chốt C-23 — "sao" và `stickersEarned` có phải một không | | |
| Rà lại claim trên store listing và trong app theo cùng matrix này | | |

**Quy trình duy trì**: đổi claim công khai ở bất kỳ kênh nào → cập nhật file này trong cùng change. Đổi entitlement/curriculum ở code → rà lại các dòng bị ảnh hưởng.
