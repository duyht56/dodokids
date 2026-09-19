# PROJECT KIDO — GÓI 2 TUẦN HỌC THỬ "NHẬT KÝ KHÁM PHÁ CỦA ĐÔ ĐÔ"

- **Trạng thái:** DRAFT PROPOSAL — chờ Truth/Human Gate
- **Ngày tạo:** 2026-09-17
- **Đối tượng:** Trẻ 5–6 tuổi (nhóm chuẩn bị vào lớp 1) và phụ huynh dùng thử
- **Phạm vi:** Nội dung học (seed → activity), **ĐẶT TRƯỚC W1**, **KHÔNG nằm trong gói 48 tuần**

> Gói này là "phễu trải nghiệm" (trial funnel): 2 tuần đầu tiên phụ huynh/bé gặp,
> được thiết kế để **thu hút + bám sát chủ đề thi vào lớp 1 của các trường/trung tâm
> luyện tư duy**, chứng minh giá trị trước khi bé bước vào lộ trình 48 tuần chính thức.

---

## 1. NGUỒN THAM KHẢO (đã khảo sát)

### 1.1. Tài liệu trường/trung tâm (anh gửi)

| Tài liệu | Nguồn | Dạng bài rút ra |
|---|---|---|
| BTTC – T3-T9 / T2-T9 | **Học viện Phát triển Năng lực Tư duy — Hành trình Sáng tạo** (Creative Journey Academy) | 24 dạng/phiếu: đếm trong tranh, cộng-hình, quy luật xoay, chuỗi phép tính +/−, ghép giá trị hình (đại số ảnh), **ẩn dụ quan hệ/analogy**, ma trận 2×2/3×3, số lẻ-chẵn + cực trị, **thứ tự vị trí (ngăn/cột)**, đối xứng, **sudoku con vật 4×4**, sắp xếp trình tự, nối bộ phận↔đồ vật, nghề↔dụng cụ, đếm có điều kiện, **cân thăng bằng/bắc cầu**, ma trận hoa quả, dãy giảm dần, **tìm bóng (shadow)**, tổng số chân (đếm ứng dụng), chọn dấu +/−, xếp theo cân nặng, trái/phải |
| Tách gộp, so sánh, sắp xếp – phạm vi 10 | Phiếu bài tập lớp 1 | **Tách–gộp (number bond) 2 chiều**, điền dấu `< > =` (so sánh KÝ HIỆU), xếp thứ tự số, **chuỗi phép tính** (6 →−4→ □ →+2→ □), **tìm số ở giữa** (3 < □ < 8) |
| Kể chuyện sáng tạo theo tranh – Tập 2 | daybemoingay.com (Cô Lan Anh) | **Xếp trình tự tranh (3–4 khung) + kể lại** → tự sự + nhân quả + cảm xúc |

### 1.2. Nguồn online

- **Sân Chơi Trí Tuệ Của Chim Đa Đa** (6 cuốn, NXB Phụ Nữ, 3–6 tuổi): rèn 5–6 loại
  năng lực — quan sát, chú ý, nhận thức, tưởng tượng, ghi nhớ, tư duy; dạng bài đếm,
  **tìm đường (mê cung)**, nhận hình, **tìm bóng**; độ khó tăng dần; "học mà chơi".
  → xác nhận taxonomy Explore của mình đang đi đúng hướng.
- **1088 Câu Đố Phát Triển Trí Tuệ** (4–5 tuổi, luyện IQ, cân não trái/phải, hình ảnh —
  bé chưa biết chữ, cần tương tác phụ huynh).
- **App đối thủ:** Monkey Math (60+ chủ đề/7 chuyên đề, Pre-K/Kindergarten/Grade1,
  workbook giấy kèm), KidsUP (Montessori, tư duy phản biện/logic, chơi offline), POMath
  (trung tâm toán tư duy). → Điểm chung: "chơi Toán" 5–10 phút, nhìn–nghĩ–thử, không ép.

### 1.3. Kết luận định hướng

Chủ đề thi lớp 1 = **tư duy qua trò chơi, hình-đầu, không đọc chữ, độ khó tăng dần,
bám bối cảnh gần gũi**. Gói học thử phải:
1. Neo vào **bối cảnh phiêu lưu** (Nhật ký của Đô Đô) để "thu hút" — không phải phiếu bài khô.
2. Trải rộng đủ **các trục tư duy trường đánh giá** (số lượng, so sánh, quy luật, phân loại,
   không gian, tách-gộp, nghe hiểu, tự sự) để phụ huynh thấy "app này luyện đúng thứ thi".
3. Giữ nguyên **triết lý Kido**: audio-first, no-stress, không dạy vẹt (Logic Signature Test,
   Mute Test, Toddler Test vẫn áp).

---

## 2. VỊ TRÍ & ĐÁNH SỐ (đặt trước W1, ngoài 48 tuần)

- Gói gồm **2 tuần**: `Tuần Trải nghiệm 1 (T1)` và `Tuần Trải nghiệm 2 (T2)`.
- **Đánh số kỹ thuật:** dùng dải tuần dự trữ **`week: 90` (T1)** và **`week: 91` (T2)**.
  - Lý do: schema **sinh tự động** (`seed-file.ts`, `MAX_SEED_WEEK = 48`) chỉ cấp phát
    tuần 1–48 cho lộ trình chính; nhưng **đường import** (`importSeedRecords` /
    `parseSeedPayload`) và **DB** (`seed.model.ts`) chỉ yêu cầu `week` là số và `quarter ∈ 1..4`,
    **không cap** — nên tuần 90/91 import & review & publish bình thường (`publish:week -- 90`).
  - `quarter: 1` (giá trị hợp lệ; gói là "khởi động", không thuộc quý nào của 48 tuần).
  - Dải ≥ 49 nên **generator 48 tuần không bao giờ chạm** vào các seed này (fail-safe).
- **Hiển thị cho trẻ:** một mục **"Học thử cùng Đô Đô"** RIÊNG, đứng **trước** W1 trên
  lộ trình — KHÔNG chèn vào timeline 48 tuần, KHÔNG tính vào tiến độ/khóa nội dung chính.
  (Việc surfacing ở mobile là task eng tiếp theo — xem §6.)
- **Lịch trong tuần** giữ chuẩn dự án: **D1/D4 = Toán · D2/D5 = Tiếng Việt · D3 = Tiếng Anh**;
  mỗi ngày đúng **8 activity** (warmup×2 → core×4 → challenge×2, khó tăng dần).

Tổng nội dung: 2 tuần × (Toán 16 + Tiếng Việt 16 + Tiếng Anh 8) = **80 seed / 10 ngày học / 6 file**.

| File | Môn | Ngày | Số seed |
|---|---|---|---:|
| `seeds/w90.json` | toan | D1, D4 | 16 |
| `seeds/w90-vi.json` | tieng_viet | D2, D5 | 16 |
| `seeds/w90-en.json` | tieng_anh | D3 | 8 |
| `seeds/w91.json` | toan | D1, D4 | 16 |
| `seeds/w91-vi.json` | tieng_viet | D2, D5 | 16 |
| `seeds/w91-en.json` | tieng_anh | D3 | 8 |

---

## 3. CHỦ ĐỀ XUYÊN SUỐT — "NHẬT KÝ KHÁM PHÁ CỦA ĐÔ ĐÔ"

Mỗi tuần là **một trang phiêu lưu** trong nhật ký của Đô Đô; mỗi ngày là một cảnh nhỏ.
Kỹ năng thi lớp 1 được **giấu trong bối cảnh**, không gọi tên học thuật.

- **Tuần T1 — "Đô Đô đi Sở Thú"** (thế giới động vật): số lượng, so sánh, quy luật, phân
  loại con vật, vị trí không gian, từ vựng loài vật, phân nhóm môi trường sống, kể chuyện
  một ngày ở sở thú.
- **Tuần T2 — "Đô Đô đi Chợ Quê & Vào Bếp"** (thực phẩm/gia đình): **tách–gộp trong 10**
  (bám cuốn "Tách gộp pvi 10"), thêm–bớt trực quan, so sánh, phân loại rau/quả/đồ bếp,
  nghề (cô bán hàng, mẹ nấu ăn), trình tự nấu ăn/mua sắm, ghép chức năng đồ vật.

Hai bối cảnh này bao phủ 6/8 chủ đề mầm non kinh điển mà trường hay ra (động vật,
thực phẩm, gia đình, nghề nghiệp, đồ dùng, phương tiện lồng trong bối cảnh) và **tất cả
các trục tư duy** trong §1.

---

## 4. KHUNG NGÀY-BÀI (mapping skill × actionType × tài liệu trường)

Ký hiệu độ khó: W=warmup, C=core, X=challenge. actionType canonical.

### 4.1. Tuần T1 — "Đô Đô đi Sở Thú"

**D1 · Toán — Cổng sở thú & vườn chim**

| # | Khó | Skill | actionType | Ý bài (rút từ tài liệu) |
|--|--|--|--|--|
|1|W|`math_subitize`|single_select|Nhìn nhanh nhóm bướm → chọn số (subitize ≤5)|
|2|W|`math_count_1_20`|count_tap|Chạm đếm khỉ (đếm trong tranh — BTTC #1)|
|3|C|`math_compare_quantity`|compare_tap|Bên nào nhiều hơn (so số lượng)|
|4|C|`math_classify_1attr`|multi_select|Chạm hết con vật cùng 1 thuộc tính|
|5|C|`math_pattern_ab`|single_select|Quy luật AB con vật|
|6|C|`math_number_recognition`|match_pair|Nối thẻ số ↔ nhóm (BTTC #5 đếm-nối-số)|
|7|X|`math_pattern_abc`|single_select|Quy luật ABC (BTTC #15 hoàn thiện chuỗi)|
|8|X|`math_order_numbers`|sort_sequence|Xếp thứ tự số (Tách gộp – Bài 3)|

**D4 · Toán — Khu thú lớn & giờ ăn**

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`math_subitize`|single_select|Nhìn nhanh mặt xúc xắc/nhóm nhỏ|
|2|W|`math_spatial_position`|single_select|Trái/phải/trong/ngoài chuồng (BTTC #10 vị trí)|
|3|C|`math_compare_length`|single_select|Con nào dài hơn (so sánh trực tiếp)|
|4|C|`math_count_1_20`|count_tap|Đếm chim cánh cụt|
|5|C|`math_classify_1attr`|multi_select|Chạm hết con vật có sọc|
|6|C|`math_group_by_category`|match_pair|Nối con vật ↔ nơi ở (BTTC #16 liên hệ)|
|7|X|`math_pattern_abc`|single_select|Quy luật ABC nâng|
|8|X|`math_seriation_size`|sort_sequence|Xếp con vật nhỏ→to (Chim Đa Đa: seriation)|

**D2 · Tiếng Việt — Gặp gỡ muôn loài**

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`lang_syllable_count`|single_select|Đếm tiếng của tên con vật (audio-only)|
|2|W|`lang_word_to_picture`|single_select|Chỉ đúng loài (phân biệt tinh)|
|3|C|`lang_follow_instruction`|multi_select|Nghe 2 điều kiện → chạm hết|
|4|C|`lang_action_word`|single_select|Con vật đang làm gì (động từ)|
|5|C|`lang_word_association`|match_pair|Con vật ↔ thức ăn (nghề↔dụng cụ – BTTC #16/17)|
|6|C|`lang_listen_detail`|single_select|Nghe chi tiết ai-làm-gì → chọn tranh|
|7|X|`lang_follow_instruction`|multi_select|2 điều kiện + phủ định|
|8|X|`lang_story_sequence`|sort_sequence|Xếp chuyện "cho voi ăn" (Kể chuyện theo tranh)|

**D5 · Tiếng Việt — Phân nhóm & kể chuyện**

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`lang_category_member`|multi_select|Chạm hết con vật sống dưới nước|
|2|W|`lang_odd_word_out`|single_select|Con vật lạc nhóm (theo nghĩa)|
|3|C|`lang_word_association`|match_pair|Con vật ↔ nơi ở/đồ dùng|
|4|C|`lang_category_member`|multi_select|Chạm hết loài chim (phân biệt tinh)|
|5|C|`lang_odd_word_out`|single_select|Lạc nhóm nâng|
|6|C|`lang_story_sequence`|sort_sequence|Chuyện đi sở thú 3 tranh|
|7|X|`lang_word_association`|match_pair|4 cặp mẹ↔con (bò↔bê…)|
|8|X|`lang_story_sequence`|sort_sequence|Chuỗi nhân quả 3 tranh|

**D3 · Tiếng Anh — Zoo animals** (themeCode `animals`, pattern `It's a ___.`)

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`en_word_recognition`|single_select|Touch the dog.|
|2|W|`en_word_recognition`|single_select|Touch the cat.|
|3|C|`en_category_select`|multi_select|Touch all the birds.|
|4|C|`en_word_recognition`|single_select|Touch the lion.|
|5|C|`en_dialogue_response`|audio_select|Do you like lions? → Yes/No|
|6|C|`en_word_match`|match_pair|Nối mẹ ↔ con (cow↔calf)|
|7|X|`en_attribute`|single_select|Find the big brown bear.|
|8|X|`en_attribute`|multi_select|Touch all the small ones.|

### 4.2. Tuần T2 — "Đô Đô đi Chợ Quê & Vào Bếp"

**D1 · Toán — Đi chợ (quầy trái cây & rau củ)**

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`math_subitize`|single_select|Nhìn nhanh nhóm quả|
|2|W|`math_count_1_20`|count_tap|Đếm quả cam|
|3|C|`math_compare_quantity`|compare_tap|Bên nào nhiều táo hơn|
|4|C|`math_arithmetic_1_50`|single_select|Thêm quả vào giỏ → mấy (thêm/bớt trực quan)|
|5|C|`math_classify_1attr`|multi_select|Chạm hết quả màu đỏ|
|6|C|`math_number_recognition`|match_pair|Nối thẻ số ↔ nhóm quả|
|7|X|`math_compose_decompose`|single_select|**Tách–gộp số 10** (Tách gộp pvi 10 – Bài 1)|
|8|X|`math_order_numbers`|sort_sequence|Xếp số/giá từ bé→lớn|

**D4 · Toán — Vào bếp (nấu ăn cùng mẹ)**

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`math_subitize`|single_select|Nhìn nhanh nhóm bánh|
|2|W|`math_spatial_position`|single_select|Vị trí dao/thớt (trên-dưới, trái-phải)|
|3|C|`math_compare_size`|single_select|Bát/đĩa nào to hơn|
|4|C|`math_classify_1attr`|multi_select|Chạm hết rau củ|
|5|C|`math_count_1_20`|count_tap|Đếm quả trứng|
|6|C|`math_group_by_category`|match_pair|Nối món ăn ↔ dụng cụ|
|7|X|`math_pattern_abc`|single_select|Quy luật ABC đồ bếp|
|8|X|`math_seriation_size`|sort_sequence|Xếp nồi/bát nhỏ→to|

**D2 · Tiếng Việt — Chợ (từ vựng thực phẩm & làm theo)**

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`lang_syllable_count`|single_select|Đếm tiếng tên thực phẩm|
|2|W|`lang_word_to_picture`|single_select|Chỉ quả lạ (măng cụt…)|
|3|C|`lang_follow_instruction`|multi_select|Nghe 2 điều kiện → chạm hết|
|4|C|`lang_word_to_picture`|single_select|Chỉ củ lạ (su hào…)|
|5|C|`lang_word_association`|match_pair|Thực phẩm/đồ ↔ chức năng|
|6|C|`lang_story_sequence`|sort_sequence|Đi chợ mua rau 3 tranh|
|7|X|`lang_word_to_picture`|single_select|Dụng cụ bếp ít gặp (cái vá…)|
|8|X|`lang_follow_instruction`|multi_select|2 điều kiện + phủ định|

**D5 · Tiếng Việt — Bếp & bữa cơm**

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`lang_category_member`|multi_select|Chạm hết đồ dùng để ăn|
|2|W|`lang_odd_word_out`|single_select|Lạc nhóm rau/quả|
|3|C|`lang_word_association`|match_pair|Dụng cụ bếp đi cùng nhau|
|4|C|`lang_category_member`|multi_select|Chạm hết thứ có vị ngọt|
|5|C|`lang_odd_word_out`|single_select|Lạc nhóm nâng|
|6|C|`lang_story_sequence`|sort_sequence|Nấu cơm 3 tranh|
|7|X|`lang_word_association`|match_pair|4 cặp chức năng|
|8|X|`lang_story_sequence`|sort_sequence|Chuỗi nhân quả bữa ăn|

**D3 · Tiếng Anh — Food** (themeCode `food`, pattern `It's a ___. / I like ___.`)

| # | Khó | Skill | actionType | Ý bài |
|--|--|--|--|--|
|1|W|`en_word_recognition`|single_select|Touch the apple.|
|2|W|`en_word_recognition`|single_select|Touch the banana.|
|3|C|`en_category_select`|multi_select|Touch all the fruits.|
|4|C|`en_word_recognition`|single_select|Touch the fish.|
|5|C|`en_dialogue_response`|audio_select|Do you like apples? → Yes/No|
|6|C|`en_word_match`|match_pair|Nối đồ đi cùng nhau (bread↔butter)|
|7|X|`en_attribute`|single_select|Find the big red apple.|
|8|X|`en_attribute`|multi_select|Touch all the small ones.|

---

## 5. RÀNG BUỘC ĐÃ TUÂN THỦ (để seed pass validate)

- **1 ngày = 8 seed**, `activityIndex` 1..8, difficulty **warmup×2 / core×4 / challenge×2**,
  tăng dần (`seed-week-validate.ts`).
- **actionType spread:** mỗi ngày ≥2 loại, **≤4 loại giống nhau** (đã giữ single_select ≤4/ngày).
- **Lexeme:** không từ nào >3 lần/ngày.
- **Toán:** `domainCode` khớp `skillCode` qua `getDomainCode()`; tránh
  `math_compare_weight`/`math_compare_capacity` (DEFERRED_VISUAL_SKILLS).
- **Tiếng Việt:** BỎ TRỐNG `domainCode`; mọi bài qua **Mute Test** (tắt tiếng không đoán được)
  + **Toddler Test** (không dễ như tuổi lên 3 — dùng từ ít gặp / phân biệt tinh / ≥2 điều kiện / phủ định).
- **Tiếng Anh:** đề 100% tiếng Anh theo `ENGLISH_INSTRUCTION_FRAMES`; `themeCode` ∈ matrix
  (`animals`, `food`) và mọi skill là ô `valid` trong `THEME_SKILL_MATRIX`; `targetLexemes` khai đúng.
- **questionCore vs answerSpec** tách bạch (không lộ đáp án / không liệt kê asset trong câu đọc).

> ⚠️ Lưu ý: file Toán `w90/w91.json` **cố ý** dùng `week` 90/91 nên sẽ KHÔNG qua
> `validateGeneratedSeedFile` (validator của generator 48 tuần, cap ≤48). Đây là **đúng
> thiết kế** — gói học thử đi qua **import** chứ không qua generator. Nếu sau này muốn nó
> qua validator sinh tự động, cần nới `MAX_SEED_WEEK` hoặc thêm nhánh "trial".

---

## 6. CÁCH CHẠY & VIỆC CÒN LẠI (surfacing)

### 6.1. Đưa nội dung vào pipeline (chạy được ngay)

```bash
cd kido-pipeline
npm run import-seeds            # nạp 6 file w90*/w91* → status pending_review
npm run trigger:seed-review     # review từng seed (backfill answerSpec nếu thiếu)
# → Human Gate duyệt trong app/review → set approved
npm run pipeline:week -- --week 90   # generate activity cho T1
npm run pipeline:week -- --week 91   # generate activity cho T2
npm run publish:week -- 90           # publish T1 lên kido-server
npm run publish:week -- 91           # publish T2
```

### 6.2. Việc eng còn lại (không chặn nội dung)

1. **Mobile surfacing:** thêm mục "Học thử cùng Đô Đô" đứng trước W1; trỏ tới lesson
   `w90-*` / `w91-*`; **không** tính vào streak/tiến độ 48 tuần, cho **chơi lại tự do**.
2. **Entitlement:** gói học thử là **miễn phí** (hook trước paywall) — xác nhận với
   `docs/KIDO_ENTITLEMENTS.md`.
3. **Asset:** Tiếng Anh T1/T2 dùng theme `animals`/`food` cần **gen ảnh vật thật** (khác
   W1 dùng Static Primitive Pack chi phí 0). Chấp nhận chi phí gen cho gói phễu; tái dùng
   được cho các tuần theme tương ứng sau này.

---

## 7. TÀI LIỆU LIÊN QUAN

- `docs/KIDO_MATH_SKILL_CATALOG_V2.md`, `docs/KIDO_MATH_CURRICULUM.md`
- `docs/KIDO_LANG_SKILL_CATALOG.md`, `docs/KIDO_LANG_CURRICULUM.md`
- `docs/KIDO_ENGLISH_CURRICULUM.md`
- `docs/KIDO_SEED_AUTHORING.md`, `kido-pipeline/src/pipeline/seed-week-validate.ts`
- `docs/KIDO_EXPLORE_REVIEW.md` (đi kèm — review khu Khám phá)
