# PROJECT KIDO — KHUNG CHƯƠNG TRÌNH TƯ DUY NGÔN NGỮ (LEARNING PATH)

- **Môn (SubjectCode):** `tieng_viet`
- **Độ tuổi:** **5–6** (Age 5–6 · School-readiness track) — khớp `KIDO_MATH_SKILL_CATALOG_V2.md`
- **Lịch phát:** 2 buổi/tuần, cố định **D2 + D5** → `lessonId` dạng `w{nn}-d2-tieng_viet` / `w{nn}-d5-tieng_viet`
- **Quy mô:** 48 tuần × 2 buổi = **96 bài** × 8 activity = **768 activity** (16 seed/tuần — cùng nhịp môn Toán)
- **Trạng thái:** DRAFT — rev **bám đề thi vào lớp 1** (audit 2026-09-19) trên nền v1.2 (chốt độ tuổi 5–6)
- **Phiên bản:** 2026-09-19-lang-curriculum-v1.3

> **CẬP NHẬT 2026-09-19 — BÁM SÁT ĐỀ THI VÀO LỚP 1 (audit anh duyệt).** Giữ **audio-first,
> KHÔNG mở mặt chữ** (§0.2 catalog nguyên vẹn). Năm thay đổi (chi tiết ở §3):
> ① **Hạ** `lang_syllable_count` khỏi cửa vào Q1 (đếm tiếng không có trong đề).
> ② **Thêm** `lang_initial_sound` — nghe âm đầu → chọn **ẢNH** (không cần `audio_library`) làm
> cửa vào `pho` mới; theo **ÂM đầu, KHÔNG hiện chữ**.
> ③ **Thêm** `lang_listen_word_count` — nghe câu/thơ → đếm số lần một *từ* lặp lại (đúng dạng đề).
> ④ **Hạ** nhận-diện-vật-thô (`lang_word_to_picture._noun`, `lang_action_word` mức dễ) khỏi
> `core`; vốn từ `core` chuyển sang `lang_riddle` + phân biệt hẹp.
> ⑤ **Tăng tỷ trọng** `nar` (kể chuyện tranh) + `lis`+`inf` (nghe hiểu/suy luận) làm `core`
> xuyên 48 tuần. Nguồn skill: `KIDO_LANG_SKILL_CATALOG.md` v1.2 (**35 skill**). Trần app: chỉ
> phủ phần **tiếp nhận** — đề nặng NÓI, app không có mic/ASR.

> **Chốt độ tuổi 5–6 (2026-07-16).** 48 tuần = **đúng năm trước lớp 1** (trẻ vào 5, ra 6).
> Điều này làm định vị "school-readiness" sắc hẳn, và **khớp môn Toán** — catalog Toán V2 đã
> là 5–6 từ trước; bản 4–6 cũ của môn ngôn ngữ là **lệch**, nay sửa. Hệ quả: `L1` không còn
> là tầng nội dung chính, chỉ dùng làm **warmup/vào bài** (giống ghi chú migration của Toán:
> nội dung 4–5 "re-tag thành tầng L1 Foundation hoặc park").

> **Doc này chốt gì:** trục tổ chức, phân vai 2 buổi, **thứ tự mở skill theo quý**, luật
> dựng một buổi, luật spiral, và thứ tự phụ thuộc khi seed.
>
> **Doc này KHÔNG chốt:** bài-nào-tuần-nào ở mức 96 lesson. Người viết seed chọn tổ hợp
> skill cho từng tuần **trong khuôn khổ luật §4–§5** — cùng mô hình vận hành với môn Toán
> (routine + catalog, không có bảng 96 dòng). Nếu sau này cần gán cứng từng tuần, đó là
> việc nối tiếp, không phải doc này.
>
> Bộ skill + construct + anti-pattern nằm ở `KIDO_LANG_SKILL_CATALOG.md` (knowledge graph,
> 35 skill) — doc này là *một* đường đi trên graph đó. Naming theo kido-server, xem
> `docs/kido-activity-schema.ts`.

---

## 1. TRỤC TỔ CHỨC

Tiếng Anh mô hình hoá **ba trục độc lập** (`themeCode` chủ đề · `sentencePattern` mẫu câu ·
`skillCode` năng lực) — ba trục này *không* loại trừ nhau. Tiếng Việt **giữ nguyên tinh thần
đó**, nhưng chọn **`skillCode` làm trục SẮP XẾP** (quyết định thứ tự bài), và **hạ chủ đề
xuống mức hướng dẫn biên soạn** thay vì field schema.

| | Toán | Tiếng Anh | **Tiếng Việt** |
|---|---|---|---|
| Buổi/tuần | 2 (D1, D4) | 1 (D3) | **2 (D2, D5)** |
| Seed/tuần | 16 | 8 | **16** |
| Trục sắp xếp | năng lực | chủ đề | **năng lực** |
| Chủ đề | không có | **field** `themeCode` | **hướng dẫn biên soạn, không phải field** |
| Mẫu câu | không có | **field** `sentencePattern` | không có |

**Vì sao chủ đề không lên field:**

1. **Lý do sư phạm (chính).** Tiếng Anh cần `sentencePattern` vì trẻ thụ đắc *mẫu câu*
   lặp theo ngữ cảnh chủ đề (`"It's ___."`) — chủ đề là *phương tiện tải mẫu câu*. Tiếng
   Việt là **tiếng mẹ đẻ**: trẻ đã có sẵn ngữ pháp, không cần tải mẫu câu. Ta luyện *thao
   tác tư duy trên ngôn ngữ*. Chủ đề ở đây chỉ còn vai trò chọn vật cho sinh động.
2. **Lý do kỹ thuật (phụ, không phải lý do chính).** `themeCode`/`sentencePattern` hiện
   **chưa tồn tại** trong `ActivitySeed`/`ActivityMeta` — kể cả tiếng Anh cũng chưa có.
   Không thêm field = không phải chờ schema change.
3. Chống lặp vật trong tuần đã có rule `SEED_OBJECT_DIVERSITY` ở seed-review — không cần
   field để làm việc đó.

*Nếu sau này report phụ huynh muốn nói theo chủ đề, phải thêm `themeCode` — nhưng report
hiện đã thống nhất nói theo **năng lực**, nên chưa cần.*

---

## 2. HAI BUỔI — PHÂN VAI

| Buổi | Tên (đối nội) | Domain | Chất |
|---|---|---|---|
| **D2** | *Nghe & Hiểu* | `voc` · `lis` · `pho` | Tiếp nhận: nghe ra, hiểu nghĩa, bắt âm |
| **D5** | *Hiểu & Suy luận* | `sem` · `nar` · `syn` · `inf` | Xử lý: quan hệ nghĩa, truyện, cấu trúc, suy luận |

> **Không đặt tên buổi là "Nói".** Toàn bộ actionType hiện có (kể cả `audio_select`) chỉ
> cho trẻ **nhận ra / chọn**, KHÔNG thu được lời nói — giống ranh giới đã chốt ở tiếng Anh
> (phần "nói" đẩy sang offline-task, không mic/ASR trong MVP). Tên buổi không được hứa thứ
> sản phẩm không đo.

Cân đối: D2 = 14 skill (voc 3 + lis 5 + pho 6) · D5 = 17 skill (sem 6 + nar 3 + syn 4 + inf 4)
= **31 skill sẵn contract** (2026-09-19: +`lang_initial_sound`/`pho`, +`lang_listen_word_count`/`lis`,
cả hai vào D2). Số activity hai buổi bằng nhau (384 mỗi buổi) → D2 ≈ 27 activity/skill, D5 ≈ 23
activity/skill. Chấp nhận được: `pho`/`voc` cần lặp nhiều hơn.

*Phân vai là trục **thiết kế**, không phải field. Seed chỉ khai `day: 'D2'|'D5'`.*

---

## 3. THỨ TỰ MỞ SKILL THEO QUÝ

Nguyên tắc: mở domain theo **độ chín nhận thức**, không theo độ tiện sản xuất. Skill đã mở **không bao giờ đóng** (§5).

### Q1 · Tuần 1–12 — NỀN TẢNG

Với trẻ **đã 5 tuổi**, vốn từ mẹ đẻ đã dày → `L1` chỉ dùng làm **warmup**, trọng tâm Q1 vào thẳng **L2**.

| Buổi | Skill mở mới | Micro |
|---|---|---|
| D2 | `lang_initial_sound` *(mới)* | `_consonant` (L2) — **cửa vào `pho` mới**, chọn ảnh theo âm đầu |
| D2 | `lang_listen_word_count` *(mới)* | `_sentence` (L2) — nghe → đếm số lần một từ (kiểu đề) |
| D2 | `lang_syllable_count` | `_2syl` (L1) — **chỉ warmup, không core** (hạ 2026-09-19) |
| D2 | `lang_word_to_picture` | `_noun` (L1, **chỉ warmup**) → `_verb` (L2) → `_adjective` (L3, cuối Q1) |
| D2 | `lang_action_word` | `_verb_in_scene` (L2) — mức dễ chỉ warmup; core dùng động từ tinh cùng họ |
| D2 | `lang_follow_instruction` | `_2cond` (L2) — *`_1cond` (L1) chỉ dùng warmup tuần 1–2* |
| D2 | `lang_listen_detail` | `_who_what` (L2) |
| D5 | `lang_category_member` | `_basic` (L2) |
| D5 | `lang_odd_word_out` | `_category` (L2) |
| D5 | `lang_word_association` | `_functional` (L2) |
| D5 | `lang_story_sequence` | `_3panel` (L2) |
| D5 | `lang_classifier` | `_animal_object` (L2) |

**Q1 KHÔNG có skill `audio_select`** → seed được ngay, không chờ `audio_library` (§6).

> **`lang_antonym` KHÔNG ở Q1 — chuyển Q2 làm `audio_select`** (chốt 2026-07-16). Đối cực gần
> như luôn là thuộc tính LIÊN TỤC của cùng một vật (dày/mỏng, nông/sâu) → vẽ bằng ảnh vừa
> **trượt Mute Test** (nhìn là giải được) vừa **không render nhất quán** (mỗi ảnh một góc). Kênh
> đúng là nghe hai clip từ rồi chọn từ ngược nghĩa → `audio_select`, thuộc Q2+ (cần
> `audio_library`). Chỗ Q1 D5 do `lang_odd_word_out` (cùng domain `sem`, single_select, mỗi
> đáp án 1 vật đơn) lấp — xem review w01 §Renderability, catalog §0.6 Test 5.

> **CẬP NHẬT 2026-09-19 — ĐOẠN DƯỚI ĐÃ HẠ.** `lang_syllable_count` KHÔNG còn là cửa vào
> Q1/`pho` (đếm tiếng là kỹ năng siêu ngôn ngữ, không có trong đề vào lớp 1). Cửa vào `pho`
> mới là `lang_initial_sound` (nghe âm đầu → chọn ảnh). Giữ `lang_syllable_count` ở vai
> phụ/nâng, không `core`. Lập luận gốc bên dưới giữ lại làm bối cảnh lịch sử.
>
> **`lang_syllable_count` mở ở Q1 — hai lý do trùng nhau.**
> ① **Sư phạm:** thứ tự phát triển nhận thức âm vị chuẩn là **âm tiết → vần → âm đầu → âm vị**.
> Đếm tiếng là *cửa vào* của cả domain `pho`, và chín quanh 5 tuổi → hợp ngay tuần 1 khi trẻ
> đã 5. Tiếng Việt lại là ngôn ngữ **âm tiết tính**, nên đơn vị "tiếng" là tự nhiên nhất.
> ② **Kỹ thuật:** đây là skill `pho` DUY NHẤT không cần `audio_library` (trả lời bằng thẻ số
> qua `single_select`) → mở ở Q1 mà KHÔNG phá tính chất "Q1 seed được ngay".
>
> Nhờ vậy lộ trình `pho` bám đúng thứ tự phát triển **và** đúng thứ tự phụ thuộc hạ tầng:
> **Q1 âm tiết → Q2 vần + âm đầu → Q3 thanh → Q4 ghép âm**.

### Q2 · Tuần 13–24 — MỞ RỘNG

| Buổi | Skill mở mới | Micro |
|---|---|---|
| D2 | `lang_rhyme_match` 🔊 | `_identify` (L2) |
| D2 | `lang_onset_match` 🔊 | `_identify` (L2) |
| D2 | `lang_picture_to_word` 🔊 | `_noun` (L2) |
| D2 | *(nâng)* `lang_syllable_count` | `_mixed` (L3) |
| D2 | *(nâng)* `lang_listen_detail` | `_where_when` (L3) |
| D5 | `lang_antonym` 🔊 | `_adjective` (L2) — nghe "dày" → chọn clip "mỏng" |
| D5 | *(nâng)* `lang_odd_word_out` | `_attribute` (L3) — *`_category` (L2) đã mở ở Q1* |
| D5 | `lang_part_whole` | `_object` (L3) |
| D5 | `lang_story_causality` | `_why` (L3) · `_what_next` (L3) |
| D5 | `lang_story_character` | `_who` (L2) |
| D5 | `lang_position_word` ⚠ | `_basic` (L2) → `_between` (L3) — *cần pipeline compose (Hướng B), xem §7* |

> **Q2 mở `audio_select`** → từ đây trở đi cần `audio_library` (§6.2 bước 4). Vần và âm đầu
> là tầng thứ hai của thứ tự phát triển âm vị, ngay sau âm tiết đã học ở Q1. **`lang_antonym`
> cũng vào đây** (audio_select): trẻ nghe từ mẫu + các clip từ, chọn từ ngược nghĩa — không
> vẽ đối cực bằng ảnh (xem §3 Q1 ghi chú).

### Q3 · Tuần 25–36 — CHIỀU SÂU

| Buổi | Skill mở mới | Micro |
|---|---|---|
| D2 | `lang_listen_inference` | `_implied` (L4) |
| D2 | `lang_riddle` | `_2clue` (L3) |
| D2 | `lang_tone_discriminate` 🔊 | `_2tone_far` (L3) |
| D2 | *(nâng)* `lang_rhyme_match` / `lang_onset_match` | `_odd_one_out` (L3) |
| D5 | `lang_verbal_analogy` | `_semantic` (L4) |
| D5 | `lang_word_order` | `_svo_3` (L3) |
| D5 | `lang_question_word` | `_who_what` (L3) · `_where_when` (L3) |
| D5 | `lang_elimination` | `_2clue` (L3) |
| D5 | `lang_if_then` | `_given_rule` (L3) |
| D5 | *(nâng)* `lang_story_character` | `_emotion` (L3) |

### Q4 · Tuần 37–48 — THÀNH THẠO

| Buổi | Skill mở mới | Micro |
|---|---|---|
| D2 | `lang_oral_blend` 🔊 | `_onset_rime` (L4) |
| D2 | *(nâng)* `lang_tone_discriminate` | `_minimal_pair` (L4) |
| D2 | *(nâng)* `lang_riddle` | `_3clue` (L4) |
| D2 | *(nâng)* `lang_follow_instruction` | `_3cond` (L4) |
| D2 | *(nâng)* `lang_listen_inference` | `_emotion` (L4) |
| D5 | `lang_absurdity` | `_spot` (L3) |
| D5 | `lang_verbal_classification` | `_common_class` (L4) → `_abstract_class` (L5) |
| D5 | *(nâng)* `lang_elimination` | `_3clue` (L4) |
| D5 | *(nâng)* `lang_word_order` | `_svo_4` (L4) |
| D5 | *(nâng)* `lang_verbal_analogy` | `_functional` (L5) |

> **`lang_absurdity._explain_why` (L5) KHÔNG vào path.** Micro này đòi trẻ *giải thích lý do*,
> nhưng mọi actionType đều là **chọn** — không có đường thu câu giải thích. Chỉ mở `_spot`.
> Catalog cần đánh dấu `_explain_why` là không dựng được với contract hiện tại.

**Kiểm phủ:** 31/31 skill sẵn contract đều được mở — `pho` 6 · `voc` 3 · `sem` 6 · `lis` 5 ·
`nar` 3 · `syn` 4 · `inf` 4. (`lang_word_match` ⛔ và 3 skill ⏸ nằm ngoài path, đúng §11 catalog.)

---

## 4. CẤU TRÚC MỘT BUỔI (8 ACTIVITY)

Luật canonical: `activityIndex` 1..8, **độ khó tăng dần**.

**`difficulty` là VỊ TRÍ TRONG BÀI, không phải mức micro tuyệt đối.** Đây là điểm dễ hiểu
sai: `warmup/core/challenge` đo độ khó **tương đối trong buổi học đó**, còn `L1–L5` là độ khó
**nội tại** của micro-skill. Vì vậy mức micro tương ứng mỗi vai **trôi lên theo quý**:

| Quý | warmup (idx 1–2) | core (idx 3–6) | challenge (idx 7–8) |
|---|---|---|---|
| **Q1** | L1 của skill đã dạy tuần trước | L2 — skill trọng tâm | L2 **biến thể khó nhất** (nhiều distractor hơn / bối cảnh lạ hơn), hoặc L3 cuối Q1 |
| **Q2** | L1–L2 (skill Q1) | L2–L3 | L3 |
| **Q3** | L2 (skill cũ) | L3 | L4 |
| **Q4** | L2–L3 (skill cũ) | L4 | L4–L5 |

*Tuần 1–2 là ngoại lệ: chưa có "quý trước" → warmup dùng chính micro L1 của skill đang mở.*

**Với trẻ 5–6, `L1` KHÔNG phải tầng nội dung** — chỉ là vai warmup/vào bài. Không quý nào
lấy L1 làm `core`.

**Luật trộn skill:** mỗi buổi dùng **3–4 skill khác nhau**, mỗi skill **2–3 activity**.
Không bao giờ 8 activity cùng một skill.

*Kiểm số học: 4 skill × 2 activity = 8 ✓ · 3 skill × (3+3+2) = 8 ✓.*

---

## 5. SPIRAL & MASTERY

Kế thừa nguyên tắc đã chốt ở tiếng Anh (`KIDO_ENGLISH_CURRICULUM.md` §5.4): **nội dung cố
định — 96 bài, chung cho mọi trẻ**; pipeline KHÔNG sinh bài thích ứng theo từng trẻ. Vì vậy
spiral phải **nướng cứng vào chuỗi 96 bài từ khâu thiết kế seed**.

**Luật tái xuất hiện (theo tầng — 1 cửa sổ duy nhất là bất khả thi):**

- Skill của **quý hiện tại + quý liền trước**: tái xuất hiện **≥1 lần / 4 tuần**.
- Skill **cũ hơn**: **≥1 lần / 8 tuần** (có thể chỉ ở vai `warmup`).

> **Vì sao không phải "mọi skill / 4 tuần":** đến Q4, D5 có 17 skill đang mở. Một cửa sổ 4
> tuần của D5 chỉ có 4 bài × 8 = 32 activity, tức tối đa 4×4 = **16 lượt-skill** — không
> đủ chỗ cho 17 skill, chưa kể mỗi skill cần 2–3 activity (≥34 slot). Luật cũ bất khả thi.
> Kiểm luật mới ở cửa sổ 8 tuần của D5 (Q4): 8 bài × 4 skill = **32 lượt-skill**; cần 10
> skill cũ × 1 + 7 skill hiện hành × 2 = **24** ≤ 32 ✓.

- **Luật không đóng skill:** skill mở ở Q1 vẫn phải có mặt ở Q4 (vai `warmup` là đủ).
- **Mastery = tín hiệu REPORT, không phải cơ chế thích ứng.** Một `skillCode` coi là *đạt*
  khi trẻ qua **≥80%** activity của skill đó (đúng lần 1, không tính sau gợi ý), tính dồn
  tới hiện tại. Chỉ dùng report phụ huynh **theo năng lực**; KHÔNG đổi nội dung bài trong app.

---

## 6. PHỤ THUỘC & THỨ TỰ SEED

### 6.1 `pho` cần gì — và KHÔNG cần gì

Spec `openspec/specs/audio-select-activity/spec.md` chốt: payload `audio_select` **SHALL NOT
chứa `assetRef`** — tức **option không bao giờ là thẻ ảnh**, chỉ là clip audio + `altTextVi`.
Nhưng payload **VẪN có `promptImage?: AssetReference`** (scaffold thị giác, tuỳ chọn, thường
bỏ trống).

Do đó, tách bạch ba thứ:

| Thứ | `pho` có cần? |
|---|---|
| **Danh sách từ + chú giải ngữ âm** (từ nào cùng vần / cùng âm đầu / khác thanh) | **BẮT BUỘC** — việc dữ liệu ngôn ngữ, rẻ |
| **`audio_library`** (clip TTS, 1 clip/word-key, tái dùng) | **BẮT BUỘC** |
| **Ảnh cho option** | **KHÔNG BAO GIỜ** — spec cấm `assetRef` trên option |
| **`promptImage`** (1 ảnh đề bài) | **TUỲ BÀI** — không phải điều kiện tiên quyết của cả domain |

> **Hai doc đều đang nói quá.** Catalog §9.2 sai khi coi bộ ảnh 200–300 từ là *tiền đề của
> toàn bộ domain `pho`*. Nhưng cũng KHÔNG được kết luận ngược lại rằng `pho` không dùng ảnh
> gì — `promptImage` vẫn hợp lệ ở từng bài. Điều đúng: **thứ chặn `pho` là danh sách từ +
> audio, không phải bộ ảnh.** §9.2 và tiêu chí *"mọi biến thể thanh phải **vẽ được**"* cần
> sửa: vì bé không thấy ảnh option, yêu cầu đúng là **"từ có nghĩa cụ thể trẻ 5–6 đã biết"**.

**Ngược lại**, bộ **ảnh** là thứ chặn `voc`/`sem`/`lis`/`nar`/`syn`/`inf` — tức toàn bộ Q1
và phần lớn D5.

### 6.2 Thứ tự

> **Phân biệt SEED vs GENERATE** (chỗ này bản v1.1 ghi sai): seed chỉ là **text**
> (`questionCore` + `answerSpec`), KHÔNG trỏ asset. Nên `viLabel`/ảnh/audio **không chặn
> seed** — chúng chặn bước **generate** (dựng payload, chọn/gen ảnh, sinh clip).
> Hệ quả tốt: **seed Q1 chạy được NGAY**, song song với việc dựng asset.

| Bước | Việc | Mở khoá |
|---|---|---|
| 0 | ✅ Nạp catalog + Language Signature Test vào seed-review | *(xong 2026-07-16)* |
| 1 | ✅ Nới `day` (type **và** Mongoose enum); 29 `lang_*` vào `KIDO_SEED_AUTHORING.md`; `gen-lang-seed.routine.md`; `lint-seeds.ts` dùng `getSkillConstruct` | *(xong 2026-07-16)* — **seed lang chạy được** |
| 2 | ✅ `viLabel` (optional) + validator + `backfill-vi-labels.ts` | *(xong 2026-07-16)* — **generate ảnh cho lang** |
| 3 | **Seed Q1** (w1–12 = 24 bài, 192 activity) — không cần `audio_library` | Chứng minh end-to-end |
| 3b | Chạy `backfill-vi-labels.ts --dry-run` → bổ sung object còn thiếu vào map → chạy thật | Generate Q1 |
| 4 | ✅ Danh sách từ ngữ-âm — `kido-pipeline/src/curriculum/vi-phonetics.ts` | *(xong 2026-09-02)* — **seed `pho` Q2–Q4 chạy được** |
| 4b | Nạp `audio_library` (TTS) | **generate** bài `pho` — KHÔNG chặn seed |
| 5 | *(tuỳ)* mở rộng `match_pair` mang `audioRef` | `lang_word_match` ⛔ |

**Tính chất quan trọng:** Q1 hoàn toàn không có `audio_select` → **generate được** mà không
cần epic `audio_library`. Chỉ cần ảnh có `viLabel`.

> ✅ **Bước 4 xong 2026-09-02 — `pho` hết chặn ở khâu SEED.** Danh sách từ + chú giải ngữ âm
> nay là `kido-pipeline/src/curriculum/vi-phonetics.ts`: kho từ một tiếng (họ vần và họ âm đầu
> đều ≥3 từ), bảng từ 2–3 tiếng cho `lang_syllable_count` (có cờ từ láy), bộ khác thanh đã
> khảo sát tay, và **validator riêng cho từng skill `pho`** mã hoá đúng các anti-pattern của
> catalog. Điểm cốt lõi: module phân biệt **con chữ** âm đầu với **âm nghe được giọng Bắc**
> (`d`/`gi`/`r` → `/z/`, `ch`/`tr`, `s`/`x` trung hoà) — nhìn mặt chữ mà soạn bài `lang_onset_match`
> thì bài có hai đáp án đúng. Cách dùng: routine `gen-lang-seed.routine.md` §7b.
>
> `audio_library` (bước 4b) vẫn cần cho **generate**, nhưng nó không phải điều kiện của seed và
> cũng không có gì để "chuẩn bị trước": clip sinh lười lúc generate qua `getOrCreateLibraryClip`.

> ✅ **Phương ngữ: CHỐT MIỀN BẮC** (2026-07-16) — `lợn`, `ngô`, `dứa`, `bát`, `thìa`, `ô`, `mũ`,
> `tất`, `dưa chuột`. Bắc/Nam khác **vần** và **số tiếng** → đổi sau khi seed `pho` là phải audit
> lại toàn bộ. Đã khoá bằng test. Xem catalog §9.1.
>
> ⚠️ **Kèm theo ở bước 4:** phải **nghe** để xác nhận giọng TTS cũng là Bắc — `ttsVoice`
> (`Sulafat`) không mã hoá phương ngữ nên config không enforce được. Nhãn Bắc + giọng Nam ⇒ bài
> âm vị lệch.

---

## 7. KHOẢNG TRỐNG CONTRACT CÒN LẠI

**Bước 1 đã xong 2026-07-16** — bảng dưới ghi lại trạng thái.

| Nơi | Trạng thái |
|---|---|
| `src/types/seed.types.ts` | ✅ `day` nới thành `'D1'\|'D2'\|'D3'\|'D4'\|'D5'`. |
| `src/db/models/seed.model.ts` | ✅ enum `day` nới thành `['D1','D2','D3','D4','D5']`. **Chỗ này ban đầu bị bỏ sót**: chỉ nới TS type thì compile qua nhưng Mongoose vẫn **reject D2/D5 lúc runtime**. |
| `src/pipeline/seed-import.ts:25` | ✅ **Chốt (a)**: `domainCode: seed.domainCode ?? getDomainCode(...)` → seed lang để `undefined`, KHÔNG sửa importer. `LangDomainCode` chỉ sống trong catalog cho review/report; tra bằng `getLangDomainCode()`. Đã ghi chú ngay tại `ActivitySeed.domainCode` để người sau không hiểu nhầm là thiếu sót. |
| `src/scripts/lint-seeds.ts` | ✅ Đổi sang `getSkillConstruct` (đa môn) → hết báo oan `lang_*`/`en_*`. Thêm rule mới: seed lang **khai** `domainCode` → flag `DOMAIN`. Ràng buộc Primitive Pack (`NONPACK_VOCAB`) giới hạn lại **chỉ skill Toán** — skill ngôn ngữ dùng vật đời thực là đúng bản chất. |
| `docs/KIDO_SEED_AUTHORING.md` | ✅ Thêm 29 `lang_*` (nhóm theo domain) + bảng `day` theo môn + mục "Riêng môn `tieng_viet`". |
| `docs/prompts/gen-lang-seed.routine.md` | ✅ Đã viết. |
| `docs/KIDO_LANG_SKILL_CATALOG.md` §0.3 | ✅ `seedId` sửa `D<1\|4>` → `D<2\|5>`. |
| `seed-file.ts` / `generate-math-seeds.ts` | Hard-code `subject: 'toan'`, `DAYS=['D1','D4']`. **KHÔNG chặn** — đó là đường *tự động* của Toán; seed lang đi đường viết-tay-rồi-import như tiếng Anh. |
| `viLabel` | ✅ **Xong 2026-07-16** — optional ở `attributes`, authoring-only (KHÔNG thêm vào `kido-server`: publish không mang `attributes`, và `LibraryAsset` bên server là mirror không ai dùng). Kèm `vi-label.ts` (validator + map ~90 object) và `backfill-vi-labels.ts --dry-run`. Xem catalog §9.1. |
| Phương ngữ | ✅ **Chốt miền Bắc 2026-07-16**, khoá bằng test. Còn phải nghe xác nhận giọng TTS ở bước 4. |
| **Còn lại** | Chạy `backfill-vi-labels.ts` (bỏ `--dry-run`) để ghi thật; rồi **seed Q1**. |

---

## 8. VIỆC CẦN CHỐT

1. ~~**Độ tuổi chia đôi?**~~ — **ĐÃ CHỐT 2026-07-16: chỉ 5–6.** Không chẻ đôi, không làm
   phân hệ 4–5. 48 tuần = năm trước lớp 1. Hệ quả đã áp: `L1` hạ xuống vai warmup;
   `lang_syllable_count` đưa về Q1; trọng tâm Q1 vào thẳng L2.
   *Rủi ro còn lại:* nếu sau này sản phẩm nhận trẻ 4 tuổi, path này KHÔNG dùng lại được —
   phải làm phân hệ riêng, không phải sửa vá.
2. **`domainCode` cho seed lang** — chọn (a)/(b)/(c) ở §7. **Đây là việc treo lớn nhất còn lại.**
3. **Chủ đề (theme):** có cần liệt kê ~12 chủ đề làm hướng dẫn chọn object cho người viết
   seed không, hay để tự do dưới `SEED_OBJECT_DIVERSITY`?
4. **Gán cứng 96 bài?** Doc này dừng ở luật (§4–§5). Nếu muốn kiểm chứng spiral bằng máy
   thay vì tin người viết seed, cần bảng phân bổ 96 bài + linter kiểm.
