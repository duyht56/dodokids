## 0. Gỡ drift (rẻ nhất, không tranh cãi, mở khoá phần sau)

- [x] 0.1 `docs/prompts/gen-english-seed.routine.md`: gỡ điều kiện ⚠ chặn `en_phonics_initial`/`en_rhyme`/`en_dialogue_response` ở PREREQUISITE mục 3, §3, §8, §9 — `audio_select` đã land 2026-07-14.
- [x] 0.2 Cùng file: vá 5 chỗ còn ghi "4 activity" (§2 ×2, §5 comment `01..04`, §10 `/* 4 seed */`, Ghi chú vận hành) → 8 activity, `01..08`.
- [x] 0.3 `docs/KIDO_ENGLISH_CURRICULUM.md`: đồng bộ §5.2 ("chờ land") với §7 ("đã land") — `audio_select` là actionType hoạt động, không còn pending.
- [x] 0.4 Chạy `cd kido-pipeline && npm test` — xác nhận không có test nào phụ thuộc câu chữ vừa sửa.

## 1. Ranh giới đo được + thứ tự chủ đề (doc canonical)

- [x] 1.1 `KIDO_ENGLISH_CURRICULUM.md` §2: thêm bảng 4 lớp từ vựng theo kênh kiểm được (vật/ngữ dụng/biến cá nhân/từ chức năng) — nền cho mọi quyết định sau.
- [x] 1.2 §4: đổi bảng chủ đề Q1 thành `colors` (1–4) → `numbers` (5–8) → `shapes` (9–12); `family` giữ 13–16. Ghi rõ cả ba thuộc khối `be`, chi phí ảnh 0.
- [x] 1.3 §4: thêm `shapes` với `sentencePattern` `"It's a red circle."` + ghi chú vốn từ 6 hình × 8 màu = 48 tổ hợp (loại `pentagon`/`hexagon`).
- [x] 1.4 §4: `animals` giữ `"Yes, I do./No, I don't."` nhưng đánh dấu **audio_select-only**; từ vựng con vật vẫn chọn ảnh.
- [x] 1.5 §4: `numbers` — tách rõ vốn từ (one–ten, kiểm in-app) khỏi mẫu câu `"I'm ___ years old."` (tuổi thật = offline-task; in-app dùng tuổi nhân vật cố định).
- [x] 1.6 §6: nhận `hello` về offline-task + mô tả nghi thức mở bài không chấm điểm.
- [x] 1.7 §5.4: thêm ghi chú `sentencePattern` là scaffold phơi nhiễm, KHÔNG tự động là mastery claim khi ảnh đúng do một content word quyết định.
- [x] 1.8 Ghi vào §1 phần sai số học mục tiêu 300–500 từ (384 lượt có vs 900–1500 lượt cần) và đánh dấu **CHỜ HUMAN GATE** — không tự sửa con số.

## 2. Theme × skill feasibility matrix

- [x] 2.1 `english-skill-catalog.ts`: thêm type + hằng `THEME_SKILL_MATRIX: Record<themeCode, Partial<Record<skillCode, 'valid'|'invalid'|'asset-blocked'>>>`, mặc định khuyết = `invalid` (allowlist).
- [x] 2.2 Điền ma trận cho 12 chủ đề × 14 skill; mỗi ô `invalid`/`asset-blocked` kèm lý do một dòng.
- [x] 2.3 Thêm `getThemeSkillFeasibility(themeCode, skillCode)` + `getValidSkillsForTheme(themeCode)`.
- [x] 2.4 `KIDO_ENGLISH_CURRICULUM.md` §4.1: bản người đọc của ma trận, ghi rõ code là nguồn chân lý cho validator.
- [x] 2.5 Unit test: `colors` không cho `en_story_sequence`; `hello` không còn là themeCode hợp lệ; chủ đề khuyết trả `invalid`.

## 3. Weekly validator

- [x] 3.1 `lint-seeds.ts`: nhóm seed theo `(week, day, subject)` thay vì theo file — file toán chứa D1+D4, file Anh chỉ D3.
- [x] 3.2 Thêm `WEEK_COUNT` (đúng 8), `WEEK_INDEX` (1..8 không trùng/hổng), `WEEK_DIFFICULTY` (2/4/2) — mức critical.
- [x] 3.3 Thêm `WEEK_INDEX_ORDER` (difficulty không giảm theo index) + `WEEK_ACTION_SPREAD` (≥2 actionType, ≤4/8) — mức warning.
- [x] 3.4 Thêm `WEEK_SKILL_FEASIBLE` (critical) — chỉ chạy khi môn có khai báo matrix; đọc `themeCode` từ `metadata` hoặc tiền tố `[theme=...]` trong `answerSpec`.
- [x] 3.5 KHÔNG thêm quota `domain`/`construct` — ghi comment nêu lý do (design.md Quyết định 1) để lần sau không ai thêm nhầm.
- [x] 3.6 Test: tuần thiếu seed, index trùng, difficulty lệch, skill ngoài matrix đều bị bắt; tuần `colors` 6/8 vocab đi qua sạch.

## 4. Chứng minh validator bắt được lỗi cũ

- [x] 4.1 Chạy `npx ts-node src/scripts/lint-seeds.ts 'seeds/w01-en.json'` lên file `hello` **hiện tại** — ghi lại output; kỳ vọng `WEEK_SKILL_FEASIBLE` critical (`hello` không còn trong bảng chủ đề).
- [x] 4.2 Chạy lint lên `seeds/w0*.json` (toán) — xác nhận không phát sinh false positive trên nội dung đang chạy tốt.

## 5. Viết lại W1 theo `colors`

- [x] 5.1 Viết `kido-pipeline/seeds/w01-en.json` mới: chủ đề `colors`, `"It's ___."`, 8 seed, difficulty 2/4/2, skill lấy từ ô `valid` của ma trận.
- [x] 5.2 Mỗi seed qua shortcut test: distractor cùng lớp khác đúng thuộc tính đích; bỏ từ tiếng Anh đích thì phải tụt về đoán ngẫu nhiên.
- [x] 5.3 Chạy lint — kỳ vọng sạch cả cấp seed lẫn cấp tuần.
- [x] 5.4 Chạy `npm test` toàn pipeline — xác nhận không hồi quy.

## 6. Bàn giao

- [x] 6.1 Cập nhật routine §2/§3: nạp feasibility matrix làm nguồn chọn skill, bỏ template "4–5 skill cho mọi chủ đề".
- [x] 6.2 Tóm tắt cho Human Gate 3 câu hỏi mở ở design.md (mục tiêu 300–500 từ; `shapes` vs `classroom_objects`; `pentagon`/`hexagon` + thiếu `rectangle`/`oval`).
- [x] 6.3 Ghi memory: quyết định "không dùng quota phân bố" + lý do, để session sau không đề xuất lại.

## 7. Con số từ vựng + lặp giãn cách (vòng 2 Codex)

- [x] 7.1 §1: bỏ 300–500, chốt 120–150 coverage / 80–100 lõi / 10–15 khung câu + định nghĩa `lexeme` + tầng core/extension.
- [x] 7.2 Gỡ mâu thuẫn routine: luật "≤2 lần/chủ đề" → "≤3/buổi + phải ở ≥2 tuần khác nhau".
- [x] 7.3 §5.4 + routine §2: thêm spiral cấp TỪ (mọi tuần từ W5 dành ≥1 activity cho từ chủ đề cũ) — cơ chế chưa từng tồn tại.
- [x] 7.4 `ActivitySeed.targetLexemes?: string[]` + enum mongoose; khai tường minh cho 8 seed W1.
- [x] 7.5 `src/curriculum/lexical-ledger.ts`: đếm theo TUẦN (lặp dồn ≠ lặp giãn cách) + tầng + summary; wire vào `lint-seeds.ts`.
- [x] 7.6 `WEEK_LEXEME_MASSED` trong weekly validator (1 lexeme ≤3/8 bài một buổi).
- [x] 7.7 Fix `audio_select` bắt nghe hết clip mới mở nút Chọn — mobile `AudioSelectActivity.tsx` VÀ preview `LessonPlayerWeb.tsx` (reviewer Human Gate không được duyệt item audio chưa nghe).

## 8. Dọn nội dung `hello` đã lọt vào DB (phương án A)

- [x] 8.1 Kiểm DB: phát hiện 8 seed `theme=hello` (approved/done) + 8 activity (pending_review) + 41 activity-asset — proposal ghi nhầm "chưa import".
- [x] 8.2 Xoá 8 seed + 8 activity + 41 activity-asset sau khi xác nhận KHÔNG activity nào qua Human Gate; giữ nguyên `LIB-*` dùng chung.
- [x] 8.3 Import lại `w01-en.json` (colors) — verify 8 seed `theme=colors`, `targetLexemes` đúng, 0 activity sót.
- [x] 8.4 `staleSeedIds` + `isSeedContentChanged()`: cảnh báo khi file khác DB mà `$setOnInsert` bỏ qua im lặng — CLI + admin UI; verify live trên browser.

## 9. Đề bài 100% tiếng Anh (bỏ Hướng B song ngữ)

- [x] 9.1 Phát hiện `4-audio.ts` hardcode `synthesize(..., 'vi')` cho MỌI slot → từ EN chèn giữa câu Việt bị đọc sai ("red"→"rét"); splicing của Hướng B chưa từng tồn tại.
- [x] 9.2 `ENGLISH_INSTRUCTION_FRAMES` + `ENGLISH_AUDIO_FIELDS` trong `english-skill-catalog.ts` — bộ khung câu lệnh cố định 14 skill, nguồn chân lý cho generate prompt.
- [x] 9.3 `4-audio.ts`: lang theo từng slot (question/correct/hint1 = EN; hint2/explain = VI).
- [x] 9.4 `generate.prompt.ts`: đảo `englishBlock` — bảng ngôn ngữ 5 slot + bơm khung cố định theo skill; thêm ngoại lệ "Bé"/"Đô Đô" cho `en_*`.
- [x] 9.5 `review.prompt.ts`: miễn R10 cho `en_*` + luật kiểm ngôn ngữ từng slot + CẤM pha ngôn ngữ trong một slot (không splicing nên câu pha luôn sai một nửa).
- [x] 9.6 Curriculum §8 viết lại: quy tắc 5 slot + bảng khung cố định + lý do bỏ Hướng B; routine §6 + checklist §9 đồng bộ.
- [x] 9.7 `w01-en.json`: 8 `questionCore` → câu lệnh tiếng Anh theo khung; đồng bộ vào DB (seed chưa qua Human Gate).
- [x] 9.8 Test: khung khớp actionType, mọi skill dùng được đều có khung, `ENGLISH_AUDIO_FIELDS` đúng 3 slot, ngoại lệ R10 + luật ngôn ngữ slot. Suite 321 xanh.
