# PROJECT KIDO — KHUNG CHƯƠNG TRÌNH TOÁN HỌC TƯ DUY (CANONICAL)

- **Mã môn học (SubjectCode):** `toan`
- **Trạng thái:** FREEZE (Đã phê duyệt cho PRD Drafting & Biên kịch nội dung)
- **Phiên bản:** 2026-06-23-Curriculum-Freeze · Naming-unified 2026-07-02

> Tài liệu này là cột mốc đóng băng nội dung môn Toán (Math Curriculum Freeze). Mọi thay đổi/bổ sung sau ngày 23/06/2026 cần thông qua hội đồng sản phẩm và cập nhật vào `PROJECT_SOURCE_OF_TRUTH.md`.
>
> **Naming (đồng nhất 2026-07-02):** Toàn bộ tài liệu dùng **một bộ tên chuẩn theo kido-server (wire/CMS contract)** — cột tương tác là `actionType` với giá trị canonical (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`). Vocabulary sư phạm cũ ("CMS Type": `multiple_choice`, `drag_order`, `listen_select`, `match_image`) chỉ còn ở §5.1 để tra cứu lịch sử. `skillCode` đồng nhất theo bộ **đã seed** trong `kido-pipeline/seeds/`; skill chưa có seed đánh dấu *(chưa seed)*.

---

## 1. TRIẾT LÝ THIẾT KẾ & ĐỊNH VỊ SƯ PHẠM (CORE PRINCIPLES)

Khung chương trình Toán học Tư duy của Kido dành cho trẻ 4–6 tuổi tuân thủ nghiêm ngặt các nguyên tắc cốt lõi trong Source of Truth (SOT):

- **Audio-first & Visual-first:** Trẻ hoàn toàn không cần biết đọc chữ để hiểu đề bài và tham gia tương tác. Mọi câu lệnh, dẫn dắt phải được truyền tải thông qua giọng đọc sinh động của mascot Đô Đô.
- **Không tạo áp lực (No-stress Learning):** Tuyệt đối không dùng thuật ngữ học thuật khô khan, không dùng câu lệnh phán xét tiêu cực ("Sai rồi", "Kém"). Mọi bài học được game hóa dưới hình thức thử thách, trò chơi khám phá cùng Đô Đô.
- **Tập trung vào năng lực sẵn sàng (School Readiness):** Không dạy trước kiến thức lớp 1 kiểu nhồi nhét, học vẹt phép tính trừu tượng. Trọng tâm là phát triển bộ rễ tư duy logic, năng lực thấu hiểu nhân quả, ước lượng không gian và tư duy đa tầng.

---

## 2. PHÂN HỆ 1: NHÓM 2 (4–5 TUỔI) — TƯ DUY LOGIC TRỰC QUAN & NHÂN QUẢ

**Mục tiêu cốt lõi:** Chuyển dịch từ tư duy hành động cụ thể sang tư duy trực quan hình tượng, nhận biết các mối quan hệ logic cơ bản và bản chất liên kết của sự vật.

| STT | Tên Kỹ năng | Skill Code | actionType | Đặc tả & Guardrails |
|-----|-------------|-----------|------------|---------------------|
| 1 | Đếm và nhận biết số (1–20) | `math_count_1_20` | `count_tap`, `sort_sequence` | Bé đếm vật thể bằng cách chạm kèm hiệu ứng âm thanh. Xếp số lên "Đoàn tàu số" (sort_sequence). Không dùng ký hiệu +, -, =. |
| 2 | Quy luật phức hợp (Pattern nâng cao) | `math_pattern_abc` | `single_select` | Chuỗi lặp ABC/ABC hoặc quy luật tăng/giảm theo kích thước/màu. Đô Đô: "Mảnh ghép tiếp theo trong món quà của Đô Đô là gì nhỉ?" |
| 3 | Phân loại theo 2 thuộc tính | `math_classify_2attr` | `single_select` | Tìm vật thỏa mãn đồng thời 2 thuộc tính (vừa TO vừa ĐỎ…). Ma trận 2x2 trực quan. |
| 4 | Quan hệ nhân quả và suy luận | `math_logic_causality` | `single_select` | Nghe audio dẫn dắt → chọn 1 ảnh. "Nếu trời mưa to, bé cần mang theo thứ gì để không bị ướt áo nhỉ?" |
| 5 | Tư duy không gian nâng cao | `math_spatial_basic` | `single_select` | Tìm hình đối xứng qua gương / lật hình phẳng. Chỉ hình phẳng có trục đối xứng rõ (cánh bướm, táo, lá, hoa). Tránh khối 3D. |
| 6 | Sắp xếp thứ tự | `math_sequence_order` | `sort_sequence` | Sắp xếp 3–4 tranh theo chuỗi thời gian logic (Gieo hạt → Nảy mầm → Cây ra hoa). |
| 7 | Tìm điểm giống và khác | `math_compare_diff` *(chưa seed)* | `single_select` | So sánh 2 tranh tìm điểm khác biệt; hoặc "Tìm vật lạc loài" + Đô Đô giải thích qua audio. |
| 8 | Đo lường và ước lượng | `math_measurement_base` | `single_select`, `count_tap` | Đo bằng đơn vị không chuẩn ("con cá này dài bằng mấy cái kẹp giấy?"). |

---

## 3. PHÂN HỆ 2: NHÓM 3 (5–6 TUỔI) — TƯ DUY TRỪU TƯỢNG SƠ KHỞI & BÁM SÁT FORMAT THI TRƯỜNG ĐIỂM

**Mục tiêu cốt lõi:** Làm quen ký hiệu toán học số lớn, suy luận đa tầng, bám sát ma trận đề thi đánh giá năng lực vào lớp 1 (Amsterdam, Archimedes, Ngôi Sao, Lê Quý Đôn…).

> Phần lớn kỹ năng Nhóm 3 **chưa có seed** trong repo (seed hiện tập trung Nhóm 2). Skill chưa seed giữ tên canonical + đánh dấu *(chưa seed)* cho tới khi được implement.

| STT | Tên Kỹ năng | Skill Code | actionType | Đặc tả & Guardrails |
|-----|-------------|-----------|------------|---------------------|
| 1 | Toán số học cơ bản (1–50) | `math_arithmetic_1_50` *(chưa seed)* | `single_select`, `count_tap` | Cộng trừ phạm vi 10 trực quan; điền số thiếu trong dãy / ô trống phép tính bắc cầu (sát format Amsterdam). |
| 2 | Quy luật và dãy số nâng cao | `math_sequence_jump` *(chưa seed)* | `single_select` | Dãy số bước nhảy cố định (2,4,6,[?],10). Ma trận đan xen 3 thuộc tính: Hình + Màu + Số lượng. |
| 3 | Ma trận logic (Matrix) | `math_matrix_logic` *(chưa seed; biến thể 2x2 đã seed: `math_matrix_2x2_basic` / `math_matrix_2x2_adv`)* | `single_select` | Ma trận 3x3 khuyết 1 ô (1 file ảnh duy nhất); phương án là thẻ hình chứa mảnh ghép đúng quy luật hàng/cột. |
| 4 | Tư duy không gian 3D sơ khởi | `math_spatial_3d` *(chưa seed)* | `count_tap`, `single_select` | Đếm số khối lập phương trong hình xếp chồng (có khối ẩn). Góc nhìn top-down. |
| 5 | Suy luận loại trừ | `math_logic_elimination` *(chưa seed)* | `single_select` | "Voi nặng hơn Gấu, Gấu nặng hơn Thỏ. Ai nhẹ nhất?" — thẻ đáp án chỉ hiện mascot, không chữ. |
| 6 | Đếm có điều kiện | `math_conditional_count` *(chưa seed)* | `multi_select` | Lọc và chạm TẤT CẢ vật thỏa nhiều điều kiện ("tất cả hình tròn, màu xanh dương, kích thước lớn") → chọn-nhiều = `multi_select`. |
| 7 | Phân tích hình học phẳng | `math_geometry_base` | `single_select` | Đếm hình đơn ẩn trong hình phức; tính diện tích/chu vi cơ bản bằng đếm ô lưới. |
| 8 | Bài toán có lời văn đơn giản | `math_word_problems` *(chưa seed)* | `single_select` | Bài toán 1–2 bước trong bối cảnh truyện tranh. "Đô Đô có 5 quả chuối, tặng 2 quả. Còn mấy?" |
| 9 | Ghép hình và biến đổi hình | `math_tangram_transform` *(chưa seed)* | `single_select`, `match_pair` | Tangram 3–4 mảnh; gấp giấy/đục lỗ; tìm bóng vật thể (shadow matching = `match_pair`). |
| 10 | Tư duy ngôn ngữ — Toán kết hợp | `math_verbal_math` *(chưa seed)* | `single_select` | Mã hóa/giải mã ký hiệu hình ảnh (Ngôi sao = 3, Kim cương = 2 → Ngôi sao + Kim cương = ?). |

---

## 4. QUY TRÌNH & NGUYÊN TẮC SẢN XUẤT (CONTENT PRODUCTION)

3 nguyên tắc vàng bắt buộc:

1. **Hình ảnh hóa ký hiệu trừu tượng (Visual Scaffolding):** Với số học lớn (1–50) hay so sánh biểu thức trừu tượng, luôn bổ sung nhóm chấm tròn / quả táo / block hình học tương phản rõ làm điểm tựa thị giác trước khi chuyển sang ký hiệu số.
2. **Game hóa thuật ngữ học thuật:** Trong `audioScript`, cấm dùng từ học thuật. "Ma trận logic" → "Trò chơi tìm mảnh ghép biến mất của Đô Đô"; "Suy luận loại trừ" → "Thử thách đi tìm người nhẹ nhất cùng Đô Đô".
3. **Tuyệt đối không hardcode text câu hỏi dài lên UI của trẻ:** Toàn bộ câu đố, lời dẫn phải nằm trong `audioScript` để thu âm / chạy TTS bằng giọng canon Đô Đô. Trẻ chỉ tương tác qua Nghe – Nhìn – Chạm.

---

## 5. NAMING & RECONCILIATION (chuẩn hóa theo kido-server)

Nguồn chân lý về tên gọi/tên biến là **kido-server** (wire/CMS contract) — cũng chính là `docs/kido-activity-schema.ts` mà server mirror, và là shape pipeline sinh ra + mobile nhận vào. Mobile có một lớp **chuẩn hóa nội bộ** (`mapServerLesson`) đổi tên cho tiện render; đó KHÔNG phải contract và không dùng trong tài liệu.

### 5.1. actionType canonical (6 loại MVP) + vocabulary sư phạm cũ

| actionType (canonical) | CMS Type cũ (sư phạm) | Ý nghĩa |
|------------------------|-----------------------|---------|
| `single_select` | `multiple_choice`, `listen_select` | Nghe audio → chọn 1 thẻ ảnh đúng. |
| `multi_select` | `count_tap` (chế độ pick) | Chọn TẤT CẢ thẻ thỏa điều kiện (đếm có điều kiện). |
| `sort_sequence` | `drag_order` | Kéo–thả sắp xếp theo thứ tự (đoàn tàu số, chuỗi thời gian). |
| `match_pair` | `match_image` | Nối cặp 2 cột (shadow matching, nối số ↔ số lượng). |
| `count_tap` | `count_tap` | Chạm đếm từng vật rồi chọn số. |
| `compare_tap` | — | So sánh số lượng 2 bên (CÙNG 1 vật, khác số lượng): app nhân bản sprite mỗi bên, bé tap đếm rồi chọn bên nhiều/ít hơn. **Chỉ `math_compare_quantity`.** |
| `watch_video` | — | **KHÔNG dùng trong môn Toán. Hoãn sau MVP.** |

> **Ghi chú freeze:** bộ MVP mở từ 5 → **6 loại** (thêm `compare_tap`, quyết định 2026-07-05) vì `math_compare_quantity` cần đếm-được-chính-xác 2 bên mà ảnh gen/thẻ chấm không đáp ứng. Xem OpenSpec change `add-compare-tap-activity`.

**Payload — tên biến canonical (theo kido-server):** discriminant là `actionType`; `count_tap` dùng `backgroundAsset` + `targetAsset` (KHÔNG `sceneImage`); `compare_tap` dùng `objectAsset` (1 vật chung 2 bên) + `leftCount`/`rightCount`/`correctSide`/`mode` (KHÔNG questionImage/options); các loại chọn dùng `options[].{optionId, assetRef, isCorrect}` với `correctAnswer` (single) / `correctAnswers` (multi). (Mobile normalize sang `type`, `background`/`target`/`object`, `options[].{id, visual, isCorrect}`, `correctId` — chỉ nội bộ, đừng dùng trong doc/CMS.)

### 5.2. skillCode — đồng nhất theo bộ đã seed

Skill code trong bảng §2/§3 đã đổi sang tên **đã seed** (khi có match ngữ nghĩa 1:1). Bảng đổi tên (freeze → seeded canonical):

| Tên freeze cũ | Tên canonical (đã seed) |
|---------------|--------------------------|
| `math_classify_2d` | `math_classify_2attr` |
| `math_pattern_adv` | `math_pattern_abc` |
| `math_spatial_2d` | `math_spatial_basic` |
| `math_geometry_flat` | `math_geometry_base` |

**Đã khớp sẵn (không đổi):** `math_count_1_20`, `math_logic_causality`, `math_sequence_order`, `math_measurement_base`.

**Skill đã seed nhưng chưa nằm trong bảng curriculum (mở rộng):** `math_classify_1attr`, `math_compare_quantity`, `math_pattern_ab`, `math_count_1_20_adv`, `math_matrix_2x2_basic`, `math_matrix_2x2_adv`.

**Skill trong curriculum CHƯA có seed** (giữ tên canonical, đánh dấu *(chưa seed)*, sẽ implement sau): `math_compare_diff`, `math_arithmetic_1_50`, `math_sequence_jump`, `math_matrix_logic` (3x3), `math_spatial_3d`, `math_logic_elimination`, `math_conditional_count`, `math_word_problems`, `math_tangram_transform`, `math_verbal_math`.

> **Việc cần chốt (sản phẩm + eng):** một số skill freeze không map 1:1 sang seed (vd `math_compare_diff` ≠ `math_compare_quantity` — khác ngữ nghĩa; `math_matrix_logic` 3x3 vs seed 2x2). Khi implement các skill *(chưa seed)*, dùng đúng tên canonical ở đây để không tái phát sinh drift.
