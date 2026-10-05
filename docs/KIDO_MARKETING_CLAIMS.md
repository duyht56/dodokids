# Kido — Truth Matrix cho Claim Thương mại

- **Mục đích**: mỗi claim công khai về sản phẩm → nguồn sự thật → trạng thái đối chiếu.
- **Phạm vi dùng chung**: landing page, store listing (Play/App Store), copy trong app, quảng cáo. Đây là nguồn duy nhất; không claim ở bất kỳ kênh nào mà không có dòng tương ứng ở đây.
- **Trạng thái**: ACTIVE — chỉ các dòng ✅, hoặc phạm vi hẹp đã ghi rõ ở dòng 🟡, được dùng cho public copy; các dòng ❓ **chờ owner xác nhận**.
- **Task liên quan**: `T-3` trong `landing/docs/SEO_PLAN.md`. Content route chỉ được dùng claim đã đạt điều kiện ở bảng này.
- **Ngày lập**: 2026-07-29 · cập nhật gần nhất: 2026-10-05 (claim gói và trụ cột trong app: paywall, onboarding, Cài đặt → Gói đăng ký; thêm C-11b; sửa C-03/C-11/C-12/C-16/C-42). Trước đó 2026-09-23 (owner duyệt C-29–C-43 cho store listing Google Play, sửa C-15/C-22/C-27).

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

**Còn nợ** (cập nhật 2026-10-05):

- **Trong app (paywall, onboarding, Cài đặt → Gói đăng ký).**
  - Dòng gói Năm cũ *"Mở toàn bộ 48 tuần ngay"* thiếu điều kiện `R-3` và hứa 48 tuần khi mới phát hành một phần (C-37). Dòng gói Tháng cũ *"Mở tuần hiện tại và 4 tuần tiếp theo…"* nói "mở" những tuần mà bản đồ vẫn khoá. Cả hai đã thay bằng câu ở **C-11b**, nay nằm ở `mobile/src/constants/planCopy.ts` (`PLAN_ACCESS`, `PAYWALL_FEATURES`); `npm run test:paywall-claims` (trong `mobile/`) giữ các luật ở bảng này.
  - Không ghi số tuần N. App không nhận được số tuần đã phát hành: `GET /iap/entitlement` không có, prefetch-manifest chỉ trả các tuần bé được mở, route `published` chỉ dành cho admin. N viết cứng trong binary thì lỗi thời sau mỗi lần publish tuần. **Owner chưa ký** việc bỏ N trên paywall, xem C-11b và §4. Hệ quả cần biết khi ký: ba mẹ của bé đã học hết các tuần đã phát hành (vd. gói hết hạn, bé dừng ở tuần 9) mua lại gói thì bé chỉ gặp màn "Nội dung đang được cập nhật" (golive plan 3.10), và paywall không báo trước điều này.
  - Cài đặt → Gói đăng ký: gói mua qua cửa hàng nay hiện *"kỳ hiện tại đến dd/mm/yyyy, tự gia hạn trừ khi ba mẹ huỷ"* thay cho *"hết hạn dd/mm/yyyy"* (gói tự gia hạn, đúng như điều khoản trên paywall). Gói từ mã kích hoạt vẫn hiện "hết hạn".
  - Sửa ở working tree mobile, **chưa commit/build**. Mọi bản đến Android vc8 (38090fd) và iOS build 4 vẫn hiện câu cũ; câu cũ chỉ hết khi Android vc9 / iOS build ≥5 lên store.
- **Landing** (repo riêng): sửa 2026-10-05. Gói Năm: *"Trong thời hạn gói: mở ngay mọi tuần đã phát hành; tuần mới tự mở khi phát hành"*; Gói Tháng thêm *"(nếu đã phát hành)"*; subtitle học phí và trang `/lo-trinh-48-tuan` kèm câu C-37 (`roadmapReleaseNote`, `LATEST_RELEASED_WEEK` trong `landing/src/lib/content.ts`); bỏ claim "chuỗi ngày học" cho khu phụ huynh (C-22). Hết nợ khi landing được deploy.

---

## 2. Truth matrix

### 2.1 Cấu trúc chương trình

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-01 | Lộ trình **48 tuần** | `entitlement.policy.ts:13` (`TOTAL_WEEKS = 48`); `KIDO_ENGLISH_CURRICULUM.md:7` | ✅ |
| C-02 | **Mỗi ngày đúng 8 hoạt động**, khó dần | `AGENTS.md:43-44` — "one learning day = exactly 8 activities (`activityIndex` 1..8, difficulty ascending)" | ✅ |
| C-03 | **Ba trụ cột**: Toán tư duy · Tư duy ngôn ngữ · Tiếng Anh nền tảng | `KIDO_MATH_CURRICULUM.md`, `KIDO_LANG_CURRICULUM.md`, `KIDO_ENGLISH_CURRICULUM.md`. Trong app (2026-10-05, ra cùng Android vc9 / iOS build ≥5): paywall `PAYWALL_FEATURES` (`mobile/src/constants/planCopy.ts`) dùng đủ tên, mỗi tên nối bằng dấu cách không ngắt nên không bị xuống dòng giữa tên; slide 2 onboarding dùng dạng ngắn của C-29 ("…, Tiếng Anh"), trên tablet mỗi trụ cột một dòng. Hai chỗ này trước đó ghi "Toán, Tiếng Việt & Tiếng Anh" | ✅ |
| C-04 | Dành cho trẻ **4–6 tuổi** | ❓ chưa đối chiếu trong phiên này — cần trỏ tới phát biểu độ tuổi trong canonical doc | ❓ |
| C-05 | Hoạt động 1–2 khởi động / 3–6 luyện tập / 7–8 vận dụng | 🟡 `AGENTS.md:43-44` xác nhận *difficulty ascending*, nhưng **không** xác nhận cách chia nhóm 2/4/2 cụ thể này | 🟡 |
| C-06 | Con **dừng và tiếp tục theo nhịp của mình** | ❓ cần đối chiếu luồng progress/resume | ❓ |
| C-29 | **Mỗi tuần 5 ngày học**: 2 ngày Toán tư duy, 2 ngày Tư duy ngôn ngữ, 1 ngày Tiếng Anh | Ngày 1 và 4 Toán, ngày 2 và 5 Tư duy ngôn ngữ, ngày 3 Tiếng Anh: `AI_CONTEXT.md`, `KIDO_LANG_CURRICULUM.md:51`, `mobile/src/screens/parent/DashboardScreen.tsx` `SUBJECT_DAYS`. Dashboard gọi trụ cột này là "Tiếng Việt", lệch tên chuẩn C-03 | ✅ |
| C-30 | Ở mỗi hoạt động, **câu hỏi được đọc thành tiếng**; con **bấm để nghe lại** | `mobile/src/components/activities/ActivityContainer.tsx` (tự phát lời đọc, nút "Nghe lại câu hỏi") | ✅ |
| C-31 | Khi con chưa chọn đúng, **Đô Đô đưa gợi ý để con thử lại, và giải thích đáp án khi cần** | `mobile/src/services/feedbackAudio.ts:3-6`. Không mở rộng thành "không chấm lỗi" (C-17 còn ❓) | ✅ |
| C-32 | **Học xong các bài của một tuần, con nhận một sticker** cho bộ sưu tập 48 tuần | `kido-server/src/modules/progress/progress.service.ts` (cấp sticker khi đủ `requiredLessonIds` của tuần); `mobile/src/screens/child/StickerCollectionScreen.tsx`. Liên quan C-23 | ✅ |
| C-33 | Ví dụ hoạt động **Toán tư duy**: đếm đồ vật trong tranh rồi chọn số đúng; xếp đồ vật từ nhỏ đến to; chọn những hình vừa tròn vừa đỏ; tìm hình còn thiếu trong một quy luật | Seed toán `kido-pipeline/seeds/w01..w07` (nội dung đã imported trên production) | ✅ |
| C-34 | Tư duy ngôn ngữ: con **luyện nghe, hiểu và suy luận qua lời nói và hình ảnh**; ví dụ hoạt động: nghe một từ rồi chọn tranh đúng; làm theo lời hướng dẫn; tìm thứ không cùng nhóm; xếp tranh theo trình tự một câu chuyện | Seed lang-v1 w01–w07 và lang-v3; đúng với cả hai bản | ✅ |
| C-35 | **Bài học đã được sắp sẵn theo lộ trình**, ba mẹ không phải tự soạn bài hay chọn nội dung cho từng ngày | `kido-server/src/modules/lessons/lessons.service.ts` `findToday` chọn bài kế tiếp theo lộ trình cố định. Không được hiểu thành "thích ứng" (R-4) | ✅ |

### 2.2 Gói & giá

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-07 | Gói Tháng **139.000đ/tháng** | `iap.service.ts:32-34` — product id `kido_monthly_139k` | ✅ |
| C-08 | Gói Năm **999.000đ/năm** | `iap.service.ts:32-34` — product id `kido_annual_999k` | ✅ |
| C-09 | Gói Năm "**tiết kiệm 669.000đ/năm**" | Số học: 139.000×12 − 999.000 = 669.000 | ✅ |
| C-10 | Gói Năm "**≈83.000đ/tháng**" | Số học: 999.000÷12 = 83.250 | ✅ |
| C-11 | Gói Năm mở **toàn bộ 48 tuần** | `entitlement.policy.ts:23` — `annual` → `TOTAL_WEEKS`. Chỉ mở được các tuần đã `imported`, nên khi còn nói "48 tuần" thì phải kèm C-37 và R-3. "Mở" ở đây là quyền ở server; bản đồ trong app vẫn mở từng tuần một. Paywall trong app dùng câu C-11b | ✅ |
| C-11b | Paywall trong app, dòng dưới tên gói. Gói Năm: **"Học lần lượt mọi tuần đã phát hành và tuần mới ra, trong thời hạn gói"**. Gói Tháng: **"Học lần lượt các tuần đã phát hành, mở dần theo tiến độ của con, trong thời hạn gói"** | *Học lần lượt*: `lessons.service.ts` `findToday` lấy bài `lessonStatus: 'imported'` chưa học đầu tiên, xếp theo `week, day`, trong phạm vi `maxUnlockedWeek`; bản đồ chỉ cho học tuần hiện tại, các tuần phía trước hiện khoá kể cả với gói Năm (`mobile/src/services/homeProgress.ts` `deriveWeekPresentation`, `HomeScreen.tsx` `handleWeekPress`). *Tuần mới ra*: gói Năm có `maxUnlockedWeek` = `TOTAL_WEEKS` (`entitlement.policy.ts:23`), nên tuần vừa import học được khi bé tới. Gói Tháng `currentWeek + 4` (`:24-26`) trượt theo tiến độ, nên với bé học tuần tự hai gói học được như nhau; tải trước cũng như nhau vì manifest chỉ lấy tối đa 4 tuần tới (`prefetch-manifest.ts:27`, `:86-98`). Vì vậy trong app không nói gói nào "mở ngay" tuần nào; câu gói Tháng giữ cách nói "mở dần theo tiến độ" của C-12b cho tới khi chốt `Q-6`. Không có N (C-37) vì app không biết số tuần đã phát hành; **owner chưa ký** việc bỏ N (§4). Luật kiểm ở `mobile/scripts/verify-paywall-claims.cjs`. Ra cùng Android vc9 / iOS build ≥5 | 🟡 khớp code; chờ owner ký bỏ N (hoặc server trả số tuần) và `Q-6` |
| C-12 | ~~Gói Tháng mở toàn bộ 48 tuần~~ → **"Mở tuần hiện tại và 4 tuần tiếp theo, tự động mở tiếp khi con học lên"** | `entitlement.policy.ts:24-26`. Xem §1. Câu này chỉ dùng cho landing: trong app, bản đồ khoá các tuần phía trước nên "mở … 4 tuần tiếp theo" đọc sai; paywall dùng câu C-11b (2026-10-05) | 🟡 câu chữ đã an toàn, nhưng `Q-6` chưa chốt quyền lợi *chính thức* |
| C-12b | Subtitle section học phí (landing): **"Trong thời hạn gói còn hiệu lực, Gói Năm mở ngay mọi tuần đã phát hành; Gói Tháng mở dần theo tiến độ học của con."** + câu C-37 | `entitlement.policy.ts:23` vs `:24-26`; `landing/src/lib/content.ts` (2026-10-05) | 🟡 như C-12 |
| C-13 | **Khu Khám phá miễn phí**, không cần mua gói | `KIDO_EXPLORE_BRD.md:16,60` — "miễn phí 100%"; `:717` — "Free means free: không khóa game bằng subscription, quảng cáo hoặc lượt" | ✅ |
| C-14 | "Hủy hoặc đổi gói theo chính sách của cửa hàng ứng dụng" | ❓ claim pháp lý — cần owner + đối chiếu điều khoản store | ❓ |
| C-36 | **2 tuần đầu** của lộ trình được mở mà không cần mua gói | `entitlement.policy.ts:21`, `child.schema.ts:105` (`trialWeeksUnlocked` mặc định 2). Owner xác nhận 2026-09-23 đây là chính sách chính thức | ✅ |
| C-37 | **"Hiện đã có bài học từ tuần 1 đến tuần N; các tuần tiếp theo được phát hành dần."** | Trạng thái `imported` trên DB production. Ngày 2026-09-23: N = 7; ngày 2026-10-05: N = 8 (landing `LATEST_RELEASED_WEEK = 8`; store listing vẫn ghi 7 cho tới lần sửa listing kế tiếp). **Bắt buộc** trong mô tả đầy đủ của store listing (và trang landing) khi còn nói "48 tuần" mà chưa đủ tuần; caption ảnh chụp được nói "Lộ trình 48 tuần" (C-01) mà không cần câu này. Ai publish tuần mới thì cập nhật N ở store listing **và** `LATEST_RELEASED_WEEK` của landing rồi deploy landing | ✅ (N phải khớp production) |

### 2.3 An toàn & kiểm duyệt

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-15 | **Có người thật kiểm duyệt**; AI không quyết định phát hành | `AGENTS.md:47-48` — "Only Human Gate sets `approved`; only publish to `kido-server` sets `imported`". Điều kiện (2026-09-23): duyệt từng hoạt động trước khi chạy `approve:week`; không dùng `--include-draft` cho tuần sẽ publish | ✅ |
| C-16 | **Không quảng cáo** | 🟡 `KIDO_EXPLORE_BRD.md:717` chỉ xác nhận cho **Khu Khám phá**. Claim "không quảng cáo" cho **toàn app** cần owner xác nhận thành chính sách. 2026-10-05: đã bỏ dòng "Không quảng cáo" khỏi paywall (ra cùng Android vc9 / iOS build ≥5), vì ở đó nó đọc như quyền lợi riêng của gói, như thể các tuần miễn phí có quảng cáo. Còn câu "Không quảng cáo, không bán dữ liệu" ở màn đồng ý của phụ huynh (`ParentConsentScreen.tsx` `NOTICE_ITEMS`), thuộc nội dung thông báo đã có phiên bản; chưa sửa, chờ owner chốt C-16 | 🟡 |
| C-17 | **Không tạo áp lực**, không chê bai, không chấm lỗi | ❓ nguyên tắc sản phẩm (no-stress) có trong `AI_CONTEXT.md`, nhưng cần owner chốt thành claim công khai | ❓ |

### 2.4 Nội dung từng trụ cột

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-18 | Tiếng Anh: **12 chủ đề** gần gũi | `KIDO_ENGLISH_CURRICULUM.md:7` — "48 tuần = 48 bài = 12 chủ đề × 4 bài" | ✅ |
| C-19 | Tiếng Anh: **phần nói tiếp tục cùng ba mẹ ngoài màn hình** | `KIDO_ENGLISH_CURRICULUM.md:47` — trẻ chỉ *nhận ra/chọn*, phần nói xử lý ở lớp offline-task, **không** dùng mic/ASR trong MVP; `:83` — "App không có mic" | ✅ |
| C-20 | Tư duy ngôn ngữ: **không dạy mặt chữ hay đánh vần trên màn hình** | `KIDO_LANG_SKILL_CATALOG.md:25-35` chốt phạm vi thuần nghe/tư duy; pipeline còn cưỡng chế Ear Test tại `seed-review.prompts.ts` | ✅ |
| C-21 | Khung Toán tư duy gồm: số và lượng; quy luật/phân loại; hình–không gian; logic/giải quyết vấn đề | `KIDO_MATH_CURRICULUM.md` (FREEZE) §2–§3; `KIDO_MATH_SKILL_CATALOG_V2.md` theo các domain; corpus `kido-pipeline/seeds/w01..w48.json` có các skill tương ứng. Chỉ dùng để mô tả **khung chương trình**, không suy ra mọi activity đã imported | ✅ |
| C-38 | Tiếng Anh **bắt đầu với màu sắc và số đếm** | `themeCode` của seed `w01–w07-en`. Chỉ nêu chủ đề của các tuần sau khi curriculum EN đã FREEZE và các tuần đó đã imported | ✅ |
| C-39 | Tiếng Anh: trong ứng dụng, **con nghe tiếng Anh rồi chọn tranh đúng** | Seed EN w01–w07 chỉ có `single_select`/`multi_select`; `KIDO_ENGLISH_CURRICULUM.md:47`. Không viết "chọn đoạn âm thanh" khi `audio_select` chưa có ở các tuần đã imported | ✅ |

### 2.5 Khu vực phụ huynh

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-22 | Ba mẹ xem **tuần hiện tại và các bài con đã hoàn thành** | `parent.service.ts` `getSummary` :196-207 — `currentWeek`, `completedLessons`. **"Chuỗi ngày học" chỉ có trong API** (`streakCount`): UI khu phụ huynh không hiển thị, nên không claim chuỗi ngày học cho khu phụ huynh (2026-09-23). Chuỗi ngày học có ở màn Thành tích của bé | ✅ (bỏ "chuỗi ngày học") |
| C-23 | Xem **sao và thành tích** | 🟡 `progress.service.ts:212-215` có `stickersEarned` (sticker theo tuần). Cần chốt: "sao" trong copy có phải chính là sticker không, hay là hai thứ khác nhau | 🟡 |
| C-24 | "Nhận **tổng kết**" về việc duy trì học | ❓ cần xác nhận tính năng này tồn tại | ❓ |
| C-40 | Khu vực phụ huynh **được bảo vệ bằng mã PIN do ba mẹ đặt** | `mobile/src/components/ParentGateModal.tsx` ("PIN 4-6 số … bảo vệ cài đặt, mua hàng và khôi phục") | ✅ |
| C-41 | Sau mỗi bài học, ba mẹ có thêm **một gợi ý hoạt động để làm cùng con ở nhà** | `mobile/src/screens/parent/OfflineTasksScreen.tsx`; `PublishLessonDto` (offline task theo bài) | ✅ |
| C-42 | Khi con hoàn thành **ngày học thứ 5** của tuần, ba mẹ **mở được báo cáo tuần** | `mobile/src/screens/parent/DashboardScreen.tsx`, `ReportScreen.tsx`; điều kiện mở khoá là `isReportUnlocked` trong `mobile/src/services/weeklyReports.ts`. Không nói thêm về nội dung báo cáo cho tới khi chốt C-24. Paywall (2026-10-05, ra cùng Android vc9 / iOS build ≥5) ghi "Ba mẹ vẫn xem được báo cáo tuần khi con hoàn thành ngày học thứ 5", thay câu cũ "Báo cáo hàng tuần cho ba mẹ" vốn không nêu điều kiện. Viết "ngày học thứ 5", không viết "ngày 5" (dễ đọc thành ngày mùng 5) hay "thứ 5" đứng riêng (thứ Năm). "Vẫn": báo cáo không phụ thuộc gói, các tuần miễn phí cũng có, nên trên paywall không được nói như quyền lợi riêng của gói. "Xem được", không viết "nhận": app không gửi báo cáo đi (C-24 còn ❓) | ✅ |

### 2.6 Khu Khám phá

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-25 | Khu Khám phá cho trẻ **tự chọn trò, chơi lại không giới hạn và thoát bất kỳ lúc nào** | `KIDO_EXPLORE_BRD.md:14-18,58-61`; catalog và luồng chơi hiện có tại `mobile/src/screens/child/ExploreCatalogScreen.tsx` + `ExplorePlayScreen.tsx` | ✅ |
| C-26 | Khu Khám phá **không có XP/sao/huy hiệu/streak/leaderboard** và không ghi thay tiến độ lộ trình | `KIDO_EXPLORE_BRD.md:61-62,69-70`; `docs/kido-explore-contract.ts:4-6`; guard cấm play-history tại `mobile/src/explore/privacy.ts` | ✅ |
| C-27 | Khu Khám phá **không giới hạn thời gian trả lời và không có trạng thái thua**; khi trẻ gặp khó có thể tăng gợi ý/giảm độ phức tạp | `KIDO_EXPLORE_BRD.md:137-170,584,911-914`; logic `hintLevel`/demotion trong `mobile/src/screens/child/ExplorePlayScreen.tsx`. **Sửa 2026-09-23:** câu cũ "không có đồng hồ đếm ngược" không còn đúng — Ú òa có đồng hồ cát trong lúc ghi nhớ (ngoại lệ BRD §6.2, `SandTimer.tsx`) | ✅ |
| C-28 | Khu Khám phá không gọi AI sinh nội dung tự do khi trẻ chơi; bài được sinh bằng generator/validator và tài nguyên đã duyệt | `KIDO_EXPLORE_BRD.md:66-68`; registry generator/validator tại `mobile/src/explore/registry.ts`; request stateless được giới hạn tại `mobile/src/explore/privacy.ts` | ✅ |

### 2.7 Tên hiển thị trên store

| # | Claim | Nguồn sự thật | TT |
|---|---|---|---|
| C-43 | Tên app trên Google Play: **"Dodokids - Xây nền tư duy"** | Owner chốt 2026-09-23. Là câu định vị thương hiệu, không phải cam kết kết quả: không ghép với số liệu hay lời hứa năng lực (R-1) | ✅ |

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
| Rà lại claim trên store listing và trong app theo cùng matrix này | | Store listing Google Play (vi) rà xong 2026-09-23. Trong app (paywall, onboarding, Cài đặt → Gói đăng ký) rà 2026-10-05, ra cùng Android vc9 / iOS build ≥5 |
| Cập nhật số tuần N ở C-37 trên store listing sau mỗi lần publish tuần mới | người publish | mỗi lần publish |
| Ký việc paywall trong app không ghi số tuần N (C-11b), **hoặc** thêm số tuần đã phát hành vào một response app đã gọi (vd. `publishedThroughWeek` ở `GET /iap/entitlement`, thay đổi ở kido-server) để paywall hiện "hiện có tuần 1–N" | Owner (kido-server nếu chọn cách thứ hai) | Trước khi đóng băng Android vc9 / iOS build ≥5 |

**Quy trình duy trì**: đổi claim công khai ở bất kỳ kênh nào → cập nhật file này trong cùng change. Đổi entitlement/curriculum ở code → rà lại các dòng bị ảnh hưởng.
