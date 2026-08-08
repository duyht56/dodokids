# PROJECT KIDO — KHUNG CHƯƠNG TRÌNH TIẾNG ANH (CANONICAL)

- **Mã môn học (SubjectCode):** `tieng_anh`
- **Độ tuổi:** 4–6 · School-readiness track (mục tiêu: phỏng vấn vào lớp 1 trường điểm)
- **Trạng thái:** DRAFT — chờ Human Gate sản phẩm để chuyển FREEZE
- **Phiên bản:** 2026-07-11-english-v1.2 (rev sau Codex round 2: `toys`/`animals` pattern khớp giới từ & luật §2, spiral/mastery reframe thành cố-định-48-bài + tín-hiệu-report (bỏ hàm ý thích ứng theo trẻ), bỏ thang L1–L5 lệch schema, làm rõ 4+1 actionType, định nghĩa đo mục tiêu từ vựng). v1.1: khớp trục ngữ pháp↔thứ tự chủ đề, 1 mẫu câu/chủ đề, sửa offline-task, thêm §5.4.
- **Lịch phát:** 1 buổi/tuần, cố định **day 3** → `lessonId` dạng `w{nn}-d3-tieng_anh`. 48 tuần = 48 bài = 12 chủ đề × 4 bài.

> Doc này song song `KIDO_MATH_CURRICULUM.md`. Nó chỉ chốt **khung** (3 trục, 14 skill, 12 chủ đề, trục ngữ pháp, guardrails). Skill catalog chi tiết (micro-skill × difficulty) tách sang `KIDO_ENGLISH_SKILL_CATALOG.md` khi bắt đầu seed. Naming theo kido-server (wire/CMS contract) — xem `docs/kido-activity-schema.ts`.

---

## 1. TRIẾT LÝ & MỤC TIÊU

Kế thừa nguyên tắc cốt lõi trong `docs/AI_CONTEXT.md`: audio-first, visual-first, no-stress, không nhồi nhét. Tiếng Anh **không** dạy ngữ pháp tường minh; trẻ thụ đắc mẫu câu qua nghe–nhìn–chạm lặp lại theo chủ đề.

**Mục tiêu năng lực (do sản phẩm chốt):** sau 48 tuần trẻ **nghe hiểu** ~300–500 từ vựng (năng lực *tiếp nhận* — receptive) và **nhận ra câu trả lời đúng** cho bộ câu hỏi phỏng vấn lớp 1 trường điểm (*What's your name? How old are you? What's your favorite color? Do you like…? Who is this?*). Một **tập con lõi** (tên, tuổi, màu yêu thích, thành viên gia đình, 2–3 sở thích) trở thành **chủ động** — trẻ tự nói được ở mức khung câu — nhưng phần chủ động này được luyện & kiểm ở lớp offline với phụ huynh (§6), KHÔNG đo trong app. Không đặt mục tiêu 300–500 từ *chủ động*: bộ actionType nhận biết/chọn không đo được năng lực nói. **Định nghĩa đo:** "300–500 từ" là **số từ được đưa vào chương trình có chủ đích** (mỗi từ xuất hiện ≥ 3 activity across 48 bài, có spiral ôn lại), KHÔNG phải cam kết mỗi trẻ lưu giữ đủ ngần ấy. Mastery thực tế đo theo **skill** (§5.4), không theo đếm đầu từ.

> ⚠️ **CON SỐ 300–500 ĐÃ BỊ BÁC (2026-07-20, sau 2 vòng review Codex) — CHỜ HUMAN GATE CHỐT CON SỐ THAY THẾ.**
>
> **Vì sao không khả thi.** Hai phương pháp độc lập cùng ra một vùng: (i) *đếm kho từ* — 12 chủ đề ở mức mầm non chứa ≈111 từ nội dung, cộng tính từ dùng chung ≈130–160; không thể phơi nhiễm từ không tồn tại trong chương trình. (ii) *scale mật độ thật* — `w01-en.json` có 10 lượt target/8 activity = 1,25 lượt/activity; nhân 384 activity ≈ 480 lượt, chia mức lặp tối thiểu → trần toán học ~160 từ. Yêu cầu cũ (300–500 từ × 3 lượt = 900–1500 lượt) hụt 2–3 lần.
>
> **Ba hiểu lầm đã loại bỏ khi tính:** distractor **ảnh** không phải lượt phơi nhiễm từ (bé không nghe tên tiếng Anh của chúng); `hint1`/`hint2`/`explain` phát **có điều kiện** nên không tính vào coverage đảm bảo; `audio_select` 3 clip **không** bằng 3 lượt chừng nào UI chưa bắt phát hết mọi clip.
>
> **Đề xuất chốt (Codex + đối chiếu độc lập):**
>
> | Chỉ số | Con số | Nghĩa |
> |---|---|---|
> | Curriculum coverage | **120–150 lexeme** | từ/cụm được đưa vào có chủ đích |
> | Core receptive inventory | **80–100 lexeme** | luyện sâu, có ôn giãn cách |
> | Interview frames | **10–15 khung câu** | nhận ra trong app, nói thật ở offline |
>
> Câu cho phụ huynh phải là **coverage chương trình**, không phải outcome cá nhân: *"Trong 48 tuần, bé được làm quen và luyện nghe–nhận ra khoảng 120–150 từ và cụm từ tiếng Anh nền tảng thuộc 12 chủ đề gần gũi."* KHÔNG viết "sau 48 tuần trẻ nghe hiểu 150 từ" — chương trình cố định chưa chứng minh được outcome đó. Nếu cần cam kết năng lực thì chỉ nói **80–100 mục lõi**.
>
> **Điều kiện trước FREEZE:** con số 120–150 vẫn là **ước lượng** cho tới khi 48 tuần seed chạy qua lexical ledger (`src/curriculum/lexical-ledger.ts`) và cho số thật.

**Định nghĩa `lexeme` (dùng cho mọi phép đếm ở trên):** lemma hoặc cụm cố định có một chức năng rõ (`cat`, `running`, `ice cream`, `thank you`). Dạng số nhiều/chia động từ KHÔNG tính thành mục mới. Tên riêng KHÔNG tính. Từ chức năng (`a`, `is`, `I'm`) KHÔNG tính riêng chỉ vì xuất hiện trong câu. Một lexeme chỉ tính **một lần trong một activity** dù clip phát lại nhiều lần. Chỉ tính khi **âm tiếng Anh được phát** và nghĩa/chức năng được neo đủ rõ.

**Mức lặp phân tầng** (thay tiêu chí "≥3 activity" phẳng — 3 lượt không phải bằng chứng đã học):

| Tầng | Yêu cầu | Được mô tả là |
|---|---|---|
| **core** | ≥5 lượt, ở ≥3 tuần khác nhau | "luyện sâu, có ôn giãn cách" |
| **extension** | ≥2 lượt, ở ≥2 tuần | "đã làm quen" |
| ritual/scaffold | theo dõi riêng | KHÔNG cộng vào con số headline |

**Ranh giới trung thực (in-app vs ngoài app):** với bộ actionType hiện có (kể cả `audio_select`), trẻ chỉ **nhận ra / chọn** — không **phát âm thành tiếng**. Phần "nói" (giới thiệu bản thân, trả lời phỏng vấn thật) được xử lý ở lớp **offline-task** cho phụ huynh (xem §6), KHÔNG bằng mic/ASR trong MVP. ASR chấm giọng trẻ Việt nói tiếng Anh báo sai nhiều → vi phạm no-stress → loại khỏi MVP.

---

## 2. BA TRỤC (KHÔNG TRỘN LẪN)

Sai lầm chết người của curriculum ngoại ngữ là gộp chủ đề và năng lực vào một mã. Kido tách **ba trục độc lập**:

| Trục | Field | Ai thấy | Vai trò |
|------|-------|---------|---------|
| **Chủ đề** | `themeCode` | Trẻ + phụ huynh | Quyết định thứ tự bài, không khí, tập từ vựng. VD `hello`, `colors`, `family`. |
| **Mẫu câu** | `sentencePattern` | (cài cắm ngầm) | Cấu trúc được lặp trong chủ đề. VD `"It's ___."`, `"I have ___."`. |
| **Năng lực** | `skillCode` | Hệ thống (report + regen) | Trẻ đang *làm gì* với ngôn ngữ. VD `en_word_recognition`. |

- `themeCode` + `sentencePattern` là **field mới** cần thêm vào seed và `ActivityMeta`.
- `skillCode` là trục theo dõi tiến bộ. Report phụ huynh nói theo **năng lực** ("nghe hiểu từ đơn tốt, nghe hiểu cả câu còn chậm"), KHÔNG theo chủ đề ("giỏi chủ đề Gia đình" = vô nghĩa sư phạm).
- **Một chủ đề = 1 cụm 4 bài**, cùng `themeCode`, cùng `sentencePattern`, xoay vòng qua 3–4 `skillCode` khác nhau.
- **`sentencePattern` phải ĐƠN NGHĨA** — mỗi chủ đề khai đúng **một** mẫu câu (để report/regen bám được). Câu hỏi phỏng vấn tương ứng (VD "How old are you?") là **prompt audio**, không phải pattern thứ hai; biến thể (VD "How many?") là hoạt động lẻ trong bài, không ghi vào field.

Ví dụ cụm chủ đề `colors` (mẫu câu `"It's ___."`):

| Bài | skillCode | actionType | Nội dung |
|-----|-----------|-----------|----------|
| 1 | `en_word_recognition` | `single_select` | Nghe "red" → chọn thẻ đỏ |
| 2 | `en_attribute` | `single_select` | Nghe "the big blue ball" → chọn |
| 3 | `en_category_select` | `multi_select` | "Touch all the yellow things" |
| 4 | `en_listen_sentence` | `single_select` | Nghe "It's green." → chọn tranh |

### 2.1 · RANH GIỚI ĐO ĐƯỢC — từ vựng nào đi kênh nào

Giả định ngầm "mọi từ đều kiểm được bằng chọn ảnh" là **SAI**, và là nguyên nhân gốc làm hỏng bản seed tuần 1 đầu tiên (chủ đề `hello`). Mỗi từ/cụm đích phải xếp vào đúng **một** trong bốn lớp dưới đây, và chỉ được kiểm bằng kênh tương ứng:

| Lớp | Ví dụ | Kênh hợp lệ | Vì sao |
|-----|-------|-------------|--------|
| **1 · Vật / thuộc tính / hành động nhìn thấy được** | `cat`, `red`, `three`, `running` | audio → **chọn ảnh** | Có vật quy chiếu; ảnh phân biệt được bằng chính nghĩa của từ. |
| **2 · Hành vi ngữ dụng có ngữ cảnh** | `hello`, `goodbye`, `thank you`, `"Yes, I do."` | tình huống → **chọn clip** (`audio_select`) | Không có vật để vẽ. Ép vào kênh ảnh thì mọi option thành "người đang làm cử chỉ", và trục phân biệt rơi về **quy ước vẽ tranh** (vẫy tay quay mặt vào / quay lưng đi) — trẻ học *pose* thay cho *từ*, mất transfer sang người và tình huống mới. |
| **3 · Biến cá nhân** | tên thật, tuổi thật, sở thích thật của trẻ | **offline-task** (§6) | Không có đáp án in-app phổ quát — đáp án khác nhau theo từng trẻ. App không có mic nên cũng không nghe được trẻ nói ra. |
| **4 · Từ chức năng** | `I'm`, `a`, `is` | chỉ khi khác biệt ngữ pháp **đổi nghĩa cả câu** | Mã hoá `I'm` thành icon "chỉ tay vào ngực" rồi bắt xếp thẻ là đo **trí nhớ mã icon**, không đo dựng câu. |

**Hệ quả bắt buộc:**
- Chủ đề mà **phần lớn** từ đích thuộc lớp 2–4 thì **không đủ nội dung cho một block 4 tuần** (32 activity). Đó là lý do `hello` bị hạ xuống nghi thức + offline-task (§6) thay vì làm chủ đề.
- Lớp 2 vẫn **kiểm được** — nhưng chỉ qua `audio_select`, và chịu trần ≤3 options. Không được kết luận "không kiểm được".
- Lớp 3 phải khai báo rõ ở §4 để routine không sinh activity cho chỗ trống đó.

**Shortcut test cho mỗi item** (bản tiếng Anh của Logic Signature Test): *bỏ hoặc thay âm tiếng Anh đích đi, kết quả có tụt về gần ngẫu nhiên không?* Nếu không — item đang đo thứ khác (pose, bố cục, trí nhớ tranh). Và: *đổi nhân vật, tư thế, góc nhìn, bối cảnh — trẻ còn nhận đúng từ không?* Nếu không — item dạy một mã phụ, không dạy từ.

---

## 3. TRỤC NGỮ PHÁP (quyết định thứ tự chủ đề)

Mẫu câu bám thứ tự thụ đắc tự nhiên, KHÔNG ngẫu nhiên. Trục này là **ràng buộc cứng** — thứ tự 12 chủ đề ở §4 phải đơn điệu theo nó:

`be` → `have` → `like` → `can` → giới từ (prepositions) → hiện tại tiếp diễn → (be + tính từ: ôn tập).

Phân bổ chủ đề theo khối ngữ pháp (12 chủ đề = đúng thứ tự trên): **be** ×4 (colors, numbers, shapes, family) → **have** ×1 (body) → **like** ×2 (food, animals) → **can** ×1 (actions) → **prepositions** ×2 (toys, house) → **continuous** ×1 (clothes) → **ôn tập** ×1 (feelings).

**Ràng buộc số học:** mỗi chủ đề = 4 tuần → mỗi quý (12 tuần) chứa đúng **3 chủ đề**. Vì vậy KHÔNG thể nhét cả 4 chủ đề phỏng vấn vào Q1. Cách xử lý: **front-load** — 3 chủ đề phỏng vấn lõi (tên/tuổi/màu) ở Q1; khối `be` chạy liền mạch tuần 1–16 nên `family` (gia đình) rơi vào **đầu Q2** (tuần 13–16, tức tháng 4 — vẫn rất sớm). Q4 kết bằng `feelings` + **mô phỏng phỏng vấn tổng hợp** (bài 4).

---

## 4. 12 CHỦ ĐỀ × 48 TUẦN

Thứ tự dưới đây đơn điệu theo trục §3 (be→have→like→can→prep→continuous→ôn tập). Mỗi chủ đề đúng **một** `sentencePattern`.

| Q | Tuần | themeCode | Chủ đề | sentencePattern | Khối ngữ pháp | Ghi chú asset |
|---|------|-----------|--------|-----------------|---------------|----------------|
| 1 | 1–4 | `colors` | Màu sắc | `"It's ___."` | be | **0** — Static Primitive Pack + assets_library |
| 1 | 5–8 | `numbers` | Số đếm | `"It's ___."` (số nghe được) | be | **0** — number_card + dot |
| 1 | 9–12 | `shapes` | Hình khối & màu | `"It's a red circle."` | be | **0** — Static Primitive Pack |
| 2 | 13–16 | `family` | Gia đình | `"This is my ___."` | be | Gen mới (family members) |
| 2 | 17–20 | `body` | Cơ thể | `"I have ___."` | have | Gen mới, hoặc **compose** (body parts) |
| 2 | 21–24 | `food` | Đồ ăn & sở thích | `"I like ___."` | like | **0** — fruit/food |
| 3 | 25–28 | `animals` | Động vật & sở thích | `"Yes, I do. / No, I don't."` ⓐ | like (câu trả lời) | **0** — category `animal` |
| 3 | 29–32 | `actions` | Hành động | `"I can ___."` | can | Gen mới (action poses) |
| 3 | 33–36 | `toys` | Đồ chơi & vị trí | `"It's in the ___."` | prepositions | household reuse (một phần) |
| 4 | 37–40 | `house` | Nhà & vị trí | `"The ___ is on the ___."` | prepositions | **Compose** từ sprite (xem §5.3) |
| 4 | 41–44 | `clothes` | Quần áo | `"I'm wearing ___."` | present continuous | **0** — category `clothing` |
| 4 | 45–48 | `feelings` | Cảm xúc & ôn tập phỏng vấn | `"I'm ___."` (happy/sad) | be + tính từ (ôn) | Gen mới (face expressions) + tái dùng |

**ⓐ `animals` — mẫu câu chỉ chạy bằng `audio_select`.** `"Yes, I do. / No, I don't."` là **hành vi lời nói** (lớp 2, §2.1): không vẽ được, nên seed nhắm vào *mẫu câu* bắt buộc dùng `audio_select` (nghe "Do you like cats?" → chọn clip trả lời đúng loại). Từ vựng con vật (lớp 1) vẫn chọn ảnh bình thường. Không đổi pattern sang `"I like ___."` vì `food` (21–24) đã dùng câu đó, và `animals` giữ vai trò dạy **dạng câu trả lời** của khối `like` mà §3 cố ý xếp.

**`numbers` — tách vốn từ khỏi mẫu câu phỏng vấn.** Từ đích one–ten là lớp 1, kiểm in-app thoải mái (nghe "three" → chọn nhóm 3 chấm). Nhưng `"I'm ___ years old."` có chỗ trống là **tuổi thật của trẻ** = lớp 3 → chỉ đo ở offline-task; bản in-app dùng tuổi **cố định của nhân vật** ("Dodo is five.") để giữ mẫu câu mà không đòi dữ liệu cá nhân.

**`hello` KHÔNG còn là chủ đề.** Ba từ `hello`/`goodbye`/`thank you` đều là lớp 2 (§2.1) — cả chủ đề không đủ nội dung kiểm được cho 32 activity. Thay bằng: nghi thức mở bài (Đô Đô chào, **không chấm**), offline-task §6 (nơi trẻ thật sự học chào), và item `audio_select` ngữ dụng rải xuyên chương trình như spiral giao tiếp.

**Chi phí ảnh (chính xác):** **6/12 chắc chắn ~0** — `colors`, `numbers`, `shapes`, `food`, `animals`, `clothes` (dùng `assets_library` + Static Primitive Pack). **Tối đa 8** nếu compose sprite chạy được cho `body` + `house` (§5.3, chưa xác minh). Ba chủ đề cần **gen ảnh mới**: `family`, `actions`, `feelings`; `toys` tái dùng household một phần. Thứ tự mới cho phép **cả Q1 (12 tuần đầu) chạy trọn vòng seed→publish→mobile với chi phí gen ảnh 0** — đúng chiến lược "mở màn bằng chủ đề zero-asset" mà lịch cũ (bắt đầu bằng `hello`) không cho làm. Hàng đợi gen ảnh cho `family` chỉ cần xong trước tuần 13.

### 4.1 · THEME × SKILL FEASIBILITY MATRIX

Trước đây routine áp **một template skill chung cho mọi chủ đề** ("xoay vòng 4–5 skillCode"). Đó là cơ chế đã buộc generator bịa `en_category_select`/`en_sentence_build` cho chủ đề không đỡ được construct đó — và là nguyên nhân trực tiếp của 3 bài `multi_select` thừa trong bản seed tuần 1 đầu tiên.

Thay bằng **ma trận khai báo trước**: mỗi ô (chủ đề × skill) là `valid` / `invalid` / `asset-blocked`. Routine **chỉ được chọn skill từ ô `valid`** của chủ đề đang làm.

- **Nguồn chân lý trong code:** `kido-pipeline/src/curriculum/english-skill-catalog.ts` → `THEME_SKILL_MATRIX`. Validator đọc trực tiếp từ đó (cùng mô hình `skill-catalog.ts` mirror `KIDO_MATH_SKILL_CATALOG_V2.md`).
- **Allowlist:** ô khuyết = `invalid`. Chủ đề mới **không sinh được seed nào** tới khi khai báo — chủ đích (fail loud), không phải bug.
- **Mỗi ô `invalid`/`asset-blocked` phải kèm lý do một dòng.** Ma trận là phán đoán người, có thể sai như bảng §4 cũ đã sai; lý do viết ra để review được thay vì tin mù.
- `asset-blocked` ≠ `invalid`: tổ hợp đúng về sư phạm nhưng thiếu asset (vd `en_attribute` cho `family` cần gen ảnh thành viên). Mở lại khi asset sẵn sàng, không cần sửa curriculum.

Ví dụ đọc ma trận — `colors`: `en_story_sequence` = `invalid` *("màu không có trình tự thời gian để kể")*; `en_sentence_build` = `invalid` *("It's red." chỉ 2 từ nội dung → thứ tự đúng không duy nhất về ngữ pháp")*.

**Vốn từ `shapes` (tuần 9–12).** Static Primitive Pack có 8 hình × 8 màu × 4 size = 256 biến thể, nhưng chỉ **8 khái niệm hình** (`circle, square, triangle, star, heart, diamond, pentagon, hexagon`). Loại `pentagon`/`hexagon` (ngoài phạm vi 4–6 tuổi và ngoài phạm vi phỏng vấn lớp 1) còn **6 từ** — mỏng cho 32 activity nếu dùng đơn lẻ. Vì vậy mẫu câu là `"It's a red circle."`: **6 hình × 8 màu = 48 tổ hợp**, và đó đúng là construct của `en_attribute`. Chủ đề `shapes` do đó vừa dạy hình, vừa **ôn lại `colors`** qua tổ hợp thuộc tính — spiral thật, không phải spiral dán nhãn. *Ghi nhận:* pack thiếu `rectangle`/`oval` (hai hình mầm non chuẩn) — nếu vốn từ cần chúng thì mở change riêng cho `primitive-pack.ts`.

---

## 5. 14 SKILL (trục năng lực)

Naming: `en_<skill>`, song song `math_<skill>`. Cờ: `✓` sẵn actionType MVP (bao gồm `audio_select` — đã land, xem §7) · `+` cần asset/pose mới.

### 5.1 Phân hệ tiếp nhận từ đơn & thuộc tính (4–5 tuổi)

| skillCode | Năng lực | actionType | Cờ |
|-----------|----------|-----------|-----|
| `en_word_recognition` | Nghe 1 từ → chọn ảnh | `single_select` | ✓ |
| `en_word_match` | Nối từ↔ảnh / cặp ngữ nghĩa | `match_pair` | ✓ |
| `en_category_select` | "Touch all the animals" | `multi_select` | ✓ |
| `en_attribute` | Tính từ: "the big red ball" | `single_select` | ✓ |
| `en_number_1_10` | Nghe "five" → chọn thẻ số/chấm | `single_select` | ✓ |
| `en_classroom_command` | TPR: stand up, sit down, clap (xem guardrail §5.4) | `single_select` | + |

### 5.2 Phân hệ nghe hiểu câu, hội thoại & âm vị (5–6 tuổi)

| skillCode | Năng lực | actionType | Cờ |
|-----------|----------|-----------|-----|
| `en_listen_sentence` | Câu đơn + giới từ: "the cat is under the table" | `single_select` | + |
| `en_story_sequence` | Nghe truyện EN → sắp xếp tranh (xem guardrail §5.4) | `sort_sequence` | + |
| `en_letter_case_match` | Nối A↔a | `match_pair` | ✓ |
| `en_letter_sound` | Nghe /b/ → chọn vật bắt đầu bằng b | `single_select` | ✓ |
| `en_phonics_initial` | "Từ nào bắt đầu bằng /b/?" (đáp án = audio) | `audio_select` | ✓ |
| `en_rhyme` | Tìm từ cùng vần (đáp án = audio) | `audio_select` | ✓ |
| `en_dialogue_response` | Nghe câu hỏi → chọn clip TRẢ LỜI đúng loại | `audio_select` | ✓ |
| `en_sentence_build` | Dựng câu bằng thẻ icon, đúng `sentencePattern` chủ đề (VD colors: `[It's][red]`) | `sort_sequence` | + |

**Không dùng trong tiếng Anh:** `count_tap`, `compare_tap` (hình dạng của Toán — "đếm bằng tiếng Anh" ít giá trị ngôn ngữ, làm lẫn môn). Tiếng Anh dùng **5 actionType**: `single_select`, `multi_select`, `match_pair`, `sort_sequence`, `audio_select` — cả 5 đều đã có trong schema (`audio_select` land 2026-07-14, §7). **Cả 14/14 skill đều chạy được**, không còn skill bị chặn.

`audio_select` là actionType **duy nhất** mang được âm thanh; 4 loại còn lại chỉ nhận ảnh. Đây là trần cứng của cả môn: mọi nội dung mà đáp án phải là tiếng Anh (hành vi lời nói, mẫu câu trả lời, âm vị) đều phải đi qua `audio_select` với guardrail ≤3 options. Xem bảng 4 lớp từ vựng ở §2 để biết loại nào đi kênh nào.

**Đã loại khỏi khung:** `en_minimal_pair` (ship/sheep) — giá trị thấp cho mục tiêu phỏng vấn, quá khó với trẻ Việt 4–6.

### 5.3 Ghi chú compose (giảm chi phí)

Skill giới từ (`en_listen_sentence`, chủ đề `house`) có thể **compose sprite** lên background bằng `kido-pipeline/src/pipeline/composite-image.ts` (cần xác minh khả năng) thay vì gen scene mới — cùng cơ chế `count_tap` nhân bản sprite. Nếu compose chạy được → thêm 1 chủ đề vào nhóm zero-asset.

### 5.4 Spiral, Mastery & Phân hóa tuổi

Mô hình "4 tuần liền một chủ đề rồi bỏ" dễ tạo **học cụm → quên cụm**. Ba cơ chế chống lại. **Lưu ý kiến trúc:** nội dung là **cố định 48 bài, chung cho mọi trẻ** (giống Toán) — pipeline KHÔNG sinh bài thích ứng theo từng trẻ. Vì vậy spiral phải **nướng cứng vào chuỗi 48 bài từ khâu thiết kế seed**, không phải chèn động lúc chạy.

- **Spiral review (cố định trong 48 tuần):** **tuần thứ 4 (lesson cuối) của MỖI chủ đề** (từ chủ đề thứ 2 trở đi) là **slot ôn cố định** — trộn **1 mẫu câu của chủ đề liền trước** vào ≥1 trong 8 activity của tuần đó. Lưu ý thuật ngữ: mỗi chủ đề = 4 tuần, mỗi tuần = 1 lesson = 8 activity (rule 8/buổi); "tuần 4 của chủ đề" là lesson thứ 4, KHÔNG phải activity thứ 4. Tuần cuối của chủ đề chốt mỗi quý (`colors` w12, `food` w24, `toys` w36) đồng thời ôn **cả 3 chủ đề trong quý**. Q4 kết bằng `feelings` tuần 4 (w48) = **mô phỏng phỏng vấn** tổng hợp mẫu câu lõi. Tất cả khai báo tĩnh ở seed qua field `reviewOf: themeCode[]` (mới) — cùng chuỗi cho mọi trẻ.
- **Spiral cấp TỪ VỰNG (khác spiral mẫu câu ở trên — MỚI 2026-07-20):** gạch đầu dòng trên chỉ ôn **mẫu câu**, nên trước đây chương trình **không có cơ chế nào đưa TỪ cũ quay lại**. Hệ quả: mọi từ chỉ sống trong 4 tuần của chủ đề mình rồi biến mất, và yêu cầu "mỗi từ ≥N lượt" ở §1 không thể đạt được về mặt cơ học. Bổ sung: **mọi tuần từ W5 trở đi dành ≥1 trong 8 activity cho từ lõi của một chủ đề ĐÃ HỌC**. 44 tuần × ~2 lexeme = ~88 lượt giãn cách — đây là ngân sách quyết định bao nhiêu từ đạt tầng `core`.
- **Lặp giãn cách, không lặp dồn:** 3 lượt trong CÙNG một buổi yếu hơn hẳn 3 lượt cách nhau nhiều tuần. Vì vậy ledger đếm theo **tuần**, không chỉ theo tổng số; và validator cảnh báo `WEEK_LEXEME_MASSED` khi 1 từ chiếm >3/8 bài một buổi. Luật cũ của routine ("không lặp 1 targetWord quá 2 lần trong 1 chủ đề") đã **gỡ** — nó mâu thuẫn trực tiếp với yêu cầu ≥N lượt/từ.
- **Mastery = tín hiệu REPORT, không phải cơ chế thích ứng:** một `skillCode` coi là *đạt* khi trẻ qua **≥ 80%** activity của skill đó (đúng lần 1, không tính sau gợi ý) **tính dồn tới hiện tại** (không phải cửa sổ 2 tuần — skill xuất hiện thưa). Con số này chỉ để **report phụ huynh** hiển thị theo **skill** (không theo chủ đề) và gợi ý offline-task ôn thêm; KHÔNG đổi nội dung bài trong app.
- **Phân hóa 4–5 vs 5–6 tuổi:** trục tuổi ánh xạ vào **difficulty** chứ KHÔNG tách hai giáo trình. Schema wire chỉ có `difficulty: 1|2|3`; nếu skill catalog dùng thang chi tiết hơn (kiểu catalog Toán) thì **phải khai mapping về 1|2|3** ở catalog — doc này KHÔNG chốt thang 5 mức. 4–5 tuổi: chỉ mở §5.1 (nhận từ đơn/thuộc tính) + `en_listen_sentence` mức dễ. 5–6 tuổi: mở thêm §5.2 (câu/hội thoại/âm vị). Cùng 12 chủ đề, khác tập skill + độ khó.

**`sentencePattern` là scaffold phơi nhiễm, KHÔNG tự động là mastery claim.** Với `"It's red."` hoặc `"It's a circle."`, ảnh đúng được quyết định bởi **một content word duy nhất** — về mặt đo lường item đó là `en_word_recognition`, không phải `en_listen_sentence`. Ràng buộc: một seed chỉ được gắn `en_listen_sentence` khi các option khác nhau ở **≥2 thành phần** của câu đang dạy, để nghe đúng một từ khoá là chưa đủ chọn đúng. Mẫu câu vẫn có giá trị (phơi nhiễm cấu trúc lặp lại 4 tuần), nhưng không được báo cáo cho phụ huynh như năng lực hiểu câu.

**Guardrail đo đúng năng lực (Logic/Mute Signature cho tiếng Anh):**

- `en_classroom_command` dùng `single_select` chỉ đo **nhận diện** lệnh (chọn tranh đúng hành động) — KHÔNG đo TPR thật (trẻ làm động tác). Phần vận động thực đẩy sang **offline task** (§6). Ghi rõ để không nhầm "nhận diện" = "thực hiện".
- `en_story_sequence`: chuỗi tranh phải **chỉ giải được bằng nghe hiểu câu**, không đoán được bằng trí nhớ thứ tự tranh hay logic thị giác thuần. Nếu bỏ audio mà vẫn xếp đúng → item hỏng (đo trí nhớ, không đo tiếng Anh).
- `audio_select` (3 skill, đã land): ràng buộc bộ nhớ làm việc ở §7 (≤3 đáp án, clip ≤4 từ, phát lại không giới hạn) là **bắt buộc** — nếu không sẽ đo trí nhớ ngắn hạn thay vì đo tiếng Anh.
- **Enforce trong code (2026-07-16):** `signatureTestLines()` ở
  `kido-pipeline/src/pipeline/seed-review/seed-review.prompts.ts` bơm **Language
  Signature Test** cho skill `en_*` thay vì Logic Signature Test của Toán. Trước đó
  reviewer bị áp luật *"làm đúng chỉ nhờ NHỚ kiến thức/quy ước → flag"* cho MỌI skill —
  sai bản chất môn ngoại ngữ (`en_word_recognition` thuần là nhớ quy ước từ vựng) →
  flag oan seed đúng. Bản tiếng Anh **KHÔNG** có Ear Test (khác `tieng_viet`: English có
  domain `literacy` dạy CHÍNH mặt chữ) và **KHÔNG** áp Mute Test tổng quát — ràng buộc
  "phải cần nghe" nằm ở `antiPattern` từng skill như các gạch đầu dòng trên.
  `en_letter_case_match` gắn `muteTestExempt: true` (nối mặt chữ là nhận diện ký hiệu
  thuần thị giác, không cần nghe → không được flag vì "làm đúng mà không cần nghe").
  Khoá bằng `seed-review.english.test.ts`.

---

## 6. LỚP "NÓI" — OFFLINE TASK (không mic)

Mục tiêu "giới thiệu bản thân / trả lời phỏng vấn" đòi ngôn ngữ **chủ động** mà in-app không làm được (đáp án đúng cho "What's your name?" là tên của chính trẻ — không clip nào chứa). Giải bằng hạ tầng offline-task **đã có sẵn trong schema**.

**Mô hình đúng (đã đối chiếu schema):** mỗi `Lesson` mang **một** bộ `offlineTaskTitle` / `offlineTaskBody` / `offlineTaskSafety` (`docs/kido-activity-schema.ts` §9, dòng ~399). Con số "5 nhiệm vụ/tuần" ở màn hình phụ huynh (`offline-tasks-api`) là **tổng hợp across 5 ngày học**, mỗi ngày một môn. Tiếng Anh giữ **day 3** → đóng góp đúng **1 offline task/tuần** = chính field `offlineTaskBody` của lesson tiếng Anh tuần đó. KHÔNG cần bảng nhiệm vụ mới; chỗ chứa kịch bản đã tồn tại.

- `offlineTaskBody` tiếng Anh = **kịch bản hội thoại cho phụ huynh**. VD tuần 1 (`colors`): *"Bố mẹ chỉ đồ vật quanh nhà và hỏi: What color is it? Bé trả lời: It's red. Làm 3 lần trong tuần."*

**Chào hỏi thuộc về đây, không thuộc về app (§2.1 lớp 2–3).** `hello`/`goodbye`/`thank you` cùng `"Hello, I'm ___."` không còn là chủ đề 4 tuần; chúng sống ở ba chỗ:

| Chỗ | Hình thức | Có chấm? |
|-----|-----------|----------|
| **Nghi thức mở bài** | Đô Đô chào "Hello!" đầu mỗi lesson, tạm biệt cuối bài — phơi nhiễm lặp 48 tuần | KHÔNG |
| **Offline-task** | Kịch bản phụ huynh: chào cô, cảm ơn khi nhận quà, tự giới thiệu tên | Phụ huynh quan sát, theo rubric dưới |
| **`audio_select` ngữ dụng** | Rải xuyên chương trình như spiral giao tiếp: tình huống → chọn clip đúng | CÓ — nhưng đo *nhận ra câu hợp tình huống*, KHÔNG đo *nói được* |

Ranh giới phải giữ đúng: item `audio_select` nhận diện nhân vật ("nghe *I'm Dodo* → chọn Dodo") là construct hợp lệ, nhưng **không được diễn giải thành năng lực tự giới thiệu**. Trẻ chọn đúng clip không chứng minh trẻ thay được tên mình vào khung câu — điều đó chỉ phụ huynh quan sát được.
- Người chấm phát âm = **phụ huynh**, không phải ASR → không vi phạm no-stress.
- **Rubric phản hồi cho phụ huynh (bắt buộc đính kèm mỗi task, chống biến thiên đánh giá):** ① luôn khen nỗ lực trước ("Con nói giỏi lắm!"); ② nếu sai, **làm mẫu lại đúng MỘT lần** rồi cho bé nhắc theo — KHÔNG bắt lặp tới khi chuẩn; ③ **tuyệt đối không** dùng "Sai rồi / Sao khó thế"; ④ mục tiêu là bé *dám nói*, không phải phát âm chuẩn bản ngữ.
- **Hạ tầng mới cần bổ sung (nhỏ nhưng có thật):** `offlineTaskBody` hiện chỉ là text; task tiếng Anh cần đính **clip audio mẫu** (`offlineTaskAudio`, field mới) để phụ huynh nhiều người không tự tin phát âm nghe trước. Bảng nhiệm vụ tĩnh của `offline-tasks-api` hiện tới tuần 12 → mở rộng tới 48 khi seed tiếng Anh.

Kiến trúc 3 lớp phần nói: **in-app** nghe hiểu + chọn khung câu (`audio_select`); **offline** nói thật với phụ huynh; **post-MVP** (tùy chọn) `listen_repeat` chỉ ghi âm + phát lại cho bé nghe, **tuyệt đối không chấm điểm**.

---

## 7. `audio_select` — ĐÃ LAND (OpenSpec `add-audio-select-activity`, 2026-07-14)

3/14 skill (`en_phonics_initial`, `en_rhyme`, `en_dialogue_response`) dùng actionType `audio_select`. Contract đã land — các điểm chốt trước đây nay đã hiện thực, giữ lại làm tham chiếu:

1. **Tên chính xác:** `audio_select` (canonical). KHÔNG dùng `listen_select` (CMS Type cũ đã khai tử ở §5.1 `KIDO_MATH_CURRICULUM.md`).
2. **Shape payload (đã chốt):** `AudioSelectPayload { promptImage?, options: AudioOptionCard[], correctAnswer }`; `AudioOptionCard { optionId, audioRef, altTextVi }`; `audioRef.type` `library` (word-key ASCII trong `audio_library`, tái dùng) | `activity` (clip đặc thù). Xem `docs/kido-activity-schema.ts`.
3. **Đã đồng bộ cùng change:** `audio_select` vào `ActionType` ở `docs/kido-activity-schema.ts`, `AGENTS.md`, `docs/AI_CONTEXT.md`, `CLAUDE.md`; enum mongoose + collection `audio_library`.
4. **Guardrail bộ nhớ làm việc (validator enforce):** **tối đa 3 đáp án**, mỗi clip **≤ 4 từ**, **phát lại không giới hạn** (mỗi thẻ 1 nút play) — R22 trong `review.prompt.ts` + `activity-mechanics.ts`.

---

## 8. NGÔN NGỮ ĐỀ BÀI — 100% TIẾNG ANH (chốt 2026-07-20)

**Hướng B song ngữ ĐÃ BỎ.** Thiết kế cũ cho Đô Đô dẫn bằng tiếng Việt rồi chèn từ EN đích ("Bé chỉ giúp Đô Đô hình màu **red** nhé!"). Bỏ vì hai lý do độc lập:

1. **Sư phạm:** bé không bao giờ nghe một câu tiếng Anh trọn vẹn → không luyện được nghe hiểu cấp câu, và `sentencePattern` của chủ đề (§4) **chưa từng được phát ra** dù nó là lý do tồn tại của chủ đề.
2. **Kỹ thuật:** `4-audio.ts` đọc **cả câu bằng một giọng**. Lời hứa "pipeline ghép 2 clip" (Hướng B) **chưa từng được implement** — không có splicing. Nên từ `red` trong câu Việt bị giọng Việt phát âm sai ("rét"): từ tiếng Anh **duy nhất** trong bài lại là từ bị đọc sai.

### Quy tắc ngôn ngữ 5 slot `audioScript`

| Slot | Ngôn ngữ | Vai trò |
|------|----------|---------|
| `question` | **TIẾNG ANH** | Input bé phải hiểu. Nghĩa được neo bằng **ảnh + thao tác + phản hồi**, không bằng dịch. |
| `correct` | **TIẾNG ANH** | "Yes! Very good!" — ngắn, lặp 384 lần → thành ngôn ngữ bé biết. |
| `hint1` | **TIẾNG ANH** | Nhắc lại từ đích chậm & gọn: "Listen. Red." |
| `hint2` | **TIẾNG VIỆT** | Lưới an toàn sau **2 lần sai**. Nghe thêm tiếng Anh khó hiểu lúc này = trừng phạt, vi phạm no-stress. |
| `explain` | **TIẾNG VIỆT** | Xác nhận sau khi trả lời — phát *sau* nên không phá immersion của đề. |

**MỖI CLIP CHỈ MỘT NGÔN NGỮ — KHÔNG PHA.** Vì không có splicing, câu pha hai thứ tiếng luôn bị một giọng đọc sai một nửa. Cụ thể: `hint2`/`explain` **không được chứa từ tiếng Anh nào**, kể cả từ đích. Neo nghĩa bằng cách mô tả **hình ảnh** ("Bé chọn hình màu đỏ nhé") — KHÔNG dịch từ ("red nghĩa là đỏ" ← sai luật).

### Bộ khung câu lệnh CỐ ĐỊNH

Immersion chạy được **không cần giáo viên** nhờ bộ khung cố định lặp suốt 48 tuần — sau vài tuần bé học luôn câu lệnh (*classroom language*), đúng loại ngôn ngữ phục vụ phỏng vấn lớp 1.

| skill | actionType | khung |
|---|---|---|
| `en_word_recognition` | single_select | `Touch the {target} one.` |
| `en_category_select` | multi_select | `Touch all the {target} ones.` |
| `en_attribute` | single_select / multi_select | `Find the {attrs} {noun}.` / `Touch all the {attrs} ones.` |
| `en_listen_sentence` | single_select | `Listen. It's {target}. Which one?` |
| `en_number_1_10` | single_select | `Touch {target}.` |
| `en_classroom_command` | single_select | `{target}! Which one?` |
| `en_word_match` / `en_letter_case_match` | match_pair | `Match them.` / `Match the letters.` |
| `en_story_sequence` / `en_sentence_build` | sort_sequence | `Listen and put them in order.` / `Make the sentence.` |
| `en_letter_sound` | single_select | `Which one starts with {target}?` |
| `en_phonics_initial` / `en_rhyme` | audio_select | `Which word starts with {target}?` / `Which word rhymes with {target}?` |
| `en_dialogue_response` | audio_select | `What do you say?` |

**Nguồn chân lý trong code:** `ENGLISH_INSTRUCTION_FRAMES` + `ENGLISH_AUDIO_FIELDS` ở `kido-pipeline/src/curriculum/english-skill-catalog.ts`. Generate prompt bơm khung theo skill; R10 ở `review.prompt.ts` miễn ràng buộc "Bé"/"Đô Đô" cho `en_*`.

---

## 8b. HẠ TẦNG CẦN THÊM (tổng hợp cho eng)

| Hạng mục | Vì sao | Quy mô |
|----------|--------|--------|
| `audio_library` keyed theo từ (mirror `assets_library`, có `usageCount`) | "cat" xuất hiện hàng chục activity/48 tuần; gen lại mỗi lần vừa tốn tiền vừa lệch phát âm | Vừa — hạ tầng bắt buộc, không phải tối ưu |
| Field `themeCode` + `sentencePattern` trong seed & `ActivityMeta` | Trục 1 & 2 của §2 (mỗi theme 1 pattern đơn nghĩa) | Nhỏ |
| Field `reviewOf: themeCode[]` trong seed | Đánh dấu bài spiral trộn mẫu câu chủ đề trước (§5.4) | Nhỏ |
| TTS worker: EN → ElevenLabs (schema ghi chú `rate 0.75`) | ĐÃ vá tiền đề trong `add-audio-select-activity`: `TTSService.synthesize(text, lang, {wrap})` giờ honor `lang` (voice EN qua `ttsVoiceEn`, KHÔNG prefix VI khi EN) + `wrap:false` cho clip từ đơn; `4-audio.ts` sinh clip option theo subject. **Còn lại:** chuyển engine EN sang ElevenLabs (hiện dùng voice EN của Gemini TTS) | Nhỏ (còn ElevenLabs) |
| Pose Đô Đô (wave/bye/thankyou) + family/action/face; (body/house thử compose) | Chủ đề hello/family/actions/feelings cần gen; body/house nếu compose fail (§4) | Gen ảnh — rải theo lịch, ưu tiên hàng đợi cho theme gen-mới |
| Field `offlineTaskAudio` (clip mẫu) + mở bảng offline-task tĩnh tới tuần 48 | §6 — phụ huynh nghe mẫu trước; neo vào `Lesson.offlineTask*` có sẵn | Nhỏ–vừa |
| Metric mastery theo skill (≥80%/2 tuần) cho report phụ huynh | §5.4 — report theo năng lực, không theo chủ đề | Vừa |

---

## 9. VIỆC CẦN CHỐT (sản phẩm + eng)

1. Human Gate duyệt khung này → chuyển trạng thái DRAFT → FREEZE. **Điều kiện tiên quyết để FREEZE** (Codex round 2): (a) `audio_select` vào contract; (b) 6 field mới ở §8 vào schema; (c) chốt mapping difficulty. Tới khi đủ 3, doc giữ DRAFT — đây là chủ đích, không phải thiếu sót.
2. Xác nhận tên/shape `audio_select` với session đang làm (§7).
3. Xác minh `composite-image.ts` có compose sprite→background được không (§5.3) trước khi khóa bảng chi phí asset.
4. **Chốt thang difficulty:** wire schema chỉ `1|2|3`. Quyết định: dùng thẳng 1–3, hay skill catalog dùng thang chi tiết + mapping về 1–3 (như catalog Toán). Doc curriculum KHÔNG tự chốt thang 5 mức.
5. Khi bắt đầu seed: viết `KIDO_ENGLISH_SKILL_CATALOG.md` (micro-skill × difficulty, khai mapping về wire `1|2|3`) song song catalog Toán.
